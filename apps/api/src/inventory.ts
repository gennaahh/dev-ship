import { DUNGEON_TICKET, FISH, FISH_SOUP, fishPrice, gear, itemName, recipe, sellPrice, shopItem, type GearSlot, type Slot } from '@dev-city/shared/catalog'
import { coffee } from '@dev-city/shared/coffee'
import { simulateRun } from '@dev-city/shared/dungeon'
import { dungeonPoints } from '@dev-city/shared/score'
import { and, asc, desc, eq, gt, inArray, sql } from 'drizzle-orm'
import { db } from './db/index.ts'
import { goldLedger, playerCoffee, playerEquipment, playerItem, playerScore, user } from './db/schema.ts'

// Inventario, monete d'oro ed equipaggiamento dei giocatori. Ogni operazione restituisce
// l'inventario aggiornato, così lo schermo si ridisegna con una risposta sola.
// I prezzi sono quelli del catalogo condiviso (packages/shared/src/catalog.ts).

// Un errore da mostrare al giocatore, col codice HTTP della risposta.
export class InventoryError extends Error {
  constructor(
    readonly status: 400 | 402 | 404 | 409,
    message: string,
  ) {
    super(message)
  }
}

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

export const goldOf = async (tx: Tx | typeof db, userId: string) => {
  const [row] = await tx
    .select({ gold: sql<number>`coalesce(sum(${goldLedger.amount}), 0)::int` })
    .from(goldLedger)
    .where(eq(goldLedger.userId, userId))
  return row.gold
}

// Il caffè in circolo (coffee.ts), se c'è ancora: { id, until }, altrimenti null.
export async function coffeeOf(tx: Tx | typeof db, userId: string) {
  const [row] = await tx
    .select({ id: playerCoffee.coffeeId, until: playerCoffee.until })
    .from(playerCoffee)
    .where(and(eq(playerCoffee.userId, userId), gt(playerCoffee.until, sql`now()`)))
  return row && coffee(row.id) ? row : null
}

export async function inventoryOf(userId: string) {
  const [gold, items, [equipment], active] = await Promise.all([
    goldOf(db, userId),
    db
      .select({ id: playerItem.id, itemId: playerItem.itemId, weightG: playerItem.weightG, quantity: playerItem.quantity, acquiredAt: playerItem.acquiredAt })
      .from(playerItem)
      .where(eq(playerItem.userId, userId))
      .orderBy(desc(playerItem.acquiredAt), desc(playerItem.id)),
    db
      .select({
        hat: playerEquipment.hat,
        color: playerEquipment.color,
        weapon: playerEquipment.weapon,
        armor: playerEquipment.armor,
        rod: playerEquipment.rod,
        pickaxe: playerEquipment.pickaxe,
      })
      .from(playerEquipment)
      .where(eq(playerEquipment.userId, userId)),
    coffeeOf(db, userId),
  ])
  return {
    gold,
    coffee: active,
    items: items.map(({ weightG, ...item }) => ({
      ...item,
      weightKg: weightG === null ? null : weightG / 1000,
      price: weightG === null ? null : fishPrice(weightG),
    })),
    equipment: {
      hat: equipment?.hat ?? null,
      color: equipment?.color ?? null,
      weapon: equipment?.weapon ?? null,
      armor: equipment?.armor ?? null,
      rod: equipment?.rod ?? null,
      pickaxe: equipment?.pickaxe ?? null,
    },
  }
}

// Vende i pesci indicati (solo quelli che sono davvero suoi). Cancellarli e accreditare
// l'oro stanno nella stessa transazione: due vendite insieme dello stesso pesce non pagano due volte.
export async function sellFish(userId: string, ids: number[]) {
  await db.transaction(async (tx) => {
    const sold = await tx
      .delete(playerItem)
      .where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, FISH), inArray(playerItem.id, ids)))
      .returning({ weightG: playerItem.weightG })
    if (!sold.length) throw new InventoryError(404, 'Questi pesci non ci sono più.')
    await tx.insert(goldLedger).values(sold.map((f) => ({ userId, amount: fishPrice(f.weightG ?? 0), reason: 'sell', itemId: FISH })))
  })
  return inventoryOf(userId)
}

// Vende oggetti a quantità che hanno un prezzo (pietre, minerali e gemme della miniera): id del
// catalogo → quanti. Come per gli acquisti la riga del giocatore resta bloccata fino alla fine.
export async function sellItems(userId: string, items: Record<string, number>) {
  const entries = Object.entries(items)
  for (const [id] of entries) if (sellPrice(id) === null) throw new InventoryError(400, `${itemName(id)} non si vende.`)
  await db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
    for (const [id, n] of entries) {
      if ((await countOf(tx, userId, id)) < n) throw new InventoryError(404, `Non hai ${n} × ${itemName(id)}.`)
      await addCount(tx, userId, id, -n)
      await tx.insert(goldLedger).values({ userId, amount: sellPrice(id)! * n, reason: 'sell', itemId: id })
    }
  })
  return inventoryOf(userId)
}

const owns = async (tx: Tx | typeof db, userId: string, itemId: string) =>
  (await tx.select({ id: playerItem.id }).from(playerItem).where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, itemId))).limit(1)).length > 0

// Quanti ne ha di un oggetto a quantità (zuppe, ticket, materiali).
export const countOf = async (tx: Tx, userId: string, itemId: string) => {
  const [row] = await tx.select({ quantity: playerItem.quantity }).from(playerItem).where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, itemId)))
  return row?.quantity ?? 0
}

// Aggiunge (o toglie, con n negativo) a un oggetto a quantità; a zero la riga sparisce.
export async function addCount(tx: Tx, userId: string, itemId: string, n: number) {
  if (n === 0) return
  await tx
    .insert(playerItem)
    .values({ userId, itemId, quantity: n })
    .onConflictDoUpdate({
      target: [playerItem.userId, playerItem.itemId],
      // Scritto per esteso: Postgres riconosce l'indice parziale solo con lo stesso predicato.
      targetWhere: sql`${playerItem.itemId} <> 'fish'`,
      set: { quantity: sql`${playerItem.quantity} + ${n}` },
    })
  if (n < 0) await tx.delete(playerItem).where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, itemId), sql`${playerItem.quantity} <= 0`))
}

// Compra un cappello o un colore. La riga del giocatore resta bloccata fino alla fine: due
// acquisti insieme non spendono le stesse monete e il saldo non va mai sotto zero.
export async function buy(userId: string, itemId: string) {
  const item = shopItem(itemId)
  if (!item) throw new InventoryError(404, 'Questo oggetto non è in vendita.')
  if (item.price === 0) throw new InventoryError(409, 'Ce l\'hai già: è gratis.')
  await db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
    if (await owns(tx, userId, itemId)) throw new InventoryError(409, 'Ce l\'hai già.')
    if ((await goldOf(tx, userId)) < item.price) throw new InventoryError(402, 'Non hai abbastanza monete.')
    await tx.insert(goldLedger).values({ userId, amount: -item.price, reason: 'buy', itemId })
    await tx.insert(playerItem).values({ userId, itemId })
  })
  return inventoryOf(userId)
}

// Indossa un oggetto (suo, o gratis) nel posto giusto, oppure lo toglie con itemId null.
// Cappelli e colori vengono dallo shop, armi, armature, canne e picconi dal crafting.
export async function equip(userId: string, slot: Slot | GearSlot, itemId: string | null) {
  if (itemId !== null && slot !== 'hat' && slot !== 'color') {
    if (gear(itemId)?.slot !== slot) throw new InventoryError(400, 'Questo oggetto non va lì.')
    if (!(await owns(db, userId, itemId))) throw new InventoryError(404, 'Non ce l\'hai: si fa col crafting.')
  } else if (itemId !== null) {
    const item = shopItem(itemId)
    if (!item || item.kind !== slot) throw new InventoryError(400, 'Questo oggetto non va lì.')
    if (item.price > 0 && !(await owns(db, userId, itemId))) throw new InventoryError(404, 'Non ce l\'hai: si compra allo shop.')
  }
  await db
    .insert(playerEquipment)
    .values({ userId, [slot]: itemId })
    .onConflictDoUpdate({ target: playerEquipment.userId, set: { [slot]: itemId } })
  return inventoryOf(userId)
}

// Una ricetta del crafting: toglie gli ingredienti e aggiunge quello che ne esce. Se servono
// pesci si prendono i più leggeri del giocatore. Come per gli acquisti la sua riga resta
// bloccata fino alla fine: due ricette insieme non usano gli stessi ingredienti.
export async function craft(userId: string, recipeId: string) {
  const r = recipe(recipeId)
  if (!r) throw new InventoryError(404, 'Questa ricetta non esiste.')
  await db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
    const missing: string[] = []
    for (const [id, n] of Object.entries(r.needs)) {
      const have = await countOf(tx, userId, id)
      if (have < n) missing.push(`${n - have} × ${itemName(id)}`)
    }
    const fish = r.fish
      ? await tx
          .select({ id: playerItem.id })
          .from(playerItem)
          .where(and(eq(playerItem.userId, userId), eq(playerItem.itemId, FISH)))
          .orderBy(asc(playerItem.weightG), asc(playerItem.id))
          .limit(r.fish)
      : []
    if (fish.length < r.fish) missing.unshift(`${r.fish - fish.length} ${r.fish - fish.length === 1 ? 'pesce' : 'pesci'}`)
    if (missing.length) throw new InventoryError(409, `Ti mancano: ${missing.join(', ')}.`)
    if (fish.length) await tx.delete(playerItem).where(inArray(playerItem.id, fish.map((f) => f.id)))
    for (const [id, n] of Object.entries(r.needs)) await addCount(tx, userId, id, -n)
    await addCount(tx, userId, r.makes, 1)
  })
  return inventoryOf(userId)
}

// Una run nel dungeon: usa un ticket, la simula tutta qui (packages/shared/src/dungeon.ts) con
// l'arma e l'armatura indossate (e il caffè al ginseng, se lo si è bevuto) e salva subito cosa
// ne esce: zuppe bevute, monete, materiali e i punti della classifica.
// Il giocatore poi la guarda (run.events), ma l'esito è già deciso e nell'inventario.
export async function runDungeon(userId: string) {
  const run = await db.transaction(async (tx) => {
    await tx.select({ id: user.id }).from(user).where(eq(user.id, userId)).for('update')
    if ((await countOf(tx, userId, DUNGEON_TICKET)) < 1) throw new InventoryError(402, 'Serve un ticket del dungeon: si ripesca al lago, in una bottiglia.')
    const [worn] = await tx.select({ weapon: playerEquipment.weapon, armor: playerEquipment.armor }).from(playerEquipment).where(eq(playerEquipment.userId, userId))
    // Solo quello che ha ancora: un'arma scambiata non conta più.
    const loadout = {
      weapon: worn?.weapon && (await countOf(tx, userId, worn.weapon)) > 0 ? worn.weapon : null,
      armor: worn?.armor && (await countOf(tx, userId, worn.armor)) > 0 ? worn.armor : null,
    }
    // Un caffè per il dungeon (il ginseng) vale per questa run e poi è finito.
    const active = await coffeeOf(tx, userId)
    const boost = coffee(active?.id)?.dungeon ? active!.id : null
    if (boost) await tx.delete(playerCoffee).where(eq(playerCoffee.userId, userId))
    const run = simulateRun(await countOf(tx, userId, FISH_SOUP), { ...loadout, coffee: boost })
    await addCount(tx, userId, DUNGEON_TICKET, -1)
    await addCount(tx, userId, FISH_SOUP, -run.soupsUsed)
    for (const [itemId, n] of Object.entries(run.materials)) await addCount(tx, userId, itemId, n)
    if (run.gold > 0) await tx.insert(goldLedger).values({ userId, amount: run.gold, reason: 'dungeon', itemId: DUNGEON_TICKET })
    // I punti della classifica della città: per le ondate superate e i boss sconfitti.
    const points = dungeonPoints(run)
    if (points > 0) await tx.insert(playerScore).values({ userId, game: 'dungeon', points })
    return run
  })
  return { run, inventory: await inventoryOf(userId) }
}
