import { Room, validate, type Client } from '@colyseus/core'
import { z } from 'zod'
import { IDLE, spawnPoint, step, type Input } from '../movement.ts'
import { DungeonState, Player } from './DungeonState.ts'

const TICK_MS = 50 // 20 tick al secondo
const RECONNECT_SECONDS = 15
// Diversi da quelli dei bug-mostri, per non confondere giocatori e nemici.
const COLORS = ['#6fd3ff', '#ff9a2e', '#c38bff', '#fff8e6']

const InputMessage = z.object({
  up: z.boolean(),
  down: z.boolean(),
  left: z.boolean(),
  right: z.boolean(),
})

// Prototipo della stanza del dungeon: i giocatori si vedono muovere sul pavimento.
// Il server è autoritativo: il client manda solo i tasti premuti, le posizioni le calcola qui.
export class DungeonRoom extends Room<{ state: DungeonState }> {
  maxClients = 4
  maxMessagesPerSecond = 30
  state = new DungeonState()

  private pressed = new Map<string, Input>()

  messages = {
    input: validate(InputMessage, (client, input) => {
      this.pressed.set(client.sessionId, input)
    }),
  }

  onCreate() {
    this.setTimestep((dt) => {
      this.state.players.forEach((p, id) => {
        const next = step(p, this.pressed.get(id) ?? IDLE, dt)
        p.x = next.x
        p.y = next.y
      })
    }, TICK_MS)
  }

  onJoin(client: Client) {
    // Senza login il nome è provvisorio: arriverà dal token emesso dall'API.
    const player = new Player()
    player.name = `Dev ${client.sessionId.slice(0, 4)}`
    const used = new Set([...this.state.players.values()].map((p) => p.color))
    player.color = COLORS.find((c) => !used.has(c)) ?? COLORS[0]
    Object.assign(player, spawnPoint())
    this.state.players.set(client.sessionId, player)
  }

  // Connessione persa senza uscire: il posto resta riservato per qualche secondo.
  onDrop(client: Client) {
    this.pressed.delete(client.sessionId)
    this.allowReconnection(client, RECONNECT_SECONDS)
  }

  onLeave(client: Client) {
    this.pressed.delete(client.sessionId)
    this.state.players.delete(client.sessionId)
  }
}
