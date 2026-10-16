<script setup>
import { computed } from 'vue'
import { isBigFind, mineral } from '@dev-city/shared/catalog'
import Avatar from '../Avatar.vue'
import MineralIcon from './MineralIcon.vue'
import { pickaxeLook } from './tools.js'
import { flecksFor, GLOW, SCALE } from './mine.js'

// Un filone della miniera, da mettere dentro l'<svg> della galleria, in due strati: layer 'wall'
// è la roccia alla base della parete (da libero col cartellino che invita a scavare), da
// disegnare dietro a tutti; layer 'front' è chi ci scava, col piccone, il mucchietto di pietre e
// quello che trova, da disegnare in ordine di profondità coi personaggi che passano.
// Chi scava sta in spot.x, spot.y e il filone in spot.vein (coordinate della scena).
// Le animazioni ripartono a ogni pietra (stones) e a ogni scoperta (finds): sono le key.
const props = defineProps({
  spot: { type: Object, required: true },
  layer: { type: String, default: 'front' },
  // null se il filone è libero, altrimenti { name, phase, stones, finds, found, tool, me, look }.
  // tool: il piccone del crafting in mano (id del catalogo), '' o assente quello di sempre.
  miner: { type: Object, default: null },
  // Il filone libero si può prendere (da loggati, col server raggiungibile).
  canDig: { type: Boolean, default: false },
})
// menu: tasto destro su chi scava (l'evento del browser), per il menu degli scambi.
const emit = defineEmits(['dig', 'menu'])

const pick = computed(() => pickaxeLook(props.miner?.tool))
const flecks = computed(() => flecksFor(props.spot.spot))
const phase = computed(() => props.miner?.phase ?? null)
const found = computed(() => (phase.value === 'found' ? mineral(props.miner.found) ?? null : null))
const big = computed(() => found.value !== null && isBigFind(found.value.id))
// Il mucchietto ai piedi: una pietra in più per ogni pietra staccata, fino a sei.
const PILE = [[0, 0], [12, 2], [6, -8], [-10, 3], [18, -6], [-2, -15]]
const pile = computed(() => PILE.slice(0, Math.min(props.miner?.stones ?? 0, PILE.length)))
// Dove il piccone colpisce la roccia e dove sta il mucchietto delle pietre staccate (scena).
const hit = computed(() => ({ x: props.spot.x + 80, y: props.spot.y - 50 }))
const heap = computed(() => ({ x: props.spot.x + 40, y: props.spot.y + 4 }))
const land = computed(() => ({ '--dx': `${heap.value.x - hit.value.x}px`, '--dy': `${heap.value.y - hit.value.y}px` }))

// Su un filone occupato (o senza poterci scavare) il clic passa al pavimento: si cammina fin lì.
function dig(e) {
  if (props.miner || !props.canDig) return
  e?.stopPropagation()
  emit('dig', props.spot.spot)
}
</script>

<template>
  <!-- La roccia del filone, con le pagliuzze colorate e, da libero, il cartellino col piccone -->
  <g v-if="layer === 'wall'" class="vein" :class="{ free: !miner, clickable: !miner && canDig, digging: phase === 'digging' }">
    <g
      :role="!miner && canDig ? 'button' : null"
      :tabindex="!miner && canDig ? 0 : null"
      :aria-label="!miner && canDig ? `Scava al filone ${spot.spot + 1}` : null"
      class="target"
      @click="dig"
      @keydown.enter.prevent="dig"
      @keydown.space.prevent="dig"
    >
      <rect :x="spot.x - 40" :y="spot.vein.y - 70" :width="spot.vein.x - spot.x + 90" height="160" fill="transparent" />
      <g :transform="`translate(${spot.vein.x + 12} ${spot.vein.y + 6}) scale(1.12 1.2)`" stroke="#2d2a4a" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">
        <path d="M -44 30 L -40 -6 L -24 -34 L 2 -46 L 28 -36 L 42 -8 L 46 30 Z" fill="#7d634c" />
        <path d="M -24 -34 L -10 -10 L 2 -46 M -10 -10 L -18 18 M 28 -36 L 16 -6 L 42 -8 M 16 -6 L 22 22" fill="none" stroke="#5e4835" stroke-width="3" />
        <g stroke-width="3">
          <path d="M -30 -2 l 8 -10 l 6 8 l -8 8 Z" :fill="flecks[0]" />
          <path d="M 8 -30 l 10 -4 l 4 10 l -10 4 Z" :fill="flecks[1]" />
          <path d="M 4 8 l 10 -6 l 6 10 l -10 6 Z" :fill="flecks[2]" />
          <path d="M 28 10 l 6 -6 l 5 6 l -6 6 Z" :fill="flecks[0]" />
        </g>
      </g>
      <!-- La polvere dove picchia il piccone -->
      <g v-if="phase === 'digging'" :transform="`translate(${hit.x} ${hit.y})`" class="dust" fill="#e6dcc8" stroke="#2d2a4a" stroke-width="2.5">
        <circle v-for="i in 5" :key="i" r="5" :style="{ '--a': `${-150 + i * 40}deg` }" />
      </g>
      <!-- Filone libero: un cartellino col piccone che invita a scavare -->
      <g v-if="!miner" class="free-tag" :transform="`translate(${spot.vein.x + 12} ${spot.vein.y - 80})`" stroke="#2d2a4a" stroke-linecap="round" fill="none">
        <circle r="17" fill="#fff8e6" stroke-width="4" />
        <path d="M -7 9 L 7 -9" stroke="#a0673a" stroke-width="4" />
        <path d="M -3 -12 Q 7 -14 12 -3" stroke-width="3.5" />
      </g>
    </g>
  </g>

  <!-- Chi scava -->
  <g v-else-if="miner" class="miner" :class="phase">
    <!-- Il mucchietto delle pietre staccate -->
    <g :transform="`translate(${heap.x} ${heap.y})`" stroke="#2d2a4a" stroke-width="3" stroke-linejoin="round">
      <path v-for="([x, y], i) in pile" :key="i" :transform="`translate(${x} ${y})`" d="M -7 3 L -6 -4 L 0 -7 L 6 -4 L 7 3 Z" fill="#a7a3b8" />
    </g>

    <g :transform="`translate(${spot.x} ${spot.y}) scale(${SCALE})`" @contextmenu="emit('menu', $event)">
      <Avatar :look="miner.look" :dir="1" />
      <!-- Il piccone, in mano: su e giù contro la roccia finché si scava -->
      <g transform="translate(30 -44)">
        <g class="pick" stroke="#2d2a4a" stroke-linecap="round" stroke-linejoin="round">
          <path d="M 0 8 L 0 -72" stroke-width="11" fill="none" />
          <path d="M 0 8 L 0 -72" :stroke="pick.handle" stroke-width="6" fill="none" />
          <path d="M -36 -58 Q 0 -92 36 -58 Q 0 -76 -36 -58 Z" :fill="pick.head" stroke-width="4" />
          <circle v-if="pick.gem" cx="0" cy="-72" r="5" :fill="pick.gem" stroke-width="2.5" />
          <circle cx="1" cy="10" r="6" fill="#4b4870" stroke-width="3" />
        </g>
      </g>
    </g>

    <!-- La pietra appena staccata: salta dalla roccia sul mucchietto -->
    <g v-if="miner.stones" :key="`stone-${miner.stones}`" :transform="`translate(${hit.x} ${hit.y})`">
      <g class="hop-x" :style="land">
        <g class="hop-y" :style="land">
          <path d="M -9 4 L -8 -5 L 0 -9 L 8 -5 L 9 4 L 0 8 Z" fill="#a7a3b8" stroke="#2d2a4a" stroke-width="3" stroke-linejoin="round" />
        </g>
      </g>
    </g>

    <!-- La scoperta: esce dalla roccia e resta su, a brillare -->
    <g v-if="found" :key="`find-${miner.finds}`" :transform="`translate(${spot.vein.x + 12} ${spot.vein.y - 10})`" class="found">
      <g class="rise">
        <g v-if="big" class="glory">
          <path v-for="i in 12" :key="i" :transform="`rotate(${i * 30})`" d="M 0 0 L -12 -110 L 12 -110 Z" :fill="GLOW[found.id]" opacity="0.5" />
        </g>
        <circle class="halo" :r="big ? 52 : 40" :fill="GLOW[found.id]" />
        <g :transform="`scale(${big ? 1.35 : 1.05})`"><MineralIcon :id="found.id" /></g>
        <g class="sparkles" fill="#fff8e6" stroke="#2d2a4a" stroke-width="2">
          <path v-for="i in 4" :key="i" :style="{ '--a': `${i * 90 + 45}deg`, animationDelay: `${i * 0.18}s` }" d="M 0 -7 L 2 -2 L 7 0 L 2 2 L 0 7 L -2 2 L -7 0 L -2 -2 Z" />
        </g>
      </g>
      <g class="label">
        <text v-if="big" class="wow" y="-158" text-anchor="middle">{{ found.id === 'diamond' ? 'LEGGENDARIO!' : 'CHE COLPO!' }}</text>
        <text class="what" y="-126" text-anchor="middle">{{ found.name }}</text>
        <text class="worth" y="-102" text-anchor="middle">+{{ found.price }} 🪙</text>
      </g>
    </g>

    <!-- Il nome e quanto si è scavato, alla misura della scena -->
    <text class="name" :class="{ me: miner.me }" :x="spot.x" :y="spot.y + 17" text-anchor="middle">{{ miner.name }}</text>
    <text class="count" :x="spot.x" :y="spot.y + 33" text-anchor="middle">🪨 {{ miner.stones }} · 💎 {{ miner.finds }}</text>
  </g>
</template>

<style scoped>
.target {
  outline: none;
}
.clickable .target {
  cursor: pointer;
}
.clickable .target:hover,
.clickable .target:focus-visible {
  filter: drop-shadow(0 0 12px rgba(255, 245, 160, 0.95));
}
.free-tag {
  animation: tag 1.8s ease-in-out infinite;
}
.free:not(.clickable) .free-tag {
  opacity: 0.6;
}
@keyframes tag {
  50% { translate: 0 -6px; }
}
.digging > .target > g:nth-of-type(1) {
  animation: shudder 1.3s infinite;
}
@keyframes shudder {
  0%, 66%, 80%, 100% { translate: 0 0; }
  70% { translate: 2px -1px; }
  74% { translate: -2px 1px; }
}
/* Il piccone: carica, colpisce verso destra e torna su. 1,3 secondi a colpo. */
.pick {
  transform-origin: 0 0;
  rotate: -10deg;
}
.digging .pick {
  animation: swing 1.3s infinite;
}
@keyframes swing {
  0% { rotate: -10deg; animation-timing-function: ease-in-out; }
  50% { rotate: -28deg; animation-timing-function: cubic-bezier(0.6, 0, 1, 0.6); }
  68% { rotate: 75deg; animation-timing-function: ease-out; }
  76% { rotate: 66deg; animation-timing-function: ease-in-out; }
  100% { rotate: -10deg; }
}
.found .pick {
  rotate: -25deg;
}
.dust circle {
  opacity: 0;
  animation: dust 1.3s infinite;
}
@keyframes dust {
  0%, 67% { transform: rotate(var(--a)) translateY(0) scale(1.3); opacity: 0; }
  69% { transform: rotate(var(--a)) translateY(-4px) scale(1.3); opacity: 1; }
  95%, 100% { transform: rotate(var(--a)) translateY(-26px) scale(0.3); opacity: 0; }
}
/* La pietra staccata: in orizzontale a velocità costante, in verticale una parabola */
.hop-x {
  animation: hop-x 0.7s linear forwards;
}
.hop-y {
  animation: hop-y 0.7s forwards;
}
@keyframes hop-x {
  to { transform: translateX(var(--dx)); }
}
@keyframes hop-y {
  0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  45% { transform: translateY(-40px) rotate(120deg); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); }
  85% { transform: translateY(var(--dy)) rotate(260deg); opacity: 1; }
  100% { transform: translateY(var(--dy)) rotate(260deg); opacity: 0; }
}
.found {
  pointer-events: none;
}
.rise {
  animation: rise 0.9s cubic-bezier(0.3, 1.5, 0.5, 1) forwards, float 1.4s 0.9s ease-in-out infinite alternate;
}
@keyframes rise {
  from { transform: translateY(20px) scale(0.2); opacity: 0; }
  to { transform: translateY(-50px) scale(1); opacity: 1; }
}
@keyframes float {
  from { transform: translateY(-50px); }
  to { transform: translateY(-58px); }
}
.halo {
  opacity: 0.45;
  stroke: none;
  animation: halo 1s ease-in-out infinite alternate;
}
@keyframes halo {
  to { opacity: 0.2; transform: scale(1.2); }
}
.glory {
  animation: glory 6s linear infinite;
}
@keyframes glory {
  to { transform: rotate(360deg); }
}
.sparkles path {
  opacity: 0;
  animation: sparkle 1.2s ease-out infinite;
}
@keyframes sparkle {
  0% { transform: rotate(var(--a)) translateY(-20px) scale(0.3); opacity: 0; }
  30% { opacity: 1; }
  100% { transform: rotate(var(--a)) translateY(-48px) scale(1); opacity: 0; }
}
.label text {
  stroke: #2d2a4a;
  stroke-width: 5px;
  stroke-linejoin: round;
  paint-order: stroke;
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: pop 0.5s 0.7s cubic-bezier(0.3, 1.8, 0.5, 1) forwards;
}
.label .what {
  fill: #fff8e6;
  font-size: 20px;
}
.label .worth {
  fill: #ffd54a;
  font-size: 20px;
}
.label .wow {
  fill: #ff7a59;
  font-size: 30px;
  animation:
    pop 0.5s 0.7s cubic-bezier(0.3, 1.8, 0.5, 1) forwards,
    wow 0.5s 1.2s ease-in-out infinite alternate;
}
@keyframes pop {
  from { opacity: 0; transform: translateY(12px) scale(0.3); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wow {
  from { transform: scale(1) rotate(-3deg); fill: #ff7a59; }
  to { transform: scale(1.12) rotate(3deg); fill: #ffd54a; }
}
.name,
.count {
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
.count {
  font-size: 12px;
  stroke-width: 4px;
}
@media (prefers-reduced-motion: reduce) {
  .vein *,
  .miner *,
  .miner :deep(*) {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
