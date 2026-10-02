import { RedisClient } from 'bun'
import { z } from 'zod'

// Chat comune alle stanze: messaggi validati, limite di frequenza e storico degli ultimi messaggi.
// Lo storico sta in Redis se c'è REDIS_URL (sopravvive alla chiusura della stanza e al riavvio
// del server, ed è lo stesso per tutti i processi), altrimenti in memoria.

export const MAX_LENGTH = 140
const HISTORY_SIZE = 50
// Un canale senza messaggi per un giorno si dimentica.
const HISTORY_TTL_SECONDS = 24 * 60 * 60
// Tra due messaggi dello stesso giocatore.
const MIN_INTERVAL_MS = 700

export const ChatInput = z.object({ text: z.string().max(MAX_LENGTH * 2) })
export const TypingInput = z.object({ typing: z.boolean() })

export type ChatMessage = {
  id: string
  // sessionId di chi scrive: in piazza serve per mettere il fumetto sul personaggio giusto.
  from: string
  name: string
  text: string
  at: number
}

// Spazi compattati, niente caratteri di controllo. Stringa vuota se non resta niente da dire.
export function cleanText(text: string) {
  return text
    .replace(/[\p{Cc}\p{Cf}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_LENGTH)
}

export function createMessage(from: string, name: string, text: string): ChatMessage {
  return { id: crypto.randomUUID(), from, name, text, at: Date.now() }
}

// Chi scrive troppo in fretta perde il messaggio.
export class RateLimit {
  private last = new Map<string, number>()

  allow(id: string) {
    const now = Date.now()
    if (now - (this.last.get(id) ?? 0) < MIN_INTERVAL_MS) return false
    this.last.set(id, now)
    return true
  }

  forget(id: string) {
    this.last.delete(id)
  }
}

interface HistoryStore {
  push(key: string, message: ChatMessage): Promise<void>
  list(key: string): Promise<ChatMessage[]>
  clear(key: string): Promise<void>
}

class RedisHistory implements HistoryStore {
  constructor(private redis: RedisClient) {}

  async push(key: string, message: ChatMessage) {
    const k = `chat:${key}`
    await this.redis.lpush(k, JSON.stringify(message))
    await this.redis.ltrim(k, 0, HISTORY_SIZE - 1)
    await this.redis.expire(k, HISTORY_TTL_SECONDS)
  }

  async list(key: string) {
    const items = await this.redis.lrange(`chat:${key}`, 0, HISTORY_SIZE - 1)
    return items.map((s) => JSON.parse(s) as ChatMessage).reverse()
  }

  async clear(key: string) {
    await this.redis.del(`chat:${key}`)
  }
}

class MemoryHistory implements HistoryStore {
  private channels = new Map<string, ChatMessage[]>()

  async push(key: string, message: ChatMessage) {
    const list = this.channels.get(key) ?? []
    list.push(message)
    this.channels.set(key, list.slice(-HISTORY_SIZE))
  }

  async list(key: string) {
    return [...(this.channels.get(key) ?? [])]
  }

  async clear(key: string) {
    this.channels.delete(key)
  }
}

const redisUrl = process.env.REDIS_URL
export const history: HistoryStore = redisUrl ? new RedisHistory(new RedisClient(redisUrl)) : new MemoryHistory()
