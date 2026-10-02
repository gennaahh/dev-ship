import { onMounted, onUnmounted, ref } from 'vue'
import { useGameRoom } from './useGameRoom.js'

const KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
}
// Quanto in fretta la posizione disegnata insegue quella del server (per secondo).
const SMOOTHING = 15

// Entra nella stanza del dungeon e tiene aggiornata la lista dei giocatori da disegnare.
// Per status vedi useGameRoom: se il server non risponde l'interno resta visitabile come prima.
export function useDungeonRoom() {
  const players = ref([])

  let raf = 0
  let last = 0
  const pressed = { up: false, down: false, left: false, right: false }
  // Posizioni disegnate, che si avvicinano a quelle del server a ogni frame.
  const drawn = new Map()

  const { status, room } = useGameRoom('dungeon', {}, {
    onJoin(r) {
      r.send('input', { ...pressed })
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
    onReconnect: (r) => r.send('input', { ...pressed }),
    onLeave() {
      players.value = []
      drawn.clear()
      cancelAnimationFrame(raf)
    },
  })

  function setKey(e, down) {
    const dir = KEYS[e.code]
    if (!dir || e.metaKey || e.ctrlKey || e.altKey) return
    // Mentre si scrive (es. l'email nella finestra del login) i tasti non muovono nessuno.
    if (e.target.closest?.('input, textarea, select, dialog')) return
    e.preventDefault()
    if (pressed[dir] === down) return
    pressed[dir] = down
    room.value?.send('input', { ...pressed })
  }
  const onKeyDown = (e) => setKey(e, true)
  const onKeyUp = (e) => setKey(e, false)
  // Se la finestra perde il focus il keyup non arriva: si lasciano tutti i tasti.
  const onBlur = () => {
    for (const k in pressed) pressed[k] = false
    room.value?.send('input', { ...pressed })
  }

  function frame(now) {
    const r = room.value
    if (!r) return
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    const k = 1 - Math.exp(-SMOOTHING * dt)
    const list = []
    r.state.players?.forEach((p, id) => {
      const d = drawn.get(id) ?? { x: p.x, y: p.y, dir: 1 }
      const dx = (p.x - d.x) * k
      const dy = (p.y - d.y) * k
      d.x += dx
      d.y += dy
      // Si guarda dove si va; fermi si resta girati com'eri.
      if (Math.abs(dx) > 0.2) d.dir = Math.sign(dx)
      drawn.set(id, d)
      const walking = Math.abs(dx) + Math.abs(dy) > 0.3
      list.push({ id, name: p.name, color: p.color, x: d.x, y: d.y, dir: d.dir, walking, me: id === r.sessionId })
    })
    for (const id of drawn.keys()) if (!r.state.players?.has(id)) drawn.delete(id)
    // Chi sta più in basso si disegna davanti.
    players.value = list.sort((a, b) => a.y - b.y)
    raf = requestAnimationFrame(frame)
  }

  onMounted(() => {
    addEventListener('keydown', onKeyDown)
    addEventListener('keyup', onKeyUp)
    addEventListener('blur', onBlur)
  })

  onUnmounted(() => {
    cancelAnimationFrame(raf)
    removeEventListener('keydown', onKeyDown)
    removeEventListener('keyup', onKeyUp)
    removeEventListener('blur', onBlur)
  })

  return { status, players }
}
