import { onMounted, onUnmounted, ref } from 'vue'

// Indirizzo dell'API: in locale gira su :3000, in produzione si imposta VITE_API_URL al build.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const POLL_MS = 10_000
const TIMEOUT_MS = 3_000

// Interroga /health a intervalli regolari. status: 'checking' finché non arriva la prima
// risposta, poi 'online' o 'offline'.
export function useApiStatus() {
  const status = ref('checking')
  let timer

  async function check() {
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      const body = res.ok ? await res.json() : null
      status.value = body?.status === 'ok' ? 'online' : 'offline'
    } catch {
      status.value = 'offline'
    }
  }

  onMounted(() => {
    check()
    timer = setInterval(check, POLL_MS)
  })
  onUnmounted(() => clearInterval(timer))

  return { status }
}
