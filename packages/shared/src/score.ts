import { mineral } from './catalog.ts'

// I punti della classifica della città, che si sommano da tutti i giochi. Ogni volta che si fa
// punti se ne scrive una riga in player_score (gioco, punti, quando): la classifica della
// settimana (da lunedì, ora italiana) e quella di sempre le calcola l'API, e i primi tre della
// settimana stanno al timone della dev-ship. Le regole sono qui, le applicano il game server
// (pesca e miniera) e l'API (dungeon e missioni).
//
// Un'ora al lago o in miniera vale più o meno uguale (circa 120 punti senza attrezzi); il
// dungeon e le missioni sono un di più, perché ticket e oggetti arrivano da lì. Il bilanciamento:
// bun packages/shared/scripts/score-balance.ts

export type Game = 'fishing' | 'mining' | 'dungeon' | 'mission'
// icon: il nome dell'icona del frontend (src/components/Icon.vue).
export const GAMES: { id: Game; name: string; icon: string }[] = [
  { id: 'fishing', name: 'Pesca', icon: 'fish' },
  { id: 'mining', name: 'Miniera', icon: 'pickaxe' },
  { id: 'dungeon', name: 'Dungeon', icon: 'bug' },
  { id: 'mission', name: 'Missioni', icon: 'pin' },
]

// Pesca: 10 punti per chilo, cioè 1 ogni etto (gli stessi della classifica del lago).
export const FISH_POINTS_PER_KG = 10
export const fishPoints = (kg: number) => Math.round(kg * FISH_POINTS_PER_KG)

// Miniera: 5 punti per ogni moneta di valore di quello che si stacca, pietre comprese (una pietra
// 5 punti, un diamante 300).
export const MINE_POINTS_PER_GOLD = 5
export const minePoints = (itemId: string) => (mineral(itemId)?.price ?? 0) * MINE_POINTS_PER_GOLD

// Dungeon: 10 punti per ogni ondata superata e 40 in più per ogni boss sconfitto (uno ogni 5
// ondate). Una run ripulita, 20 ondate, ne vale 360.
export const WAVE_POINTS = 10
export const BOSS_POINTS = 40
export function dungeonPoints(run: { wave: number; cleared: boolean }) {
  const beaten = run.cleared ? run.wave : run.wave - 1
  return beaten * WAVE_POINTS + Math.floor(beaten / 5) * BOSS_POINTS
}

// Missioni dell'ufficio: 2 punti per ogni moneta del premio.
export const MISSION_POINTS_PER_GOLD = 2
export const missionPoints = (reward: { gold: number }) => reward.gold * MISSION_POINTS_PER_GOLD
