// I colori di canne e picconi del crafting (RODS e PICKAXES in packages/shared/src/catalog.ts):
// per le icone (GearIcon) e per quelli in mano, al lago (Angler) e in miniera (Miner). Ognuno ha
// i colori dei suoi materiali, e una pietra se ce l'ha nella ricetta. Senza attrezzo del
// crafting si pesca e si scava con quelli di sempre (NO_ROD, NO_PICKAXE).
export const NO_ROD = { pole: '#c98a4b', grip: '#7a4a2a', reel: '#4b4870' }
export const NO_PICKAXE = { head: '#c9d3dc', handle: '#a0673a' }

export const TOOL_LOOKS = {
  copper_rod: { pole: '#f0a06a', grip: '#7a4a2a', reel: '#c97a45' },
  iron_rod: { pole: '#b8c2d4', grip: '#7a4a2a', reel: '#6d7f92' },
  silk_rod: { pole: '#b8c2d4', grip: '#4b4870', reel: '#f2eefc', gem: '#f2eefc' },
  silver_rod: { pole: '#e8eef7', grip: '#4b4870', reel: '#b8c2d4', gem: '#9b6bf0' },
  golden_rod: { pole: '#ffd54a', grip: '#4b4870', reel: '#ffd54a', gem: '#3fc97e' },
  fetch_rod: { pole: '#c8f6ff', grip: '#ffd54a', reel: '#ffd54a', gem: '#ffffff' },
  stone_pickaxe: { head: '#a7a3b8', handle: '#a0673a' },
  copper_pickaxe: { head: '#f0a06a', handle: '#a0673a' },
  iron_pickaxe: { head: '#b8c2d4', handle: '#7a4a2a' },
  silver_pickaxe: { head: '#e8eef7', handle: '#4b4870', gem: '#f2eefc' },
  golden_pickaxe: { head: '#ffd54a', handle: '#4b4870', gem: '#9b6bf0' },
  bisect_pickaxe: { head: '#c8f6ff', handle: '#ffd54a', gem: '#ff4a6a' },
}

export const rodLook = (id) => TOOL_LOOKS[id] ?? NO_ROD
export const pickaxeLook = (id) => TOOL_LOOKS[id] ?? NO_PICKAXE

// Cosa fa un attrezzo, in breve: "−10% attesa · +20% rari".
export const toolStat = (t) => `⏱ −${Math.round(t.speed * 100)}% attesa · 🍀 +${Math.round(t.luck * 100)}% rari`
