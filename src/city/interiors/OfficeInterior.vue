<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { coffee } from '@dev-city/shared/coffee'
import { BOARD, CANCEL_COOLDOWN_MS } from '@dev-city/shared/office'
import { clampToOffice, COFFEE_SPOT, SCALE, SEAT_SPOTS, walkOffice } from '@dev-city/shared/office-floor'
import { authClient, displayName } from '../../auth.js'
import ChatWindow from '../../components/ChatWindow.vue'
import { useInventory } from '../../composables/useInventory.js'
import { useOffice } from '../../composables/useOffice.js'
import { useOfficeRoom } from '../../composables/useOfficeRoom.js'
import { useTrade } from '../../composables/useTrade.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { DEFAULT_LOOK, lookOf } from '../avatar.js'
import { activeCoffee, leftText } from '../office/coffee.js'
import CoffeeMachine from '../office/CoffeeMachine.vue'
import CoffeeMenu from '../office/CoffeeMenu.vue'
import MissionBoard from '../office/MissionBoard.vue'
import TableSeat from '../office/TableSeat.vue'
import WallBoard from '../office/WallBoard.vue'
import SpeechBubble from '../SpeechBubble.vue'
import InteriorLayout from './InteriorLayout.vue'
import Icon from '../../components/Icon.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Si cammina e si chiacchiera come in piazza; al tavolo ci sono 8 posti, uno a testa: clicca su una sedia libera per sederti.',
  `In fondo a sinistra la bacheca delle missioni: un clic per avvicinarsi. Ci sono sempre ${BOARD.length} missioni col premio scritto sopra, e appena qualcuno ne prende una ne esce un'altra.`,
  `Una missione alla volta: si consegna dalla finestra della missione (tasto M). Annullarla si può, ma poi per ${CANCEL_COOLDOWN_MS / 60_000} minuti non se ne prendono altre.`,
  'In fondo a destra, su un tavolino, la macchinetta del caffè: ogni caffè costa qualche moneta e per un po\' fa aspettare meno al lago e in miniera, porta più pesci speciali e scoperte rare, o dà forza nel dungeon. Uno alla volta.',
  'Chi ha un caffè in circolo, seduto al tavolo, ha la tazza davanti. Tasto destro su un altro giocatore per uno scambio.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const myName = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : 'Tu'
})
// Il proprio look viene dall'inventario, così cambia subito; quello degli altri dalla stanza.
const inventory = useInventory()
const trade = useTrade()
const myLook = computed(() => (session.value.data?.user ? lookOf(myName.value, inventory.equipment.value) : DEFAULT_LOOK))

// La bacheca delle missioni: mentre si è in ufficio si ricarica da sola, le missioni prese dagli
// altri spariscono e al loro posto ne escono di nuove.
const office = useOffice()
const BOARD_REFRESH_MS = 10_000

// Il posto verso cui sto camminando, e l'avviso se arrivato lo trovo occupato.
const goingSeat = ref(null)
const seatTaken = ref(false)
let takenTimer = 0

// Da loggati l'ufficio è multigiocatore: si cammina, si chiacchiera e ci si siede con gli altri.
const room = BACKEND_ENABLED
  ? useOfficeRoom({
      onSeatTaken() {
        goingSeat.value = null
        seatTaken.value = true
        clearTimeout(takenTimer)
        takenTimer = setTimeout(() => (seatTaken.value = false), 3500)
      },
    })
  : null
const online = computed(() => room?.status.value === 'online')

// Senza backend, prima del login o col server spento si passeggia da soli, mentre al tavolo
// chiacchiera la squadra della classifica, col caffè davanti.
const me = reactive({ x: 800, y: 920, tx: 800, ty: 820, dir: 1, walking: false })
const crew = [
  { seat: 1, name: 'Vedetta Debug', look: { color: '#5c6bc0', hat: 'headphones' }, coffee: 'cappuccino' },
  { seat: 2, name: 'Nostromo Deploy', look: { color: '#9ccc65', hat: 'cap' }, coffee: 'espresso' },
  { seat: 6, name: 'Marinaio Commit', look: { color: '#ffca28', hat: 'beanie' }, coffee: 'marocchino' },
]

// now fa sparire le tazze dei caffè finiti.
const now = ref(Date.now())
let clock = 0
let refresh = 0
let raf = 0
let last = 0
function frame(t) {
  const dt = Math.min(100, Math.max(0, t - last))
  last = t
  if (!online.value && (me.x !== me.tx || me.y !== me.ty)) {
    const next = walkOffice(me, { x: me.tx, y: me.ty }, dt)
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
  clock = setInterval(() => (now.value = Date.now()), 15_000)
  office.loadBoard()
  office.loadMission()
  refresh = setInterval(office.loadBoard, BOARD_REFRESH_MS)
  // Con la bacheca da vicino Esc ci si allontana, invece di uscire dall'ufficio: si passa prima
  // di InteriorLayout (fase di cattura) e preventDefault gli dice di lasciar stare.
  addEventListener('keydown', onEscape, true)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearInterval(clock)
  clearInterval(refresh)
  clearTimeout(takenTimer)
  clearTimeout(brewTimer)
  removeEventListener('keydown', onEscape, true)
})

// Chi è seduto a quale posto, col caffè che ha davanti (se non è finito) e il fumetto.
const sitters = computed(() => {
  if (!online.value) return new Map(crew.map((c) => [c.seat, { ...c, me: false, say: '', typing: false }]))
  const byId = new Map(room.players.value.map((p) => [p.id, p]))
  return new Map(
    room.seats.value.map((s) => [
      s.seat,
      {
        ...s,
        coffee: s.coffeeUntil > now.value ? s.coffee : '',
        look: s.me ? myLook.value : lookOf(s.name, byId.get(s.id)),
        say: byId.get(s.id)?.say ?? '',
        typing: byId.get(s.id)?.typing ?? false,
      },
    ]),
  )
})
// Chi cammina: tutti quelli che non sono seduti.
const walkers = computed(() => {
  if (!online.value) return [{ ...me, id: 'me', me: true, name: myName.value, look: myLook.value, say: '', typing: false }]
  const seated = new Set(room.seats.value.map((s) => s.id))
  return room.players.value.filter((p) => !seated.has(p.id)).map((p) => ({ ...p, look: p.me ? myLook.value : lookOf(p.name, p) }))
})
const mySeat = computed(() => (online.value ? room.seats.value.find((s) => s.me) : null))
const freeSeats = computed(() => SEAT_SPOTS.length - sitters.value.size)

// Tutto quello che sta sul pavimento, dal fondo verso chi guarda: l'angolo del caffè contro la
// parete, chi passa dietro al tavolo, le sedie di dietro, il tavolo con quello che c'è sopra, le
// sedie davanti e chi passa davanti.
const PROPS = [
  { id: 'plant-left', kind: 'plant', x: 70, y: 548 },
  { id: 'plant-right', kind: 'plant', x: 1532, y: 548 },
  { id: 'coffee', kind: 'coffee', y: 496 },
]
const scene = computed(() =>
  [
    ...PROPS,
    { id: 'table', kind: 'table', y: 669 },
    { id: 'on-table', kind: 'onTable', y: 670 },
    ...SEAT_SPOTS.map((s) => ({ id: `seat-${s.seat}`, kind: 'seat', y: s.side === 'back' ? 600 : s.y, spot: s })),
    ...walkers.value.map((w) => ({ ...w, sessionId: w.id, id: `walker-${w.id}`, kind: 'walker' })),
  ].sort((a, b) => a.y - b.y),
)
// I fumetti, sopra a tutto: SpeechBubble è fatto per i personaggi della piazza, lo si sposta
// sulla testa di quelli più piccoli dell'ufficio.
const bubbles = computed(() => {
  const list = walkers.value.filter((w) => w.say || w.typing).map((w) => ({ id: w.id, x: w.x, y: w.y + 96 - 96 * SCALE, say: w.say, typing: w.typing }))
  for (const [seat, s] of sitters.value) {
    if (!s.say && !s.typing) continue
    const spot = SEAT_SPOTS[seat]
    list.push({ id: `seat-${seat}`, x: spot.x, y: spot.y + 96 - 96 * SCALE, say: s.say, typing: s.typing })
  }
  return list
})

const svg = ref(null)
const marker = ref(null)
const showMarker = (p) => (marker.value = { ...p, k: (marker.value?.k ?? 0) + 1 })

function onFloor(e) {
  if (zoomed.value) return (zoomed.value = false)
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.value.getScreenCTM().inverse())
  walkTo(p)
}
function walkTo(p) {
  goingSeat.value = null
  if (online.value) {
    showMarker(room.moveTo(p.x, p.y))
  } else {
    const target = clampToOffice(p)
    me.tx = target.x
    me.ty = target.y
    showMarker(target)
  }
}
// Si cammina fino al posto: ci si siede all'arrivo, se nessuno ci è arrivato prima.
function sit(seat) {
  goingSeat.value = seat
  seatTaken.value = false
  room.sit(seat)
  showMarker(SEAT_SPOTS[seat].approach)
}

// La bacheca da vicino: la scena zooma sulla bacheca e sopra compaiono i foglietti da leggere.
const zoomed = ref(false)
function onEscape(e) {
  if (e.key !== 'Escape' || !zoomed.value || document.querySelector('dialog[open]')) return
  e.preventDefault()
  zoomed.value = false
}

// La macchinetta: il menu si apre subito, e se non si è seduti ci si avvicina.
const menuOpen = ref(false)
const brewing = ref(false)
let brewTimer = 0
function openCoffee() {
  menuOpen.value = true
  if (!mySeat.value) walkTo(COFFEE_SPOT)
}
function brewed() {
  brewing.value = true
  clearTimeout(brewTimer)
  brewTimer = setTimeout(() => (brewing.value = false), 2200)
}

const myCoffee = computed(() => activeCoffee(inventory.coffee.value, now.value))

// Il cartellino in alto: cosa si può fare adesso, o come si sta al tavolo.
const status = computed(() => {
  if (!BACKEND_ENABLED) return { text: 'Demo: con il backend ci si siede al tavolo e si beve il caffè davvero' }
  const st = room.status.value
  if (st === 'login') return { text: 'Accedi per sederti e bere un caffè: per ora passeggi e guardi' }
  if (st === 'connecting') return { text: 'Si entra in ufficio…' }
  if (st === 'reconnecting') return { text: 'Connessione persa: il posto resta tuo per qualche secondo…' }
  if (st !== 'online') return { text: 'Server di gioco non raggiungibile: per ora si passeggia soltanto' }
  if (mySeat.value) {
    const c = myCoffee.value
    return c ? { icon: 'coffee', text: `Seduto al tavolo · ${c.name}, ancora ${leftText(c.left)}`, stand: true } : { text: 'Seduto al tavolo: con un caffè si chiacchiera meglio', stand: true }
  }
  if (seatTaken.value) return { text: 'Qualcuno si è seduto prima di te: scegli un altro posto', tone: 'taken' }
  if (goingSeat.value !== null) return { text: 'Vai al tavolo…' }
  if (!freeSeats.value) return { text: 'Il tavolo è pieno: aspetta che si liberi un posto' }
  return { text: `Clicca sul pavimento per camminare, su una sedia per sederti · ${freeSeats.value} posti liberi su ${SEAT_SPOTS.length}` }
})
// Le scorciatoie sotto il cartellino: bacheca e macchinetta anche dove la scena è tagliata (telefoni).
const coffeeName = computed(() => (myCoffee.value ? coffee(myCoffee.value.id)?.name : null))
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#2f4d85" @leave="$emit('leave')">
    <svg ref="svg" class="office" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" @click="onFloor">
      <g class="camera" :class="{ zoomed }">
        <!-- La parete in fondo -->
        <rect x="-200" y="-200" width="2000" height="680" fill="#dfe8f5" />
        <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
          <!-- Finestra sulla città -->
          <rect x="640" y="90" width="320" height="250" rx="10" fill="#8ecdf0" />
          <path d="M 640 280 Q 720 250 800 280 T 960 272 L 960 340 L 640 340 Z" fill="#74c264" stroke-width="5" />
          <path d="M 690 280 L 690 236 L 716 236 L 716 280 M 860 276 L 860 220 L 896 220 L 896 276" fill="#fff8e6" stroke-width="4" />
          <path d="M 800 90 L 800 340 M 640 215 L 960 215" fill="none" stroke-width="10" />
          <!-- Orologio -->
          <circle cx="1140" cy="160" r="52" fill="#fff8e6" />
          <path d="M 1140 160 L 1140 124" fill="none" class="hand" />
          <path d="M 1140 160 L 1166 160" fill="none" />
          <!-- Lo zoccolino -->
          <path d="M -200 470 L 1800 470" fill="none" />
          <rect x="-200" y="452" width="2000" height="18" fill="#c9d3e6" stroke="none" />
          <!-- Le lampade sopra al tavolo -->
          <g v-for="x in [680, 920]" :key="`lamp${x}`">
            <path :d="`M ${x} -10 L ${x} 380`" fill="none" stroke-width="4" />
            <path :d="`M ${x - 44} 420 Q ${x - 40} 380 ${x} 380 Q ${x + 40} 380 ${x + 44} 420 Z`" fill="#ffd54a" />
            <ellipse :cx="x" cy="422" rx="20" ry="6" fill="#fff8e6" class="bulb" />
          </g>
        </g>

        <!-- La bacheca delle missioni, in fondo a sinistra -->
        <WallBoard :missions="office.board.value?.open ?? null" :ready="office.ready.value" @open="zoomed = true" />

        <!-- Il pavimento, col tappeto sotto al tavolo -->
        <path d="M -200 470 L 1800 470 L 1800 1100 L -200 1100 Z" fill="#b0bfd6" stroke="#2d2a4a" stroke-width="5" />
        <g stroke="#a3b2cb" stroke-width="4">
          <path v-for="i in 9" :key="`fl${i}`" :d="`M ${i * 180 - 120} 470 L ${i * 220 - 300} 900`" fill="none" />
        </g>
        <rect x="430" y="560" width="740" height="240" rx="40" fill="#8e9fd1" stroke="#2d2a4a" stroke-width="5" />
        <rect x="452" y="580" width="696" height="200" rx="30" fill="none" stroke="#b8c4ea" stroke-width="4" stroke-dasharray="14 10" />

        <!-- Dove si sta andando -->
        <ellipse v-if="marker" :key="marker.k" class="marker" :cx="marker.x" :cy="marker.y" rx="18" ry="7" fill="none" stroke="#fff8e6" stroke-width="4" />

        <!-- Chi è seduto, chi passeggia, il tavolo, il caffè e le piante, dal fondo verso chi guarda -->
        <template v-for="item in scene" :key="item.id">
          <TableSeat
            v-if="item.kind === 'seat'"
            :spot="item.spot"
            :sitter="sitters.get(item.spot.seat) ?? null"
            :can-sit="online"
            @sit="sit"
            @menu="(e) => online && trade.openMenu(e, sitters.get(item.spot.seat))"
          />
          <g v-else-if="item.kind === 'onTable'">
            <TableSeat v-for="s in SEAT_SPOTS" :key="`top-${s.seat}`" layer="table" :spot="s" :sitter="sitters.get(s.seat) ?? null" />
          </g>
          <g v-else-if="item.kind === 'walker'" @contextmenu="online && !item.me && trade.openMenu($event, { ...item, id: item.sessionId })">
            <g :transform="`translate(${item.x} ${item.y}) scale(${SCALE})`">
              <Avatar :look="item.look" :dir="item.dir" :walking="item.walking" />
            </g>
            <text class="name" :class="{ me: item.me }" :x="item.x" :y="item.y + 17" text-anchor="middle">{{ item.name }}</text>
          </g>
          <g v-else-if="item.kind === 'table'" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
            <ellipse cx="800" cy="752" rx="320" ry="18" fill="#2d2a4a" opacity="0.15" stroke="none" />
            <rect x="518" y="684" width="22" height="66" fill="#8a5432" />
            <rect x="1060" y="684" width="22" height="66" fill="#8a5432" />
            <path d="M 524 588 L 1076 588 L 1100 666 L 500 666 Z" fill="#c98a4b" />
            <path d="M 560 606 L 1040 606 M 548 628 L 1052 628 M 536 648 L 1064 648" fill="none" stroke="#d9a06a" stroke-width="3" />
            <rect x="500" y="664" width="600" height="24" rx="4" fill="#a0673a" />
            <!-- In mezzo al tavolo, il portapenne -->
            <rect x="784" y="618" width="30" height="30" rx="6" fill="#4fc3f7" stroke-width="3" />
            <path d="M 792 618 L 788 600 M 800 618 L 802 596 M 808 618 L 814 602" fill="none" stroke-width="3" />
          </g>
          <CoffeeMachine v-else-if="item.kind === 'coffee'" :brewing="brewing" @open="openCoffee" />
          <g v-else-if="item.kind === 'plant'" :transform="`translate(${item.x} ${item.y})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
            <ellipse cx="0" cy="2" rx="40" ry="9" fill="#2d2a4a" stroke="none" opacity="0.18" />
            <circle cx="-22" cy="-112" r="34" fill="#4fae55" />
            <circle cx="20" cy="-128" r="30" fill="#5cc062" />
            <circle cx="0" cy="-90" r="30" fill="#4fae55" />
            <path d="M -32 0 L -38 -64 L 38 -64 L 32 0 Z" fill="#c07d45" />
          </g>
        </template>

        <!-- Fumetti, sopra a tutto: i puntini mentre si scrive, poi il messaggio -->
        <g v-for="b in bubbles" :key="b.id" :transform="`translate(${b.x} ${b.y})`">
          <SpeechBubble :text="b.say" :typing="b.typing" />
        </g>
      </g>
    </svg>

    <div v-if="!zoomed" class="top">
      <div class="status" :class="status.tone" role="status">
        <span><Icon v-if="status.icon" :name="status.icon" /> {{ status.text }}</span>
        <button v-if="status.stand" class="stand" @click="room.stand()">Alzati</button>
      </div>
      <div class="quick">
        <button @click="zoomed = true"><Icon name="pin" /> Bacheca<span v-if="office.ready.value" class="dot" title="Missione pronta da consegnare"><Icon name="check" /></span></button>
        <button @click="openCoffee"><Icon name="coffee" /> {{ coffeeName ?? 'Caffè' }}</button>
      </div>
    </div>

    <!-- Da vicino la stanza si scurisce: resta la bacheca. Un clic fuori ci si allontana. -->
    <Transition name="dim">
      <div v-if="zoomed" class="dim" @click="zoomed = false" />
    </Transition>
    <Transition name="board">
      <MissionBoard v-if="zoomed" @close="zoomed = false" />
    </Transition>

    <ChatWindow
      v-if="room"
      title="Chat dell'ufficio"
      :status="room.status.value"
      :messages="room.chat.messages.value"
      @send="room.chat.send"
      @typing="room.chat.setTyping"
    />
    <CoffeeMenu v-if="menuOpen" @close="menuOpen = false" @brewed="brewed" />
  </InteriorLayout>
</template>

<style scoped>
.office {
  cursor: pointer;
  user-select: none;
}
/* La camera: da vicino la scena si ingrandisce attorno alla bacheca (x 112-548, y 92-382). */
.camera {
  transition: transform 0.7s cubic-bezier(0.3, 0.7, 0.2, 1);
}
.camera.zoomed {
  transform: translate(41px, -113px) scale(2.3);
}
@media (prefers-reduced-motion: reduce) {
  .camera {
    transition: none;
  }
}
.hand {
  transform-origin: 1140px 160px;
  animation: tick 60s steps(60) infinite;
}
@keyframes tick {
  to { transform: rotate(360deg); }
}
.bulb {
  animation: glow 3s ease-in-out infinite;
}
@keyframes glow {
  50% { fill: #ffe9b0; }
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
}
.status.taken {
  background: #c9d3e6;
}
button {
  font: inherit;
  cursor: pointer;
}
.stand {
  flex: none;
  padding: 4px 12px 6px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ff9a4a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
}
.stand:active,
.quick button:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.quick {
  display: flex;
  gap: 8px;
}
.quick button {
  position: relative;
  padding: 3px 12px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff8e6;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
}
.dot {
  position: absolute;
  top: -9px;
  right: -9px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
  background: #9ccc65;
  font: 800 12px system-ui, sans-serif;
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
.board-enter-active {
  transition: opacity 0.35s ease 0.35s, translate 0.35s ease 0.35s;
}
.board-leave-active {
  transition: opacity 0.2s ease;
}
.board-enter-from {
  opacity: 0;
  translate: -50% 12px;
}
.board-leave-to {
  opacity: 0;
}
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  .top {
    top: 176px;
  }
  .status {
    white-space: normal;
  }
}
</style>
