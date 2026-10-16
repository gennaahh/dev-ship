import { FISH, itemName } from '@dev-city/shared/catalog'
import { coffee } from '@dev-city/shared/coffee'
import { BOARD, CANCEL_COOLDOWN_MS, generateMission } from '@dev-city/shared/office'
import { missionPoints } from '@dev-city/shared/score'
import { and, asc, desc, eq, gt, inArray, sql } from 'drizzle-orm'
import { db } from './db/index.ts'
import { goldLedger, officeMission, playerCoffee, playerItem, playerScore, user } from './db/schema.ts'
import { addCount, countOf, goldOf, InventoryError, inventoryOf, type Tx } from './inventory.ts'

// L'ufficio: la macchinetta del caffè (in fondo) e la bacheca delle missioni.
//
// La bacheca delle missioni dell'ufficio (regole in packages/shared/src/office.ts): la bacheca la
// vedono tutti, prendere, annullare e completare una missione solo da loggati. Le azioni
// restituiscono la propria situazione e la bacheca aggiornate, per ridisegnare tutto con una
// risposta sola; l'inventario, dopo una consegna, il frontend lo richiede a parte.

// Stesso nome che si vede nelle stanze (displayName in auth.ts).
const name = sql<string>`coalesce(nullif(trim(${user.name}), ''), split_part(${user.email}, '@', 1))`
// Quante missioni in corso e fatte di recente mostra la bacheca.
const RECENT = 5

const mission = {
  id: officeMission.id,
  slot: officeMission.slot,
  difficulty: officeMission.difficulty,
  requester: officeMission.requester,
  title: officeMission.title,
  needs: officeMission.needs,
  reward: officeMission.reward,
}

// Rimette una missione nuova nei posti vuoti della bacheca. Due richieste insieme non ne mettono
// due nello stesso posto: l'indice unico lo impedisce, e la seconda non fa niente.
async function fill(tx: Tx | typeof db) {
  const open = await tx.select({ slot: officeMission.slot }).from(officeMission).where(eq(officeMission.status, 'open'))
  const free = BOARD.flatMap((difficulty, slot) => (open.some((o) => o.slot === slot) ? [] : [{ slot, ...generateMission(difficulty) }]))
  if (free.length) await tx.insert(officeMission).values(free).onConflictDoNothing()
}

// I posti della bacheca (da fare), chi sta facendo cosa e le ultime consegnate.
export async function officeBoard() {
  await fill(db)
  const [open, doing, done] = await Promise.all([
    db.select(mission).from(officeMission).where(eq(officeMission.status, 'open')).orderBy(asc(officeMission.slot)),
    db
      .select({ name, title: officeMission.title, difficulty: officeMission.difficulty })
      .from(officeMission)
      .innerJoin(user, eq(user.id, officeMission.takenBy))
      .where(eq(officeMission.status, 'taken'))
      .orderBy(desc(officeMission.takenAt))
      .limit(RECENT),
    db
      .select({ name, title: officeMission.title, difficulty: officeMission.difficulty, reward: officeMission.reward, finishedAt: officeMission.finishedAt })
      .from(officeMission)
      .innerJoin(user, eq(user.id, officeMission.takenBy))
      .where(eq(officeMission.status, 'done'))
      .orderBy(desc(officeMission.finishedAt))
      .limit(RECENT),
  ])
  return { open, doing, done }
}

// La missione in corso del giocatore, se ce l'ha, e fino a quando non ne può prendere un'altra
// perché ne ha annullata una (null: può).
async function stateOf(tx: Tx | typeof db, userId: string) {
  const [[current], [cancelled]] = await Promise.all([
    tx
      .select({ ...mission, takenAt: officeMission.takenAt })
      .from(officeMission)
      .where(and(eq(officeMission.takenBy, userId), eq(officeMission.status, 'taken'))),
    tx
      .select({ finishedAt: officeMission.finishedAt })
      .from(officeMission)
      .where(
        and(
          eq(officeMission.takenBy, userId),
          eq(officeMission.status, 'cancelled'),
          gt(officeMission.finishedAt, sql`now() - ${CANCEL_COOLDOWN_MS} * interval '1 millisecond'`),
        ),
      )
      .orderBy(desc(officeMission.finishedAt))
      .limit(1),
  ])
  const until = cancelled?.finishedAt ? new Date(cancelled.finishedAt.getTime() + CANCEL_COOLDOWN_MS) : null
  return { mission: current ?? null, cooldownUntil: until?.toISOString() ?? null }
}

export const missionOf = (userId: string) => stateOf(db, userId)
const withBoard = async (userId: string) => ({ ...(await stateOf(db, userId)), board: await officeBoard() })

// La riga del giocatore resta bloccata fino alla fine: due richieste insieme non prendono due
// missioni né consegnano due volte.
const lock = (tx: Tx, userId: string) => tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')

// Prende una missione dalla bacheca, se non ne ha già una e non ne ha annullata una da poco. Al
// suo posto ne esce subito un'altra della stessa difficoltà.
export async function takeMission(userId: string, missionId: number) {
  await db.transaction(async (tx) => {
    await lock(tx, userId)
    const state = await stateOf(tx, userId)
    if (state.mission) throw new InventoryError(409, 'Hai già una missione in corso: completala o annullala.')
    if (state.cooldownUntil) {
      const minutes = Math.max(1, Math.ceil((Date.parse(state.cooldownUntil) - Date.now()) / 60_000))
      throw new InventoryError(409, `Hai annullato una missione da poco: potrai prenderne un'altra tra ${minutes} min.`)
    }
    const [taken] = await tx
      .update(officeMission)
      .set({ status: 'taken', takenBy: userId, takenAt: sql`now()` })
      .where(and(eq(officeMission.id, missionId), eq(officeMission.status, 'open')))
      .returning({ slot: officeMission.slot })
    if (!taken) throw new InventoryError(409, 'Questa missione l\'ha appena presa qualcun altro.')
    await tx.insert(officeMission).values({ slot: taken.slot, ...generateMission(BOARD[taken.slot]) }).onConflictDoNothing()
  })
  return withBoard(userId)
}

// Annulla la missione in corso: non torna sulla bacheca, e per CANCEL_COOLDOWN_MS non se ne
// prendono altre.
export async function cancelMission(userId: string) {
  const [cancelled] = await db
    .update(officeMission)
    .set({ status: 'cancelled', finishedAt: sql`now()` })
    .where(and(eq(officeMission.takenBy, userId), eq(officeMission.status, 'taken')))
    .returning({ id: officeMission.id })
  if (!cancelled) throw new InventoryError(404, 'Non hai nessuna missione in corso.')
  return withBoard(userId)
}

// Consegna quello che chiede la missione e riscuote il premio, coi punti della classifica. Se servono pesci si danno i più
// leggeri, come in cucina.
export async function completeMission(userId: string) {
  await db.transaction(async (tx) => {
    await lock(tx, userId)
    const [current] = await tx
      .select({ id: officeMission.id, needs: officeMission.needs, reward: officeMission.reward })
      .from(officeMission)
      .where(and(eq(officeMission.takenBy, userId), eq(officeMission.status, 'taken')))
    if (!current) throw new InventoryError(404, 'Non hai nessuna missione in corso.')
    const { [FISH]: fishNeeded = 0, ...needs } = current.needs
    const fish = fishNeeded
      ? await tx
          .select({ id: playerItem.id })
          .from(playerItem)
          .where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, FISH)))
          .orderBy(asc(playerItem.weightG), asc(playerItem.id))
          .limit(fishNeeded)
      : []
    const missing: string[] = []
    if (fish.length < fishNeeded) missing.push(`${fishNeeded - fish.length} ${fishNeeded - fish.length === 1 ? 'pesce' : 'pesci'}`)
    for (const [id, n] of Object.entries(needs)) {
      const have = await countOf(tx, userId, id)
      if (have < n) missing.push(`${n - have} × ${itemName(id)}`)
    }
    if (missing.length) throw new InventoryError(409, `Ti mancano: ${missing.join(', ')}.`)
    if (fish.length) await tx.delete(playerItem).where(inArray(playerItem.id, fish.map((f) => f.id)))
    for (const [id, n] of Object.entries(needs)) await addCount(tx, userId, id, -n)
    for (const [id, n] of Object.entries(current.reward.items)) await addCount(tx, userId, id, n)
    if (current.reward.gold > 0) await tx.insert(goldLedger).values({ userId, amount: current.reward.gold, reason: 'mission', itemId: 'mission' })
    await tx.insert(playerScore).values({ userId, game: 'mission', points: missionPoints(current.reward) })
    await tx.update(officeMission).set({ status: 'done', finishedAt: sql`now()` }).where(eq(officeMission.id, current.id))
  })
  return withBoard(userId)
}

// Un caffè alla macchinetta (packages/shared/src/coffee.ts): si paga e vale da adesso per i suoi
// minuti, al posto di quello di prima. Restituisce l'inventario, col caffè in circolo.
export async function drinkCoffee(userId: string, coffeeId: string) {
  const c = coffee(coffeeId)
  if (!c) throw new InventoryError(404, 'La macchinetta non fa questo caffè.')
  await db.transaction(async (tx) => {
    await lock(tx, userId)
    if ((await goldOf(tx, userId)) < c.price) throw new InventoryError(402, 'Non hai abbastanza monete.')
    await tx.insert(goldLedger).values({ userId, amount: -c.price, reason: 'coffee', itemId: c.id })
    const until = sql`now() + ${c.minutes} * interval '1 minute'`
    await tx
      .insert(playerCoffee)
      .values({ userId, coffeeId: c.id, until })
      .onConflictDoUpdate({ target: playerCoffee.userId, set: { coffeeId: c.id, until } })
  })
  return inventoryOf(userId)
}
