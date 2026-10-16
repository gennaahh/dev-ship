// Il catalogo degli oggetti, uguale per frontend e API: l'API ci prende i prezzi e controlla
// cosa si può comprare e indossare, lo shop e l'inventario ci prendono nomi e colori.
// Gli id finiscono nel database (player_item, player_equipment): non vanno cambiati.

export type Slot = 'hat' | 'color'
// added: il giorno in cui è arrivato nello shop, che per un po' lo segna come novità.
export type ShopItem = { id: string; kind: Slot; name: string; price: number; value?: string; added?: string }

// Prezzo 0: lo si ha già, senza comprarlo. I colori sono tutti gratis: non stanno nello shop,
// si scelgono dalla finestra del personaggio.
export const COLORS = [
  { id: 'azzurro', name: 'Azzurro', value: '#4fc3f7', price: 0 },
  { id: 'corallo', name: 'Corallo', value: '#ff7a59', price: 0 },
  { id: 'menta', name: 'Menta', value: '#9ccc65', price: 0 },
  { id: 'sole', name: 'Sole', value: '#ffca28', price: 0 },
  { id: 'lilla', name: 'Lilla', value: '#ba68c8', price: 0 },
  { id: 'rosa', name: 'Rosa', value: '#f06292', price: 0 },
  { id: 'acqua', name: 'Acquamarina', value: '#4db6ac', price: 0 },
  { id: 'notte', name: 'Notte', value: '#5c6bc0', price: 0 },
].map((c) => ({ ...c, kind: 'color' as const }))

// In ordine di prezzo, come li mostra lo shop.
export const HATS = [
  { id: 'beanie', name: 'Cuffia col pon pon', price: 80 },
  { id: 'cap', name: 'Cappellino', price: 100 },
  { id: 'chef', name: 'Cappello da cuoco', price: 120 },
  { id: 'headphones', name: 'Cuffie da focus', price: 150 },
  { id: 'propeller', name: 'Cappellino a elica', price: 200, added: '2026-10-16' },
  { id: 'pirate', name: 'Tricorno da pirata', price: 250 },
  { id: 'captain', name: 'Berretto da capitano', price: 300, added: '2026-10-16' },
  { id: 'wizard', name: 'Cappello da mago', price: 400, added: '2026-10-16' },
  { id: 'crown', name: 'Corona', price: 500 },
].map((h): ShopItem => ({ ...h, kind: 'hat' as const }))

const SHOP: ShopItem[] = [...COLORS, ...HATS]
export const shopItem = (id: string) => SHOP.find((i) => i.id === id)

// I pesci presi al lago: ognuno è un oggetto a sé, col suo peso. Si vendono per monete d'oro.
export const FISH = 'fish'
// 1 moneta per chilo, arrotondata al pesce: un pesce da 1,4 kg vale 1 moneta, uno da 1,6 kg 2.
// I pesci speciali, da 5 kg in su (quelli festeggiati a tutto schermo), valgono il triplo.
export const GOLD_PER_KG = 1
export const SPECIAL_KG = 5
export const SPECIAL_MULTIPLIER = 3
export const isSpecialFish = (weightG: number) => weightG >= SPECIAL_KG * 1000
export const fishPrice = (weightG: number) =>
  Math.round((weightG / 1000) * GOLD_PER_KG * (isSpecialFish(weightG) ? SPECIAL_MULTIPLIER : 1))

// Il crafting: con gli oggetti dell'inventario se ne fanno altri. Per ora c'è una ricetta sola,
// la zuppa di pesce: 3 pesci qualsiasi, e il cuoco prende i più leggeri, così quelli grossi e
// gli speciali restano da vendere. Nel dungeon la zuppa si beve da sola e cura heal punti vita.
// Non si vende.
export const FISH_SOUP = 'fish_soup'
export type Recipe = { id: string; name: string; makes: string; fish: number; heal: number }
export const RECIPES: Recipe[] = [{ id: 'fish_soup', name: 'Zuppa di pesce', makes: FISH_SOUP, fish: 3, heal: 30 }]
export const recipe = (id: string) => RECIPES.find((r) => r.id === id)

// Il ticket del dungeon: una volta su 15 sale dal lago insieme al pesce, dentro una bottiglia
// (lo decide il game server, apps/game/src/fishing.ts). Ogni run nel dungeon ne usa uno.
export const DUNGEON_TICKET = 'dungeon_ticket'

// I materiali che lasciano i mostri del dungeon, per il crafting di armi e armature che verrà.
// Tre rarità, e per ognuna un materiale per le armature e uno per le armi: comuni dai mostri
// di tutte le ondate, non comuni da quelli delle ondate più avanti, rari quasi solo dal boss.
export type Rarity = 'common' | 'uncommon' | 'rare'
export const MATERIALS = [
  { id: 'bug_hide', name: 'Pelle di bug', rarity: 'common', use: 'armor' },
  { id: 'bug_fang', name: 'Zanna di bug', rarity: 'common', use: 'weapon' },
  { id: 'web_silk', name: 'Seta di ragnatela', rarity: 'uncommon', use: 'armor' },
  { id: 'cache_crystal', name: 'Cristallo di cache', rarity: 'uncommon', use: 'weapon' },
  { id: 'incident_scale', name: 'Scaglia d\'incidente', rarity: 'rare', use: 'armor' },
  { id: 'kernel_core', name: 'Nucleo del kernel', rarity: 'rare', use: 'weapon' },
] as const satisfies readonly { id: string; name: string; rarity: Rarity; use: 'armor' | 'weapon' }[]
export const RARITY_NAMES: Record<Rarity, string> = { common: 'Comune', uncommon: 'Non comune', rare: 'Raro' }

// Gli scambi tra giocatori: oltre a monete e pesci si scambiano gli oggetti a quantità (zuppe,
// ticket, materiali) e i cappelli comprati, che si hanno al massimo una volta. I colori no:
// sono gratis per tutti.
export const STACK_ITEMS: string[] = [FISH_SOUP, DUNGEON_TICKET, ...MATERIALS.map((m) => m.id)]
export const isHat = (id: string) => HATS.some((h) => h.id === id)
export const isTradable = (id: string) => STACK_ITEMS.includes(id) || isHat(id)

// Il nome da mostrare di un oggetto dell'inventario (pesci esclusi: hanno la loro specie).
export function itemName(id: string) {
  if (id === FISH_SOUP) return recipe(FISH_SOUP)!.name
  if (id === DUNGEON_TICKET) return 'Ticket in bottiglia'
  return MATERIALS.find((m) => m.id === id)?.name ?? shopItem(id)?.name ?? id
}
