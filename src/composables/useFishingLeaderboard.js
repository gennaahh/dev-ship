import { onMounted, onUnmounted, ref } from 'vue'
import { DEMO_LEADERBOARD } from '../city/fishing/lake.js'
import { API_URL, BACKEND_ENABLED } from '../config.js'

const REFRESH_MS = 60_000
// La cattura la salva il game server: si aspetta un attimo prima di richiedere la classifica.
const AFTER_CATCH_MS = 1_500

// Classifica della pesca (oggi, settimana, sempre) presa dall'API, che la mostra anche a chi
// non è entrato. Senza backend è quella dimostrativa. board è null finché non arriva,
// failed true se l'API non risponde.
export function useFishingLeaderboard() {
  const board = ref(BACKEND_ENABLED ? null : DEMO_LEADERBOARD)
  const failed = ref(false)
  let timer = 0
  let soon = 0

  async function load() {
    clearTimeout(timer)
    try {
      const res = await fetch(`${API_URL}/api/fishing/leaderboard`)
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
    soon = setTimeout(load, AFTER_CATCH_MS)
  }

  onMounted(() => BACKEND_ENABLED && load())
  onUnmounted(() => {
    clearTimeout(timer)
    clearTimeout(soon)
  })

  return { board, failed, refreshSoon }
}
