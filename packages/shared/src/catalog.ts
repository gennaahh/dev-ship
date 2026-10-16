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

// Il crafting: con gli oggetti dell'inventario se ne fanno altri. Le ricette stanno in fondo
// (RECIPES), divise per banco: la cucina (la zuppa di pesce), la forgia delle armi, quella delle
// armature, le canne da pesca e i picconi. La zuppa vuole 3 pesci qualsiasi, e il cuoco prende i più leggeri, così quelli grossi
// e gli speciali restano da vendere. Nel dungeon la zuppa si beve da sola e cura heal punti vita.
// Non si vende.
export const FISH_SOUP = 'fish_soup'

// Il ticket del dungeon: una volta su 15 sale dal lago insieme al pesce, dentro una bottiglia
// (lo decide il game server, apps/game/src/fishing.ts). Ogni run nel dungeon ne usa uno.
export const DUNGEON_TICKET = 'dungeon_ticket'

// I materiali che lasciano i mostri del dungeon, per il crafting di armi e armature.
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

// La miniera: seduti a un filone si scava da soli. Ogni tanto si stacca una pietra, più di rado
// si trova qualcosa nella roccia: un minerale (metalli per le armi e le armature) o una gemma.
// I tempi stanno in mine.ts; qui cosa si trova, quanto spesso (chance: su 100 scoperte, la pietra
// non è una scoperta) e quanto vale alla vendita.
// Tutto si vende, oppure va nel crafting. Il bilanciamento con la pesca:
// bun packages/shared/scripts/mine-balance.ts
export const STONE = 'stone'
export type MineralKind = 'stone' | 'ore' | 'gem'
export const MINERALS = [
  { id: STONE, name: 'Pietra', kind: 'stone', rarity: 'common', price: 1, chance: 0 },
  { id: 'copper_ore', name: 'Rame grezzo', kind: 'ore', rarity: 'common', price: 2, chance: 34 },
  { id: 'iron_ore', name: 'Ferro grezzo', kind: 'ore', rarity: 'common', price: 3, chance: 26 },
  { id: 'quartz', name: 'Quarzo', kind: 'gem', rarity: 'common', price: 3, chance: 12 },
  { id: 'silver_ore', name: 'Argento grezzo', kind: 'ore', rarity: 'uncommon', price: 5, chance: 12 },
  { id: 'amethyst', name: 'Ametista', kind: 'gem', rarity: 'uncommon', price: 6, chance: 7 },
  { id: 'gold_nugget', name: 'Pepita d\'oro', kind: 'ore', rarity: 'uncommon', price: 9, chance: 5 },
  { id: 'emerald', name: 'Smeraldo', kind: 'gem', rarity: 'rare', price: 15, chance: 2.5 },
  { id: 'ruby', name: 'Rubino', kind: 'gem', rarity: 'rare', price: 25, chance: 1 },
  { id: 'diamond', name: 'Diamante', kind: 'gem', rarity: 'rare', price: 60, chance: 0.5 },
] as const satisfies readonly { id: string; name: string; kind: MineralKind; rarity: Rarity; price: number; chance: number }[]
export type MineralId = (typeof MINERALS)[number]['id']
export const mineral = (id: string) => MINERALS.find((m) => m.id === id)
// Le scoperte da festeggiare a tutto schermo (le vedono tutti in miniera): dalla pepita in su.
export const BIG_FIND_PRICE = 9
export const isBigFind = (id: string) => (mineral(id)?.price ?? 0) >= BIG_FIND_PRICE
// Quanto vale alla vendita un oggetto a quantità: solo quelli della miniera, per ora.
export const sellPrice = (id: string) => mineral(id)?.price ?? null

// Armi e armature, dalla forgia del crafting. Si indossano dalla finestra del personaggio (una
// per tipo) e contano nel dungeon: l'arma dà i danni di ogni colpo al posto della spada di legno
// (12-18), l'armatura punti vita in più e una parte dei danni presi che non passa (defense).
// Le ricette vogliono metalli e gemme della miniera, più i materiali del dungeon: per le armi
// zanne, cristalli e nuclei, per le armature pelli, seta e scaglie. Più si sale, più servono
// cose rare. Non si vendono; si scambiano. Il bilanciamento: bun packages/shared/scripts/dungeon-balance.ts
export type GearSlot = 'weapon' | 'armor' | ToolSlot
type Cost = Record<string, number>
export type Weapon = { id: string; name: string; slot: 'weapon'; tier: number; damage: readonly [number, number]; cost: Cost }
export type Armor = { id: string; name: string; slot: 'armor'; tier: number; hp: number; defense: number; cost: Cost }
const weapons = (list: Omit<Weapon, 'slot'>[]): Weapon[] => list.map((w) => ({ ...w, slot: 'weapon' }))
const armors = (list: Omit<Armor, 'slot'>[]): Armor[] => list.map((a) => ({ ...a, slot: 'armor' }))
export const WEAPONS = weapons([
  { id: 'stone_club', name: 'Clava di pietra', tier: 1, damage: [14, 20], cost: { stone: 15, bug_fang: 2 } },
  { id: 'copper_sword', name: 'Spada di rame', tier: 2, damage: [16, 23], cost: { copper_ore: 8, stone: 6, bug_fang: 4 } },
  { id: 'iron_sword', name: 'Spada di ferro', tier: 3, damage: [19, 27], cost: { iron_ore: 10, copper_ore: 4, bug_fang: 6, cache_crystal: 1 } },
  { id: 'silver_blade', name: 'Lama d\'argento', tier: 4, damage: [23, 32], cost: { silver_ore: 8, iron_ore: 6, quartz: 4, cache_crystal: 3 } },
  { id: 'hotfix_hammer', name: 'Martello dell\'hotfix', tier: 5, damage: [27, 38], cost: { gold_nugget: 6, silver_ore: 6, amethyst: 4, kernel_core: 1 } },
  { id: 'diamond_debugger', name: 'Debugger di diamante', tier: 6, damage: [32, 45], cost: { diamond: 1, ruby: 1, gold_nugget: 4, kernel_core: 2 } },
])
export const ARMORS = armors([
  { id: 'bug_vest', name: 'Giubbotto di pelle di bug', tier: 1, hp: 15, defense: 0.05, cost: { bug_hide: 6, stone: 8 } },
  { id: 'copper_mail', name: 'Cotta di rame', tier: 2, hp: 25, defense: 0.1, cost: { copper_ore: 10, bug_hide: 4 } },
  { id: 'iron_plate', name: 'Corazza di ferro', tier: 3, hp: 35, defense: 0.15, cost: { iron_ore: 12, bug_hide: 6, web_silk: 2 } },
  { id: 'silver_armor', name: 'Armatura d\'argento', tier: 4, hp: 45, defense: 0.2, cost: { silver_ore: 8, iron_ore: 6, web_silk: 4, amethyst: 3 } },
  { id: 'incident_armor', name: 'Armatura a scaglie d\'incidente', tier: 5, hp: 60, defense: 0.25, cost: { gold_nugget: 6, emerald: 2, incident_scale: 2 } },
  { id: 'uptime_armor', name: 'Armatura dell\'uptime', tier: 6, hp: 80, defense: 0.3, cost: { diamond: 1, emerald: 2, ruby: 1, incident_scale: 3 } },
])

// Canne da pesca e picconi, dal crafting. Si tengono in mano dalla finestra del personaggio (uno
// per tipo) e contano mentre si pesca o si scava (lo fa il game server, apps/game/src/fishing.ts
// e mine.ts): speed è quanto si accorcia l'attesa (0.1: il 10% in meno), luck quanto diventano
// più probabili le prede rare (0.5: il 50% in più), per la canna i pesci speciali da 5 kg in su,
// per il piccone i minerali e le gemme non comuni e rari. Senza, si pesca e si scava come prima.
// Le canne vogliono metalli e seta di ragnatela (la lenza), i picconi metalli e zanne o cristalli.
// Il bilanciamento: bun packages/shared/scripts/mine-balance.ts
export type ToolSlot = 'rod' | 'pickaxe'
export type Tool = { id: string; name: string; slot: ToolSlot; tier: number; speed: number; luck: number; cost: Cost }
// Per livello. La fortuna delle canne è più bassa: i pesci speciali valgono tanto (pesano e si
// pagano il triplo), così a pari livello canne e picconi rendono più o meno uguale.
const SPEED = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
const LUCK = { rod: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3], pickaxe: [0.1, 0.2, 0.3, 0.45, 0.6, 0.8] }
const tools = (slot: ToolSlot, list: Pick<Tool, 'id' | 'name' | 'cost'>[]): Tool[] =>
  list.map((t, i) => ({ ...t, slot, tier: i + 1, speed: SPEED[i], luck: LUCK[slot][i] }))
export const RODS = tools('rod', [
  { id: 'copper_rod', name: 'Canna di rame', cost: { copper_ore: 3, stone: 8 } },
  { id: 'iron_rod', name: 'Canna di ferro', cost: { iron_ore: 6, copper_ore: 4, bug_hide: 2 } },
  { id: 'silk_rod', name: 'Canna con lenza di seta', cost: { iron_ore: 6, quartz: 2, web_silk: 3 } },
  { id: 'silver_rod', name: 'Canna d\'argento', cost: { silver_ore: 8, amethyst: 2, web_silk: 4 } },
  { id: 'golden_rod', name: 'Canna d\'oro', cost: { gold_nugget: 6, emerald: 1, web_silk: 6 } },
  { id: 'fetch_rod', name: 'Canna del git fetch', cost: { diamond: 1, emerald: 1, gold_nugget: 4, kernel_core: 1 } },
])
export const PICKAXES = tools('pickaxe', [
  { id: 'stone_pickaxe', name: 'Piccone di pietra', cost: { stone: 20 } },
  { id: 'copper_pickaxe', name: 'Piccone di rame', cost: { copper_ore: 8, stone: 6 } },
  { id: 'iron_pickaxe', name: 'Piccone di ferro', cost: { iron_ore: 10, copper_ore: 4, bug_fang: 2 } },
  { id: 'silver_pickaxe', name: 'Piccone d\'argento', cost: { silver_ore: 8, iron_ore: 6, cache_crystal: 2 } },
  { id: 'golden_pickaxe', name: 'Piccone d\'oro', cost: { gold_nugget: 6, amethyst: 3, cache_crystal: 3 } },
  { id: 'bisect_pickaxe', name: 'Piccone del git bisect', cost: { diamond: 1, ruby: 1, gold_nugget: 4, kernel_core: 1 } },
])
export const TOOLS = [...RODS, ...PICKAXES]
export const tool = (id: string | null | undefined) => TOOLS.find((t) => t.id === id) ?? null

export const GEAR = [...WEAPONS, ...ARMORS, ...TOOLS]
export const gear = (id: string) => GEAR.find((g) => g.id === id)
export const weapon = (id: string | null | undefined) => WEAPONS.find((w) => w.id === id) ?? null
export const armor = (id: string | null | undefined) => ARMORS.find((a) => a.id === id) ?? null

// Le ricette. category: il banco del crafting. needs: oggetti a quantità (id del catalogo →
// quanti); fish: quanti pesci qualsiasi (i più leggeri). makes: cosa ne esce, uno.
export type RecipeCategory = 'kitchen' | GearSlot
export type Recipe = { id: string; name: string; category: RecipeCategory; makes: string; fish: number; needs: Cost; heal?: number }
export const RECIPE_CATEGORIES: { id: RecipeCategory; name: string }[] = [
  { id: 'kitchen', name: 'Cucina' },
  { id: 'weapon', name: 'Armi' },
  { id: 'armor', name: 'Armature' },
  { id: 'rod', name: 'Canne' },
  { id: 'pickaxe', name: 'Picconi' },
]
export const RECIPES: Recipe[] = [
  { id: FISH_SOUP, name: 'Zuppa di pesce', category: 'kitchen', makes: FISH_SOUP, fish: 3, needs: {}, heal: 30 },
  ...GEAR.map((g) => ({ id: g.id, name: g.name, category: g.slot, makes: g.id, fish: 0, needs: g.cost })),
]
export const recipe = (id: string) => RECIPES.find((r) => r.id === id)

// Gli scambi tra giocatori: oltre a monete e pesci si scambiano gli oggetti a quantità (zuppe,
// ticket, materiali, minerali, armi, armature, canne e picconi) e i cappelli comprati, che si hanno al massimo
// una volta. I colori no: sono gratis per tutti.
export const STACK_ITEMS: string[] = [FISH_SOUP, DUNGEON_TICKET, ...MATERIALS.map((m) => m.id), ...MINERALS.map((m) => m.id), ...GEAR.map((g) => g.id)]
export const isHat = (id: string) => HATS.some((h) => h.id === id)
export const isTradable = (id: string) => STACK_ITEMS.includes(id) || isHat(id)

// Il nome da mostrare di un oggetto dell'inventario (pesci esclusi: hanno la loro specie).
export function itemName(id: string) {
  if (id === FISH_SOUP) return recipe(FISH_SOUP)!.name
  if (id === DUNGEON_TICKET) return 'Ticket in bottiglia'
  return MATERIALS.find((m) => m.id === id)?.name ?? mineral(id)?.name ?? gear(id)?.name ?? shopItem(id)?.name ?? id
}
