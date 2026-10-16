// Il bilanciamento dei punti della classifica (packages/shared/src/score.ts): quanti punti
// all'ora danno la pesca e la miniera, senza attrezzi e con quelli di ogni livello, quanti una
// run nel dungeon per livello di armi e quanti una missione per difficoltà. Le regole della pesca
// sono quelle di apps/game/src/fishing.ts (come in mine-balance.ts).
// bun packages/shared/scripts/score-balance.ts
import { MINERALS, PICKAXES, RODS } from '../src/catalog.ts'
import { simulateRun, type Loadout } from '../src/dungeon.ts'
import { FIND_MS, mineralWeight, STONE_MS } from '../src/mine.ts'
import { BOARD, generateMission } from '../src/office.ts'
import { dungeonPoints, FISH_POINTS_PER_KG, MINE_POINTS_PER_GOLD, missionPoints } from '../src/score.ts'

const HOUR = 3_600_000
const avg = ([min, max]: readonly [number, number]) => (min + max) / 2
const fmt = (v: number, d = 0) => v.toFixed(d).padStart(6)

// Pesca: 4 abboccate all'ora (una ogni 15 minuti), 3 su 4 restano; 1 su 10 è speciale (5-20 kg,
// 12,5 in media), gli altri 1-4,9 kg (2,95 in media).
const fishPoints = (speed: number, luck: number) => ((4 * 0.75) / (1 - speed)) * (0.1 * (1 + luck) * 12.5 + (1 - 0.1 * (1 + luck)) * 2.95) * FISH_POINTS_PER_KG
function minePoints(speed: number, luck: number) {
  const total = MINERALS.reduce((sum, m) => sum + mineralWeight(m, luck), 0)
  const perFind = MINERALS.reduce((sum, m) => sum + (mineralWeight(m, luck) / total) * m.price, 0)
  return ((HOUR / avg(STONE_MS) + (HOUR / avg(FIND_MS)) * perFind) / (1 - speed)) * MINE_POINTS_PER_GOLD
}

console.log('Punti all\'ora (pesca / miniera)')
console.log(`  senza attrezzi  ${fmt(fishPoints(0, 0))} ${fmt(minePoints(0, 0))}`)
for (const [i, rod] of RODS.entries()) {
  const pick = PICKAXES[i]
  console.log(`  livello ${rod.tier}       ${fmt(fishPoints(rod.speed, rod.luck))} ${fmt(minePoints(pick.speed, pick.luck))}`)
}

const RUNS = 20_000
const GEAR: [string, Loadout][] = [
  ['senza armi né armature', {}],
  ['livello 1', { weapon: 'stone_club', armor: 'bug_vest' }],
  ['livello 3', { weapon: 'iron_sword', armor: 'iron_plate' }],
  ['livello 5', { weapon: 'hotfix_hammer', armor: 'incident_armor' }],
  ['livello 6', { weapon: 'diamond_debugger', armor: 'uptime_armor' }],
]
console.log('\nPunti di una run nel dungeon, con 3 zuppe (un ticket ogni 5 ore di pesca, circa)')
for (const [label, loadout] of GEAR) {
  let points = 0
  for (let i = 0; i < RUNS; i++) points += dungeonPoints(simulateRun(3, loadout))
  console.log(`  ${label.padEnd(24)} ${fmt(points / RUNS)}`)
}

console.log('\nPunti di una missione dell\'ufficio, in media')
for (const difficulty of new Set(BOARD)) {
  let points = 0
  for (let i = 0; i < 5000; i++) points += missionPoints(generateMission(difficulty).reward)
  console.log(`  ${difficulty.padEnd(8)} ${fmt(points / 5000)}`)
}
