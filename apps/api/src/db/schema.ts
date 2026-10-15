import { index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
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
