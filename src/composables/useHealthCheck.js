import { onMounted, onUnmounted, ref } from 'vue'

const POLL_MS = 10_000
const TIMEOUT_MS = 3_000

// Interroga un endpoint di healthcheck a intervalli regolari. status: 'checking' finché non
// arriva la prima risposta, poi 'online' o 'offline'. isOk decide se la risposta è sana.
export function useHealthCheck(url, isOk = (res) => res.ok) {
  const status = ref('checking')
  let timer

  async function check() {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      status.value = (await isOk(res)) ? 'online' : 'offline'
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
