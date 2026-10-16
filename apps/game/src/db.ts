import { SQL } from 'bun'
import type { Client } from '@colyseus/core'
import type { MapSchema } from '@colyseus/schema'
import type { PlayerAuth } from './auth.ts'
import type { PlazaPlayer } from './rooms/PlazaState.ts'

// Lo stesso PostgreSQL dell'API, che ne ha le tabelle e le migrazioni (apps/api/src/db/schema.ts).
// Se il database non risponde si gioca lo stesso: le catture non restano e i look sono quelli di base.
const DATABASE_URL = process.env.DATABASE_URL ?? 'postgres://devcity:devcity@localhost:5432/devcity'
export const sql = new SQL(DATABASE_URL)

// Cosa indossa un giocatore (player_equipment, lo cambia l'API): id del catalogo, '' = niente.
export async function loadLook(userId: string) {
  try {
    const [row] = await sql`select hat, color from player_equipment where user_id = ${userId}`
    return { hat: row?.hat ?? '', color: row?.color ?? '' }
  } catch (e) {
    console.error('Look non letto:', e)
    return { hat: '', color: '' }
  }
}

// Rilegge il look di un giocatore e lo mette su tutti i suoi personaggi nella stanza (uno per
// scheda aperta). Il client lo chiede dopo aver cambiato equipaggiamento: il look non lo manda
// lui, si prende dal database.
export async function refreshLook(clients: Iterable<Client<{ auth: PlayerAuth }>>, players: MapSchema<PlazaPlayer>, userId: string) {
  const look = await loadLook(userId)
  for (const c of clients) {
    const player = c.auth?.userId === userId ? players.get(c.sessionId) : undefined
    if (player) Object.assign(player, look)
  }
}
