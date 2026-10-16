import { sql } from './db.ts'

// Regole della pesca: funzioni pure, separate dalla Room, più il salvataggio delle catture.
// Il lago, le sedie e come ci si cammina attorno stanno in lake.ts.

// Da quando ci si siede (o dalla cattura precedente) a quando il pesce abbocca.
// FISHING_FAST=1 accorcia l'attesa a 10-20 secondi, per provare in sviluppo.
const FAST = process.env.FISHING_FAST === '1'
const BITE_MIN_MS = FAST ? 10_000 : 10 * 60_000
const BITE_MAX_MS = FAST ? 20_000 : 20 * 60_000
// Quanto dura il tira e molla, e quanto resta in vista il risultato prima di tornare ad aspettare.
export const BITE_MS = 3_500
export const RESULT_MS = 6_000
export const BIG_RESULT_MS = 10_000

const CATCH_CHANCE = 0.75
const BIG_CHANCE = 0.1
export const BIG_KG = 5
const MIN_KG = 1
const MAX_SMALL_KG = 4.9
const MAX_KG = 20
// Punti in classifica: 10 per chilo, cioè 1 ogni etto.
export const POINTS_PER_KG = 10

const between = (min: number, max: number) => min + Math.random() * (max - min)
const tenths = (kg: number) => Math.round(kg * 10) / 10

// La canna in mano (catalogo, RODS) accorcia l'attesa di speed e rende più probabili i pesci
// speciali di luck. Senza, speed e luck sono 0.
export function biteDelay(speed = 0) {
  return between(BITE_MIN_MS, BITE_MAX_MS) * (1 - speed)
}

// null se il pesce scappa, altrimenti il suo peso in kg (al decimo).
export function rollCatch(luck = 0): number | null {
  if (Math.random() >= CATCH_CHANCE) return null
  return Math.random() < BIG_CHANCE * (1 + luck) ? tenths(between(BIG_KG, MAX_KG)) : tenths(between(MIN_KG, MAX_SMALL_KG))
}

export const pointsFor = (kg: number) => Math.round(kg * POINTS_PER_KG)

// Una volta su 15, insieme al pesce sale una bottiglia col ticket del dungeon.
const BOTTLE_CHANCE = 1 / 15
export const rollBottle = () => Math.random() < BOTTLE_CHANCE

// Le catture vanno in PostgreSQL: in fish_catch per la classifica (la calcola l'API) e il
// pesce nell'inventario (player_item, 'fish' è il suo id nel catalogo di packages/shared),
// con la bottiglia il ticket del dungeon ('dungeon_ticket', una riga con la quantità).
// Se il database non risponde si pesca lo stesso, ma la cattura non resta.
export async function saveCatch(userId: string, kg: number, bottle: boolean) {
  const grams = Math.round(kg * 1000)
  try {
    await sql.begin(async (tx) => {
      const [c] = await tx`insert into fish_catch (user_id, weight_g, points) values (${userId}, ${grams}, ${pointsFor(kg)}) returning id`
      await tx`insert into player_item (user_id, item_id, weight_g, catch_id) values (${userId}, 'fish', ${grams}, ${c.id})`
      if (bottle) {
        await tx`insert into player_item (user_id, item_id) values (${userId}, 'dungeon_ticket')
          on conflict (user_id, item_id) where item_id <> 'fish' do update set quantity = player_item.quantity + 1`
      }
    })
    return true
  } catch (e) {
    console.error('Cattura non salvata:', e)
    return false
  }
}
