import { DUNGEON_TICKET, FISH, FISH_SOUP, itemName, MATERIALS, mineral } from '@dev-city/shared/catalog'

// L'ufficio per il frontend: nomi e provenienze di quello che chiedono le missioni, i colori dei
// foglietti e il tempo che manca alla fine dell'attesa dopo aver annullato una missione.
// Le regole delle missioni sono in packages/shared/src/office.ts.

// I foglietti della bacheca, per difficoltà: gli stessi colori dei post-it disegnati prima.
export const NOTE_COLORS = { easy: '#ffe082', medium: '#80deea', hard: '#ffab91' }

export const needName = (id) => (id === FISH ? 'Pesci' : itemName(id))

// Dove si trova quello che chiede una missione, per il suggerimento sopra la casella.
export function source(id) {
  if (id === FISH) return 'pesci qualsiasi, si pescano al lago: si danno i più leggeri'
  if (id === FISH_SOUP) return 'si cucina col crafting, con 3 pesci'
  if (id === DUNGEON_TICKET) return 'si ripesca al lago, in una bottiglia'
  if (mineral(id)) return 'si trova in miniera'
  if (MATERIALS.some((m) => m.id === id)) return 'lo lasciano i mostri del dungeon'
  return ''
}

// Quanto manca a until (ISO), in minuti arrotondati per eccesso; 0 se è già passato.
export const minutesLeft = (until, now) => (until ? Math.max(0, Math.ceil((Date.parse(until) - now) / 60_000)) : 0)
