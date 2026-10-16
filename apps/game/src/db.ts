import { SQL } from 'bun'
import type { Client } from '@colyseus/core'
import type { ToolSlot } from '@dev-city/shared/catalog'
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

// La canna o il piccone che un giocatore tiene in mano (player_equipment), se ce l'ha ancora:
// id del catalogo, '' = niente (uno scambiato non conta più).
export async function loadTool(userId: string, slot: ToolSlot) {
  try {
    const [row] = await sql`select rod, pickaxe from player_equipment where user_id = ${userId}`
    const id: string | null = row?.[slot] ?? null
    if (!id) return ''
    const [has] = await sql`select 1 from player_item where user_id = ${userId} and item_id = ${id} and quantity > 0`
    return has ? id : ''
  } catch (e) {
    console.error('Attrezzo non letto:', e)
    return ''
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
