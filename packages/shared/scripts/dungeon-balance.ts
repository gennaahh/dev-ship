// Il bilanciamento del dungeon: tante run simulate per ogni numero di zuppe, con le medie di
// ondate, monete e materiali per rarità. +monete/zuppa è quanto rende in media ogni zuppa in
// più: deve restare ben sopra quello che valgono i 3 pesci che ci vogliono (piccoli, 1-3 monete
// l'uno), se no al dungeon conviene vendere i pesci. bun packages/shared/scripts/dungeon-balance.ts
import { MATERIALS } from '../src/catalog.ts'
import { simulateRun } from '../src/dungeon.ts'

const RUNS = 4000
const rarity = Object.fromEntries(MATERIALS.map((m) => [m.id, m.rarity]))
const cell = (v: number, digits = 1, width = 8) => v.toFixed(digits).padStart(width)

console.log('  zuppe  ondata  monete  +monete/zuppa  comuni  non comuni  rari  durata(s)')
let before = 0
let soupsBefore = 0
for (const soups of [0, 1, 2, 3, 5, 8, 10, 15, 20, 30]) {
  let wave = 0
  let gold = 0
  let ms = 0
  const found = { common: 0, uncommon: 0, rare: 0 }
  for (let i = 0; i < RUNS; i++) {
    const run = simulateRun(soups)
    wave += run.wave
    gold += run.gold
    ms += run.durationMs
    for (const [id, n] of Object.entries(run.materials)) found[rarity[id]] += n ?? 0
  }
  const avg = gold / RUNS
  const perSoup = soups ? cell((avg - before) / (soups - soupsBefore), 1, 15) : ''.padStart(15)
  console.log(
    String(soups).padStart(7), cell(wave / RUNS), cell(avg, 0), perSoup,
    cell(found.common / RUNS), cell(found.uncommon / RUNS, 2, 12), cell(found.rare / RUNS, 2, 6), cell(ms / RUNS / 1000, 0, 11),
  )
  before = avg
  soupsBefore = soups
}
