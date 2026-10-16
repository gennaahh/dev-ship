// Il catalogo degli oggetti, uguale per frontend e API: l'API ci prende i prezzi e controlla
// cosa si può comprare e indossare, lo shop e l'inventario ci prendono nomi e colori.
// Gli id finiscono nel database (player_item, player_equipment): non vanno cambiati.

export type Slot = 'hat' | 'color'
export type ShopItem = { id: string; kind: Slot; name: string; price: number; value?: string }

// Prezzo 0: lo si ha già, senza comprarlo.
export const COLORS = [
  { id: 'azzurro', name: 'Azzurro', value: '#4fc3f7', price: 0 },
  { id: 'corallo', name: 'Corallo', value: '#ff7a59', price: 50 },
  { id: 'menta', name: 'Menta', value: '#9ccc65', price: 50 },
  { id: 'sole', name: 'Sole', value: '#ffca28', price: 50 },
  { id: 'lilla', name: 'Lilla', value: '#ba68c8', price: 50 },
  { id: 'rosa', name: 'Rosa', value: '#f06292', price: 50 },
  { id: 'acqua', name: 'Acquamarina', value: '#4db6ac', price: 50 },
  { id: 'notte', name: 'Notte', value: '#5c6bc0', price: 80 },
].map((c) => ({ ...c, kind: 'color' as const }))

export const HATS = [
  { id: 'beanie', name: 'Cuffia col pon pon', price: 80 },
  { id: 'cap', name: 'Cappellino', price: 100 },
  { id: 'chef', name: 'Cappello da cuoco', price: 120 },
  { id: 'headphones', name: 'Cuffie da focus', price: 150 },
  { id: 'pirate', name: 'Tricorno da pirata', price: 250 },
  { id: 'crown', name: 'Corona', price: 500 },
].map((h) => ({ ...h, kind: 'hat' as const }))

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
