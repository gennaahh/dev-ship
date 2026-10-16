<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { clampToMuseum, SCALE, walkMuseum } from '@dev-city/shared/museum-floor'
import { authClient, displayName } from '../../auth.js'
import ChatWindow from '../../components/ChatWindow.vue'
import { useCaptains } from '../../composables/useCaptains.js'
import { useInventory } from '../../composables/useInventory.js'
import { useMuseumRoom } from '../../composables/useMuseumRoom.js'
import { useTrade } from '../../composables/useTrade.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { DEFAULT_LOOK, lookOf } from '../avatar.js'
import CaptainPortrait from '../museum/CaptainPortrait.vue'
import CaptainsAlbum from '../museum/CaptainsAlbum.vue'
import { weekLabel } from '../museum/museum.js'
import TrophyCase from '../museum/TrophyCase.vue'
import TrophyShelf from '../museum/TrophyShelf.vue'
import SpeechBubble from '../SpeechBubble.vue'
import InteriorLayout from './InteriorLayout.vue'
import Icon from '../../components/Icon.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Sulla parete l\'albo dei capitani: ogni lunedì il podio della settimana prima della classifica della città diventa un quadro, col primo al timone.',
  'Le stelle sulla cornice sono le vittorie del capitano. Un clic sui quadri per vederli tutti, dal più recente.',
  'A destra la bacheca dei trofei: per ora è vuota, arriveranno i trofei per le imprese della città.',
  'Si passeggia e si chiacchiera come in piazza. Tasto destro su un altro giocatore per uno scambio.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const myName = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : 'Tu'
})
const inventory = useInventory()
const trade = useTrade()
const myLook = computed(() => (session.value.data?.user ? lookOf(myName.value, inventory.equipment.value) : DEFAULT_LOOK))

const { album, failed } = useCaptains()

// Da loggati il museo è multigiocatore; senza, si passeggia da soli.
const room = BACKEND_ENABLED ? useMuseumRoom() : null
const online = computed(() => room?.status.value === 'online')
const me = reactive({ x: 800, y: 920, tx: 800, ty: 800, dir: 1, walking: false })
let raf = 0
let last = 0
function frame(t) {
  const dt = Math.min(100, Math.max(0, t - last))
  last = t
  if (!online.value && (me.x !== me.tx || me.y !== me.ty)) {
    const next = walkMuseum(me, { x: me.tx, y: me.ty }, dt)
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
  // Da vicino Esc ci si allontana, invece di uscire dal museo: si passa prima di InteriorLayout
  // (fase di cattura) e preventDefault gli dice di lasciar stare.
  addEventListener('keydown', onEscape, true)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  removeEventListener('keydown', onEscape, true)
})

const walkers = computed(() => {
  if (!online.value) return [{ ...me, id: 'me', me: true, name: myName.value, look: myLook.value, say: '', typing: false }]
  return room.players.value.map((p) => ({ ...p, look: p.me ? myLook.value : lookOf(p.name, p) }))
})
// Chi passeggia, i cordoni, la bacheca dei trofei e le piante, dal fondo verso chi guarda.
const PROPS = [
  { id: 'case', kind: 'case', y: 520 },
  { id: 'ropes', kind: 'ropes', y: 548 },
  { id: 'plant-left', kind: 'plant', x: 64, y: 600 },
  { id: 'plant-right', kind: 'plant', x: 1540, y: 600 },
]
const scene = computed(() => [...PROPS, ...walkers.value.map((w) => ({ ...w, sessionId: w.id, id: `walker-${w.id}`, kind: 'walker' }))].sort((a, b) => a.y - b.y))
const bubbles = computed(() => walkers.value.filter((w) => w.say || w.typing).map((w) => ({ id: w.id, x: w.x, y: w.y + 96 - 96 * SCALE, say: w.say, typing: w.typing })))

// I tre quadri sulla parete: le ultime tre settimane, dalla più recente a sinistra. Quelli che
// mancano sono cornici vuote, in attesa.
const FRAME_X = [130, 450, 770]
const FRAME_SCALE = 0.92
const wall = computed(() => FRAME_X.map((x, i) => ({ x, week: album.value?.weeks?.[i] ?? null })))
const short = (name, max = 16) => (name.length > max ? `${name.slice(0, max - 1)}…` : name)

const svg = ref(null)
const marker = ref(null)
function onFloor(e) {
  if (zoomed.value) return (zoomed.value = null)
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.value.getScreenCTM().inverse())
  if (online.value) {
    marker.value = { ...room.moveTo(p.x, p.y), k: (marker.value?.k ?? 0) + 1 }
  } else {
    const target = clampToMuseum(p)
    me.tx = target.x
    me.ty = target.y
    marker.value = { ...target, k: (marker.value?.k ?? 0) + 1 }
  }
}

// Da vicino: 'album' (i quadri) o 'trophies' (la bacheca). La scena zooma lì e sopra compare il
// pannello da leggere.
const zoomed = ref(null)
const CAMERA = {
  album: 'translate(-100px, 98px) scale(1.5)',
  trophies: 'translate(-1890px, -190px) scale(2)',
}
function onEscape(e) {
  if (e.key !== 'Escape' || !zoomed.value || document.querySelector('dialog[open]')) return
  e.preventDefault()
  zoomed.value = null
}
const openAlbum = (e) => {
  e?.stopPropagation()
  zoomed.value = 'album'
}

const status = computed(() => {
  if (!BACKEND_ENABLED) return 'Demo: l\'albo e la sala sono quelli della squadra finta'
  const st = room.status.value
  if (st === 'login') return 'Accedi per passeggiare con gli altri: per ora sei da solo nella sala'
  if (st === 'connecting') return 'Si entra al museo…'
  if (st === 'reconnecting') return 'Connessione persa: si riprova…'
  if (st !== 'online') return 'Server di gioco non raggiungibile: per ora si passeggia da soli'
  return 'Clicca sul pavimento per camminare, sui quadri per l\'albo dei capitani, sulla vetrina per i trofei'
})
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#7a4a2a" @leave="$emit('leave')">
    <svg ref="svg" class="museum" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" @click="onFloor">
      <g class="camera" :style="{ transform: zoomed ? CAMERA[zoomed] : 'none' }">
        <!-- La parete, con la boiserie in basso -->
        <rect x="-200" y="-200" width="2000" height="720" fill="#f3ead2" />
        <rect x="-200" y="410" width="2000" height="110" fill="#e2d4b0" />
        <g stroke="#cfbf96" stroke-width="4" fill="none">
          <rect v-for="i in 9" :key="`panel${i}`" :x="i * 180 - 160" y="428" width="150" height="72" rx="6" />
        </g>
        <path d="M -200 410 L 1800 410" stroke="#2d2a4a" stroke-width="5" />
        <!-- Le colonne ai lati -->
        <g v-for="x in [24, 1112]" :key="`col${x}`" stroke="#2d2a4a" stroke-width="5">
          <rect :x="x" y="40" width="56" height="480" fill="#fffaf0" />
          <rect :x="x - 12" y="30" width="80" height="24" rx="4" fill="#e2d4b0" />
          <path :d="`M ${x + 18} 64 L ${x + 18} 510 M ${x + 38} 64 L ${x + 38} 510`" stroke="#e2d4b0" stroke-width="4" />
        </g>

        <!-- L'albo dei capitani: i faretti, i quadri, le targhette e sotto, sulla boiserie, il titolo -->
        <g class="gallery" role="button" tabindex="0" aria-label="Albo dei capitani: guardalo da vicino" @click="openAlbum" @keydown.enter.prevent="openAlbum" @keydown.space.prevent="openAlbum">
          <rect x="100" y="70" width="1000" height="430" rx="20" fill="transparent" class="halo" stroke="#ffd54a" stroke-width="10" />
          <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
            <rect x="420" y="430" width="360" height="50" rx="10" fill="#e8a31a" />
            <rect x="430" y="440" width="340" height="30" rx="6" fill="none" stroke="#ffd54a" stroke-width="3" />
          </g>
          <text x="600" y="464" text-anchor="middle" class="title">ALBO DEI CAPITANI</text>
          <g v-for="f in wall" :key="f.x">
            <path :d="`M ${f.x + 140} 96 L ${f.x + 20} 330 L ${f.x + 300} 330 L ${f.x + 180} 96 Z`" fill="#fff8c8" opacity="0.35" />
            <rect :x="f.x + 140" y="86" width="40" height="14" rx="5" fill="#4b4870" stroke="#2d2a4a" stroke-width="3" />
            <g v-if="f.week" :transform="`translate(${f.x + 15} 126) scale(${FRAME_SCALE})`">
              <CaptainPortrait :podium="f.week.podium" :wins="f.week.wins" />
            </g>
            <g v-else>
              <rect :x="f.x" y="111" width="306" height="222" rx="6" fill="#fffaf0" opacity="0.6" stroke="#2d2a4a" stroke-width="4" stroke-dasharray="14 10" />
              <text :x="f.x + 153" y="240" text-anchor="middle" class="ask">?</text>
            </g>
            <!-- La targhetta -->
            <rect :x="f.x + 43" y="350" width="220" height="48" rx="6" fill="#e8a31a" stroke="#2d2a4a" stroke-width="4" />
            <template v-if="f.week">
              <text :x="f.x + 153" y="370" text-anchor="middle" class="plate">Settimana del {{ weekLabel(f.week.weekStart) }}</text>
              <text :x="f.x + 153" y="390" text-anchor="middle" class="plate small">{{ short(f.week.podium[0].name) }} · {{ f.week.podium[0].points }} pt</text>
            </template>
            <text v-else :x="f.x + 153" y="380" text-anchor="middle" class="plate">{{ f === wall.find((w) => !w.week) ? 'Lunedì il prossimo' : '…' }}</text>
          </g>
          <text x="600" y="64" text-anchor="middle" class="hint">Clicca per vedere tutti i quadri</text>
        </g>

        <!-- Il pavimento a scacchi -->
        <path d="M -200 520 L 1800 520 L 1800 1100 L -200 1100 Z" fill="#e2d4b0" stroke="#2d2a4a" stroke-width="5" />
        <g stroke="#cfbf96" stroke-width="4" fill="none">
          <path v-for="i in 21" :key="`fl${i}`" :d="`M ${(i - 1) * 100 - 400} 900 L ${(i - 1) * 90 - 100} 520`" />
          <path d="M -200 600 L 1800 600 M -200 700 L 1800 700 M -200 810 L 1800 810" />
        </g>

        <ellipse v-if="marker" :key="marker.k" class="marker" :cx="marker.x" :cy="marker.y" rx="18" ry="7" fill="none" stroke="#fff8e6" stroke-width="4" />

        <template v-for="item in scene" :key="item.id">
          <TrophyCase v-if="item.kind === 'case'" @open="zoomed = 'trophies'" />
          <g v-else-if="item.kind === 'ropes'" stroke="#2d2a4a" stroke-width="4">
            <path d="M 140 512 Q 300 552 460 512 Q 620 552 780 512 Q 940 552 1100 512" fill="none" stroke="#c0392b" stroke-width="10" />
            <g v-for="x in [140, 460, 780, 1100]" :key="`post${x}`">
              <rect :x="x - 6" y="508" width="12" height="44" fill="#e8a31a" />
              <circle :cx="x" cy="506" r="10" fill="#e8a31a" />
              <ellipse :cx="x" cy="552" rx="18" ry="6" fill="#e8a31a" />
            </g>
          </g>
          <g v-else-if="item.kind === 'plant'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
            <ellipse cx="0" cy="2" rx="40" ry="9" fill="#2d2a4a" stroke="none" opacity="0.18" />
            <circle cx="-20" cy="-110" r="32" fill="#4fae55" />
            <circle cx="18" cy="-124" r="28" fill="#5cc062" />
            <circle cx="0" cy="-88" r="28" fill="#4fae55" />
            <path d="M -30 0 L -36 -62 L 36 -62 L 30 0 Z" fill="#fffaf0" />
          </g>
          <g v-else-if="item.kind === 'walker'" @contextmenu="online && !item.me && trade.openMenu($event, { ...item, id: item.sessionId })">
            <g :transform="`translate(${item.x} ${item.y}) scale(${SCALE})`">
              <Avatar :look="item.look" :dir="item.dir" :walking="item.walking" />
            </g>
            <text class="name" :class="{ me: item.me }" :x="item.x" :y="item.y + 17" text-anchor="middle">{{ item.name }}</text>
          </g>
        </template>

        <g v-for="b in bubbles" :key="b.id" :transform="`translate(${b.x} ${b.y})`">
          <SpeechBubble :text="b.say" :typing="b.typing" />
        </g>
      </g>
    </svg>

    <div v-if="!zoomed" class="top">
      <div class="status" role="status">{{ status }}</div>
      <div class="quick">
        <button @click="zoomed = 'album'"><Icon name="frame" /> Albo dei capitani</button>
        <button @click="zoomed = 'trophies'"><Icon name="trophy" /> Trofei</button>
      </div>
    </div>

    <Transition name="dim">
      <div v-if="zoomed" class="dim" @click="zoomed = null" />
    </Transition>
    <Transition name="panel">
      <CaptainsAlbum v-if="zoomed === 'album'" :album="album" :failed="failed" @close="zoomed = null" />
      <TrophyShelf v-else-if="zoomed === 'trophies'" @close="zoomed = null" />
    </Transition>

    <ChatWindow v-if="room" title="Chat del museo" :status="room.status.value" :messages="room.chat.messages.value" @send="room.chat.send" @typing="room.chat.setTyping" />
  </InteriorLayout>
</template>

<style scoped>
.museum {
  cursor: pointer;
  user-select: none;
}
.camera {
  transition: transform 0.7s cubic-bezier(0.3, 0.7, 0.2, 1);
}
@media (prefers-reduced-motion: reduce) {
  .camera {
    transition: none;
  }
}
.gallery {
  cursor: zoom-in;
  outline: none;
}
.halo,
.hint {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.gallery:hover .halo,
.gallery:focus-visible .halo,
.gallery:hover .hint,
.gallery:focus-visible .hint {
  opacity: 1;
}
.title {
  fill: #2d2a4a;
  font-size: 24px;
  letter-spacing: 3px;
}
.ask {
  fill: #cfbf96;
  font-size: 90px;
}
.plate {
  fill: #2d2a4a;
  font-size: 15px;
}
.plate.small {
  font-size: 13px;
}
.hint {
  fill: #2d2a4a;
  font-size: 18px;
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
.top {
  position: absolute;
  top: 16px;
  left: 50%;
  translate: -50% 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: calc(100% - 32px);
}
.status {
  box-sizing: border-box;
  max-width: 100%;
  padding: 8px 16px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 17px;
  text-align: center;
}
button {
  font: inherit;
  cursor: pointer;
}
.quick {
  display: flex;
  gap: 8px;
}
.quick button {
  padding: 3px 12px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff8e6;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
}
.quick button:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.dim {
  position: absolute;
  inset: 0;
  background: rgba(45, 42, 74, 0.5);
  cursor: zoom-out;
}
.dim-enter-active,
.dim-leave-active {
  transition: opacity 0.5s ease;
}
.dim-enter-from,
.dim-leave-to {
  opacity: 0;
}
.panel-enter-active {
  transition: opacity 0.35s ease 0.35s, translate 0.35s ease 0.35s;
}
.panel-leave-active {
  transition: opacity 0.2s ease;
}
.panel-enter-from {
  opacity: 0;
  translate: -50% 12px;
}
.panel-leave-to {
  opacity: 0;
}
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  .top {
    top: 176px;
  }
}
</style>
