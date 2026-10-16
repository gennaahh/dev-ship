import { Room, ServerError, validate, type Client, type Delayed } from '@colyseus/core'
import { isBigFind, STONE, tool } from '@dev-city/shared/catalog'
import { BIG_FOUND_MS, FOUND_MS, rollMineral } from '@dev-city/shared/mine'
import { z } from 'zod'
import { verifyRoomToken, type PlayerAuth } from '../auth.ts'
import { caveEntrance, clampToCave, SPOT_SPOTS, SPOTS, stepBack, walkCave } from '../cave.ts'
import { ChatInput, cleanText, createMessage, history, RateLimit, TypingInput } from '../chat.ts'
import { loadLook, loadTool, refreshLook } from '../db.ts'
import { findDelay, saveFind, stoneDelay } from '../mine.ts'
import { TradeDesk } from '../trade.ts'
import { PlazaPlayer } from './PlazaState.ts'
import { MineSpot, MineState } from './MineState.ts'

const TICK_MS = 50 // 20 tick al secondo
const RECONNECT_SECONDS = 15

const MoveInput = z.object({ x: z.number().finite(), y: z.number().finite() })
const DigInput = z.object({ spot: z.number().int().min(0).max(SPOTS - 1) })

type MineClient = Client<{ auth: PlayerAuth }>

// La miniera: si cammina e si chiacchiera come in piazza, e ci si mette a scavare a uno degli
// otto filoni camminandoci. Una persona per filone: chi ci arriva per primo. Si scava da soli:
// ogni 4-6 minuti si stacca una pietra, ogni 15-25 si trova un minerale o una gemma (le regole
// in packages/shared/src/mine.ts). Con un piccone del crafting in mano si aspetta di meno e le
// scoperte rare sono più frequenti. Come la zona di pesca (FishingRoom), la stanza è una sola.
export class MineRoom extends Room<{ state: MineState; client: MineClient }> {
  maxClients = 100
  maxMessagesPerSecond = 20
  state = new MineState()

  private targets = new Map<string, { x: number; y: number }>()
  // Il filone verso cui si sta camminando, per sessionId: si scava all'arrivo, se è ancora libero.
  private goingToSpot = new Map<string, string>()
  private users = new Map<string, PlayerAuth>()
  // Per ogni filone il prossimo sasso e la prossima scoperta (o la fine della scoperta in vista).
  private stoneTimers = new Map<string, Delayed>()
  private findTimers = new Map<string, Delayed>()
  // Chi scava dove, per userId: con due schede aperte si scava comunque da un filone solo.
  private spotOfUser = new Map<string, string>()
  private rate = new RateLimit()
  // Gli scambi tra chi è in miniera (col tasto destro su un giocatore).
  private trades = new TradeDesk(this, (userIds) => userIds.forEach((id) => this.refresh(id)))

  static async onAuth(token: string) {
    if (!token) throw new ServerError(401, 'Serve il login')
    try {
      return await verifyRoomToken(token)
    } catch {
      throw new ServerError(401, 'Token non valido o scaduto')
    }
  }

  messages = {
    // Camminare altrove fa smettere di scavare.
    moveTo: validate(MoveInput, (client: MineClient, target) => {
      this.stand(client)
      this.goingToSpot.delete(client.sessionId)
      this.targets.set(client.sessionId, clampToCave(target))
    }),
    dig: validate(DigInput, (client: MineClient, { spot }) => {
      const key = String(spot)
      if (this.state.spots.get(key)?.sessionId === client.sessionId) return
      this.stand(client)
      this.goingToSpot.set(client.sessionId, key)
      this.targets.set(client.sessionId, { ...SPOT_SPOTS[spot] })
    }),
    stand: (client: MineClient) => {
      const key = this.mySpot(client)
      if (key === undefined) return
      this.stand(client)
      this.targets.set(client.sessionId, stepBack(SPOT_SPOTS[Number(key)]))
    },
    typing: validate(TypingInput, (client, { typing }) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.typing = typing
    }),
    // Ha cambiato equipaggiamento: si rilegge dal database.
    look: (client: MineClient) => this.refresh(client.auth!.userId),
    history: async (client: Client) => {
      client.send('history', await history.list(this.historyKey))
    },
    chat: validate(ChatInput, async (client: MineClient, { text }) => {
      const player = this.state.players.get(client.sessionId)
      const clean = cleanText(text)
      if (!player || !clean || !this.rate.allow(client.sessionId)) return
      player.typing = false
      const message = createMessage(client.sessionId, player.name, clean)
      this.broadcast('chat', message)
      await history.push(this.historyKey, message)
    }),
    ...this.trades.messages,
  }

  private get historyKey() {
    return `mine:${this.roomId}`
  }

  onCreate() {
    this.setTimestep((dt) => {
      this.state.players.forEach((p, id) => {
        const target = this.targets.get(id)
        if (!target) return
        if (p.x !== target.x || p.y !== target.y) {
          const next = walkCave(p, target, dt)
          p.x = next.x
          p.y = next.y
        } else if (this.goingToSpot.has(id)) {
          this.arriveAtSpot(id, this.goingToSpot.get(id)!)
        }
      })
    }, TICK_MS)
  }

  private arriveAtSpot(sessionId: string, key: string) {
    this.goingToSpot.delete(sessionId)
    const auth = this.users.get(sessionId)
    const player = this.state.players.get(sessionId)
    if (!auth || !player) return
    // Arrivato qualcun altro prima, o si scava già da un'altra scheda.
    if (this.state.spots.has(key) || this.spotOfUser.has(auth.userId)) {
      this.clients.getById(sessionId)?.send('spotTaken')
      return
    }
    const s = new MineSpot()
    s.sessionId = sessionId
    s.name = player.name
    s.phase = 'digging'
    s.since = Date.now()
    s.stones = 0
    s.finds = 0
    s.found = ''
    s.tool = ''
    this.state.spots.set(key, s)
    this.spotOfUser.set(auth.userId, key)
    // Le prime attese partono quando si sa che piccone ha in mano.
    loadTool(auth.userId, 'pickaxe').then((t) => {
      if (this.state.spots.get(key) !== s) return
      s.tool = t
      this.schedule(this.stoneTimers, key, stoneDelay(this.pickaxe(s).speed), () => this.stone(key, auth.userId))
      this.schedule(this.findTimers, key, findDelay(this.pickaxe(s).speed), () => this.find(key, auth.userId))
    })
  }

  // Il piccone di chi scava: senza, quello di sempre.
  private pickaxe(spot: MineSpot) {
    return tool(spot.tool) ?? { speed: 0, luck: 0 }
  }

  // Look e piccone riletti dal database, dopo un cambio di equipaggiamento o uno scambio. Il
  // piccone nuovo conta dalla prossima attesa.
  private refresh(userId: string) {
    refreshLook(this.clients, this.state.players, userId)
    const key = this.spotOfUser.get(userId)
    const spot = key === undefined ? undefined : this.state.spots.get(key)
    if (spot) loadTool(userId, 'pickaxe').then((t) => this.state.spots.get(key!) === spot && (spot.tool = t))
  }

  private schedule(timers: Map<string, Delayed>, key: string, ms: number, fn: () => void) {
    timers.get(key)?.clear()
    timers.set(key, this.clock.setTimeout(fn, ms))
  }

  // Il pezzo trovato va nell'inventario: lo si dice a tutte le schede di chi scava.
  private save(userId: string, itemId: string) {
    saveFind(userId, itemId).then((saved) => {
      if (!saved) return
      for (const c of this.clients) if (c.auth?.userId === userId) c.send('inventory')
    })
  }

  private stone(key: string, userId: string) {
    const spot = this.state.spots.get(key)
    if (!spot) return
    spot.stones++
    this.save(userId, STONE)
    this.schedule(this.stoneTimers, key, stoneDelay(this.pickaxe(spot).speed), () => this.stone(key, userId))
  }

  private find(key: string, userId: string) {
    const spot = this.state.spots.get(key)
    if (!spot) return
    const item = rollMineral(Math.random, this.pickaxe(spot).luck)
    const big = isBigFind(item)
    spot.phase = 'found'
    spot.found = item
    spot.finds++
    this.broadcast('find', { spot: Number(key), from: spot.sessionId, name: spot.name, item, big })
    this.save(userId, item)
    const shown = big ? BIG_FOUND_MS : FOUND_MS
    // Si torna a scavare; la prossima scoperta si conta da qui.
    this.schedule(this.findTimers, key, shown, () => {
      const s = this.state.spots.get(key)
      if (!s) return
      s.phase = 'digging'
      this.schedule(this.findTimers, key, Math.max(1000, findDelay(this.pickaxe(s).speed) - shown), () => this.find(key, userId))
    })
  }

  // Il filone di questa connessione: un'altra scheda dello stesso giocatore può scavare mentre
  // questa cammina.
  private mySpot(client: MineClient) {
    const key = this.spotOfUser.get(client.auth!.userId)
    return key !== undefined && this.state.spots.get(key)?.sessionId === client.sessionId ? key : undefined
  }

  private stand(client: MineClient) {
    const key = this.mySpot(client)
    if (key === undefined) return
    for (const timers of [this.stoneTimers, this.findTimers]) {
      timers.get(key)?.clear()
      timers.delete(key)
    }
    this.spotOfUser.delete(client.auth!.userId)
    this.state.spots.delete(key)
  }

  onJoin(client: MineClient) {
    const { from, to } = caveEntrance()
    const player = new PlazaPlayer()
    player.name = client.auth!.name // c'è sempre: senza, onAuth rifiuta l'ingresso
    Object.assign(player, from)
    this.state.players.set(client.sessionId, player)
    this.targets.set(client.sessionId, to)
    this.users.set(client.sessionId, client.auth!)
    // Si entra subito; il look arriva appena letto.
    loadLook(client.auth!.userId).then((look) => Object.assign(player, look))
  }

  // Connessione persa senza uscire: il filone (e lo scavo) resta per qualche secondo.
  onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.typing = false
    this.trades.leave(client.sessionId)
    this.allowReconnection(client, RECONNECT_SECONDS)
  }

  onLeave(client: MineClient) {
    this.trades.leave(client.sessionId)
    this.stand(client)
    this.targets.delete(client.sessionId)
    this.goingToSpot.delete(client.sessionId)
    this.users.delete(client.sessionId)
    this.rate.forget(client.sessionId)
    this.state.players.delete(client.sessionId)
  }

  async onDispose() {
    await history.clear(this.historyKey)
  }
}
