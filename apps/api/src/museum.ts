import { desc, sql } from 'drizzle-orm'
import { db } from './db/index.ts'
import { captainWeek } from './db/schema.ts'

// Il museo: l'albo dei capitani, un quadro per ogni settimana finita col podio della classifica
// della città (player_score, packages/shared/src/score.ts). I quadri si appendono da soli: quando
// qualcuno guarda l'albo, le settimane finite che non hanno ancora il loro quadro lo ricevono, coi
// nomi e i look di quel momento. Le settimane senza punti non hanno quadro.
const TZ = 'Europe/Rome'
// Quanti quadri restituisce, dal più recente: un anno.
const WEEKS = 52
// Appendere i quadri vuol dire guardare tutti i punti: lo si fa al più una volta ogni tanto.
const HANG_EVERY_MS = 10 * 60_000
let hungAt = 0

async function hang() {
  if (Date.now() - hungAt < HANG_EVERY_MS) return
  hungAt = Date.now()
  // I primi tre di ogni settimana prima di quella in corso, a pari punti chi ci è arrivato prima.
  // Due richieste insieme non appendono due volte lo stesso quadro: la chiave è settimana e posto.
  await db.execute(sql`
    with weekly as (
      select date_trunc('week', created_at at time zone ${TZ})::date as week, user_id, sum(points)::int as points, max(created_at) as last
      from player_score
      where created_at < date_trunc('week', now() at time zone ${TZ}) at time zone ${TZ}
      group by 1, 2
    ),
    ranked as (
      select *, row_number() over (partition by week order by points desc, last asc) as rank
      from weekly
      where week not in (select week_start from captain_week)
    )
    insert into captain_week (week_start, rank, user_id, name, points, hat, color)
    select r.week, r.rank, r.user_id, coalesce(nullif(trim(u.name), ''), split_part(u.email, '@', 1)), r.points, e.hat, e.color
    from ranked r
    join "user" u on u.id = r.user_id
    left join player_equipment e on e.user_id = r.user_id
    where r.rank <= 3
    on conflict do nothing
  `)
}

// I quadri, dal più recente: per ognuno la settimana (il lunedì) e il podio, dal primo, con
// quante settimane aveva vinto il primo fino a quella (wins).
export async function captains() {
  try {
    await hang()
  } catch (e) {
    // Si mostra l'albo com'è: si riprova alla prossima richiesta.
    hungAt = 0
    console.error('Quadri non appesi:', e)
  }
  const rows = await db
    .select({
      weekStart: captainWeek.weekStart,
      rank: captainWeek.rank,
      userId: captainWeek.userId,
      name: captainWeek.name,
      points: captainWeek.points,
      hat: captainWeek.hat,
      color: captainWeek.color,
    })
    .from(captainWeek)
    .orderBy(desc(captainWeek.weekStart), captainWeek.rank)
    .limit(WEEKS * 3)
  // Le vittorie di ognuno, dalla settimana più vecchia: chi se n'è andato si conta per nome.
  const wins = new Map<string, number>()
  const winsAt = new Map<string, number>()
  for (const r of [...rows].reverse()) {
    if (r.rank !== 1) continue
    const who = r.userId ?? `name:${r.name}`
    wins.set(who, (wins.get(who) ?? 0) + 1)
    winsAt.set(r.weekStart, wins.get(who)!)
  }
  const weeks = new Map<string, { weekStart: string; wins: number; podium: { rank: number; name: string; points: number; look: { hat: string; color: string } }[] }>()
  for (const r of rows) {
    const week = weeks.get(r.weekStart) ?? { weekStart: r.weekStart, wins: winsAt.get(r.weekStart) ?? 0, podium: [] }
    week.podium.push({ rank: r.rank, name: r.name, points: r.points, look: { hat: r.hat ?? '', color: r.color ?? '' } })
    weeks.set(r.weekStart, week)
  }
  return { weeks: [...weeks.values()] }
}
