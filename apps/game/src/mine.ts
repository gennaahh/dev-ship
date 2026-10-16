import { between, FIND_MS, STONE_MS } from '@dev-city/shared/mine'
import { mineral, STONE } from '@dev-city/shared/catalog'
import { sql } from './db.ts'

// I tempi della miniera (packages/shared/src/mine.ts) e il salvataggio di quello che si trova.
// Il filone, la camminata e i posti stanno in cave.ts.

// MINING_FAST=1 accorcia i minuti in secondi, per provare in sviluppo: una pietra ogni 4-6
// secondi, una scoperta ogni 15-25.
// Il piccone in mano (catalogo, PICKAXES) accorcia l'attesa di speed (0 senza).
const SPEEDUP = process.env.MINING_FAST === '1' ? 60 : 1
export const stoneDelay = (speed = 0) => (between(Math.random, STONE_MS) * (1 - speed)) / SPEEDUP
export const findDelay = (speed = 0) => (between(Math.random, FIND_MS) * (1 - speed)) / SPEEDUP

// Quello che si trova va nell'inventario (player_item, una riga per oggetto con la quantità);
// minerali e gemme anche in mine_find, per il cartellone della miniera (lo fa l'API).
// Se il database non risponde si scava lo stesso, ma non resta niente.
export async function saveFind(userId: string, itemId: string) {
  try {
    await sql.begin(async (tx) => {
      await tx`insert into player_item (user_id, item_id) values (${userId}, ${itemId})
        on conflict (user_id, item_id) where item_id <> 'fish' do update set quantity = player_item.quantity + 1`
      if (itemId !== STONE) await tx`insert into mine_find (user_id, item_id, value) values (${userId}, ${itemId}, ${mineral(itemId)?.price ?? 0})`
    })
    return true
  } catch (e) {
    console.error('Scoperta non salvata:', e)
    return false
  }
}
