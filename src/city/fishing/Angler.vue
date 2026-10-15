<script setup>
import { computed } from 'vue'
import Avatar from '../Avatar.vue'
import SpeechBubble from '../SpeechBubble.vue'
import Fish from './Fish.vue'
import { BIG_KG, formatKg, pointsFor, SCALE, speciesFor } from './lake.js'

// Una sedia attorno al lago, da mettere dentro l'<svg> della zona di pesca: vuota si può
// cliccare per andarci a sedere, occupata c'è chi pesca, con canna, lenza e galleggiante.
// La sedia sta in spot.x, spot.y e il galleggiante in spot.bobber (coordinate della scena).
// Dentro si disegna con la sedia nell'origine e alla misura dei personaggi della piazza, poi
// tutto si rimpicciolisce di SCALE: il galleggiante va riportato in queste coordinate.
// Le animazioni ripartono a ogni cambio di fase (i gruppi hanno la fase come key):
// waiting (si aspetta), bite (ha abboccato), caught (preso, il pesce salta sulla canna), escaped.
const props = defineProps({
  spot: { type: Object, required: true },
  // null se la sedia è libera, altrimenti { name, phase, weight, me, look, say, typing }.
  angler: { type: Object, default: null },
  // La sedia libera si può prendere (da loggati, col server raggiungibile).
  canSit: { type: Boolean, default: false },
})
const emit = defineEmits(['sit'])

const SEAT_H = 22 // il personaggio sta seduto un po' più in alto dei piedi della sedia

const geo = computed(() => {
  const { x, y, dir, bobber } = props.spot
  const b = { x: (bobber.x - x) / SCALE, y: (bobber.y - y) / SCALE }
  const hand = { x: dir * 30, y: -SEAT_H - 42 }
  const vx = b.x - hand.x
  const vy = b.y - hand.y
  const len = Math.hypot(vx, vy)
  const ux = vx / len
  const uy = vy / len
  // La punta sta sempre un po' avanti, verso dove si guarda: anche dalle sedie in asse col
  // lago (sopra e sotto) il pesce preso resta appeso davanti, non sulla faccia.
  const tip = { x: hand.x + ux * 110 + dir * 40, y: hand.y - 92 + uy * 40 }
  // La canna si piega verso l'alto; quando abbocca la punta è tirata verso il galleggiante.
  const bentTip = { x: tip.x + (b.x - tip.x) * 0.16, y: tip.y + (b.y - tip.y) * 0.22 }
  const ctrl = (t, k) => ({ x: (hand.x + t.x) / 2 - uy * k, y: (hand.y + t.y) / 2 - 14 })
  const c1 = ctrl(tip, 6)
  const c2 = ctrl(bentTip, 4)
  // Il pesce preso resta appeso alla punta della canna.
  const hang = { x: tip.x, y: tip.y + 60 }
  // Quello che scappa salta lontano da chi pesca.
  const away = { x: b.x + ux * 90, y: b.y + uy * 40 }
  return {
    dir,
    b,
    hand,
    tip,
    rod: `M ${hand.x} ${hand.y} Q ${c1.x} ${c1.y} ${tip.x} ${tip.y}`,
    bentRod: `M ${hand.x} ${hand.y} Q ${c2.x} ${c2.y} ${bentTip.x} ${bentTip.y}`,
    sag: `M ${tip.x} ${tip.y} Q ${(tip.x + b.x) / 2} ${(tip.y + b.y) / 2 + 46} ${b.x} ${b.y - 10}`,
    taut: `M ${bentTip.x} ${bentTip.y} L ${b.x} ${b.y - 4}`,
    snapped: `M ${tip.x} ${tip.y} q -8 14 0 24 q 8 10 -2 22`,
    hang,
    leap: { '--dx': `${hang.x - b.x}px`, '--dy': `${hang.y - b.y}px`, '--peak': `${Math.min(hang.y - b.y, 0) - 110}px` },
    flee: { '--dx': `${away.x - b.x}px`, '--dy': `${away.y - b.y}px`, '--peak': '-80px' },
    away,
    pivot: { transformOrigin: `${hand.x}px ${hand.y}px` },
  }
})

const phase = computed(() => props.angler?.phase ?? null)
const kg = computed(() => props.angler?.weight ?? 0)
const big = computed(() => phase.value === 'caught' && kg.value >= BIG_KG)
// Più è pesante, più è grande (da 0,8 a 1,9 volte).
const fishScale = computed(() => 0.8 + Math.min(kg.value, 20) * 0.055)
// La lenza arriva alla bocca del pesce appeso (girato col muso in su, lungo 46 per parte),
// e il pesce dondola da lì.
const mouth = computed(() => 46 * fishScale.value)
const hangLine = computed(() => {
  const { tip, hang } = geo.value
  return `M ${tip.x} ${tip.y} L ${hang.x} ${hang.y - mouth.value}`
})
const dangleOrigin = computed(() => ({ transformOrigin: `0px ${-mouth.value}px` }))
// Gli "z" del pisolino: ogni sedia col suo ritmo, così non dormono tutti insieme.
const zDelay = computed(() => ({ animationDelay: `${-(props.spot.seat * 1.7) % 9}s` }))

// Il fumetto "Scappato!" alla misura della scena, sopra la testa di chi è seduto.
const bubbleAt = `translate(0 ${-118 + 96 / SCALE}) scale(${1 / SCALE})`

// Su una sedia occupata (o senza poterci sedere) il clic passa al prato: si cammina fin lì.
function sit(e) {
  if (props.angler || !props.canSit) return
  e?.stopPropagation()
  emit('sit', props.spot.seat)
}
</script>

<template>
  <g class="angler" :class="{ free: !angler, clickable: !angler && canSit, big }">
   <g :transform="`translate(${spot.x} ${spot.y}) scale(${SCALE})`">
    <!-- Sedia da campeggio, girata verso il lago -->
    <g
      :role="!angler && canSit ? 'button' : null"
      :tabindex="!angler && canSit ? 0 : null"
      :aria-label="!angler && canSit ? `Siediti sulla sedia ${spot.seat + 1}` : null"
      class="chair"
      @click="sit"
      @keydown.enter.prevent="sit"
      @keydown.space.prevent="sit"
    >
      <rect x="-60" y="-120" width="120" height="140" fill="transparent" />
      <ellipse cx="0" cy="0" rx="42" ry="10" fill="#2d2a4a" opacity="0.16" />
      <g :transform="`scale(${geo.dir} 1)`" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M -30 -2 L 24 -28 M 24 -2 L -30 -28" fill="none" stroke="#7a4a2a" stroke-width="6" />
        <path d="M -42 -92 L -30 -26" fill="none" stroke="#7a4a2a" stroke-width="6" />
        <path d="M -46 -88 Q -40 -60 -36 -34 L -24 -36 Q -28 -62 -32 -90 Z" fill="#3d8fd1" />
        <path d="M -34 -34 L 30 -34 L 26 -20 L -30 -20 Z" fill="#4fb3ea" />
        <path d="M -34 -34 L 30 -34" fill="none" stroke="#fff8e6" stroke-width="3" stroke-dasharray="8 6" />
      </g>
      <!-- Sedia libera: un cartellino che invita a sedersi -->
      <g v-if="!angler" class="free-tag" stroke="#2d2a4a" stroke-linecap="round" fill="none">
        <circle cx="0" cy="-74" r="20" fill="#fff8e6" stroke-width="4" />
        <path d="M -9 -63 L 8 -86" stroke="#c98a4b" stroke-width="4" />
        <path d="M 8 -86 Q 12 -76 10 -66 a 3.5 3.5 0 1 1 -6 -2" stroke-width="2.5" />
      </g>
    </g>

    <template v-if="angler">
      <!-- Galleggiante e cerchi nell'acqua -->
      <g :transform="`translate(${geo.b.x} ${geo.b.y})`">
        <g :key="`water-${phase}`" :class="`water ${phase}`">
          <ellipse class="ring r1" cx="0" cy="2" rx="16" ry="6" fill="none" stroke="#fff" stroke-width="3" />
          <ellipse class="ring r2" cx="0" cy="2" rx="16" ry="6" fill="none" stroke="#fff" stroke-width="3" />
          <g v-if="phase === 'bite' || phase === 'caught' || phase === 'escaped'" class="splash" fill="#d8f3ff" stroke="#2d2a4a" stroke-width="2.5">
            <circle v-for="i in 7" :key="i" class="drop" r="4.5" :style="{ '--a': `${i * 51}deg` }" />
          </g>
          <g v-if="phase === 'waiting' || phase === 'bite'" class="bobber">
            <g stroke="#2d2a4a" stroke-width="3">
              <path d="M 0 -18 L 0 -10" fill="none" />
              <path d="M -9 -4 A 9 9 0 0 1 9 -4 Z" fill="#ff4a4a" />
              <path d="M -9 -4 A 9 9 0 0 0 9 -4 Z" fill="#fff8e6" />
            </g>
          </g>
        </g>
      </g>

      <!-- Chi pesca, seduto -->
      <g transform="translate(0 -22)" class="seated">
        <Avatar :look="angler.look" :dir="geo.dir" />
      </g>

      <!-- Canna e lenza -->
      <g :key="`gear-${phase}`" stroke-linecap="round" fill="none" :class="`gear ${phase}`">
        <g class="rod" :style="geo.pivot">
          <path :d="phase === 'bite' ? geo.bentRod : geo.rod" stroke="#2d2a4a" stroke-width="9" />
          <path :d="phase === 'bite' ? geo.bentRod : geo.rod" stroke="#c98a4b" stroke-width="4" />
          <circle :cx="geo.hand.x - geo.dir * 4" :cy="geo.hand.y + 6" r="6" fill="#4b4870" stroke="#2d2a4a" stroke-width="3" />
        </g>
        <path v-if="phase === 'waiting'" class="line" :d="geo.sag" stroke="#fff8e6" stroke-width="2" />
        <path v-else-if="phase === 'bite'" class="line taut" :d="geo.taut" stroke="#fff8e6" stroke-width="2.5" />
        <path v-else-if="phase === 'caught'" class="line hang-line" :d="hangLine" stroke="#fff8e6" stroke-width="2.5" />
        <path v-else-if="phase === 'escaped'" class="line snapped" :d="geo.snapped" stroke="#fff8e6" stroke-width="2.5" />
      </g>

      <!-- Il pesce: salta fuori dall'acqua e resta appeso alla canna, o scappa -->
      <g v-if="phase === 'caught'" :key="`caught-${kg}`" :transform="`translate(${geo.b.x} ${geo.b.y})`">
        <g class="leap-x" :style="geo.leap">
          <g class="leap-y" :style="geo.leap">
            <g v-if="big" class="glory">
              <path
                v-for="i in 12"
                :key="i"
                :transform="`rotate(${i * 30})`"
                d="M 0 0 L -14 -130 L 14 -130 Z"
                fill="#ffe27a"
                opacity="0.55"
              />
              <circle r="62" fill="#fff3a8" opacity="0.6" />
            </g>
            <g class="dangle" :style="dangleOrigin">
              <g :transform="`rotate(-90) scale(${fishScale})`">
                <Fish :kg="kg" />
              </g>
            </g>
          </g>
        </g>
      </g>
      <g v-if="phase === 'escaped'" :key="'escaped'" :transform="`translate(${geo.b.x} ${geo.b.y})`">
        <g class="leap-x flee" :style="geo.flee">
          <g class="leap-y flee" :style="geo.flee">
            <g class="flip" :transform="`scale(${geo.away.x > geo.b.x ? 1 : -1} 1)`">
              <Fish :kg="2" />
            </g>
          </g>
        </g>
      </g>

      <!-- Sopra la testa: z del pisolino, punto esclamativo, peso del pesce o il disappunto -->
      <g transform="translate(0 -22)" class="over">
        <g v-if="phase === 'waiting'" class="zzz" :style="zDelay">
          <text x="24" y="-112">z</text>
          <text x="38" y="-130" class="z2">z</text>
        </g>
        <g v-else-if="phase === 'bite'" class="alert">
          <path d="M -18 -150 L 18 -150 L 12 -114 L -12 -114 Z" fill="#ff4a4a" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" />
          <text x="0" y="-122" text-anchor="middle" class="bang">!</text>
        </g>
      </g>
      <g v-if="phase === 'escaped' && !angler.say && !angler.typing" :transform="bubbleAt">
        <SpeechBubble text="Scappato! 😩" />
      </g>
      <g v-if="phase === 'caught'" :key="`label-${kg}`" :transform="`translate(${geo.hang.x} ${geo.hang.y - 120})`" class="catch-label">
        <text v-if="big" class="wow" y="-76" text-anchor="middle">{{ kg >= 15 ? 'LEGGENDARIO!' : 'ENORME!' }}</text>
        <text class="kg" y="-34" text-anchor="middle">{{ formatKg(kg) }}</text>
        <text class="species" y="-4" text-anchor="middle">{{ speciesFor(kg).name }} · +{{ pointsFor(kg) }} pt</text>
      </g>
    </template>
   </g>
    <!-- Il nome resta leggibile: è alla misura della scena, non dei personaggi -->
    <text v-if="angler" class="name" :class="{ me: angler.me }" :x="spot.x" :y="spot.y + 17" text-anchor="middle">{{ angler.name }}</text>
  </g>
</template>

<style scoped>
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
.chair {
  outline: none;
}
.free .chair {
  opacity: 0.85;
}
.clickable .chair {
  cursor: pointer;
}
.clickable .chair:hover,
.clickable .chair:focus-visible {
  filter: drop-shadow(0 0 12px rgba(255, 245, 160, 0.95));
}
.free-tag {
  animation: tag 1.8s ease-in-out infinite;
}
.free:not(.clickable) .free-tag {
  opacity: 0.6;
}
@keyframes tag {
  50% { transform: translateY(-6px); }
}

/* Acqua attorno al galleggiante */
.ring {
  transform-box: fill-box;
  transform-origin: center;
  opacity: 0;
  animation: ring 3.2s ease-out infinite;
}
.r2 {
  animation-delay: 1.6s;
}
@keyframes ring {
  0% { transform: scale(0.5); opacity: 0.8; }
  100% { transform: scale(2.6); opacity: 0; }
}
.bite .ring {
  animation-duration: 0.7s;
}
.bite .r2 {
  animation-delay: 0.35s;
}
.caught .ring,
.escaped .ring {
  animation: ring-burst 1.1s ease-out forwards;
}
.caught .r2,
.escaped .r2 {
  animation-delay: 0.2s;
}
@keyframes ring-burst {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(4.5); opacity: 0; }
}
.bobber {
  animation: bob 2.2s ease-in-out infinite;
}
@keyframes bob {
  50% { transform: translateY(3px) rotate(4deg); }
}
.bite .bobber {
  animation: dive 0.42s ease-in-out infinite;
}
@keyframes dive {
  0%, 100% { transform: translateY(0); }
  45% { transform: translateY(12px) scale(0.85); opacity: 0.55; }
}
.drop {
  opacity: 0;
  animation: drop 0.8s ease-out infinite;
}
.drop:nth-child(odd) {
  animation-delay: 0.25s;
}
.caught .drop,
.escaped .drop {
  animation: drop-big 0.9s ease-out forwards;
}
@keyframes drop {
  0% { transform: rotate(var(--a)) translate(0, 0); opacity: 1; }
  100% { transform: rotate(var(--a)) translate(0, -26px) scale(0.4); opacity: 0; }
}
@keyframes drop-big {
  0% { transform: rotate(var(--a)) translate(0, 0) scale(1.4); opacity: 1; }
  100% { transform: rotate(var(--a)) translate(0, -70px) scale(0.3); opacity: 0; }
}

/* Canna: ondeggia piano mentre si aspetta, trema quando abbocca */
.rod {
  transform-box: view-box;
}
.waiting .rod {
  animation: sway 4s ease-in-out infinite;
}
@keyframes sway {
  50% { transform: rotate(-3deg); }
}
.bite .rod {
  animation: tug 0.18s ease-in-out infinite alternate;
}
@keyframes tug {
  from { transform: rotate(-2deg); }
  to { transform: rotate(3deg); }
}
.caught .rod {
  animation: yank 0.5s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes yank {
  0% { transform: rotate(8deg); }
  100% { transform: rotate(0); }
}
.line.taut {
  animation: thrum 0.1s linear infinite alternate;
}
@keyframes thrum {
  to { transform: translate(1px, -1px); }
}
.hang-line {
  opacity: 0;
  animation: show 0.2s 0.85s forwards;
}
@keyframes show {
  to { opacity: 1; }
}
.snapped {
  animation: snap 0.6s ease-out;
}
@keyframes snap {
  0% { transform: translateY(-10px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

/* Il salto del pesce: in orizzontale a velocità costante, in verticale su e giù (una parabola) */
.leap-x {
  animation: leap-x 0.9s linear forwards;
}
.leap-y {
  animation: leap-y 0.9s forwards;
}
@keyframes leap-x {
  to { transform: translateX(var(--dx)); }
}
@keyframes leap-y {
  0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  50% { transform: translateY(var(--peak)); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); }
  100% { transform: translateY(var(--dy)); }
}
.flee.leap-x {
  animation-duration: 0.8s;
}
.flee.leap-y {
  animation: flee-y 0.8s forwards;
}
@keyframes flee-y {
  0% { transform: translateY(0); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  50% { transform: translateY(var(--peak)) rotate(-20deg); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); }
  100% { transform: translateY(var(--dy)) rotate(30deg) scale(0.4); opacity: 0; }
}
.dangle {
  animation:
    spin-in 0.9s ease-out,
    dangle 0.9s 0.9s ease-in-out infinite alternate;
}
@keyframes spin-in {
  from { transform: rotate(-200deg) scale(0.5); }
  to { transform: rotate(0) scale(1); }
}
@keyframes dangle {
  from { transform: rotate(-10deg); }
  to { transform: rotate(10deg); }
}
.glory {
  opacity: 0;
  animation:
    glory-in 0.4s 0.8s forwards,
    glory-spin 6s 0.8s linear infinite;
}
@keyframes glory-in {
  to { opacity: 1; }
}
@keyframes glory-spin {
  to { transform: rotate(360deg); }
}

/* Sopra la testa */
.zzz text {
  fill: #fff8e6;
  stroke: #2d2a4a;
  stroke-width: 5px;
  paint-order: stroke;
  font-size: 22px;
}
.zzz .z2 {
  font-size: 16px;
}
.zzz {
  opacity: 0;
  animation: zzz 9s ease-in-out infinite;
}
@keyframes zzz {
  0%, 60% { opacity: 0; transform: translate(0, 10px); }
  70%, 90% { opacity: 1; transform: translate(4px, 0); }
  100% { opacity: 0; transform: translate(10px, -16px); }
}
.alert,
.catch-label text {
  transform-box: fill-box;
  transform-origin: center;
}
.alert {
  animation: alert 0.3s ease-in-out infinite alternate;
}
@keyframes alert {
  from { transform: translateY(0) rotate(-8deg) scale(1); }
  to { transform: translateY(-8px) rotate(8deg) scale(1.15); }
}
.bang {
  fill: #fff8e6;
  font-size: 34px;
}
.catch-label {
  pointer-events: none;
}
.catch-label text {
  stroke: #2d2a4a;
  stroke-width: 6px;
  stroke-linejoin: round;
  paint-order: stroke;
  opacity: 0;
  animation: pop 0.5s 0.9s cubic-bezier(0.3, 1.8, 0.5, 1) forwards;
}
.catch-label .kg {
  fill: #ffd54a;
  font-size: 42px;
}
.catch-label .species {
  fill: #fff8e6;
  font-size: 26px;
}
.catch-label .wow {
  fill: #ff7a59;
  font-size: 46px;
  animation:
    pop 0.5s 0.9s cubic-bezier(0.3, 1.8, 0.5, 1) forwards,
    wow 0.5s 1.4s ease-in-out infinite alternate;
}
@keyframes pop {
  from { opacity: 0; transform: translateY(16px) scale(0.3); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes wow {
  from { transform: scale(1) rotate(-3deg); fill: #ff7a59; }
  to { transform: scale(1.12) rotate(3deg); fill: #ffd54a; }
}
@media (prefers-reduced-motion: reduce) {
  .angler *,
  .angler :deep(*) {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
