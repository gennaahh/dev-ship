import { MINERALS, type MineralId } from './catalog.ts'

// Le regole della miniera: le applica il game server (apps/game/src/rooms/MineRoom.ts), il
// frontend le racconta. Seduti a un filone si scava da soli: una pietra ogni STONE_MS, e ogni
// FIND_MS (indipendente) una scoperta, un minerale o una gemma presi a caso secondo le chance
// del catalogo. Nessuna scoperta va a vuoto: a differenza dei pesci, la roccia non scappa.
// Cosa si trova e quanto vale sta nel catalogo (MINERALS); il confronto con la pesca:
// bun packages/shared/scripts/mine-balance.ts
export const STONE_MS = [4 * 60_000, 6 * 60_000] as const
export const FIND_MS = [15 * 60_000, 25 * 60_000] as const
// Quanto resta in vista la scoperta prima di tornare a scavare (di più per quelle da festeggiare).
export const FOUND_MS = 6_000
export const BIG_FOUND_MS = 10_000

export const between = (rand: () => number, [min, max]: readonly [number, number]) => min + rand() * (max - min)

// Cosa si trova nella roccia, a caso secondo le chance. luck è la fortuna del piccone (catalogo,
// PICKAXES): rende più probabili, di tanto, i minerali e le gemme non comuni e rari.
export const mineralWeight = (m: (typeof MINERALS)[number], luck = 0) => m.chance * (m.rarity === 'common' ? 1 : 1 + luck)
export function rollMineral(rand: () => number = Math.random, luck = 0): MineralId {
  const total = MINERALS.reduce((sum, m) => sum + mineralWeight(m, luck), 0)
  let r = rand() * total
  for (const m of MINERALS) {
    if (!m.chance) continue
    r -= mineralWeight(m, luck)
    if (r < 0) return m.id
  }
  return 'copper_ore'
}
