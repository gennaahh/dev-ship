import { effectScope, ref } from 'vue'
import { API_URL, BACKEND_ENABLED } from '../config.js'

const REFRESH_MS = 60_000

// La squadra della demo: senza backend la classifica della città è questa, coi punti gioco per
// gioco come quelli veri (packages/shared/src/score.ts).
const demo = (name, color, hat, fishing, mining, dungeon, mission) => ({
  name,
  points: fishing + mining + dungeon + mission,
  games: { fishing, mining, dungeon, mission },
  look: { color, hat },
})
const DEMO_WEEK = [
  demo('Capitan Merge', 'corallo', 'captain', 1820, 1450, 380, 196),
  demo('Mozzo Refactor', 'azzurro', 'propeller', 1310, 1690, 220, 98),
  demo('Nostromo Deploy', 'menta', 'cap', 2040, 610, 150, 140),
  demo('Vedetta Debug', 'notte', 'headphones', 980, 1240, 310, 36),
  demo('Cuoca Hotfix', 'lilla', 'chef', 1460, 420, 110, 72),
  demo('Timoniere Review', 'acqua', 'pirate', 690, 880, 0, 98),
  demo('Marinaio Commit', 'sole', 'beanie', 520, 410, 120, 0),
]
const DEMO = { week: DEMO_WEEK, all: DEMO_WEEK, demo: true }

// La classifica della città (tutti i giochi sommati, della settimana e di sempre) presa
// dall'API, che la mostra anche a chi non è entrato. Una sola per la pagina: la usano il
// cartellone e il timone della dev-ship, e si ricarica ogni minuto. board è null finché non
// arriva, failed true se l'API non risponde. Senza backend è quella della demo.
let store = null
export function useLeaderboard() {
  store ??= effectScope(true).run(createStore)
  return store
}

function createStore() {
  const board = ref(BACKEND_ENABLED ? null : DEMO)
  const failed = ref(false)

  async function load() {
    try {
      const res = await fetch(`${API_URL}/api/leaderboard`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      board.value = await res.json()
      failed.value = false
    } catch {
      failed.value = true
    }
    setTimeout(load, REFRESH_MS)
  }
  if (BACKEND_ENABLED) load()

  return { board, failed }
}
