import { Room, ServerError, validate, type Client } from '@colyseus/core'
import { clampToOffice, officeEntrance, SEAT_SPOTS, SEATS, walkOffice } from '@dev-city/shared/office-floor'
import { z } from 'zod'
import { verifyRoomToken, type PlayerAuth } from '../auth.ts'
import { ChatInput, cleanText, createMessage, history, RateLimit, TypingInput } from '../chat.ts'
import { loadCoffee, loadLook, refreshLook } from '../db.ts'
import { TradeDesk } from '../trade.ts'
import { PlazaPlayer } from './PlazaState.ts'
import { OfficeSeat, OfficeState } from './OfficeState.ts'

const TICK_MS = 50 // 20 tick al secondo
const RECONNECT_SECONDS = 15

const MoveInput = z.object({ x: z.number().finite(), y: z.number().finite() })
const SitInput = z.object({ seat: z.number().int().min(0).max(SEATS - 1) })

type OfficeClient = Client<{ auth: PlayerAuth }>

// L'ufficio: si cammina e si chiacchiera come in piazza, girando attorno al tavolo delle
// riunioni, e ci si siede a uno degli otto posti camminandoci. Un giocatore per posto: chi ci
// arriva per primo. Seduti non succede niente di speciale, si chiacchiera; chi ha un caffè in
// circolo (lo si compra alla macchinetta, con l'API) ha la tazza sul tavolo. La bacheca delle
// missioni e la macchinetta passano dall'API. Le sedie sono le stesse per tutti: la stanza è una.
export class OfficeRoom extends Room<{ state: OfficeState; client: OfficeClient }> {
  maxClients = 100
  maxMessagesPerSecond = 20
  state = new OfficeState()

  private targets = new Map<string, { x: number; y: number }>()
  // Il posto verso cui si sta camminando, per sessionId: ci si siede all'arrivo, se è ancora libero.
  private goingToSeat = new Map<string, string>()
  private users = new Map<string, PlayerAuth>()
  // Chi è seduto dove, per userId: con due schede aperte si sta seduti una volta sola.
  private seatOfUser = new Map<string, string>()
  private rate = new RateLimit()
  // Gli scambi tra chi è in ufficio (col tasto destro su un giocatore).
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
    // Camminare altrove fa alzare dalla sedia.
    moveTo: validate(MoveInput, (client: OfficeClient, target) => {
      this.stand(client)
      this.goingToSeat.delete(client.sessionId)
      this.targets.set(client.sessionId, clampToOffice(target))
    }),
    sit: validate(SitInput, (client: OfficeClient, { seat }) => {
      const key = String(seat)
      if (this.state.seats.get(key)?.sessionId === client.sessionId) return
      this.stand(client)
      this.goingToSeat.set(client.sessionId, key)
      this.targets.set(client.sessionId, { ...SEAT_SPOTS[seat].approach })
    }),
    stand: (client: OfficeClient) => this.stand(client),
    typing: validate(TypingInput, (client, { typing }) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.typing = typing
    }),
    // Ha cambiato equipaggiamento o ha bevuto un caffè: si rilegge dal database.
    look: (client: OfficeClient) => this.refresh(client.auth!.userId),
    history: async (client: Client) => {
      client.send('history', await history.list(this.historyKey))
    },
    chat: validate(ChatInput, async (client: OfficeClient, { text }) => {
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
    return `office:${this.roomId}`
  }

  onCreate() {
    this.setTimestep((dt) => {
      this.state.players.forEach((p, id) => {
        const target = this.targets.get(id)
        if (!target) return
        if (p.x !== target.x || p.y !== target.y) {
          const next = walkOffice(p, target, dt)
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
    // Arrivato qualcun altro prima, o si è già seduti da un'altra scheda.
    if (this.state.seats.has(key) || this.seatOfUser.has(auth.userId)) {
      this.clients.getById(sessionId)?.send('seatTaken')
      return
    }
    const s = new OfficeSeat()
    s.sessionId = sessionId
    s.name = player.name
    s.coffee = ''
    s.coffeeUntil = 0
    this.state.seats.set(key, s)
    this.seatOfUser.set(auth.userId, key)
    // Ci si siede: dal bordo del tavolo al proprio posto.
    const spot = SEAT_SPOTS[Number(key)]
    player.x = spot.x
    player.y = spot.y
    this.targets.set(sessionId, { x: spot.x, y: spot.y })
    this.loadCoffee(auth.userId, key, s)
  }

  // La tazza sul tavolo: il caffè in circolo, riletto dal database.
  private loadCoffee(userId: string, key: string, seat: OfficeSeat) {
    loadCoffee(userId).then((c) => {
      if (this.state.seats.get(key) !== seat) return
      seat.coffee = c?.id ?? ''
      seat.coffeeUntil = c?.until ?? 0
    })
  }

  // Look e caffè riletti dal database, dopo un cambio di equipaggiamento, uno scambio o un caffè.
  private refresh(userId: string) {
    refreshLook(this.clients, this.state.players, userId)
    const key = this.seatOfUser.get(userId)
    const seat = key === undefined ? undefined : this.state.seats.get(key)
    if (seat) this.loadCoffee(userId, key!, seat)
  }

  // Il posto di questa connessione: un'altra scheda dello stesso giocatore può essere seduta
  // mentre questa cammina.
  private mySeat(client: OfficeClient) {
    const key = this.seatOfUser.get(client.auth!.userId)
    return key !== undefined && this.state.seats.get(key)?.sessionId === client.sessionId ? key : undefined
  }

  // Ci si alza tornando sul bordo del tavolo, da dove si cammina.
  private stand(client: OfficeClient) {
    const key = this.mySeat(client)
    if (key === undefined) return
    this.seatOfUser.delete(client.auth!.userId)
    this.state.seats.delete(key)
    const { approach } = SEAT_SPOTS[Number(key)]
    const player = this.state.players.get(client.sessionId)
    if (player) Object.assign(player, approach)
    this.targets.set(client.sessionId, { ...approach })
  }

  onJoin(client: OfficeClient) {
    const { from, to } = officeEntrance()
    const player = new PlazaPlayer()
    player.name = client.auth!.name // c'è sempre: senza, onAuth rifiuta l'ingresso
    Object.assign(player, from)
    this.state.players.set(client.sessionId, player)
    this.targets.set(client.sessionId, to)
    this.users.set(client.sessionId, client.auth!)
    // Si entra subito; il look arriva appena letto.
    loadLook(client.auth!.userId).then((look) => Object.assign(player, look))
  }

  // Connessione persa senza uscire: il posto resta per qualche secondo.
  onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.typing = false
    this.trades.leave(client.sessionId)
    this.allowReconnection(client, RECONNECT_SECONDS)
  }

  onLeave(client: OfficeClient) {
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
