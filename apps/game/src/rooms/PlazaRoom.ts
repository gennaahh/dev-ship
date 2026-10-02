import { Room, ServerError, validate, type Client } from '@colyseus/core'
import { z } from 'zod'
import { verifyRoomToken, type PlayerAuth } from '../auth.ts'
import { ChatInput, cleanText, createMessage, history, RateLimit, TypingInput } from '../chat.ts'
import { clampToPlaza, plazaEntrance, walkToward } from '../movement.ts'
import { PlazaPlayer, PlazaState } from './PlazaState.ts'

const TICK_MS = 50 // 20 tick al secondo
const RECONNECT_SECONDS = 15

const MoveInput = z.object({ x: z.number().finite(), y: z.number().finite() })

// La piazza: chi c'è si vede passeggiare e chiacchierare, con i fumetti sopra la testa.
// Quando è piena se ne apre un'altra, con la sua chat: i messaggi restano tra chi si vede.
export class PlazaRoom extends Room<{ state: PlazaState; client: Client<{ auth: PlayerAuth }> }> {
  maxClients = 40
  maxMessagesPerSecond = 20
  state = new PlazaState()

  private targets = new Map<string, { x: number; y: number }>()
  private rate = new RateLimit()

  static async onAuth(token: string) {
    if (!token) throw new ServerError(401, 'Serve il login')
    try {
      return await verifyRoomToken(token)
    } catch {
      throw new ServerError(401, 'Token non valido o scaduto')
    }
  }

  messages = {
    moveTo: validate(MoveInput, (client, target) => {
      this.targets.set(client.sessionId, clampToPlaza(target))
    }),
    typing: validate(TypingInput, (client, { typing }) => {
      const player = this.state.players.get(client.sessionId)
      if (player) player.typing = typing
    }),
    history: async (client: Client) => {
      client.send('history', await history.list(this.historyKey))
    },
    chat: validate(ChatInput, async (client: Client<{ auth: PlayerAuth }>, { text }) => {
      const player = this.state.players.get(client.sessionId)
      const clean = cleanText(text)
      if (!player || !clean || !this.rate.allow(client.sessionId)) return
      player.typing = false
      const message = createMessage(client.sessionId, player.name, clean)
      this.broadcast('chat', message)
      await history.push(this.historyKey, message)
    }),
  }

  // Ogni piazza ha il suo storico, che sparisce con lei.
  private get historyKey() {
    return `plaza:${this.roomId}`
  }

  onCreate() {
    this.setTimestep((dt) => {
      this.state.players.forEach((p, id) => {
        const target = this.targets.get(id)
        if (!target || (p.x === target.x && p.y === target.y)) return
        const next = walkToward(p, target, dt)
        p.x = next.x
        p.y = next.y
      })
    }, TICK_MS)
  }

  onJoin(client: Client<{ auth: PlayerAuth }>) {
    const { from, to } = plazaEntrance()
    const player = new PlazaPlayer()
    player.name = client.auth!.name // c'è sempre: senza, onAuth rifiuta l'ingresso
    Object.assign(player, from)
    this.state.players.set(client.sessionId, player)
    this.targets.set(client.sessionId, to)
  }

  // Connessione persa senza uscire: il posto resta riservato per qualche secondo.
  onDrop(client: Client) {
    const player = this.state.players.get(client.sessionId)
    if (player) player.typing = false
    this.allowReconnection(client, RECONNECT_SECONDS)
  }

  onLeave(client: Client) {
    this.targets.delete(client.sessionId)
    this.rate.forget(client.sessionId)
    this.state.players.delete(client.sessionId)
  }

  async onDispose() {
    await history.clear(this.historyKey)
  }
}
