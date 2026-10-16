// La miniera per il frontend: misura dei personaggi, colori delle scoperte e dati dimostrativi.
// Dove stanno i filoni e come ci si cammina è in cave.js, cosa si trova nel catalogo (MINERALS)
// e i tempi in packages/shared/src/mine.ts.

// La galleria è vista un po' da lontano: personaggi più piccoli che in piazza.
export const SCALE = 0.8

// Il colore di ogni scoperta, per bagliori, raggi e cartellone.
export const GLOW = {
  stone: '#c9c5d8',
  copper_ore: '#e98a4a',
  iron_ore: '#d9a07c',
  quartz: '#f2eefc',
  silver_ore: '#e8eef7',
  amethyst: '#c59bff',
  gold_nugget: '#ffd54a',
  emerald: '#3fc97e',
  ruby: '#ff4a6a',
  diamond: '#c8f6ff',
}

// Le pagliuzze colorate di ogni filone: ognuno ha i suoi colori, sempre gli stessi.
const FLECKS = ['#e98a4a', '#d9a07c', '#c59bff', '#ffd54a', '#3fc97e', '#e8eef7', '#ff4a6a', '#c8f6ff']
export const flecksFor = (spot) => [FLECKS[spot % FLECKS.length], FLECKS[(spot * 3 + 1) % FLECKS.length], FLECKS[(spot * 5 + 2) % FLECKS.length]]

// Quanto tempo fa, a grandi linee.
export function ago(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (min < 1) return 'ora'
  if (min < 60) return `${min} min fa`
  if (min < 24 * 60) return `${Math.floor(min / 60)} h fa`
  return `${Math.floor(min / (24 * 60))} g fa`
}

// Cartellone dimostrativo, per il sito senza backend: l'equipaggio della classifica della città.
const row = (name, finds, best, value) => ({ name, finds, best, value })
const at = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()
export const DEMO_BOARD = {
  day: [row('Nostromo Deploy', 4, 'gold_nugget', 21), row('Vedetta Debug', 3, 'amethyst', 12), row('Marinaio Commit', 2, 'iron_ore', 5)],
  week: [
    row('Vedetta Debug', 19, 'ruby', 96),
    row('Nostromo Deploy', 17, 'emerald', 74),
    row('Marinaio Commit', 12, 'gold_nugget', 47),
    row('Timoniere Review', 8, 'amethyst', 29),
    row('Capitan Merge', 5, 'silver_ore', 16),
  ],
  all: [
    row('Vedetta Debug', 88, 'diamond', 412),
    row('Nostromo Deploy', 71, 'ruby', 338),
    row('Marinaio Commit', 50, 'emerald', 221),
    row('Timoniere Review', 34, 'gold_nugget', 140),
    row('Capitan Merge', 22, 'amethyst', 81),
  ],
  recent: [
    { name: 'Vedetta Debug', itemId: 'amethyst', foundAt: at(3) },
    { name: 'Nostromo Deploy', itemId: 'gold_nugget', foundAt: at(18) },
    { name: 'Marinaio Commit', itemId: 'iron_ore', foundAt: at(36) },
    { name: 'Vedetta Debug', itemId: 'copper_ore', foundAt: at(52) },
    { name: 'Nostromo Deploy', itemId: 'quartz', foundAt: at(90) },
  ],
}
