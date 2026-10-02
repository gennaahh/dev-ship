import { Client } from '@colyseus/sdk'
import { onMounted, onUnmounted, ref } from 'vue'
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
// status: 'connecting', 'online', 'reconnecting' (connessione persa, il server tiene il posto)
// oppure 'offline' (game server irraggiungibile: l'interno resta visitabile come prima, e
// si riprova finché il server non torna su).
export function useDungeonRoom() {
  const status = ref('connecting')
  const players = ref([])

  let room = null
  let disposed = false
  let raf = 0
  let last = 0
  let retry = 0
  const pressed = { up: false, down: false, left: false, right: false }
  // Posizioni disegnate, che si avvicinano a quelle del server a ogni frame.
  const drawn = new Map()

  function setKey(e, down) {
    const dir = KEYS[e.code]
    if (!dir || e.metaKey || e.ctrlKey || e.altKey) return
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
    let joined
    try {
      joined = await new Client(GAME_URL).joinOrCreate('dungeon')
    } catch {
      status.value = 'offline'
      retry = setTimeout(connect, RETRY_MS)
      return
    }
    if (disposed) return joined.leave()

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
      status.value = 'offline'
      players.value = []
      drawn.clear()
      cancelAnimationFrame(raf)
      if (!disposed) retry = setTimeout(connect, RETRY_MS)
    })
    room.send('input', { ...pressed })
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    addEventListener('keydown', onKeyDown)
    addEventListener('keyup', onKeyUp)
    addEventListener('blur', onBlur)
    addEventListener('pagehide', onPageHide)
    connect()
  })

  onUnmounted(() => {
    disposed = true
    clearTimeout(retry)
    cancelAnimationFrame(raf)
    removeEventListener('keydown', onKeyDown)
    removeEventListener('keyup', onKeyUp)
    removeEventListener('blur', onBlur)
    removeEventListener('pagehide', onPageHide)
    room?.leave()
  })

  return { status, players }
}
