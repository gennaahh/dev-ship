<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { authClient, displayName } from '../../auth.js'
import ChatWindow from '../../components/ChatWindow.vue'
import { useFishingLeaderboard } from '../../composables/useFishingLeaderboard.js'
import { useFishingRoom } from '../../composables/useFishingRoom.js'
import { useInventory } from '../../composables/useInventory.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { DEFAULT_LOOK, lookOf } from '../avatar.js'
import Angler from '../fishing/Angler.vue'
import BigCatch from '../fishing/BigCatch.vue'
import FishingBoard from '../fishing/FishingBoard.vue'
import { BIG_KG, clampToLakeside, formatKg, LAKE, pointsFor, rollCatch, SCALE, SEAT_SPOTS, SHORE, walkLakeside } from '../fishing/lake.js'
import SpeechBubble from '../SpeechBubble.vue'
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Cammina fino a una sedia libera attorno al lago: ce ne sono 10, una persona per sedia.',
  'Tra 10 e 20 minuti abbocca: 3 volte su 4 il pesce resta all\'amo.',
  'Più pesa, più punti: 10 per chilo. Uno su dieci supera i 5 kg.',
  'Alzarsi, camminare altrove o uscire dalla zona libera la sedia.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const myName = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : 'Tu'
})
// Il proprio look viene dall'inventario, così cambia subito; quello degli altri dalla stanza.
const inventory = useInventory()
const myLook = computed(() => (session.value.data?.user ? lookOf(myName.value, inventory.equipment.value) : DEFAULT_LOOK))

const { board, failed, refreshSoon } = useFishingLeaderboard()

// Pesci da festeggiare a tutto schermo (5 kg o più), uno alla volta, e la scena che trema.
const bigCatches = ref([])
const shake = ref(false)
let shakeTimer = 0
let celebrated = 0
function celebrate(c) {
  bigCatches.value.push({ ...c, id: ++celebrated })
  shake.value = false
  requestAnimationFrame(() => (shake.value = true))
  clearTimeout(shakeTimer)
  shakeTimer = setTimeout(() => (shake.value = false), 700)
}

// La sedia verso cui sto camminando, e l'avviso se arrivato la trovo occupata.
const goingSeat = ref(null)
const seatTaken = ref(false)
let takenTimer = 0

// Da loggati la zona di pesca è multigiocatore: si cammina, si chiacchiera e si pesca con
// gli altri, e i personaggi e le sedie arrivano dalla stanza della pesca.
const lake = BACKEND_ENABLED
  ? useFishingRoom({
      onCatch(c) {
        refreshSoon()
        if (c.big) celebrate(c)
      },
      onSeatTaken() {
        goingSeat.value = null
        seatTaken.value = true
        clearTimeout(takenTimer)
        takenTimer = setTimeout(() => (seatTaken.value = false), 3500)
      },
    })
  : null
const online = computed(() => lake?.status.value === 'online')

// Senza backend, prima del login o col server spento si passeggia da soli attorno al lago,
// mentre pesca l'equipaggio della classifica, con attese brevi per vedere qualcosa succedere.
// Le loro catture non contano.
const me = reactive({ x: LAKE.cx, y: 920, tx: LAKE.cx, ty: 800, dir: 1, walking: false })
const DEMO_WAIT = [12, 30] // secondi
const crew = [
  { seat: 1, name: 'Cuoca Hotfix', look: { color: '#ba68c8', hat: 'chef' } },
  { seat: 4, name: 'Nostromo Deploy', look: { color: '#9ccc65', hat: 'cap' } },
  { seat: 8, name: 'Capitan Merge', look: { color: '#ff7a59', hat: 'pirate' } },
].map((c, i) => reactive({ ...c, phase: 'waiting', weight: 0, me: false, next: Date.now() / 1000 + 3 + i * 5 }))

function demoStep(c, now) {
  if (now < c.next) return
  if (c.phase === 'waiting') {
    c.phase = 'bite'
    c.next = now + 3.5
  } else if (c.phase === 'bite') {
    const kg = rollCatch()
    c.phase = kg === null ? 'escaped' : 'caught'
    if (kg !== null) c.weight = kg
    c.next = now + (kg !== null && kg >= BIG_KG ? 10 : 6)
  } else {
    c.phase = 'waiting'
    c.next = now + DEMO_WAIT[0] + Math.random() * (DEMO_WAIT[1] - DEMO_WAIT[0])
  }
}

// A ogni frame il proprio passo (da soli; in compagnia muove il server), ogni 250 ms le fasi
// dell'equipaggio e il tempo passato in sedia.
const now = ref(Date.now())
let clock = 0
let raf = 0
let last = 0
function frame(t) {
  const dt = Math.min(0.1, Math.max(0, (t - last) / 1000))
  last = t
  if (!online.value && (me.x !== me.tx || me.y !== me.ty)) {
    const next = walkLakeside(me, { x: me.tx, y: me.ty }, dt)
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

// Chi è seduto su quale sedia, con il fumetto di chi sta scrivendo o ha appena scritto.
const anglers = computed(() => {
  if (!online.value) return new Map(crew.map((c) => [c.seat, c]))
  const byId = new Map(lake.players.value.map((p) => [p.id, p]))
  return new Map(
    lake.seats.value.map((s) => [
      s.seat,
      { ...s, look: s.me ? myLook.value : lookOf(s.name, byId.get(s.id)), say: byId.get(s.id)?.say ?? '', typing: byId.get(s.id)?.typing ?? false },
    ]),
  )
})
// Chi cammina: tutti quelli che non sono seduti.
const walkers = computed(() => {
  if (!online.value) return [{ ...me, id: 'me', me: true, name: myName.value, look: myLook.value, say: '', typing: false }]
  const seated = new Set(lake.seats.value.map((s) => s.id))
  return lake.players.value
    .filter((p) => !seated.has(p.id))
    .map((p) => ({ ...p, look: p.me ? myLook.value : lookOf(p.name, p) }))
})
const mine = computed(() => (online.value ? lake.seats.value.find((s) => s.me) : null))
const freeSeats = computed(() => SEAT_SPOTS.length - anglers.value.size)

// Alberi, falò e secchio delle esche stanno sul prato: si disegnano in ordine di profondità
// insieme a sedie e personaggi, così chi ci passa davanti li copre.
const PROPS = [
  { id: 'tree-1', kind: 'tree', x: 1500, y: 350, s: 0.75 },
  { id: 'tree-2', kind: 'tree', x: 1560, y: 640, s: 0.85 },
  { id: 'tree-3', kind: 'tree', x: 1300, y: 330, s: 0.6 },
  { id: 'tree-4', kind: 'tree', x: 80, y: 520, s: 0.8 },
  { id: 'tree-5', kind: 'tree', x: 1460, y: 885, s: 0.75 },
  { id: 'tree-6', kind: 'tree', x: 560, y: 880, s: 0.7 },
  { id: 'fire', kind: 'fire', x: 1380, y: 720 },
  { id: 'bucket', kind: 'bucket', x: 1185, y: 800 },
]
const scene = computed(() =>
  [
    ...PROPS,
    ...SEAT_SPOTS.map((s) => ({ id: `seat-${s.seat}`, kind: 'seat', y: s.y, spot: s })),
    ...walkers.value.map((w) => ({ ...w, id: `walker-${w.id}`, kind: 'walker' })),
  ].sort((a, b) => a.y - b.y),
)
// I fumetti, sopra a tutto. SpeechBubble è fatto per i personaggi della piazza: lo si sposta
// sulla testa di quelli piccoli (seduti stanno un po' più in alto).
const bubbles = computed(() => {
  const list = walkers.value.filter((w) => w.say || w.typing).map((w) => ({ id: w.id, x: w.x, y: w.y + 96 - 96 * SCALE, say: w.say, typing: w.typing }))
  for (const [seat, a] of anglers.value) {
    if (!a.say && !a.typing) continue
    const s = SEAT_SPOTS[seat]
    list.push({ id: `seat-${seat}`, x: s.x, y: s.y + 96 - 118 * SCALE, say: a.say, typing: a.typing })
  }
  return list
})

const svg = ref(null)
const marker = ref(null)
const moved = ref(false)
const showMarker = (p) => (marker.value = { ...p, k: (marker.value?.k ?? 0) + 1 })

function onFloor(e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.value.getScreenCTM().inverse())
  moved.value = true
  goingSeat.value = null
  if (online.value) {
    showMarker(lake.moveTo(p.x, p.y))
  } else {
    const target = clampToLakeside(p)
    me.tx = target.x
    me.ty = target.y
    showMarker(target)
  }
}
// Si cammina fino alla sedia: ci si siede all'arrivo, se nessuno ci è arrivato prima.
function sit(seat) {
  moved.value = true
  goingSeat.value = seat
  seatTaken.value = false
  lake.sit(seat)
  showMarker(SEAT_SPOTS[seat])
}

const clockText = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  const mm = String(Math.floor(s / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return s >= 3600 ? `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${ss}` : `${mm}:${ss}`
}

// Il cartellino in alto: cosa si può fare adesso, o come va la propria pesca.
const status = computed(() => {
  if (!BACKEND_ENABLED) return { text: 'Demo: con il backend ci si siede e si pesca davvero' }
  const st = lake.status.value
  if (st === 'login') return { text: 'Accedi per sederti e pescare: per ora passeggi e guardi l\'equipaggio' }
  if (st === 'connecting') return { text: 'Si va al lago…' }
  if (st === 'reconnecting') return { text: 'Connessione persa: la sedia resta tua per qualche secondo…' }
  if (st !== 'online') return { text: 'Server di gioco non raggiungibile: per ora si passeggia soltanto' }
  const m = mine.value
  if (m) {
    if (m.phase === 'bite') return { text: 'Ha abboccato!!', tone: 'bite', stand: true }
    if (m.phase === 'caught') return { text: `Preso! ${formatKg(m.weight)} · +${pointsFor(m.weight)} pt`, tone: 'caught', stand: true }
    if (m.phase === 'escaped') return { text: 'Scappato… la lenza torna in acqua', tone: 'escaped', stand: true }
    return { text: `🎣 In pesca da ${clockText(now.value - m.since)} · prima o poi abbocca`, stand: true }
  }
  if (seatTaken.value) return { text: 'Qualcuno è arrivato prima di te: scegli un\'altra sedia', tone: 'escaped' }
  if (goingSeat.value !== null) return { text: 'Vai alla sedia…' }
  if (!freeSeats.value) return { text: 'Tutte le sedie sono occupate: aspetta che se ne liberi una' }
  return { text: `Clicca sul prato per camminare, su una sedia libera per pescare · ${freeSeats.value} su ${SEAT_SPOTS.length} libere` }
})

// Ciuffi d'erba, fiori e canne palustri: posizioni fisse, sempre uguali.
const tufts = [
  [180, 470], [90, 640], [230, 760], [420, 860], [700, 880], [1000, 880], [1250, 860], [1440, 760],
  [1540, 520], [1460, 430], [1200, 310], [640, 290], [960, 280], [330, 600], [1250, 600], [80, 420],
  [380, 420], [600, 790], [1120, 860], [1400, 560],
]
const flowers = [
  [260, 520, '#ff9ec4'], [300, 700, '#ffd54a'], [1340, 470, '#fff8e6'], [1500, 780, '#ff9ec4'],
  [700, 320, '#ffd54a'], [1060, 300, '#ff9ec4'], [150, 800, '#fff8e6'], [1240, 900, '#ffd54a'],
]
const reeds = [0, 180, 108, 252].map((deg) => {
  const a = (deg * Math.PI) / 180
  return { x: LAKE.cx + (LAKE.rx - 8) * Math.cos(a), y: LAKE.cy + (LAKE.ry - 4) * Math.sin(a) }
})
// Ninfee, riflessi e anatre sono disegnati per un lago con il centro in (880, 570), largo 440:
// li si porta su questo lago, più piccolo.
const inLake = `translate(${LAKE.cx} ${LAKE.cy}) scale(${LAKE.rx / 440}) translate(-880 -570)`
const pads = [
  { x: 680, y: 520, r: 18 },
  { x: 708, y: 540, r: 12 },
  { x: 1090, y: 612, r: 16 },
  { x: 970, y: 506, r: 13, flower: true },
  { x: 760, y: 640, r: 15, flower: true },
]
const farTrees = Array.from({ length: 22 }, (_, i) => ({ x: i * 78 - 20, r: 26 + ((i * 7) % 4) * 5 }))
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#1f5d86" @leave="$emit('leave')">
    <svg ref="svg" class="pond" :class="{ shake }" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" @click="onFloor">
      <defs>
        <linearGradient id="pond-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5cbcf0" />
          <stop offset="1" stop-color="#d8f4ff" />
        </linearGradient>
        <radialGradient id="pond-water" cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stop-color="#6cc8f2" />
          <stop offset="0.7" stop-color="#3f9ad2" />
          <stop offset="1" stop-color="#2c78b0" />
        </radialGradient>
        <clipPath id="pond-lake">
          <ellipse :cx="LAKE.cx" :cy="LAKE.cy" :rx="LAKE.rx" :ry="LAKE.ry" />
        </clipPath>
        <g id="pond-tree" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="0" cy="0" rx="40" ry="10" fill="#2d2a4a" stroke="none" opacity="0.16" />
          <path d="M -10 0 L -8 -70 L 8 -70 L 10 0 Z" fill="#a0673a" />
          <circle cx="-26" cy="-96" r="34" fill="#4fae55" />
          <circle cx="26" cy="-96" r="34" fill="#4fae55" />
          <circle cx="0" cy="-124" r="40" fill="#5fbf5a" />
          <circle cx="-14" cy="-136" r="12" fill="#7fd474" stroke="none" />
        </g>
      </defs>

      <!-- Cielo, montagne e bosco in fondo: visto dall'alto il prato arriva quasi in cima -->
      <rect x="-200" y="-200" width="2000" height="440" fill="url(#pond-sky)" />
      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <g class="cloud">
          <path transform="translate(1180 50) scale(0.7)" d="M -70 30 q -40 0 -36 -30 q 6 -30 44 -22 q 10 -40 56 -34 q 40 6 42 40 q 40 -6 44 26 q 2 22 -30 22 z" fill="#fff" />
        </g>
        <path d="M -200 210 L 120 120 L 300 180 L 520 90 L 760 190 L 980 100 L 1200 180 L 1420 110 L 1800 200 L 1800 260 L -200 260 Z" fill="#9fb3dc" />
        <path d="M 478 108 L 520 90 L 562 110 L 540 118 L 520 106 L 500 120 Z M 944 116 L 980 100 L 1018 120 L 998 126 L 980 114 L 962 128 Z" fill="#fff8e6" stroke-width="4" />
        <circle v-for="(t, i) in farTrees" :key="`ft${i}`" :cx="t.x" :cy="226 - t.r * 0.4" :r="t.r" fill="#4f9a50" />
      </g>

      <!-- Prato -->
      <path d="M -200 226 Q 800 196 1800 226 L 1800 1000 L -200 1000 Z" fill="#8ed16f" stroke="#2d2a4a" stroke-width="5" />
      <ellipse cx="260" cy="480" rx="220" ry="60" fill="#9bdc7c" />
      <ellipse cx="1360" cy="820" rx="260" ry="70" fill="#80c464" />
      <ellipse cx="1180" cy="330" rx="200" ry="40" fill="#9bdc7c" />
      <!-- Il sentiero da cui si arriva -->
      <path :d="`M ${LAKE.cx - 70} 940 Q ${LAKE.cx - 30} 860 ${LAKE.cx - 40} 760 L ${LAKE.cx + 40} 760 Q ${LAKE.cx + 40} 860 ${LAKE.cx + 70} 940 Z`" fill="#e8cf9c" />
      <g fill="none" stroke="#5fa84c" stroke-width="3" stroke-linecap="round">
        <path v-for="([x, y], i) in tufts" :key="`tu${i}`" :d="`M ${x - 7} ${y} l 3 -10 M ${x} ${y} l 0 -13 M ${x + 7} ${y} l -3 -10`" />
      </g>
      <g stroke="#2d2a4a" stroke-width="2">
        <g v-for="([x, y, c], i) in flowers" :key="`fl${i}`">
          <circle :cx="x" :cy="y" r="5" :fill="c" />
          <circle :cx="x + 9" :cy="y + 4" r="4" :fill="c" />
          <circle :cx="x" :cy="y" r="1.8" fill="#ff7a59" stroke="none" />
        </g>
      </g>

      <!-- Spiaggetta e lago -->
      <g stroke="#2d2a4a" stroke-linejoin="round" stroke-linecap="round">
        <ellipse :cx="LAKE.cx" :cy="LAKE.cy + 8" :rx="SHORE.rx" :ry="SHORE.ry" fill="#f0dcb0" stroke-width="5" />
        <ellipse :cx="LAKE.cx" :cy="LAKE.cy + 5" :rx="LAKE.rx + 24" :ry="LAKE.ry + 16" fill="#e2c58e" stroke="none" />
        <g fill="#d2b47c" stroke="none">
          <circle cx="560" cy="700" r="4" /><circle cx="1130" cy="410" r="3" /><circle cx="1190" cy="690" r="4" /><circle cx="520" cy="470" r="3" />
        </g>
        <ellipse :cx="LAKE.cx" :cy="LAKE.cy" :rx="LAKE.rx" :ry="LAKE.ry" fill="url(#pond-water)" stroke-width="5" />
      </g>
      <g clip-path="url(#pond-lake)">
        <ellipse :cx="LAKE.cx" :cy="LAKE.cy" :rx="LAKE.rx - 10" :ry="LAKE.ry - 7" fill="none" stroke="#9fe0ff" stroke-width="8" opacity="0.45" />
        <g :transform="inLake">
          <!-- Ombre di pesci che girano sotto il pelo dell'acqua -->
          <g class="shadows" fill="#1d5a8a" opacity="0.28">
            <g class="swim s1"><ellipse cx="0" cy="0" rx="26" ry="9" /><path d="M -24 0 l -14 -9 l 0 18 z" /></g>
            <g class="swim s2"><ellipse cx="0" cy="0" rx="34" ry="11" /><path d="M -32 0 l -16 -11 l 0 22 z" /></g>
            <g class="swim s3"><ellipse cx="0" cy="0" rx="20" ry="7" /><path d="M -18 0 l -12 -7 l 0 14 z" /></g>
          </g>
          <g class="waves" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.6">
            <path d="M 600 520 q 20 -10 40 0 M 1040 560 q 20 -10 40 0 M 800 690 q 20 -10 40 0 M 1160 660 q 20 -10 40 0 M 900 460 q 20 -10 40 0" />
          </g>
          <g fill="#fff">
            <path v-for="(p, i) in [[740, 470], [1030, 640], [1170, 520], [640, 610], [920, 600]]" :key="`gl${i}`" class="glint" :style="{ animationDelay: `${i * -0.7}s` }" :d="`M ${p[0]} ${p[1] - 8} L ${p[0] + 3} ${p[1]} L ${p[0]} ${p[1] + 8} L ${p[0] - 3} ${p[1]} Z`" />
          </g>
          <!-- Ninfee -->
          <g stroke="#2d2a4a" stroke-width="3" stroke-linejoin="round">
            <g v-for="(p, i) in pads" :key="`pad${i}`">
              <path :d="`M ${p.x} ${p.y} L ${p.x + p.r} ${p.y - p.r * 0.2} A ${p.r} ${p.r * 0.55} 0 1 1 ${p.x + p.r * 0.7} ${p.y - p.r * 0.5} Z`" fill="#5fbf5a" />
              <g v-if="p.flower">
                <circle :cx="p.x - 2" :cy="p.y - 6" r="6" fill="#ff9ec4" />
                <circle :cx="p.x - 2" :cy="p.y - 7" r="2.5" fill="#ffd54a" stroke-width="2" />
              </g>
            </g>
          </g>
          <!-- Mamma anatra e anatroccoli -->
          <g transform="translate(760 590)">
            <g class="ducks">
              <g class="duck-flip">
                <g stroke="#2d2a4a" stroke-width="3" stroke-linejoin="round">
                  <ellipse cx="0" cy="0" rx="20" ry="11" fill="#fff8e6" />
                  <circle cx="14" cy="-14" r="9" fill="#fff8e6" />
                  <path d="M 22 -15 L 31 -12 L 22 -10 Z" fill="#ffb347" />
                  <circle cx="16" cy="-16" r="1.8" fill="#2d2a4a" stroke="none" />
                  <ellipse v-for="k in 3" :key="k" :cx="-22 - k * 22" cy="3" rx="8" ry="5" fill="#ffd54a" />
                  <circle v-for="k in 3" :key="`h${k}`" :cx="-16 - k * 22" cy="-4" r="5" fill="#ffd54a" />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
      <!-- Canne palustri sul bordo -->
      <g v-for="(r, i) in reeds" :key="`reed${i}`" :transform="`translate(${r.x} ${r.y}) scale(${SCALE})`">
        <g class="reeds" :style="{ animationDelay: `${-i}s` }" stroke="#2d2a4a" stroke-width="4" stroke-linecap="round">
          <path d="M -10 6 L -16 -46 M 0 6 L 0 -58 M 10 6 L 18 -42" fill="none" stroke="#3f8f3a" stroke-width="6" />
          <rect x="-23" y="-62" width="12" height="26" rx="6" fill="#8b5a2b" />
          <rect x="-6" y="-76" width="12" height="28" rx="6" fill="#8b5a2b" />
          <path d="M -14 8 Q -24 -20 -32 -26 Q -18 -12 -6 8 Z M 12 8 Q 26 -14 34 -18 Q 22 -6 18 8 Z" fill="#5fbf5a" stroke-width="3" />
        </g>
      </g>

      <!-- Il cartellone della classifica -->
      <FishingBoard :board="board" :failed="failed" :demo="!BACKEND_ENABLED" />

      <!-- Dove si sta andando -->
      <ellipse v-if="marker" :key="marker.k" class="marker" :cx="marker.x" :cy="marker.y" rx="16" ry="6" fill="none" stroke="#fff8e6" stroke-width="4" />

      <!-- Sedie, personaggi e oggetti sul prato, dal fondo verso chi guarda -->
      <template v-for="item in scene" :key="item.id">
        <Angler v-if="item.kind === 'seat'" :spot="item.spot" :angler="anglers.get(item.spot.seat) ?? null" :can-sit="online" @sit="sit" />
        <g v-else-if="item.kind === 'walker'">
          <g :transform="`translate(${item.x} ${item.y}) scale(${SCALE})`">
            <Avatar :look="item.look" :dir="item.dir" :walking="item.walking" />
          </g>
          <text class="name" :class="{ me: item.me }" :x="item.x" :y="item.y + 17" text-anchor="middle">{{ item.name }}</text>
        </g>
        <use v-else-if="item.kind === 'tree'" href="#pond-tree" :transform="`translate(${item.x} ${item.y}) scale(${item.s})`" />
        <g v-else-if="item.kind === 'fire'" :transform="`translate(${item.x} ${item.y}) scale(0.7)`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <ellipse cx="0" cy="4" rx="46" ry="12" fill="#2d2a4a" stroke="none" opacity="0.16" />
          <g fill="#9aa6b8" stroke-width="4">
            <ellipse cx="-30" cy="0" rx="12" ry="8" /><ellipse cx="30" cy="0" rx="12" ry="8" /><ellipse cx="0" cy="8" rx="14" ry="8" />
          </g>
          <path d="M -26 -2 L 24 -16 M 24 -2 L -26 -16" stroke="#7a4a2a" stroke-width="10" fill="none" />
          <g class="flame">
            <path d="M -18 -8 Q -24 -40 -4 -64 Q -2 -44 8 -40 Q 12 -54 10 -66 Q 30 -40 18 -8 Z" fill="#ff7a59" stroke-width="4" />
            <path d="M -8 -10 Q -10 -30 2 -42 Q 4 -28 12 -26 Q 14 -18 8 -10 Z" fill="#ffd54a" stroke="none" />
          </g>
          <circle class="ember e1" cx="-4" cy="-70" r="3" fill="#ffd54a" stroke="none" />
          <circle class="ember e2" cx="8" cy="-74" r="2.5" fill="#ff7a59" stroke="none" />
        </g>
        <g v-else-if="item.kind === 'bucket'" :transform="`translate(${item.x} ${item.y}) scale(${SCALE})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M -22 0 L -26 -40 L 26 -40 L 22 0 Z" fill="#9aa6b8" />
          <path d="M -24 -40 Q 0 -70 24 -40" fill="none" stroke-width="4" />
          <path d="M -14 -40 q 6 -16 14 -4 q 8 -12 14 2" fill="none" stroke="#ff8fa3" stroke-width="5" />
        </g>
      </template>

      <!-- Fumetti, sopra a tutto: i puntini mentre si scrive, poi il messaggio -->
      <g v-for="b in bubbles" :key="b.id" :transform="`translate(${b.x} ${b.y})`">
        <SpeechBubble :text="b.say" :typing="b.typing" />
      </g>
    </svg>

    <div class="status" :class="status.tone" role="status">
      <span>{{ status.text }}</span>
      <button v-if="status.stand" class="stand" @click="lake.stand()">Alzati</button>
    </div>

    <ChatWindow
      v-if="lake"
      title="Chat della zona di pesca"
      :status="lake.status.value"
      :messages="lake.chat.messages.value"
      @send="lake.chat.send"
      @typing="lake.chat.setTyping"
    />
    <BigCatch v-if="bigCatches.length" :key="bigCatches[0].id" :fish="bigCatches[0]" @done="bigCatches.shift()" />
  </InteriorLayout>
</template>

<style scoped>
.pond {
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
.pond.shake {
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}
@keyframes shake {
  10%, 90% { transform: translate(-3px, 1px); }
  20%, 80% { transform: translate(6px, -2px); }
  30%, 50%, 70% { transform: translate(-10px, 3px); }
  40%, 60% { transform: translate(10px, -3px); }
}
.cloud {
  animation: drift 60s linear infinite alternate;
}
.cloud.slow {
  animation-duration: 90s;
  animation-direction: alternate-reverse;
}
@keyframes drift {
  from { transform: translateX(-80px); }
  to { transform: translateX(80px); }
}
.waves {
  animation: waves 3s ease-in-out infinite alternate;
}
@keyframes waves {
  to { transform: translateX(18px); }
}
.glint {
  transform-box: fill-box;
  transform-origin: center;
  animation: glint 2.8s ease-in-out infinite;
}
@keyframes glint {
  0%, 60%, 100% { transform: scale(0); }
  75% { transform: scale(1.2); }
}
/* Le ombre dei pesci girano in tondo sotto l'acqua */
.swim {
  offset-rotate: auto;
  animation: lap 26s linear infinite;
}
.s1 {
  offset-path: path('M 660 560 C 660 470 1100 470 1100 560 C 1100 650 660 650 660 560 Z');
}
.s2 {
  offset-path: path('M 1180 590 C 1180 660 740 690 680 600 C 630 520 940 470 1040 500 C 1140 530 1180 560 1180 590 Z');
  animation-duration: 38s;
  animation-direction: reverse;
}
.s3 {
  offset-path: path('M 800 520 C 900 470 1020 520 980 590 C 940 660 760 620 800 520 Z');
  animation-duration: 18s;
}
@keyframes lap {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}
.s2 {
  transform: scaleX(-1);
}
.ducks {
  animation: paddle 48s ease-in-out infinite alternate;
}
@keyframes paddle {
  from { transform: translate(-60px, 0); }
  to { transform: translate(300px, 30px); }
}
.duck-flip {
  animation: duck-flip 96s steps(1) infinite, duck-bob 1.6s ease-in-out infinite;
}
@keyframes duck-flip {
  0% { scale: 1 1; }
  50% { scale: -1 1; }
}
@keyframes duck-bob {
  50% { transform: translateY(2px) rotate(-3deg); }
}
.reeds {
  transform-origin: 0 6px;
  animation: reeds 3.4s ease-in-out infinite alternate;
}
@keyframes reeds {
  from { transform: rotate(-3deg); }
  to { transform: rotate(3deg); }
}
.flame {
  transform-origin: 0 -8px;
  animation: flame 0.5s ease-in-out infinite alternate;
}
@keyframes flame {
  from { transform: scale(1, 1) skewX(-4deg); }
  to { transform: scale(0.92, 1.1) skewX(5deg); }
}
.ember {
  animation: ember 1.6s ease-out infinite;
}
.e2 {
  animation-delay: 0.8s;
}
@keyframes ember {
  from { transform: translate(0, 0); opacity: 1; }
  to { transform: translate(10px, -50px); opacity: 0; }
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
.status.bite {
  background: #ff7a59;
  color: #fff8e6;
  animation: nudge 0.3s ease-in-out infinite alternate;
}
.status.caught {
  background: #ffd54a;
}
.status.escaped {
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
  background: #4fc3f7;
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
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  .status {
    top: 176px;
    white-space: normal;
  }
}
</style>
