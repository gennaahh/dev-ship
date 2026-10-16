import { sql } from 'drizzle-orm'
import { index, integer, pgTable, serial, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'
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
// 'buy' (acquisto allo shop), 'dungeon' (monete raccolte in una run, itemId 'dungeon_ticket')
// o 'trade' (scambio tra giocatori, itemId 'gold').
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
