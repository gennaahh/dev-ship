import { desc, eq, gte, sql, type SQL } from 'drizzle-orm'
import { db } from './db/index.ts'
import { mineFind, user } from './db/schema.ts'

// Il cartellone della miniera: i primi 10 per valore delle scoperte (minerali e gemme, al prezzo
// di quando sono state trovate) di oggi, della settimana (da lunedì) e di sempre, più le ultime
// scoperte. Come la classifica della pesca (fishing.ts), coi giorni dell'ora italiana.
const TZ = 'Europe/Rome'
const startOf = (unit: 'day' | 'week') => sql`date_trunc(${unit}, now() at time zone ${TZ}) at time zone ${TZ}`
const TOP = 10

// Stesso nome che si vede nelle stanze (displayName in auth.ts).
const name = sql<string>`coalesce(nullif(trim(${user.name}), ''), split_part(${user.email}, '@', 1))`
const value = sql<number>`sum(${mineFind.value})::int`

function top(since?: SQL) {
  return db
    .select({
      name,
      finds: sql<number>`count(*)::int`,
      // La scoperta più preziosa: a pari valore la più recente.
      best: sql<string>`(array_agg(${mineFind.itemId} order by ${mineFind.value} desc, ${mineFind.foundAt} desc))[1]`,
      value,
    })
    .from(mineFind)
    .innerJoin(user, eq(user.id, mineFind.userId))
    .where(since && gte(mineFind.foundAt, since))
    .groupBy(user.id)
    .orderBy(desc(value), desc(sql`max(${mineFind.value})`))
    .limit(TOP)
}

function recent() {
  return db
    .select({ name, itemId: mineFind.itemId, foundAt: mineFind.foundAt })
    .from(mineFind)
    .innerJoin(user, eq(user.id, mineFind.userId))
    .orderBy(desc(mineFind.foundAt), desc(mineFind.id))
    .limit(TOP)
}

export async function mineBoard() {
  const [day, week, all, latest] = await Promise.all([top(startOf('day')), top(startOf('week')), top(), recent()])
  return { day, week, all, recent: latest }
}
