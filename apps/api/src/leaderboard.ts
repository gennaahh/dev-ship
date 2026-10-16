import { GAMES, type Game } from '@dev-city/shared/score'
import { asc, desc, eq, gte, sql, type SQL } from 'drizzle-orm'
import { db } from './db/index.ts'
import { playerEquipment, playerScore, user } from './db/schema.ts'

// La classifica della città: i punti di tutti i giochi sommati (packages/shared/src/score.ts),
// della settimana (da lunedì, ora italiana, come la nave) e di sempre. Per ognuno anche i punti
// gioco per gioco e il look, così il cartellone e il timone della dev-ship lo disegnano com'è.
const TZ = 'Europe/Rome'
const startOfWeek = sql`date_trunc('week', now() at time zone ${TZ}) at time zone ${TZ}`
const TOP = 10

// Stesso nome che si vede nelle stanze (displayName in auth.ts).
const name = sql<string>`coalesce(nullif(trim(${user.name}), ''), split_part(${user.email}, '@', 1))`
const total = sql<number>`sum(${playerScore.points})::int`
const pointsIn = (game: Game) => sql<number>`coalesce(sum(${playerScore.points}) filter (where ${playerScore.game} = ${game}), 0)::int`

async function top(since?: SQL) {
  const rows = await db
    .select({
      name,
      points: total,
      fishing: pointsIn('fishing'),
      mining: pointsIn('mining'),
      dungeon: pointsIn('dungeon'),
      mission: pointsIn('mission'),
      hat: playerEquipment.hat,
      color: playerEquipment.color,
    })
    .from(playerScore)
    .innerJoin(user, eq(user.id, playerScore.userId))
    .leftJoin(playerEquipment, eq(playerEquipment.userId, user.id))
    .where(since && gte(playerScore.createdAt, since))
    .groupBy(user.id, playerEquipment.hat, playerEquipment.color)
    // A pari punti, chi ci è arrivato prima.
    .orderBy(desc(total), asc(sql`max(${playerScore.createdAt})`))
    .limit(TOP)
  return rows.map((r) => ({
    name: r.name,
    points: r.points,
    games: Object.fromEntries(GAMES.map((g) => [g.id, r[g.id]])) as Record<Game, number>,
    look: { hat: r.hat ?? '', color: r.color ?? '' },
  }))
}

export async function leaderboard() {
  const [week, all] = await Promise.all([top(startOfWeek), top()])
  return { week, all }
}
