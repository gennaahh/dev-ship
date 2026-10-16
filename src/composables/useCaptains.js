import { onMounted, ref } from 'vue'
import { demoCaptains } from '../city/museum/museum.js'
import { API_URL, BACKEND_ENABLED } from '../config.js'

// L'albo dei capitani del museo dall'API: un quadro per ogni settimana finita, col podio, dal più
// recente. Cambia una volta a settimana: lo si chiede entrando. album è null finché non arriva,
// failed true se l'API non risponde. Senza backend è quello della demo.
export function useCaptains() {
  const album = ref(BACKEND_ENABLED ? null : demoCaptains())
  const failed = ref(false)

  onMounted(async () => {
    if (!BACKEND_ENABLED) return
    try {
      const res = await fetch(`${API_URL}/api/museum/captains`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      album.value = await res.json()
    } catch {
      failed.value = true
    }
  })

  return { album, failed }
}
