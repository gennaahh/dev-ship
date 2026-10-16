import { Room, ServerError, validate, type Client, type Delayed } from '@colyseus/core'
import { z } from 'zod'
import { verifyRoomToken, type PlayerAuth } from '../auth.ts'
import { ChatInput, cleanText, createMessage, history, RateLimit, TypingInput } from '../chat.ts'
import { loadLook, refreshLook } from '../db.ts'
import { BIG_KG, BIG_RESULT_MS, BITE_MS, biteDelay, pointsFor, RESULT_MS, rollBottle, rollCatch, saveCatch } from '../fishing.ts'
import { clampToLakeside, lakeEntrance, SEAT_SPOTS, SEATS, stepBack, walkLakeside } from '../lake.ts'
import { TradeDesk } from '../trade.ts'
import { PlazaPlayer } from './PlazaState.ts'
import { FishingSeat, FishingState } from './FishingState.ts'

const TICK_MS = 50 // 20 tick al secondo
const RECONNECT_SECONDS = 15

const MoveInput = z.object({ x: z.number().finite(), y: z.number().finite() })
const SitInput = z.object({ seat: z.number().int().min(0).max(SEATS - 1) })

type FishingClient = Client<{ auth: PlayerAuth }>

// La zona di pesca: si cammina attorno al lago e si chiacchiera come in piazza, e ci si siede
// su una delle dieci sedie camminandoci. Una persona per sedia: chi ci arriva per primo.
// Seduti si aspetta: dopo 10-20 minuti abbocca, e 3 volte su 4 il pesce resta all'amo. Una
// volta su 15 col pesce sale anche una bottiglia, col ticket per il dungeon.
// Le sedie sono le stesse per tutti, quindi la stanza è una sola.
export class FishingRoom extends Room<{ state: FishingState; client: FishingClient }> {
  maxClients = 100
  maxMessagesPerSecond = 20
  state = new FishingState()

  private targets = new Map<string, { x: number; y: number }>()
  // La sedia verso cui si sta camminando, per sessionId: ci si siede all'arrivo, se è ancora libera.
  private goingToSeat = new Map<string, string>()
  private users = new Map<string, PlayerAuth>()
  // Il prossimo passo di ogni sedia (abboccata, esito, nuova attesa).
  private timers = new Map<string, Delayed>()
  // Chi è seduto dove, per userId: con due schede aperte si pesca comunque da una sola sedia.
  private seatOfUser = new Map<string, string>()
  private rate = new RateLimit()
  // Gli scambi tra chi è al lago (col tasto destro su un giocatore).
  private trades = new TradeDesk(this, (userIds) => userIds.forEach((id) => refreshLook(this.clients, this.state.players, id)))

  static async onAuth(token: string) {
    if (!token) throw new ServerError(401, 'Serve il login')
    try {
      return await verifyRoomToken(token)
    } catch {
      throw new ServerError(401, 'Token non valido o scaduto')
    }
  }

  messages = {
    // Camminare altrove fa alzare dalla sedia.
    moveTo: validate(MoveInput, (client: FishingClient, target) => {
      this.stand(client)
      this.goingToSeat.delete(client.sessionId)
      this.targets.set(client.sessionId, clampToLakeside(target))
    }),
    sit: validate(SitInput, (client: FishingClient, { seat }) => {
      const key = String(seat)
      if (this.state.seats.get(key)?.sessionId === client.sessionId) return
      this.stand(client)
      this.goingToSeat.set(client.sessionId, key)
      this.targets.set(client.sessionId, { ...SEAT_SPOTS[seat] })
    }),
    stand: (client: FishingClient) => {
      const key = this.mySeat(client)
      if (key === undefined) return
      this.stand(client)
      this.targets.set(client.sessionId, stepBack(SEAT_SPOTS[Number(key)]))
    },
    typing: validate(TypingInput, (client, { typing }) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.typing = typing
    }),
    // Ha cambiato equipaggiamento: si rilegge dal database.
    look: (client: FishingClient) => refreshLook(this.clients, this.state.players, client.auth!.userId),
    history: async (client: Client) => {
      client.send('history', await history.list(this.historyKey))
    },
    chat: validate(ChatInput, async (client: FishingClient, { text }) => {
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
    return `fishing:${this.roomId}`
  }

  onCreate() {
    this.setTimestep((dt) => {
      this.state.players.forEach((p, id) => {
        const target = this.targets.get(id)
        if (!target) return
        if (p.x !== target.x || p.y !== target.y) {
          const next = walkLakeside(p, target, dt)
          p.x = next.x
          p.y = next.y
        } else if (this.goingToSeat.has(id)) {
          this.arriveAtSeat(id, this.goingToSeat.get(id)!)
        }
      })
    }, TICK_MS)
  }

  private arriveAtSeat(sessionId: string, key: string) {
    this.goingToSeat.delete(sessionId)
    const auth = this.users.get(sessionId)
    const player = this.state.players.get(sessionId)
    if (!auth || !player) return
    // Arrivato qualcun altro prima, o si pesca già da un'altra scheda.
    if (this.state.seats.has(key) || this.seatOfUser.has(auth.userId)) {
      this.clients.getById(sessionId)?.send('seatTaken')
      return
    }
    const s = new FishingSeat()
    s.sessionId = sessionId
    s.name = player.name
    s.phase = 'waiting'
    s.since = Date.now()
    s.weight = 0
    s.bottle = false
    this.state.seats.set(key, s)
    this.seatOfUser.set(auth.userId, key)
    this.schedule(key, biteDelay(), () => this.bite(key, auth.userId))
  }

  private schedule(key: string, ms: number, fn: () => void) {
    this.timers.get(key)?.clear()
    this.timers.set(key, this.clock.setTimeout(fn, ms))
  }

  private bite(key: string, userId: string) {
    const seat = this.state.seats.get(key)
    if (!seat) return
    seat.phase = 'bite'
    this.schedule(key, BITE_MS, () => this.resolve(key, userId))
  }

  private resolve(key: string, userId: string) {
    const seat = this.state.seats.get(key)
    if (!seat) return
    const kg = rollCatch()
    if (kg === null) {
      seat.phase = 'escaped'
    } else {
      const bottle = rollBottle()
      seat.phase = 'caught'
      seat.weight = kg
      seat.bottle = bottle
      this.broadcast('catch', { seat: Number(key), from: seat.sessionId, name: seat.name, weight: kg, points: pointsFor(kg), big: kg >= BIG_KG, bottle })
      // Il pesce (e il ticket) è nell'inventario: lo si dice a tutte le schede del pescatore.
      saveCatch(userId, kg, bottle).then((saved) => {
        if (!saved) return
        for (const c of this.clients) if (c.auth?.userId === userId) c.send('inventory')
      })
    }
    const wait = kg !== null && kg >= BIG_KG ? BIG_RESULT_MS : RESULT_MS
    // Si rilancia: la prossima abboccata si conta da qui.
    this.schedule(key, wait, () => {
      const s = this.state.seats.get(key)
      if (!s) return
      s.phase = 'waiting'
      this.schedule(key, Math.max(1000, biteDelay() - wait), () => this.bite(key, userId))
    })
  }

  // La sedia di questa connessione: un'altra scheda dello stesso giocatore può essere seduta
  // mentre questa cammina.
  private mySeat(client: FishingClient) {
    const key = this.seatOfUser.get(client.auth!.userId)
    return key !== undefined && this.state.seats.get(key)?.sessionId === client.sessionId ? key : undefined
  }

  private stand(client: FishingClient) {
    const key = this.mySeat(client)
    if (key === undefined) return
    this.timers.get(key)?.clear()
    this.timers.delete(key)
    this.seatOfUser.delete(client.auth!.userId)
    this.state.seats.delete(key)
  }

  onJoin(client: FishingClient) {
    const { from, to } = lakeEntrance()
    const player = new PlazaPlayer()
    player.name = client.auth!.name // c'è sempre: senza, onAuth rifiuta l'ingresso
    Object.assign(player, from)
    this.state.players.set(client.sessionId, player)
    this.targets.set(client.sessionId, to)
    this.users.set(client.sessionId, client.auth!)
    // Si entra subito; il look arriva appena letto.
    loadLook(client.auth!.userId).then((look) => Object.assign(player, look))
  }

  // Connessione persa senza uscire: la sedia (e l'attesa) resta per qualche secondo.
  onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.typing = false
    this.trades.leave(client.sessionId)
    this.allowReconnection(client, RECONNECT_SECONDS)
  }

  onLeave(client: FishingClient) {
    this.trades.leave(client.sessionId)
    this.stand(client)
    this.targets.delete(client.sessionId)
    this.goingToSeat.delete(client.sessionId)
    this.users.delete(client.sessionId)
    this.rate.forget(client.sessionId)
    this.state.players.delete(client.sessionId)
  }

  async onDispose() {
    await history.clear(this.historyKey)
  }
}
