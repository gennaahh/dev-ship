import { DUNGEON_TICKET, FISH, FISH_SOUP, mineral } from './catalog.ts'

// Le missioni della bacheca dell'ufficio: qualcuno in città chiede degli oggetti (pesci, zuppe,
// pietre, minerali, gemme o materiali del dungeon) e paga in monete, a volte con un ticket.
// Sulla bacheca ce ne sono sempre BOARD.length, una per posto: quando un giocatore ne prende una,
// nello stesso posto ne esce subito un'altra della stessa difficoltà. Così la bacheca non si
// riempie di missioni difficili lasciate lì. Una missione alla volta per giocatore; annullarla
// costa CANCEL_COOLDOWN_MS senza poterne prendere un'altra. Le gestisce l'API (apps/api/src/office.ts).

export type Difficulty = 'easy' | 'medium' | 'hard'
export const DIFFICULTY_NAMES: Record<Difficulty, string> = { easy: 'Facile', medium: 'Media', hard: 'Difficile' }
// La difficoltà di ogni posto della bacheca.
export const BOARD: Difficulty[] = ['easy', 'easy', 'medium', 'hard']
export const CANCEL_COOLDOWN_MS = 60 * 60_000

// needs: id del catalogo → quanti; 'fish' sono pesci qualsiasi, e alla consegna si danno i più
// leggeri (come in cucina). reward: le monete e gli oggetti a quantità che si ricevono.
export type Reward = { gold: number; items: Record<string, number> }
export type Mission = { difficulty: Difficulty; requester: string; title: string; needs: Record<string, number>; reward: Reward }

// Quanto vale in monete un oggetto chiesto, per fare il premio: per pietre, minerali e gemme il
// prezzo di vendita; per il resto, che non si vende, quanto costa trovarlo. Un pesce è una ventina
// di minuti al lago (3 l'ora, a 20 monete l'ora), la zuppa sono 3 pesci, i materiali del dungeon
// arrivano coi ticket (uno ogni 5 ore di pesca).
const VALUE: Record<string, number> = {
  [FISH]: 5,
  [FISH_SOUP]: 15,
  bug_hide: 4,
  bug_fang: 4,
  web_silk: 10,
  cache_crystal: 10,
  incident_scale: 30,
  kernel_core: 30,
}
export const valueOf = (id: string) => VALUE[id] ?? mineral(id)?.price ?? 0
// Il premio rende di più che vendere: vale la pena tenere le cose per la bacheca.
export const REWARD_MULTIPLIER = 1.5
// Le missioni difficili, una volta su TICKET_CHANCE, danno anche un ticket del dungeon.
export const TICKET_CHANCE = 0.5

// Chi chiede cosa. Ogni tema ha i suoi oggetti per difficoltà: [id, quanti da, quanti a].
type Ask = readonly [string, number, number]
type Theme = { requesters: string[]; titles: string[]; asks: Record<Difficulty, Ask[]> }
const THEMES: Theme[] = [
  {
    requesters: ['Mensa aziendale', 'Team marketing', 'Ufficio HR'],
    titles: ['Grigliata di fine sprint', 'Pranzo col cliente', 'Aperitivo del venerdì', 'Cena di team building'],
    asks: {
      easy: [[FISH, 2, 4]],
      medium: [[FISH, 4, 6], [FISH_SOUP, 1, 2]],
      hard: [[FISH_SOUP, 3, 4], [FISH, 6, 8]],
    },
  },
  {
    requesters: ['Sistemista', 'Facility manager', 'Team DevOps'],
    titles: ['Nuovo rack dei server', 'Cablaggio della sala riunioni', 'Scrivanie standing per tutti', 'Rinforzo del data center'],
    asks: {
      easy: [['stone', 10, 25], ['copper_ore', 3, 6], ['iron_ore', 2, 4]],
      medium: [['iron_ore', 4, 8], ['silver_ore', 2, 4], ['copper_ore', 6, 10]],
      hard: [['silver_ore', 4, 6], ['gold_nugget', 2, 3]],
    },
  },
  {
    requesters: ['Ufficio commerciale', 'Product owner', 'Amministratore delegato'],
    titles: ['Regalo per il cliente', 'Premio dell\'hackathon', 'Gadget per la conferenza', 'Targa per i dieci anni'],
    asks: {
      easy: [['quartz', 1, 3]],
      medium: [['amethyst', 1, 2], ['quartz', 3, 5]],
      hard: [['emerald', 1, 2], ['gold_nugget', 2, 3], ['amethyst', 2, 3]],
    },
  },
  {
    requesters: ['Team QA', 'Team sicurezza', 'Scrum master'],
    titles: ['Studio sui bug', 'Postmortem dell\'incidente', 'Test di regressione', 'Bug bash'],
    asks: {
      easy: [['bug_hide', 2, 4], ['bug_fang', 2, 4]],
      medium: [['web_silk', 1, 2], ['cache_crystal', 1, 2], ['bug_hide', 4, 6], ['bug_fang', 4, 6]],
      hard: [['incident_scale', 1, 1], ['kernel_core', 1, 1], ['web_silk', 2, 3], ['cache_crystal', 2, 3]],
    },
  },
]

const pick = <T>(list: readonly T[], rng: () => number) => list[Math.floor(rng() * list.length)]
const between = (min: number, max: number, rng: () => number) => min + Math.floor(rng() * (max - min + 1))

// Una missione nuova: facile un oggetto del tema, media due (almeno uno da media), difficile uno
// da difficile e uno da media. Il premio è il valore di quello che si chiede per REWARD_MULTIPLIER,
// arrotondato a 5 monete.
export function generateMission(difficulty: Difficulty, rng: () => number = Math.random): Mission {
  const theme = pick(THEMES, rng)
  const first = pick(theme.asks[difficulty], rng)
  const asks = [first]
  if (difficulty !== 'easy') {
    const others = (difficulty === 'hard' ? theme.asks.medium : [...theme.asks.medium, ...theme.asks.easy]).filter((a) => a[0] !== first[0])
    if (others.length) asks.push(pick(others, rng))
  }
  const needs: Record<string, number> = {}
  for (const [id, min, max] of asks) needs[id] = between(min, max, rng)
  const value = Object.entries(needs).reduce((sum, [id, n]) => sum + valueOf(id) * n, 0)
  const items: Record<string, number> = difficulty === 'hard' && rng() < TICKET_CHANCE ? { [DUNGEON_TICKET]: 1 } : {}
  return {
    difficulty,
    requester: pick(theme.requesters, rng),
    title: pick(theme.titles, rng),
    needs,
    reward: { gold: Math.max(10, Math.round((value * REWARD_MULTIPLIER) / 5) * 5), items },
  }
}
