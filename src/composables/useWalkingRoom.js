import { onUnmounted, ref, watch } from 'vue'
import { createChat } from './chat.js'
import { useGameRoom } from './useGameRoom.js'
import { useInventory } from './useInventory.js'
import { useTrade } from './useTrade.js'

// Quanto in fretta la posizione disegnata insegue quella del server (per secondo).
const SMOOTHING = 12

// Quanto resta il fumetto sopra la testa: di più per i messaggi lunghi.
const bubbleMs = (text) => Math.min(9000, 3500 + text.length * 60)

// Una stanza in cui si cammina cliccando dove andare e si chiacchiera, col fumetto sopra la
// testa: la piazza e la zona di pesca. Il server muove i personaggi (state.players), qui si
// disegnano inseguendo le loro posizioni. clamp(x, y) dà il punto davvero raggiungibile,
// come lo calcola il server. hooks: onJoin(room) e onLeave() in più, per i luoghi che hanno
// altro da seguire. Per status vedi useGameRoom.
export function useWalkingRoom(name, { clamp, onJoin, onLeave } = {}) {
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

  // Gli scambi tra chi è nella stanza, col tasto destro su un giocatore.
  const trade = useTrade()
  const game = useGameRoom(name, {}, {
    onJoin(r) {
      chat.attach(r)
      trade.attach(r)
      onJoin?.(r)
      last = performance.now()
      raf = requestAnimationFrame(frame)
    },
    onReconnect(r) {
      chat.refresh(r)
      trade.dropped()
    },
    onLeave() {
      players.value = []
      drawn.clear()
      bubbles.clear()
      going = null
      cancelAnimationFrame(raf)
      trade.detach()
      onLeave?.()
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
        // Cosa indossa: id del catalogo, '' = niente (vedi lookOf in avatar.js).
        hat: p.hat,
        color: p.color,
        say: bubbles.get(id)?.text ?? '',
      })
    })
    for (const id of drawn.keys()) if (!r.state.players?.has(id)) drawn.delete(id)
    players.value = list
    raf = requestAnimationFrame(frame)
  }

  // Restituisce il punto davvero raggiungibile, per il segnalino sul pavimento.
  function moveTo(x, y, arrive = null) {
    const target = clamp(x, y)
    game.room.value?.send('moveTo', target)
    going = { ...target, arrive }
    return target
  }

  // Cambiato equipaggiamento (dall'inventario o allo shop): la stanza lo rilegge dal database
  // e lo fa vedere a tutti. Anche canna e piccone: al lago e in miniera contano.
  const inventory = useInventory()
  watch(
    () => ['hat', 'color', 'rod', 'pickaxe'].map((slot) => inventory.equipment.value[slot]).join('|'),
    () => game.room.value?.send('look'),
  )

  onUnmounted(() => cancelAnimationFrame(raf))

  return { status: game.status, room: game.room, players, moveTo, chat }
}
