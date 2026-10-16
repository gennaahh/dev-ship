import { onMounted, onUnmounted, ref } from 'vue'
import { DEMO_BOARD } from '../city/mine/mine.js'
import { API_URL, BACKEND_ENABLED } from '../config.js'

const REFRESH_MS = 60_000
// La scoperta la salva il game server: si aspetta un attimo prima di richiedere il cartellone.
const AFTER_FIND_MS = 1_500

// Il cartellone della miniera (classifica di oggi, settimana e sempre per valore delle scoperte,
// e le ultime scoperte) preso dall'API, che lo mostra anche a chi non è entrato. Senza backend è
// quello dimostrativo. board è null finché non arriva, failed true se l'API non risponde.
export function useMineLeaderboard() {
  const board = ref(BACKEND_ENABLED ? null : DEMO_BOARD)
  const failed = ref(false)
  let timer = 0
  let soon = 0

  async function load() {
    clearTimeout(timer)
    try {
      const res = await fetch(`${API_URL}/api/mine/leaderboard`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      board.value = await res.json()
      failed.value = false
    } catch {
      failed.value = true
    }
    timer = setTimeout(load, REFRESH_MS)
  }

  function refreshSoon() {
    if (!BACKEND_ENABLED) return
    clearTimeout(soon)
    soon = setTimeout(load, AFTER_FIND_MS)
  }

  onMounted(() => BACKEND_ENABLED && load())
  onUnmounted(() => {
    clearTimeout(timer)
    clearTimeout(soon)
  })

  return { board, failed, refreshSoon }
}
