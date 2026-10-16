// Il bilanciamento della miniera, a confronto con la pesca: quante monete all'ora rendono
// vendendo tutto, anche con canne e picconi del crafting, e quanto ci vuole per i materiali di
// armi, armature e attrezzi. Le regole della pesca
// sono copiate da apps/game/src/fishing.ts (abboccata ogni 10-20 minuti, 3 volte su 4 resta
// all'amo, 1 pesce su 10 da 5 kg in su, 1 bottiglia col ticket ogni 15 pesci): se cambiano lì,
// vanno cambiate anche qui. bun packages/shared/scripts/mine-balance.ts
import { fishPrice, GEAR, MATERIALS, MINERALS, mineral, PICKAXES, RODS } from '../src/catalog.ts'
import { FIND_MS, mineralWeight, STONE_MS } from '../src/mine.ts'
import { simulateRun } from '../src/dungeon.ts'

const HOURS = 20_000
const HOUR = 3_600_000
const avg = ([min, max]: readonly [number, number]) => (min + max) / 2

// Miniera: le medie si calcolano, non serve simulare.
const stonesPerHour = HOUR / avg(STONE_MS)
const findsPerHour = HOUR / avg(FIND_MS)
const stoneGold = stonesPerHour * mineral('stone')!.price
const findGold = findsPerHour * MINERALS.reduce((sum, m) => sum + (m.chance / 100) * m.price, 0)

// Miniera con un piccone: si aspetta di meno (speed) e le scoperte rare escono più spesso (luck).
function mineGold(speed = 0, luck = 0) {
  const total = MINERALS.reduce((sum, m) => sum + mineralWeight(m, luck), 0)
  const perFind = MINERALS.reduce((sum, m) => sum + (mineralWeight(m, luck) / total) * m.price, 0)
  return (stoneGold + findsPerHour * perFind) / (1 - speed)
}

// Pesca: si simula, per via degli arrotondamenti del prezzo. Con una canna si aspetta di meno
// (speed: più abboccate all'ora) e i pesci speciali escono più spesso (luck).
function fishing(speed = 0, luck = 0) {
  let gold = 0
  let fish = 0
  let bottles = 0
  for (let i = 0; i < (HOURS * 4) / (1 - speed); i++) {
    if (Math.random() >= 0.75) continue
    const kg = Math.round((Math.random() < 0.1 * (1 + luck) ? 5 + Math.random() * 15 : 1 + Math.random() * 3.9) * 10) / 10
    fish++
    gold += fishPrice(kg * 1000)
    if (Math.random() < 1 / 15) bottles++
  }
  return { gold: gold / HOURS, fish: fish / HOURS, bottles: bottles / HOURS }
}
const base = fishing()
// Quanto vale un ticket: le monete di una run con 3 zuppe, senza armi né armature.
let ticketGold = 0
for (let i = 0; i < 4000; i++) ticketGold += simulateRun(3).gold
ticketGold /= 4000

const fmt = (v: number, d = 1) => v.toFixed(d).padStart(7)
console.log('Monete all\'ora, vendendo tutto')
console.log(`  miniera   ${fmt(stoneGold + findGold)}  (pietre ${fmt(stonesPerHour, 0).trim()}/h → ${stoneGold.toFixed(1)}, scoperte ${findsPerHour.toFixed(1)}/h → ${findGold.toFixed(1)})`)
console.log(`  pesca     ${fmt(base.gold)}  (${base.fish.toFixed(1)} pesci/h, più ${base.bottles.toFixed(2)} ticket/h: con 3 zuppe un ticket rende ~${ticketGold.toFixed(0)} monete nel dungeon)`)

console.log('\nCon gli attrezzi del crafting: monete all\'ora vendendo tutto (e quanto in più)')
for (const [i, rod] of RODS.entries()) {
  const pick = PICKAXES[i]
  const f = fishing(rod.speed, rod.luck)
  const m = mineGold(pick.speed, pick.luck)
  const more = (v: number, b: number) => `+${Math.round((v / b - 1) * 100)}%`.padStart(5)
  console.log(`  livello ${rod.tier}  pesca ${fmt(f.gold)} ${more(f.gold, base.gold)} (${f.bottles.toFixed(2)} ticket/h)   miniera ${fmt(m)} ${more(m, stoneGold + findGold)}`)
}

console.log('\nScoperte all\'ora e ore di miniera per trovarne una')
for (const m of MINERALS) {
  if (!m.chance) continue
  const perHour = (findsPerHour * m.chance) / 100
  console.log(`  ${m.name.padEnd(16)} ${fmt(perHour, 2)}/h  ${fmt(1 / perHour, 0)} h  · ${m.price} monete`)
}

// Le ore di miniera per i minerali di ogni ricetta, tenendo conto di quello che si trova
// insieme (la scoperta più lenta comanda), e i materiali del dungeon che servono in più.
console.log('\nArmi, armature, canne e picconi: ore di miniera per i minerali, valore di vendita dei minerali, materiali del dungeon')
const dungeon = new Set<string>(MATERIALS.map((m) => m.id))
for (const g of GEAR) {
  let hours = 0
  let value = 0
  const fromDungeon: string[] = []
  for (const [id, n] of Object.entries(g.cost)) {
    const m = mineral(id)
    if (dungeon.has(id)) fromDungeon.push(`${n} ${MATERIALS.find((x) => x.id === id)!.name}`)
    if (!m) continue
    value += m.price * n
    const perHour = m.chance ? (findsPerHour * m.chance) / 100 : stonesPerHour
    hours = Math.max(hours, n / perHour)
  }
  console.log(`  ${`${g.tier}. ${g.name}`.padEnd(34)} ${fmt(hours, 0)} h  ${fmt(value, 0)} monete  ${fromDungeon.join(', ')}`)
}
