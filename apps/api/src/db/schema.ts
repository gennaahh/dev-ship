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
// Tutto il resto è una riga sola per giocatore, con quantity: cappelli e colori 1, zuppe
// (dal crafting), ticket del dungeon (dalla pesca) e materiali (dal dungeon) quanti se ne hanno.
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
// né si cancellano. reason: 'sell' (vendita di un pesce), 'buy' (acquisto allo shop) o
// 'dungeon' (monete raccolte in una run, itemId 'dungeon_ticket').
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
export const playerEquipment = pgTable('player_equipment', {
  userId: text()
    .primaryKey()
    .references(() => user.id, { onDelete: 'cascade' }),
  hat: text(),
  color: text(),
})
