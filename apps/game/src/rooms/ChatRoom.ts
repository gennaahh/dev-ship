import { Room, ServerError, validate, type Client } from '@colyseus/core'
import { verifyRoomToken, type PlayerAuth } from '../auth.ts'
import { ChatInput, cleanText, createMessage, history, RateLimit } from '../chat.ts'

// Canali di chat: la città (globale) e un canale per ogni luogo. La piazza non c'è:
// lì la chat passa dalla PlazaRoom, che mette i fumetti sui personaggi.
const CHANNELS = ['city', 'miniera', 'dungeon', 'ufficio', 'museo', 'pesca']

// Una stanza per canale (filterBy in index.ts). Si legge e si scrive solo da loggati.
export class ChatRoom extends Room<{ client: Client<{ auth: PlayerAuth }> }> {
  maxMessagesPerSecond = 10

  private channel = ''
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
    // Lo storico lo chiede il client, quando è pronto a riceverlo.
    history: async (client: Client) => {
      client.send('history', await history.list(this.channel))
    },
    chat: validate(ChatInput, async (client: Client<{ auth: PlayerAuth }>, { text }) => {
      const clean = cleanText(text)
      if (!clean || !this.rate.allow(client.sessionId)) return
      const message = createMessage(client.sessionId, client.auth!.name, clean)
      this.broadcast('chat', message)
      await history.push(this.channel, message)
    }),
  }

  onCreate(options: { channel?: string }) {
    if (!CHANNELS.includes(options.channel ?? '')) throw new ServerError(400, 'Canale sconosciuto')
    this.channel = options.channel!
    this.autoDispose = true
  }

  onLeave(client: Client) {
    this.rate.forget(client.sessionId)
  }
}
