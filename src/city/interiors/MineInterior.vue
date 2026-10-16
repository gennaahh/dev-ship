<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { isBigFind, mineral } from '@dev-city/shared/catalog'
import { FIND_MS, rollMineral, STONE_MS } from '@dev-city/shared/mine'
import { authClient, displayName } from '../../auth.js'
import ChatWindow from '../../components/ChatWindow.vue'
import { useInventory } from '../../composables/useInventory.js'
import { useMineLeaderboard } from '../../composables/useMineLeaderboard.js'
import { useMineRoom } from '../../composables/useMineRoom.js'
import { useTrade } from '../../composables/useTrade.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { DEFAULT_LOOK, lookOf } from '../avatar.js'
import BigFind from '../mine/BigFind.vue'
import { clampToCave, SPOT_SPOTS, walkCave } from '../mine/cave.js'
import MineBoard from '../mine/MineBoard.vue'
import Miner from '../mine/Miner.vue'
import { SCALE } from '../mine/mine.js'
import SpeechBubble from '../SpeechBubble.vue'
import InteriorLayout from './InteriorLayout.vue'
import Icon from '../../components/Icon.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const minutes = ([min, max]) => `${min / 60_000}-${max / 60_000}`
const plans = [
  `Cammina fino a un filone libero alla base della parete: ce ne sono ${SPOT_SPOTS.length}, una persona per filone.`,
  `Si scava da soli: ogni ${minutes(STONE_MS)} minuti si stacca una pietra, ogni ${minutes(FIND_MS)} si trova un minerale o una gemma.`,
  'Rame, ferro e quarzo sono comuni; argento, ametista e oro più rari; smeraldi, rubini e diamanti rarissimi.',
  'Tutto si vende dall\'inventario, oppure va nel crafting per armi e armature.',
  'Pepite d\'oro e gemme preziose si festeggiano a tutto schermo.',
  'Camminare altrove o uscire libera il filone. Tasto destro su un altro giocatore per uno scambio.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const myName = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : 'Tu'
})
// Il proprio look viene dall'inventario, così cambia subito; quello degli altri dalla stanza.
const inventory = useInventory()
// Tasto destro su un altro giocatore, che passeggi o scavi: il menu per chiedergli uno scambio.
const trade = useTrade()
const myLook = computed(() => (session.value.data?.user ? lookOf(myName.value, inventory.equipment.value) : DEFAULT_LOOK))

const { board, failed, refreshSoon } = useMineLeaderboard()

// Scoperte da festeggiare a tutto schermo (dalla pepita in su), una alla volta, e la scena che trema.
const bigFinds = ref([])
const shake = ref(false)
let shakeTimer = 0
let celebrated = 0
function celebrate(f) {
  bigFinds.value.push({ ...f, id: ++celebrated })
  shake.value = false
  requestAnimationFrame(() => (shake.value = true))
  clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => (shake.value = false), 700)
}

// Il filone verso cui sto camminando, e l'avviso se arrivato lo trovo occupato.
const goingSpot = ref(null)
const spotTaken = ref(false)
let takenTimer = 0

// Da loggati la miniera è multigiocatore: si cammina, si chiacchiera e si scava con gli altri,
// e i personaggi e i filoni arrivano dalla stanza della miniera.
const mine = BACKEND_ENABLED
  ? useMineRoom({
      onFind(f) {
        refreshSoon()
        if (f.big) celebrate(f)
      },
      onSpotTaken() {
        goingSpot.value = null
        spotTaken.value = true
        clearTimeout(takenTimer)
        takenTimer = setTimeout(() => (spotTaken.value = false), 3500)
      },
    })
  : null
const online = computed(() => mine?.status.value === 'online')

// Senza backend, prima del login o col server spento si passeggia da soli, mentre scava la
// squadra della classifica, coi tempi accorciati per vedere qualcosa succedere. Quello che
// trovano non conta.
const me = reactive({ x: 800, y: 920, tx: 800, ty: 800, dir: 1, walking: false })
const DEMO_STONE = [3, 5] // secondi
const DEMO_FIND = [9, 16]
const DEMO_FOUND = 5
const between = ([min, max]) => min + Math.random() * (max - min)
const crew = [
  { spot: 1, name: 'Vedetta Debug', look: { color: '#5c6bc0', hat: 'headphones' }, tool: 'iron_pickaxe' },
  { spot: 3, name: 'Nostromo Deploy', look: { color: '#9ccc65', hat: 'cap' } },
  { spot: 6, name: 'Marinaio Commit', look: { color: '#ffca28', hat: 'beanie' }, tool: 'golden_pickaxe' },
].map((c, i) => {
  const t = Date.now() / 1000
  return reactive({ ...c, phase: 'digging', stones: 0, finds: 0, found: '', me: false, nextStone: t + 1 + i, nextFind: t + 4 + i * 4, back: 0 })
})

function demoStep(c, now) {
  if (now >= c.nextStone) {
    c.stones++
    c.nextStone = now + between(DEMO_STONE)
  }
  if (c.phase === 'found' && now >= c.back) c.phase = 'digging'
  if (now >= c.nextFind) {
    c.found = rollMineral()
    c.finds++
    c.phase = 'found'
    c.back = now + DEMO_FOUND
    c.nextFind = now + DEMO_FOUND + between(DEMO_FIND)
  }
}

// A ogni frame il proprio passo (da soli; in compagnia muove il server), ogni 250 ms le fasi
// della squadra e il tempo passato a scavare.
const now = ref(Date.now())
let clock = 0
let raf = 0
let last = 0
function frame(t) {
  const dt = Math.min(0.1, Math.max(0, (t - last) / 1000))
  last = t
  if (!online.value && (me.x !== me.tx || me.y !== me.ty)) {
    const next = walkCave(me, { x: me.tx, y: me.ty }, dt)
    if (Math.abs(next.x - me.x) > 0.5) me.dir = Math.sign(next.x - me.x)
    me.x = next.x
    me.y = next.y
    me.walking = true
  } else {
    me.walking = false
  }
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  last = performance.now()
  raf = requestAnimationFrame(frame)
  clock = setInterval(() => {
    now.value = Date.now()
    if (!online.value) for (const c of crew) demoStep(c, now.value / 1000)
  }, 250)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearInterval(clock)
  clearTimeout(shakeTimer)
  clearTimeout(takenTimer)
})

// Chi scava a quale filone, con il fumetto di chi sta scrivendo o ha appena scritto.
const miners = computed(() => {
  if (!online.value) return new Map(crew.map((c) => [c.spot, c]))
  const byId = new Map(mine.players.value.map((p) => [p.id, p]))
  return new Map(
    mine.spots.value.map((s) => [
      s.spot,
      { ...s, look: s.me ? myLook.value : lookOf(s.name, byId.get(s.id)), say: byId.get(s.id)?.say ?? '', typing: byId.get(s.id)?.typing ?? false },
    ]),
  )
})
// Chi cammina: tutti quelli che non scavano.
const walkers = computed(() => {
  if (!online.value) return [{ ...me, id: 'me', me: true, name: myName.value, look: myLook.value, say: '', typing: false }]
  const digging = new Set(mine.spots.value.map((s) => s.id))
  return mine.players.value
    .filter((p) => !digging.has(p.id))
    .map((p) => ({ ...p, look: p.me ? myLook.value : lookOf(p.name, p) }))
})
const mySpot = computed(() => (online.value ? mine.spots.value.find((s) => s.me) : null))
const freeSpots = computed(() => SPOT_SPOTS.length - miners.value.size)

// Carrello, casse e barile coi picconi stanno sul pavimento: si disegnano in ordine di
// profondità insieme a chi scava e a chi cammina, così chi ci passa davanti li copre.
const PROPS = [
  { id: 'cart', kind: 'cart', x: 1290, y: 742 },
  { id: 'crates', kind: 'crates', x: 1500, y: 640 },
  { id: 'barrel', kind: 'barrel', x: 90, y: 600 },
  { id: 'rocks', kind: 'rocks', x: 560, y: 860 },
]
const scene = computed(() =>
  [
    ...PROPS,
    ...SPOT_SPOTS.filter((s) => miners.value.has(s.spot)).map((s) => ({ id: `miner-${s.spot}`, kind: 'miner', y: s.y, spot: s })),
    ...walkers.value.map((w) => ({ ...w, sessionId: w.id, id: `walker-${w.id}`, kind: 'walker' })),
  ].sort((a, b) => a.y - b.y),
)
// I fumetti, sopra a tutto. SpeechBubble è fatto per i personaggi della piazza: lo si sposta
// sulla testa di quelli più piccoli della galleria.
const bubbles = computed(() => {
  const list = walkers.value.filter((w) => w.say || w.typing).map((w) => ({ id: w.id, x: w.x, y: w.y + 96 - 96 * SCALE, say: w.say, typing: w.typing }))
  for (const [spot, m] of miners.value) {
    if (!m.say && !m.typing) continue
    const s = SPOT_SPOTS[spot]
    list.push({ id: `spot-${spot}`, x: s.x, y: s.y + 96 - 96 * SCALE, say: m.say, typing: m.typing })
  }
  return list
})

const svg = ref(null)
const marker = ref(null)
const showMarker = (p) => (marker.value = { ...p, k: (marker.value?.k ?? 0) + 1 })

function onFloor(e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.value.getScreenCTM().inverse())
  unlessDigging(() => walkTo(p))
}
function walkTo(p) {
  goingSpot.value = null
  if (online.value) {
    showMarker(mine.moveTo(p.x, p.y))
  } else {
    const target = clampToCave(p)
    me.tx = target.x
    me.ty = target.y
    showMarker(target)
  }
}
// Mentre si scava un clic sul pavimento o su un altro filone fa smettere: prima si chiede
// conferma, per non perdere lo scavo per sbaglio. leaving è cosa fare se si conferma.
const leaveDialog = ref(null)
let leaving = null
function unlessDigging(action) {
  if (!mySpot.value) return action()
  leaving = action
  leaveDialog.value.showModal()
}
function closeLeave(confirmed) {
  const action = leaving
  leaving = null
  if (leaveDialog.value.open) leaveDialog.value.close()
  if (confirmed) action?.()
}
// Si cammina fino al filone: si scava all'arrivo, se nessuno ci è arrivato prima.
function dig(spot) {
  unlessDigging(() => goDig(spot))
}
function goDig(spot) {
  goingSpot.value = spot
  spotTaken.value = false
  mine.dig(spot)
  showMarker(SPOT_SPOTS[spot])
}

const clockText = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${ss}` : `${mm}:${ss}`
}
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

// Il cartellino in alto: cosa si può fare adesso, o come va il proprio scavo.
const status = computed(() => {
  if (!BACKEND_ENABLED) return { text: 'Demo: con il backend si scava davvero' }
  const st = mine.status.value
  if (st === 'login') return { text: 'Accedi per scavare: per ora passeggi e guardi la squadra' }
  if (st === 'connecting') return { text: 'Si scende in miniera…' }
  if (st === 'reconnecting') return { text: 'Connessione persa: il filone resta tuo per qualche secondo…' }
  if (st !== 'online') return { text: 'Server di gioco non raggiungibile: per ora si passeggia soltanto' }
  const m = mySpot.value
  if (m) {
    const found = m.phase === 'found' ? mineral(m.found) : null
    if (found) return { icon: 'gem', text: `Trovato: ${found.name}! +${found.price}`, after: 'coin', tone: isBigFind(found.id) ? 'big' : 'found', stand: true }
    return { icon: 'pickaxe', text: `Scavi da ${clockText(now.value - m.since)} · ${plural(m.stones, 'pietra', 'pietre')} · ${plural(m.finds, 'scoperta', 'scoperte')}`, stand: true }
  }
  if (spotTaken.value) return { text: 'Qualcuno è arrivato prima di te: scegli un altro filone', tone: 'taken' }
  if (goingSpot.value !== null) return { text: 'Vai al filone…' }
  if (!freeSpots.value) return { text: 'Tutti i filoni sono occupati: aspetta che se ne liberi uno' }
  return { text: `Clicca sul pavimento per camminare, su un filone libero per scavare · ${freeSpots.value} su ${SPOT_SPOTS.length} liberi` }
})

// Sassi sul pavimento e cristalli nella parete: posizioni fisse, sempre uguali.
const pebbles = [
  [140, 560, 6], [330, 640, 5], [470, 590, 4], [720, 650, 6], [940, 600, 5], [1130, 660, 4], [1380, 580, 5],
  [260, 820, 5], [700, 880, 4], [1000, 820, 6], [1220, 870, 5], [1450, 820, 4], [60, 760, 5], [860, 780, 4],
]
const crystals = [
  { x: 560, y: 150, c: '#59e3ff' },
  { x: 640, y: 250, c: '#ff6fb5' },
  { x: 960, y: 120, c: '#b388ff' },
  { x: 1500, y: 160, c: '#ffd54a' },
  { x: 860, y: 260, c: '#7dff8a' },
  { x: 40, y: 380, c: '#59e3ff' },
]
// Un puntello tra un filone e l'altro, più quelli ai lati, e qualche lanterna appesa alla trave.
const posts = [40, ...SPOT_SPOTS.slice(0, -1).map((s) => s.x + 127), 1560]
const lanterns = [posts[1], posts[3], posts[5], posts[7]]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#5a4330" @leave="$emit('leave')">
    <svg ref="svg" class="cave" :class="{ shake }" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" @click="onFloor">
      <defs>
        <linearGradient id="cave-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3b2c22" />
          <stop offset="1" stop-color="#7d634c" />
        </linearGradient>
        <radialGradient id="cave-floor" cx="0.5" cy="0.2" r="0.9">
          <stop offset="0" stop-color="#a98a6d" />
          <stop offset="1" stop-color="#6b5140" />
        </radialGradient>
        <radialGradient id="cave-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffd54a" stop-opacity="0.35" />
          <stop offset="1" stop-color="#ffd54a" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- La parete di roccia, con la galleria che va più giù e i cristalli -->
      <rect x="-200" y="-200" width="2000" height="720" fill="url(#cave-wall)" />
      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <g fill="#6b5140" opacity="0.7">
          <path d="M 470 40 q 60 -30 120 0 q 30 40 -20 60 q -80 10 -100 -60 Z" />
          <path d="M 1000 200 q 50 -40 110 -10 q 20 40 -30 56 q -70 6 -80 -46 Z" />
          <path d="M 680 120 q 40 -24 80 0 q 10 30 -30 40 q -50 0 -50 -40 Z" />
          <path d="M 1430 260 q 50 -30 100 0 q 10 34 -40 44 q -60 0 -60 -44 Z" />
        </g>
        <!-- La galleria verso il livello di sotto, col cartello -->
        <path d="M 1120 318 L 1120 170 Q 1230 70 1340 170 L 1340 318 Z" fill="#1a1410" />
        <path d="M 1150 318 L 1150 190 Q 1230 120 1310 190 L 1310 318 Z" fill="#0f0b08" stroke="none" />
        <path d="M 1100 318 L 1100 160 Q 1230 40 1360 160 L 1360 318" fill="none" stroke="#a0673a" stroke-width="18" />
        <path d="M 1100 318 L 1100 160 Q 1230 40 1360 160 L 1360 318" fill="none" />
        <g transform="translate(1230 132) rotate(-4)">
          <rect x="-74" y="-18" width="148" height="34" rx="6" fill="#c07d45" />
          <text x="0" y="6" text-anchor="middle" class="sign" stroke="none">LIVELLO -1 · LEGACY</text>
        </g>
        <g v-for="(g, i) in crystals" :key="`cr${i}`" class="crystal" :style="{ animationDelay: `${-i * 0.5}s` }">
          <path :d="`M ${g.x} ${g.y} l 14 -32 l 14 32 l -14 14 Z`" :fill="g.c" />
        </g>
      </g>

      <!-- La trave che regge il soffitto e i puntelli tra i filoni -->
      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
        <rect v-for="x in posts" :key="`post${x}`" :x="x - 11" y="318" width="22" height="190" fill="#a0673a" />
        <rect x="-20" y="306" width="1640" height="28" fill="#c07d45" />
        <path d="M -20 320 L 1620 320" fill="none" stroke="#a0673a" stroke-width="3" />
        <g v-for="x in lanterns" :key="`lan${x}`">
          <ellipse :cx="x" cy="370" rx="70" ry="60" fill="url(#cave-glow)" stroke="none" />
          <path :d="`M ${x} 334 L ${x} 350`" fill="none" />
          <rect class="lamp" :x="x - 12" y="350" width="24" height="30" rx="7" fill="#ffd54a" />
        </g>
      </g>

      <!-- Il pavimento della galleria, coi binari -->
      <path d="M -200 505 L 1800 505 L 1800 1100 L -200 1100 Z" fill="url(#cave-floor)" stroke="#2d2a4a" stroke-width="5" />
      <g fill="#8a6a4c" stroke="#2d2a4a" stroke-width="3">
        <ellipse v-for="([x, y, r], i) in pebbles" :key="`pb${i}`" :cx="x" :cy="y" :rx="r * 1.4" :ry="r" />
      </g>
      <g stroke="#2d2a4a" stroke-linecap="round">
        <path v-for="x in 34" :key="`sl${x}`" :d="`M ${x * 50 - 40} 700 L ${x * 50 - 46} 752`" stroke="#7a4a2a" stroke-width="12" />
        <path d="M -20 712 L 1620 712 M -20 742 L 1620 742" fill="none" stroke="#9aa6b8" stroke-width="7" />
      </g>

      <!-- I filoni alla base della parete -->
      <Miner v-for="s in SPOT_SPOTS" :key="`vein-${s.spot}`" layer="wall" :spot="s" :miner="miners.get(s.spot) ?? null" :can-dig="online" @dig="dig" />

      <!-- Il cartellone della miniera -->
      <MineBoard :board="board" :failed="failed" :demo="!BACKEND_ENABLED" />

      <!-- Dove si sta andando -->
      <ellipse v-if="marker" :key="marker.k" class="marker" :cx="marker.x" :cy="marker.y" rx="18" ry="7" fill="none" stroke="#fff8e6" stroke-width="4" />

      <!-- Chi scava, chi passeggia e gli oggetti sul pavimento, dal fondo verso chi guarda -->
      <template v-for="item in scene" :key="item.id">
        <Miner v-if="item.kind === 'miner'" :spot="item.spot" :miner="miners.get(item.spot.spot)" @menu="(e) => online && trade.openMenu(e, miners.get(item.spot.spot))" />
        <g v-else-if="item.kind === 'walker'" @contextmenu="online && trade.openMenu($event, { ...item, id: item.sessionId })">
          <g :transform="`translate(${item.x} ${item.y}) scale(${SCALE})`">
            <Avatar :look="item.look" :dir="item.dir" :walking="item.walking" />
          </g>
          <text class="name" :class="{ me: item.me }" :x="item.x" :y="item.y + 17" text-anchor="middle">{{ item.name }}</text>
        </g>
        <g v-else-if="item.kind === 'cart'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="0" cy="2" rx="96" ry="12" fill="#2d2a4a" stroke="none" opacity="0.18" />
          <circle cx="-56" cy="-112" r="22" fill="#a7a3b8" />
          <circle cx="-14" cy="-122" r="26" fill="#e98a4a" />
          <circle cx="28" cy="-114" r="22" fill="#c59bff" />
          <circle cx="60" cy="-106" r="18" fill="#ffd54a" />
          <path d="M -90 -100 L 90 -100 L 72 -18 L -72 -18 Z" fill="#6d7f92" />
          <path d="M -82 -74 L 82 -74" fill="none" stroke="#4d5b6b" />
          <circle cx="-46" cy="-12" r="16" fill="#4b4870" />
          <circle cx="46" cy="-12" r="16" fill="#4b4870" />
        </g>
        <g v-else-if="item.kind === 'crates'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="0" cy="2" rx="80" ry="10" fill="#2d2a4a" stroke="none" opacity="0.18" />
          <rect x="-74" y="-66" width="70" height="66" fill="#c07d45" />
          <path d="M -74 -66 L -4 0 M -4 -66 L -74 0" fill="none" stroke="#a0673a" stroke-width="5" />
          <rect x="0" y="-56" width="60" height="56" fill="#c98a4b" />
          <rect x="-40" y="-118" width="56" height="52" fill="#c98a4b" />
          <text x="-12" y="-84" text-anchor="middle" class="tnt" stroke="none">TNT</text>
        </g>
        <g v-else-if="item.kind === 'barrel'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <ellipse cx="0" cy="2" rx="44" ry="9" fill="#2d2a4a" stroke="none" opacity="0.18" />
          <path d="M -8 -62 L -30 -116 M 10 -62 L 34 -110" fill="none" stroke="#a0673a" stroke-width="7" />
          <path d="M -46 -118 Q -30 -134 -14 -116 M 20 -108 Q 36 -126 50 -104" fill="none" stroke="#c9d3dc" stroke-width="7" />
          <path d="M -32 0 Q -40 -36 -32 -72 L 32 -72 Q 40 -36 32 0 Z" fill="#a0673a" />
          <path d="M -36 -20 L 36 -20 M -36 -52 L 36 -52" fill="none" stroke="#6d7f92" stroke-width="5" />
        </g>
        <g v-else-if="item.kind === 'rocks'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <path d="M -50 0 L -46 -26 L -24 -40 L 0 -32 L 6 0 Z" fill="#8f8aa6" />
          <path d="M 0 0 L 6 -22 L 26 -30 L 44 -14 L 42 0 Z" fill="#a7a3b8" />
        </g>
      </template>

      <!-- Fumetti, sopra a tutto: i puntini mentre si scrive, poi il messaggio -->
      <g v-for="b in bubbles" :key="b.id" :transform="`translate(${b.x} ${b.y})`">
        <SpeechBubble :text="b.say" :typing="b.typing" />
      </g>
    </svg>

    <div class="status" :class="status.tone" role="status">
      <span><Icon v-if="status.icon" :name="status.icon" /> {{ status.text }} <Icon v-if="status.after" :name="status.after" /></span>
      <button v-if="status.stand" class="stand" @click="mine.stand()">Smetti</button>
    </div>

    <ChatWindow
      v-if="mine"
      title="Chat della miniera"
      :status="mine.status.value"
      :messages="mine.chat.messages.value"
      @send="mine.chat.send"
      @typing="mine.chat.setTyping"
    />
    <dialog ref="leaveDialog" class="leave" aria-labelledby="leave-title" @click.self="closeLeave(false)" @close="closeLeave(false)">
      <h2 id="leave-title">Smetti di scavare?</h2>
      <p>Se ti allontani lasci il filone e l'attesa per la prossima scoperta si perde. Le pietre e quello che hai trovato restano tuoi.</p>
      <div class="actions">
        <button class="cancel" autofocus @click="closeLeave(false)">Annulla</button>
        <button class="confirm" @click="closeLeave(true)">Smetti</button>
      </div>
    </dialog>
    <BigFind v-if="bigFinds.length" :key="bigFinds[0].id" :find="bigFinds[0]" @done="bigFinds.shift()" />
  </InteriorLayout>
</template>

<style scoped>
.cave {
  cursor: pointer;
  user-select: none;
}
.name {
  fill: #fff8e6;
  stroke: #2d2a4a;
  stroke-width: 5px;
  stroke-linejoin: round;
  paint-order: stroke;
  font-size: 14px;
  pointer-events: none;
}
.name.me {
  fill: #ffd54a;
}
.sign {
  fill: #fff8e6;
  font-size: 15px;
  letter-spacing: 1px;
}
.tnt {
  fill: #ff4a4a;
  font-size: 18px;
}
.marker {
  pointer-events: none;
  transform-box: fill-box;
  transform-origin: center;
  animation: marker 0.7s ease-out forwards;
}
@keyframes marker {
  from { transform: scale(0.4); opacity: 1; }
  to { transform: scale(1.3); opacity: 0; }
}
.cave.shake {
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes shake {
  10%, 90% { transform: translate(-3px, 1px); }
  20%, 80% { transform: translate(6px, -2px); }
  30%, 50%, 70% { transform: translate(-10px, 3px); }
  40%, 60% { transform: translate(10px, -3px); }
}
.crystal {
  animation: sparkle 3s ease-in-out infinite;
}
@keyframes sparkle {
  50% { filter: brightness(1.6); }
}
.lamp {
  animation: glow 2.4s ease-in-out infinite;
}
@keyframes glow {
  50% { fill: #ffb300; }
}

.status {
  position: absolute;
  top: 16px;
  left: 50%;
  translate: -50% 0;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px 8px 16px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 17px;
  text-align: center;
  white-space: nowrap;
}
.status span {
  padding: 2px 6px 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: tabular-nums;
}
.status.found {
  background: #9fe7ff;
}
.status.big {
  background: #ffd54a;
  animation: nudge 0.3s ease-in-out infinite alternate;
}
.status.taken {
  background: #c9d3e6;
}
@keyframes nudge {
  from { rotate: -1.5deg; }
  to { rotate: 1.5deg; }
}
.stand {
  flex: none;
  padding: 4px 12px 6px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ff9a4a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 15px;
  cursor: pointer;
}
.stand:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.leave {
  width: min(380px, calc(100% - 32px));
  box-sizing: border-box;
  padding: 18px 22px 20px;
  border: 5px solid #2d2a4a;
  border-radius: 20px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  text-align: center;
}
.leave::backdrop {
  background: rgba(45, 42, 74, 0.55);
}
.leave h2 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: normal;
  color: #a0673a;
}
.leave p {
  margin: 0 0 18px;
  font-size: 16px;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.actions button {
  padding: 6px 18px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 17px;
  cursor: pointer;
}
.actions button:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.cancel {
  background: #4fc3f7;
}
.confirm {
  background: #ff7a59;
}
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  .status {
    top: 176px;
    white-space: normal;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cave.shake {
    animation: none;
  }
}
</style>
