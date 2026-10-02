import { onUnmounted, ref } from 'vue'
import { createChat } from './chat.js'
import { useGameRoom } from './useGameRoom.js'

// Quanto in fretta la posizione disegnata insegue quella del server (per secondo).
const SMOOTHING = 12
// Stesse misure della PlazaRoom (apps/game/src/movement.ts).
const WALK = { minX: 40, maxX: 1560, minY: 500, maxY: 860 }

// Quanto resta il fumetto sopra la testa: di più per i messaggi lunghi.
const bubbleMs = (text) => Math.min(9000, 3500 + text.length * 60)
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// La piazza multigiocatore: chi c'è passeggia (si cammina cliccando dove andare),
// chiacchiera in chat e ha il fumetto sopra la testa. Per status vedi useGameRoom.
export function usePlazaRoom() {
  const players = ref([])

  let raf = 0
  let last = 0
  const drawn = new Map()
  // Ultimo messaggio di ognuno, da mostrare nel fumetto finché non scade.
  const bubbles = new Map()
  // Dove sto andando e cosa fare all'arrivo (es. aprire lo shop).
  let going = null

  const chat = createChat(() => game.room.value, {
    onMessage: (m) => bubbles.set(m.from, { text: m.text, until: performance.now() + bubbleMs(m.text) }),
  })

  const game = useGameRoom('plaza', {}, {
    onJoin(r) {
      chat.attach(r)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
    onReconnect: chat.refresh,
    onLeave() {
      players.value = []
      drawn.clear()
      bubbles.clear()
      going = null
      cancelAnimationFrame(raf)
    },
  })

  function frame(now) {
    const r = game.room.value
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
      const bubble = bubbles.get(id)
      if (bubble && bubble.until < now) bubbles.delete(id)
      const me = id === r.sessionId
      if (me && going && Math.hypot(going.x - d.x, going.y - d.y) < 3) {
        const { arrive } = going
        going = null
        arrive?.()
      }
      list.push({
        id,
        name: p.name,
        x: d.x,
        y: d.y,
        dir: d.dir,
        walking: Math.abs(dx) + Math.abs(dy) > 0.3,
        me,
        typing: p.typing,
        say: bubbles.get(id)?.text ?? '',
      })
    })
    for (const id of drawn.keys()) if (!r.state.players?.has(id)) drawn.delete(id)
    players.value = list
    raf = requestAnimationFrame(frame)
  }

  // Restituisce il punto davvero raggiungibile, per il segnalino sul pavimento.
  function moveTo(x, y, arrive = null) {
    const target = { x: clamp(x, WALK.minX, WALK.maxX), y: clamp(y, WALK.minY, WALK.maxY) }
    game.room.value?.send('moveTo', target)
    going = { ...target, arrive }
    return target
  }

  onUnmounted(() => cancelAnimationFrame(raf))

  return { status: game.status, players, moveTo, chat }
}
