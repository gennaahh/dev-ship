import { drizzle } from 'drizzle-orm/bun-sql'
import { env } from '../env.ts'
import * as schema from './schema.ts'

// casing come in drizzle.config.ts: le colonne senza nome esplicito diventano snake_case.
export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' })
