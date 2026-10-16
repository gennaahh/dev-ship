import { sql } from 'drizzle-orm'
import type { Difficulty, Reward } from '@dev-city/shared/office'
import { index, integer, jsonb, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
import { user } from './auth-schema.ts'

// Tutte le tabelle dell'API. Le tabelle dei giocatori (users, sessions, ...) le genera
// Better Auth: bun run --filter @dev-city/api auth:schema.
export * from './auth-schema.ts'

// Un pesce preso nella zona di pesca. Le scrive il game server (apps/game/src/fishing.ts),
// la classifica di giorno, settimana e sempre la calcola l'API.
export const fishCatch = pgTable(
  'fish_catch',
  {
    id: serial().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    // In grammi, per non avere decimali.
    weightG: integer().notNull(),
    points: integer().notNull(),
    caughtAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('fish_catch_caught_at_idx').on(table.caughtAt)],
)

// Gli oggetti nell'inventario dei giocatori. itemId è un id del catalogo
// (packages/shared/src/catalog.ts). I pesci sono una riga ciascuno, col loro peso: li aggiunge
// il game server a ogni cattura, e venduti o cucinati spariscono (in classifica restano).
// Tutto il resto è una riga sola per giocatore, con quantity: cappelli e colori 1, zuppe, armi,
// armature, canne e picconi (dal crafting), ticket del dungeon (dalla pesca), materiali (dal dungeon), pietre,
// minerali e gemme (dalla miniera) quanti se ne hanno.
export const playerItem = pgTable(
  'player_item',
  {
    id: serial().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    itemId: text().notNull(),
    // Solo per i pesci: il peso in grammi e la cattura da cui vengono.
    weightG: integer(),
    catchId: integer().references(() => fishCatch.id, { onDelete: 'set null' }),
    quantity: integer().notNull().default(1),
    acquiredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('player_item_user_id_idx').on(table.userId),
    uniqueIndex('player_item_unique_idx').on(table.userId, table.itemId).where(sql`${table.itemId} <> 'fish'`),
  ],
)

// Le monete d'oro: ogni movimento è una riga, il saldo è la somma. Le righe non si cambiano
// né si cancellano. reason: 'sell' (vendita di un pesce o di quello che si trova in miniera),
// 'buy' (acquisto allo shop), 'dungeon' (monete raccolte in una run, itemId 'dungeon_ticket'),
// 'trade' (scambio tra giocatori, itemId 'gold'), 'mission' (premio di una missione dell'ufficio,
// itemId 'mission') o 'coffee' (un caffè alla macchinetta dell'ufficio, itemId il caffè).
export const goldLedger = pgTable(
  'gold_ledger',
  {
    id: serial().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    amount: integer().notNull(),
    reason: text().notNull(),
    itemId: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('gold_ledger_user_id_idx').on(table.userId)],
)

// Cosa indossa ognuno: id del catalogo, null = niente cappello o il colore di sempre (dal nome).
// La leggono anche le stanze del game server, per far vedere a tutti il look giusto.
// weapon e armor: l'arma e l'armatura del crafting che si usano nel dungeon, null = la spada di
// legno e niente armatura. rod e pickaxe: la canna e il piccone del crafting, che contano al lago
// e in miniera (li legge il game server), null = quelli di sempre.
export const playerEquipment = pgTable('player_equipment', {
  userId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  hat: text(),
  color: text(),
  weapon: text(),
  armor: text(),
  rod: text(),
  pickaxe: text(),
})

// Le scoperte in miniera (minerali e gemme, non le pietre). Le scrive il game server
// (apps/game/src/mine.ts) insieme all'oggetto nell'inventario; l'API ci fa il cartellone della
// miniera. value: quanto valeva alla vendita quando è stata trovata, per la classifica.
export const mineFind = pgTable(
  'mine_find',
  {
    id: serial().primaryKey(),
    userId: text()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    itemId: text().notNull(),
    value: integer().notNull(),
    foundAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('mine_find_found_at_idx').on(table.foundAt)],
)

// Le missioni della bacheca dell'ufficio (regole in packages/shared/src/office.ts). Una riga per
// missione, dall'uscita sulla bacheca alla fine. status: 'open' (sulla bacheca, al posto slot),
// 'taken' (presa da takenBy), 'done' (consegnata, premio riscosso) o 'cancelled' (annullata: da
// finishedAt per un'ora takenBy non ne prende altre). needs e reward come in Mission.
export const officeMission = pgTable(
  'office_mission',
  {
    id: serial().primaryKey(),
    slot: integer().notNull(),
    difficulty: text().$type<Difficulty>().notNull(),
    requester: text().notNull(),
    title: text().notNull(),
    needs: jsonb().$type<Record<string, number>>().notNull(),
    reward: jsonb().$type<Reward>().notNull(),
    status: text().$type<'open' | 'taken' | 'done' | 'cancelled'>().notNull().default('open'),
    takenBy: text().references(() => user.id, { onDelete: 'cascade' }),
    takenAt: timestamp({ withTimezone: true }),
    finishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Una missione per posto sulla bacheca, una in corso per giocatore.
    uniqueIndex('office_mission_open_slot_idx').on(table.slot).where(sql`${table.status} = 'open'`),
    uniqueIndex('office_mission_taken_idx').on(table.takenBy).where(sql`${table.status} = 'taken'`),
    index('office_mission_taken_by_idx').on(table.takenBy),
    index('office_mission_status_idx').on(table.status, table.finishedAt),
  ],
)

// Il caffè che un giocatore ha in circolo (packages/shared/src/coffee.ts): uno alla volta, berne un
// altro lo sostituisce. Vale fino a until; quelli per il dungeon spariscono alla prima run.
// Lo scrive l'API, lo leggono anche le stanze del game server (lago e miniera, per i tempi e la
// fortuna, e l'ufficio, per la tazzina sul tavolo).
export const playerCoffee = pgTable('player_coffee', {
  userId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  coffeeId: text().notNull(),
  until: timestamp({ withTimezone: true }).notNull(),
})
