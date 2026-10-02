import { Client } from '@colyseus/sdk'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { authClient, getRoomToken } from '../auth.js'
import { GAME_URL } from '../config.js'

const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
}
// Quanto in fretta la posizione disegnata insegue quella del server (per secondo).
const SMOOTHING = 15
// Ogni quanto riprovare a entrare se il game server non risponde.
const RETRY_MS = 5_000

// Entra nella stanza del dungeon e tiene aggiornata la lista dei giocatori da disegnare.
// Si entra solo da loggati, con il token emesso dall'API.
// status: 'connecting', 'login' (serve il login), 'online', 'reconnecting' (connessione persa,
// il server tiene il posto) oppure 'offline' (game server o API irraggiungibili: l'interno
// resta visitabile come prima, e si riprova finché non tornano su).
export function useDungeonRoom() {
  const status = ref('connecting')
  const players = ref([])

  const session = authClient.useSession()
  const userId = computed(() => (session.value.isPending ? undefined : (session.value.data?.user?.id ?? null)))

  let room = null
  // Se vogliamo stare nella stanza: da loggati, finché l'interno è aperto.
  let wanted = false
  let joining = false
  let raf = 0
  let last = 0
  let retry = 0
  const pressed = { up: false, down: false, left: false, right: false }
  // Posizioni disegnate, che si avvicinano a quelle del server a ogni frame.
  const drawn = new Map()

  function setKey(e, down) {
    const dir = KEYS[e.code]
    if (!dir || e.metaKey || e.ctrlKey || e.altKey) return
    // Mentre si scrive (es. l'email nella finestra del login) i tasti non muovono nessuno.
    if (e.target.closest?.('input, textarea, select, dialog')) return
    e.preventDefault()
    if (pressed[dir] === down) return
    pressed[dir] = down
    room?.send('input', { ...pressed })
  }
  const onKeyDown = (e) => setKey(e, true)
  const onKeyUp = (e) => setKey(e, false)
  // Se la finestra perde il focus il keyup non arriva: si lasciano tutti i tasti.
  const onBlur = () => {
    for (const k in pressed) pressed[k] = false
    room?.send('input', { ...pressed })
  }
  // Chiudere o ricaricare la pagina è un'uscita voluta: senza leave() il server la prende
  // per una caduta e tiene il posto (e il personaggio fermo) per i secondi della riconnessione.
  const onPageHide = () => room?.leave()

  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const k = 1 - Math.exp(-SMOOTHING * dt)
    const list = []
    room.state.players?.forEach((p, id) => {
      const d = drawn.get(id) ?? { x: p.x, y: p.y }
      d.x += (p.x - d.x) * k
      d.y += (p.y - d.y) * k
      drawn.set(id, d)
      list.push({ id, name: p.name, color: p.color, x: d.x, y: d.y, me: id === room.sessionId })
    })
    for (const id of drawn.keys()) if (!room.state.players?.has(id)) drawn.delete(id)
    // Chi sta più in basso si disegna davanti.
    players.value = list.sort((a, b) => a.y - b.y)
    raf = requestAnimationFrame(frame)
  }

  async function connect() {
    clearTimeout(retry)
    if (!wanted || room || joining) return
    joining = true
    let joined
    try {
      const token = await getRoomToken()
      if (!token) {
        status.value = 'login'
        return
      }
      const client = new Client(GAME_URL)
      client.auth.token = token
      joined = await client.joinOrCreate('dungeon')
    } catch {
      status.value = 'offline'
      retry = setTimeout(connect, RETRY_MS)
      return
    } finally {
      joining = false
    }
    // Nel frattempo si è usciti dall'interno o dall'account.
    if (!wanted) return joined.leave()

    room = joined
    status.value = 'online'
    room.onDrop(() => (status.value = 'reconnecting'))
    room.onReconnect(() => {
      status.value = 'online'
      room.send('input', { ...pressed })
    })
    // Fuori dalla stanza (server spento, riconnessione fallita): si torna a riprovare.
    room.onLeave(() => {
      room = null
      players.value = []
      drawn.clear()
      cancelAnimationFrame(raf)
      if (!wanted) return
      status.value = 'offline'
      retry = setTimeout(connect, RETRY_MS)
    })
    room.send('input', { ...pressed })
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function disconnect() {
    wanted = false
    clearTimeout(retry)
    room?.leave()
  }

  // Login e logout (anche da un'altra parte della pagina) fanno entrare e uscire dalla stanza.
  watch(userId, (id, prev) => {
    if (id === undefined) return // sessione ancora in caricamento
    if (prev) disconnect() // cambio di account o logout
    if (id) {
      wanted = true
      status.value = 'connecting'
      connect()
    } else {
      status.value = 'login'
    }
  })

  onMounted(() => {
    addEventListener('keydown', onKeyDown)
    addEventListener('keyup', onKeyUp)
    addEventListener('blur', onBlur)
    addEventListener('pagehide', onPageHide)
    if (userId.value !== undefined) {
      wanted = Boolean(userId.value)
      status.value = wanted ? 'connecting' : 'login'
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
    cancelAnimationFrame(raf)
    removeEventListener('keydown', onKeyDown)
    removeEventListener('keyup', onKeyUp)
    removeEventListener('blur', onBlur)
    removeEventListener('pagehide', onPageHide)
  })

  return { status, players }
}
