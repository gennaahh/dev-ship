import { desc, eq, gte, sql, type SQL } from 'drizzle-orm'
import { db } from './db/index.ts'
import { fishCatch, user } from './db/schema.ts'

// Classifica della pesca: i primi 10 per punti di oggi, della settimana (da lunedì) e di sempre,
// più gli ultimi pesci presi.
// I giorni e le settimane sono quelli dell'ora italiana, come la nave.
const TZ = 'Europe/Rome'
const startOf = (unit: 'day' | 'week') => sql`date_trunc(${unit}, now() at time zone ${TZ}) at time zone ${TZ}`
const TOP = 10

// Stesso nome che si vede nelle stanze (displayName in auth.ts).
const name = sql<string>`coalesce(nullif(trim(${user.name}), ''), split_part(${user.email}, '@', 1))`
const points = sql<number>`sum(${fishCatch.points})::int`

function top(since?: SQL) {
  return db
    .select({
      name,
      fish: sql<number>`count(*)::int`,
      biggestKg: sql<number>`(max(${fishCatch.weightG}) / 1000.0)::float`,
      points,
    })
    .from(fishCatch)
    .innerJoin(user, eq(user.id, fishCatch.userId))
    .where(since && gte(fishCatch.caughtAt, since))
    .groupBy(user.id)
    .orderBy(desc(points), desc(sql`max(${fishCatch.weightG})`))
    .limit(TOP)
}

function recent() {
  return db
    .select({
      name,
      weightKg: sql<number>`(${fishCatch.weightG} / 1000.0)::float`,
      caughtAt: fishCatch.caughtAt,
    })
    .from(fishCatch)
    .innerJoin(user, eq(user.id, fishCatch.userId))
    .orderBy(desc(fishCatch.caughtAt))
    .limit(TOP)
}

export async function fishingLeaderboard() {
  const [day, week, all, latest] = await Promise.all([top(startOf('day')), top(startOf('week')), top(), recent()])
  return { day, week, all, recent: latest }
}
