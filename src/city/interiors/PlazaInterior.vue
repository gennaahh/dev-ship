<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { authClient, displayName } from '../../auth.js'
import ChatWindow from '../../components/ChatWindow.vue'
import { usePlazaRoom } from '../../composables/usePlazaRoom.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { colorFor, DEFAULT_LOOK } from '../avatar.js'
import ShopCatalog from '../ShopCatalog.vue'
import SpeechBubble from '../SpeechBubble.vue'
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Allo shop si compreranno colori e cappelli per il proprio personaggio.',
  'Le monete si guadagneranno in città: gemme, bug chiusi e pesci.',
]

// La piazza vista come le stanze di Club Penguin: camera alta e frontale, pavimento che sale
// verso il fondo, personaggi della stessa misura ovunque. Si cammina cliccando dove andare.
// Dove si può camminare, nelle coordinate della scena (1600 × 900).
const WALK = { minX: 40, maxX: 1560, minY: 500, maxY: 860 }
// I passanti restano lontani dal cartello del luogo, in basso a destra.
const STROLL = { minX: 120, maxX: 1150, minY: 520, maxY: 800 }
const SPEED = 280 // unità al secondo
// Davanti al banco dello shop.
const SHOP_SPOT = { x: 330, y: 515 }
const SHOPKEEPER = { x: 330, y: 412 }

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const myName = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : 'Tu'
})
const myLook = computed(() => (session.value.data?.user ? { color: colorFor(myName.value), hat: null } : DEFAULT_LOOK))

// Da loggati la piazza è multigiocatore: i personaggi e la chat arrivano dalla stanza della
// piazza. Senza backend, prima del login o col server spento si passeggia da soli tra i passanti.
const plaza = BACKEND_ENABLED ? usePlazaRoom() : null
const online = computed(() => plaza?.status.value === 'online')

// Si arriva dal vialetto in basso, come entrando in piazza dalla città.
const me = reactive({ id: 'me', kind: 'actor', x: 800, y: 920, tx: 800, ty: 790, dir: 1, walking: false, arrive: null })

// Passanti dimostrativi (l'equipaggio della classifica), per quando si è da soli.
const PHRASES = [
  'Chi ha rotto la build?',
  'Merge fatto!',
  'Deploy di venerdì? No.',
  'Sulla mia macchina va',
  'Caffè?',
  'Rebase in corso…',
  'Bel cappello!',
  'Oggi 3 bug chiusi',
]
const crowd = [
  { name: 'Capitan Merge', look: { color: '#ff7a59', hat: 'pirate' }, x: 460, y: 650 },
  { name: 'Cuoca Hotfix', look: { color: '#ba68c8', hat: 'chef' }, x: 1020, y: 590 },
  { name: 'Vedetta Debug', look: { color: '#ffca28', hat: 'headphones' }, x: 640, y: 760 },
].map((n, i) =>
  reactive({ ...n, id: n.name, kind: 'actor', tx: n.x, ty: n.y, dir: i % 2 ? -1 : 1, walking: false, say: '', sayUntil: 0, wait: 1 + Math.random() * 3, arrive: null }),
)

// Oggetti che stanno sul pavimento: si disegnano in ordine di profondità insieme ai personaggi,
// così chi ci passa davanti li copre e chi ci passa dietro ne è coperto.
const PROPS = [
  { id: 'lamp-l', kind: 'lamp', x: 70, y: 590 },
  { id: 'lamp-r', kind: 'lamp', x: 1530, y: 590 },
  { id: 'bench-l', kind: 'bench', x: 130, y: 740 },
  { id: 'bench-r', kind: 'bench', x: 1470, y: 740 },
  { id: 'planter-l', kind: 'planter', x: 70, y: 890 },
  { id: 'planter-r', kind: 'planter', x: 1530, y: 890 },
]
// Chi c'è in piazza, tutti nella stessa forma: nome, aspetto, fumetto.
const actors = computed(() => {
  if (online.value) {
    return plaza.players.value.map((p) => ({
      ...p,
      kind: 'actor',
      look: p.me ? myLook.value : { color: colorFor(p.name), hat: null },
    }))
  }
  return [{ ...me, me: true, name: myName.value, look: myLook.value }, ...crowd]
})
const myself = computed(() => actors.value.find((a) => a.me))
const scene = computed(() => [...PROPS, ...actors.value].sort((a, b) => a.y - b.y))

// Pavimento in prospettiva: linee che fuggono verso un punto alto e file sempre più fitte verso il fondo.
const VP = { x: 800, y: -1100 }
const FLOOR_TOP = 390
const rays = []
for (let x0 = -1100; x0 <= 2700; x0 += 150) {
  const t = (FLOOR_TOP - VP.y) / (900 - VP.y)
  rays.push(`M ${x0} 900 L ${VP.x + (x0 - VP.x) * t} ${FLOOR_TOP}`)
}
const rows = [426, 446, 470, 500, 536, 580, 632, 694, 768, 856]
const backTrees = [
  { x: 40, y: 450, s: 1.3 },
  { x: 1580, y: 450, s: 1.3 },
  { x: 1110, y: 380, s: 0.9 },
  { x: 500, y: 380, s: 0.9 },
]

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
const pick = (list) => list[Math.floor(Math.random() * list.length)]
const randomIn = (r) => ({ x: r.minX + Math.random() * (r.maxX - r.minX), y: r.minY + Math.random() * (r.maxY - r.minY) })

function move(a, dt) {
  const dx = a.tx - a.x
  const dy = a.ty - a.y
  const d = Math.hypot(dx, dy)
  const s = SPEED * dt
  if (d <= s) {
    a.x = a.tx
    a.y = a.ty
    a.walking = false
    const arrive = a.arrive
    a.arrive = null
    arrive?.()
    return
  }
  a.x += (dx / d) * s
  a.y += (dy / d) * s
  a.walking = true
  if (Math.abs(dx) > 2) a.dir = dx > 0 ? 1 : -1
}

// I passanti: una pausa, a volte una battuta, poi un'altra passeggiata.
function stroll(n, dt, now) {
  if (n.sayUntil && now > n.sayUntil) {
    n.say = ''
    n.sayUntil = 0
  }
  if (n.walking || (n.wait -= dt) > 0) return
  const p = randomIn(STROLL)
  n.tx = p.x
  n.ty = p.y
  n.arrive = () => {
    n.wait = 2 + Math.random() * 5
    if (Math.random() < 0.45) {
      n.say = pick(PHRASES)
      n.sayUntil = performance.now() + 3500
    }
  }
}

let raf = 0
let last = 0
function frame(now) {
  // Il primo frame può avere un orario precedente a quello del mount.
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000))
  last = now
  // In piazza con gli altri i personaggi li muove il server (usePlazaRoom).
  if (!online.value) {
    move(me, dt)
    for (const n of crowd) {
      stroll(n, dt, now)
      move(n, dt)
    }
  }
  raf = requestAnimationFrame(frame)
}
onMounted(() => {
  last = performance.now()
  raf = requestAnimationFrame(frame)
})
onUnmounted(() => cancelAnimationFrame(raf))

const svg = ref(null)
const marker = ref(null)
const moved = ref(false)

function walkTo(x, y, arrive = null) {
  let target
  if (online.value) {
    target = plaza.moveTo(x, y, arrive)
  } else {
    me.tx = clamp(x, WALK.minX, WALK.maxX)
    me.ty = clamp(y, WALK.minY, WALK.maxY)
    me.arrive = arrive
    target = { x: me.tx, y: me.ty }
  }
  marker.value = { ...target, k: (marker.value?.k ?? 0) + 1 }
  moved.value = true
}
function onFloor(e) {
  const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.value.getScreenCTM().inverse())
  walkTo(p.x, p.y)
}

const shopOpen = ref(false)
const goShop = () => walkTo(SHOP_SPOT.x, SHOP_SPOT.y, () => (shopOpen.value = true))
const nearShop = computed(
  () => !shopOpen.value && myself.value && Math.hypot(myself.value.x - SHOP_SPOT.x, myself.value.y - SHOP_SPOT.y) < 220,
)
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#3d5fa0" @leave="$emit('leave')">
    <svg ref="svg" class="plaza" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" @click="onFloor">
      <defs>
        <linearGradient id="plaza-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4fb3ea" />
          <stop offset="1" stop-color="#d4f3ff" />
        </linearGradient>
        <clipPath id="plaza-floor">
          <path d="M -200 420 Q 800 360 1800 420 L 1800 1000 L -200 1000 Z" />
        </clipPath>
        <g id="plaza-lamp" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="0" cy="0" rx="26" ry="8" fill="#2d2a4a" stroke="none" opacity="0.15" />
          <rect x="-8" y="-180" width="16" height="180" fill="#4b4870" />
          <rect x="-20" y="-14" width="40" height="18" rx="6" fill="#4b4870" />
          <path d="M -24 -180 L 24 -180 L 16 -226 L -16 -226 Z" fill="#fff3a8" />
          <path d="M -30 -226 L 30 -226 L 0 -250 Z" fill="#4b4870" />
        </g>
        <g id="plaza-bench" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <ellipse cx="0" cy="0" rx="100" ry="10" fill="#2d2a4a" stroke="none" opacity="0.15" />
          <rect x="-86" y="-104" width="14" height="104" rx="4" fill="#4b4870" />
          <rect x="72" y="-104" width="14" height="104" rx="4" fill="#4b4870" />
          <rect x="-96" y="-100" width="192" height="16" rx="5" fill="#c98a4b" />
          <rect x="-96" y="-78" width="192" height="16" rx="5" fill="#c98a4b" />
          <rect x="-100" y="-50" width="200" height="18" rx="5" fill="#e0a965" />
        </g>
        <g id="plaza-planter" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
          <circle cx="-22" cy="-74" r="26" fill="#4fae55" />
          <circle cx="22" cy="-74" r="26" fill="#4fae55" />
          <circle cx="0" cy="-92" r="28" fill="#5fbf5a" />
          <circle cx="-20" cy="-86" r="6" fill="#ff7aa8" stroke-width="3" />
          <circle cx="14" cy="-104" r="6" fill="#ffd54a" stroke-width="3" />
          <circle cx="26" cy="-76" r="6" fill="#ff7a59" stroke-width="3" />
          <path d="M -50 -60 L 50 -60 L 40 0 L -40 0 Z" fill="#c07d45" />
          <path d="M -46 -46 L 46 -46" fill="none" stroke="#9c6332" stroke-width="4" />
        </g>
      </defs>

      <!-- Cielo, nuvole e colline -->
      <rect x="-200" y="-200" width="2000" height="700" fill="url(#plaza-sky)" />
      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
        <g v-for="(c, i) in [[180, 90, 1], [1420, 60, 0.8]]" :key="i" class="cloud" :style="{ animationDelay: `${-i * 20}s` }">
          <path
            :transform="`translate(${c[0]} ${c[1]}) scale(${c[2]})`"
            d="M -70 30 q -40 0 -36 -30 q 6 -30 44 -22 q 10 -40 56 -34 q 40 6 42 40 q 40 -6 44 26 q 2 22 -30 22 z"
            fill="#fff"
          />
        </g>
        <path d="M -200 330 Q 100 250 420 310 T 1000 300 T 1500 290 T 1800 320 L 1800 520 L -200 520 Z" fill="#74c264" />
        <!-- Alberi in fondo -->
        <g v-for="(t, i) in backTrees" :key="i" :transform="`translate(${t.x} ${t.y}) scale(${t.s})`">
          <path d="M -9 0 L -7 -60 L 7 -60 L 9 0 Z" fill="#a0673a" />
          <circle cx="0" cy="-92" r="44" fill="#4fae55" />
          <circle cx="-16" cy="-106" r="13" fill="#76cf6a" stroke="none" />
        </g>
      </g>

      <!-- Pavimento della piazza -->
      <path d="M -200 420 Q 800 360 1800 420 L 1800 1000 L -200 1000 Z" fill="#f0dcb0" stroke="#2d2a4a" stroke-width="5" />
      <g clip-path="url(#plaza-floor)" fill="none" stroke="#dcc493" stroke-width="3">
        <path v-for="(d, i) in rays" :key="`r${i}`" :d="d" />
        <path v-for="y in rows" :key="`f${y}`" :d="`M -200 ${y} L 1800 ${y}`" />
      </g>
      <path d="M -200 434 Q 800 374 1800 434" fill="none" stroke="#d9bf8c" stroke-width="8" />
      <!-- Rosa dei venti al centro -->
      <g stroke-linejoin="round">
        <ellipse cx="800" cy="680" rx="300" ry="86" fill="#e8d09f" stroke="#d2b47c" stroke-width="5" />
        <ellipse cx="800" cy="680" rx="262" ry="72" fill="none" stroke="#f6e8c8" stroke-width="4" stroke-dasharray="20 12" />
        <path d="M 800 616 L 826 680 L 800 744 L 774 680 Z" fill="#d2b47c" />
        <path d="M 620 680 L 800 664 L 980 680 L 800 696 Z" fill="#d9bf8c" />
        <circle cx="800" cy="680" r="10" fill="#ff7a59" stroke="#2d2a4a" stroke-width="4" />
      </g>

      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
        <!-- Il cartellone, visto da sotto -->
        <g>
          <path d="M 630 320 L 970 440 M 970 320 L 630 440" stroke-width="12" />
          <path d="M 630 320 L 970 440 M 970 320 L 630 440" stroke="#7d7aa6" stroke-width="5" />
          <rect x="600" y="300" width="34" height="140" fill="#57537f" />
          <rect x="966" y="300" width="34" height="140" fill="#57537f" />
          <rect x="584" y="432" width="66" height="18" rx="4" fill="#b9b2a4" />
          <rect x="950" y="432" width="66" height="18" rx="4" fill="#b9b2a4" />
          <rect x="470" y="30" width="660" height="290" rx="18" fill="#4b4870" stroke-width="6" />
          <circle v-for="i in 12" :key="i" :cx="470 + i * 52 - 12" cy="18" r="9" fill="#fff3a8" class="bulb" :style="{ animationDelay: `${(i % 3) * -0.4}s` }" />
          <rect x="494" y="54" width="612" height="242" rx="8" fill="#8fd3ff" />
          <path d="M 494 200 L 1106 200 L 1106 288 Q 1106 296 1098 296 L 502 296 Q 494 296 494 288 Z" fill="#2f8fd8" stroke="none" />
          <path d="M 520 230 q 20 -10 40 0 q 20 10 40 0 M 760 260 q 20 -10 40 0 q 20 10 40 0 M 960 226 q 20 -10 40 0 q 20 10 40 0" fill="none" stroke="#fff" stroke-width="4" opacity="0.7" />
          <circle cx="1040" cy="100" r="26" fill="#ffd54a" stroke-width="4" />
          <g class="ship">
            <path d="M 740 200 L 860 200 L 840 232 L 760 232 Z" fill="#c07d45" stroke-width="4" />
            <path d="M 800 196 L 800 112 L 852 188 Z" fill="#fff8e6" stroke-width="4" />
            <path d="M 796 190 L 796 128 L 756 190 Z" fill="#ff7a59" stroke-width="4" />
          </g>
          <rect x="494" y="54" width="612" height="242" rx="8" fill="none" stroke-width="5" />
          <rect x="716" y="306" width="168" height="36" rx="10" fill="#ffd54a" />
          <text x="800" y="333" text-anchor="middle" class="plate" fill="#2d2a4a" stroke="none">DEV-SHIP</text>
        </g>

        <!-- Cespugli ai piedi del cartellone -->
        <g v-for="x in [540, 1060]" :key="x">
          <ellipse :cx="x" cy="430" rx="52" ry="30" fill="#4fae55" />
          <circle :cx="x - 18" cy="420" r="6" fill="#ff7aa8" stroke-width="3" />
          <circle :cx="x + 20" cy="428" r="6" fill="#ffd54a" stroke-width="3" />
        </g>

        <!-- Fontana -->
        <g>
          <ellipse cx="1290" cy="474" rx="168" ry="18" fill="#2d2a4a" stroke="none" opacity="0.15" />
          <path d="M 1130 430 L 1130 464 A 160 36 0 0 0 1450 464 L 1450 430" fill="#cfc6e0" />
          <ellipse cx="1290" cy="430" rx="160" ry="36" fill="#e6e0f2" />
          <ellipse cx="1290" cy="432" rx="138" ry="26" fill="#6ccff6" stroke-width="4" />
          <path class="ripple" d="M 1200 436 q 14 -6 28 0 M 1330 428 q 14 -6 28 0 M 1270 446 q 12 -5 24 0" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" />
          <rect x="1278" y="350" width="24" height="84" fill="#e6e0f2" />
          <path d="M 1226 346 Q 1290 384 1354 346 Z" fill="#e6e0f2" />
          <ellipse cx="1290" cy="346" rx="64" ry="10" fill="#6ccff6" stroke-width="4" />
          <g class="jet" fill="none" stroke="#bfefff" stroke-width="7">
            <path d="M 1290 340 Q 1290 290 1290 284 M 1290 290 Q 1256 282 1240 340 M 1290 290 Q 1324 282 1340 340" />
          </g>
        </g>

        <!-- Shop -->
        <g
          class="shop"
          role="button"
          tabindex="0"
          aria-label="Vai allo shop"
          @click.stop="goShop"
          @keydown.enter.prevent="goShop"
          @keydown.space.prevent="goShop"
        >
          <rect x="120" y="120" width="420" height="360" fill="transparent" stroke="none" />
          <ellipse cx="330" cy="474" rx="210" ry="14" fill="#2d2a4a" stroke="none" opacity="0.15" />
          <rect x="160" y="262" width="340" height="130" fill="#fff3dc" />
          <path d="M 160 326 L 500 326" fill="none" stroke-width="6" />
          <!-- Merce sullo scaffale -->
          <g stroke-width="3">
            <path d="M 186 324 C 186 296 222 296 222 324 Z" fill="#ff5c6c" />
            <circle cx="204" cy="294" r="5" fill="#fff8e6" />
            <path d="M 430 324 L 426 300 L 438 310 L 446 296 L 454 310 L 466 300 L 462 324 Z" fill="#ffd54a" />
            <path d="M 244 324 C 244 300 276 300 276 324 Z M 270 316 Q 290 316 292 324 L 270 324 Z" fill="#4f7bd0" />
          </g>
          <rect x="150" y="250" width="18" height="222" fill="#c98a4b" />
          <rect x="492" y="250" width="18" height="222" fill="#c98a4b" />
          <!-- Tendone a strisce -->
          <path d="M 140 214 L 520 214 L 506 194 L 154 194 Z" fill="#e0457b" />
          <rect x="130" y="214" width="400" height="40" fill="#fff8e6" />
          <rect v-for="i in 4" :key="i" :x="130 + (i - 1) * 100" y="214" width="50" height="40" fill="#ff7aa8" stroke="none" />
          <path
            d="M 130 254 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0 a 25 18 0 0 0 50 0"
            fill="#ff7aa8"
          />
          <rect x="130" y="214" width="400" height="40" fill="none" />
          <!-- Negoziante dietro al banco -->
          <g :transform="`translate(${SHOPKEEPER.x} ${SHOPKEEPER.y})`">
            <Avatar :look="{ color: '#4db6ac', hat: 'cap' }" :dir="-1" />
          </g>
          <rect x="140" y="384" width="380" height="88" rx="6" fill="#c98a4b" />
          <rect x="128" y="372" width="404" height="20" rx="6" fill="#e0a965" />
          <path d="M 200 406 L 200 456 M 270 406 L 270 456 M 390 406 L 390 456 M 460 406 L 460 456" fill="none" stroke="#9c6332" stroke-width="4" />
          <!-- Cassa -->
          <rect x="418" y="340" width="54" height="34" rx="6" fill="#4b4870" />
          <rect x="426" y="346" width="38" height="12" rx="3" fill="#7dff8a" stroke-width="3" />
          <!-- Insegna -->
          <rect x="240" y="122" width="180" height="62" rx="14" fill="#fff8e6" />
          <text x="330" y="168" text-anchor="middle" class="sign" fill="#e0457b" stroke="none">SHOP</text>
          <path d="M 270 184 L 270 196 M 390 184 L 390 196" fill="none" stroke-width="6" />
        </g>
      </g>

      <!-- Dove si sta andando -->
      <ellipse v-if="marker" :key="marker.k" class="marker" :cx="marker.x" :cy="marker.y" rx="24" ry="9" fill="none" stroke="#fff8e6" stroke-width="5" />

      <!-- Personaggi e oggetti, dal fondo verso chi guarda -->
      <template v-for="item in scene" :key="item.id">
        <g v-if="item.kind === 'actor'" :transform="`translate(${item.x} ${item.y})`">
          <Avatar :look="item.look" :dir="item.dir" :walking="item.walking" :name="item.name" :me="item.me" />
        </g>
        <use v-else :href="`#plaza-${item.kind}`" :transform="`translate(${item.x} ${item.y})`" />
      </template>

      <!-- Fumetti, sopra a tutto: i puntini mentre si scrive, poi il messaggio -->
      <g v-for="a in actors.filter((a) => a.typing || a.say)" :key="a.id" :transform="`translate(${a.x} ${a.y})`">
        <SpeechBubble :text="a.say" :typing="a.typing" :hat="Boolean(a.look.hat)" />
      </g>
      <g v-if="nearShop" :transform="`translate(${SHOPKEEPER.x} ${SHOPKEEPER.y})`">
        <SpeechBubble text="Dai un'occhiata!" hat />
      </g>
    </svg>

    <Transition name="hint">
      <div v-if="!moved" class="hint">Clicca sulla piazza per camminare · lo shop è a sinistra</div>
    </Transition>
    <ShopCatalog v-if="shopOpen" :look="myLook" @close="shopOpen = false" />
    <ChatWindow
      v-if="plaza"
      title="Chat della piazza"
      :status="plaza.status.value"
      :messages="plaza.chat.messages.value"
      @send="plaza.chat.send"
      @typing="plaza.chat.setTyping"
    />
  </InteriorLayout>
</template>

<style scoped>
.plaza {
  cursor: pointer;
  user-select: none;
}
.plate {
  font-size: 24px;
}
.sign {
  font-size: 42px;
  letter-spacing: 2px;
}
.shop {
  outline: none;
  transition: filter 0.2s ease;
}
.shop:hover,
.shop:focus-visible {
  filter: drop-shadow(0 0 14px rgba(255, 245, 160, 0.95));
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
.cloud {
  animation: drift 60s linear infinite alternate;
}
@keyframes drift {
  from { transform: translateX(-80px); }
  to { transform: translateX(80px); }
}
.bulb {
  animation: bulb 1.2s steps(1) infinite;
}
@keyframes bulb {
  50% { fill: #ffd54a; }
}
.ship {
  animation: sail 3s ease-in-out infinite alternate;
}
@keyframes sail {
  from { transform: translate(-30px, 0) rotate(-1deg); }
  to { transform: translate(30px, 3px) rotate(1deg); }
}
.jet {
  stroke-dasharray: 14 10;
  animation: flow 0.6s linear infinite;
}
@keyframes flow {
  to { stroke-dashoffset: -24; }
}
.ripple {
  animation: ripple 2.4s ease-in-out infinite alternate;
}
@keyframes ripple {
  to { transform: translateX(10px); }
}
.hint {
  position: absolute;
  top: 16px;
  left: 50%;
  translate: -50% 0;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  padding: 8px 16px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 17px;
  text-align: center;
  pointer-events: none;
}
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  .hint {
    top: 176px;
  }
}
.hint-leave-active {
  transition: opacity 0.4s ease;
}
.hint-leave-to {
  opacity: 0;
}
</style>
