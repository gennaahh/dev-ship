// Il bilanciamento dei caffè dell'ufficio: quante monete in più porta ognuno, per tutta la sua
// durata e tolto il prezzo, a chi pesca, a chi scava e a chi fa tutte e due le cose (due schede),
// senza attrezzi e con quelli di livello 3; per il ginseng, quanto rende in più la run nel dungeon
// per livello di armi. L'obiettivo: chi fa tutte e due le cose va più o meno in pari, chi ne fa
// una sola ci perde un po' (il caffè è una scelta e toglie monete dal gioco); il ginseng non va
// mai sotto zero. Le regole della pesca sono quelle di apps/game/src/fishing.ts (come in
// mine-balance.ts). bun packages/shared/scripts/coffee-balance.ts
import { MINERALS, PICKAXES, RODS } from '../src/catalog.ts'
import { COFFEES } from '../src/coffee.ts'
import { simulateRun, type Loadout } from '../src/dungeon.ts'
import { FIND_MS, mineralWeight, STONE_MS } from '../src/mine.ts'

const HOUR = 3_600_000
const avg = ([min, max]: readonly [number, number]) => (min + max) / 2

// Monete all'ora vendendo tutto. Pesca: 4 abboccate all'ora (una ogni 15 minuti), 3 su 4 restano,
// 1 su 10 è speciale (5-20 kg, il triplo), gli altri 1-4,9 kg; 1 moneta per chilo, al pesce.
const SMALL = 2.95
const BIG = 37.5
const fishGold = (speed: number, luck: number) => ((4 * 0.75) / (1 - speed)) * (0.1 * (1 + luck) * BIG + (1 - 0.1 * (1 + luck)) * SMALL)
function mineGold(speed: number, luck: number) {
  const total = MINERALS.reduce((sum, m) => sum + mineralWeight(m, luck), 0)
  const perFind = MINERALS.reduce((sum, m) => sum + (mineralWeight(m, luck) / total) * m.price, 0)
  return (HOUR / avg(STONE_MS) + (HOUR / avg(FIND_MS)) * perFind) / (1 - speed)
}

const tiers = [
  { label: 'senza attrezzi', rod: { speed: 0, luck: 0 }, pick: { speed: 0, luck: 0 } },
  { label: 'livello 3', rod: RODS[2], pick: PICKAXES[2] },
]
// Il guadagno netto, col segno: sotto zero il caffè costa più di quanto rende.
const net = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(1)}`.padStart(6)

console.log('Monete in più per tutta la durata del caffè, meno il prezzo (pesca / miniera / tutte e due)')
for (const c of COFFEES.filter((c) => !c.dungeon)) {
  const hours = c.minutes / 60
  const cols = tiers.map(({ rod, pick }) => {
    const f = (fishGold(rod.speed + c.speed, rod.luck + c.luck) - fishGold(rod.speed, rod.luck)) * hours
    const m = (mineGold(pick.speed + c.speed, pick.luck + c.luck) - mineGold(pick.speed, pick.luck)) * hours
    return `${net(f - c.price)} ${net(m - c.price)} ${net(f + m - c.price)}`
  })
  console.log(`  ${c.name.padEnd(18)} ${String(c.minutes).padStart(3)} min  ${String(c.price).padStart(2)} 🪙   ${tiers[0].label}: ${cols[0]}   ${tiers[1].label}: ${cols[1]}`)
}

// Il dungeon: le monete medie di una run con 3 zuppe, con e senza il caffè, per livello di armi.
const RUNS = 20_000
const runGold = (loadout: Loadout) => {
  let gold = 0
  for (let i = 0; i < RUNS; i++) gold += simulateRun(3, loadout).gold
  return gold / RUNS
}
const GEAR: [string, Loadout][] = [
  ['senza armi né armature', {}],
  ['livello 1', { weapon: 'stone_club', armor: 'bug_vest' }],
  ['livello 3', { weapon: 'iron_sword', armor: 'iron_plate' }],
  ['livello 5', { weapon: 'hotfix_hammer', armor: 'incident_armor' }],
]
for (const c of COFFEES.filter((c) => c.dungeon)) {
  console.log(`\n${c.name} (${c.price} 🪙) nel dungeon, con 3 zuppe: monete di una run senza e col caffè, e il guadagno meno il prezzo`)
  for (const [label, loadout] of GEAR) {
    const without = runGold(loadout)
    const withCoffee = runGold({ ...loadout, coffee: c.id })
    console.log(`  ${label.padEnd(24)} ${without.toFixed(0).padStart(4)} → ${withCoffee.toFixed(0).padStart(4)}  ${net(withCoffee - without - c.price)}`)
  }
}
