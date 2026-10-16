<script setup>
import { computed } from 'vue'
import { SCALE } from '@dev-city/shared/office-floor'
import Avatar from '../Avatar.vue'
import CoffeeCup from './CoffeeCup.vue'

// Un posto al tavolo dell'ufficio, da mettere dentro l'<svg> (coordinate della scena), in due
// strati: layer 'seat' è la sedia con chi ci è seduto, da disegnare in ordine di profondità (i
// posti dietro prima del tavolo, quelli davanti dopo); layer 'table' è quello che sta sul piano
// del tavolo, la tazza e il segnaposto col nome, da disegnare subito dopo il tavolo.
// Dietro (side 'back') si guarda verso chi guarda, col tavolo davanti; davanti ('front') si è
// di spalle e lo schienale copre la schiena.
const props = defineProps({
  // { seat, side, x, y } da SEAT_SPOTS (packages/shared/src/office-floor.ts).
  spot: { type: Object, required: true },
  layer: { type: String, default: 'seat' },
  // null se il posto è libero, altrimenti { name, look, coffee, me }: coffee è il caffè in
  // circolo (id), '' se non ce l'ha o è finito.
  sitter: { type: Object, default: null },
  // Il posto libero si può prendere (da loggati, col server raggiungibile).
  canSit: { type: Boolean, default: false },
})
// menu: tasto destro su chi è seduto (l'evento del browser), per il menu degli scambi.
const emit = defineEmits(['sit', 'menu'])

const back = computed(() => props.spot.side === 'back')
// Si guarda verso il centro del tavolo.
const dir = computed(() => (props.spot.x < 800 ? 1 : -1))
// La tazza, dalla parte verso la testa del tavolo: dietro sul piano, di fianco al segnaposto;
// davanti sul bordo del tavolo, di fianco alla testa. Così non copre i segnaposti né il portapenne.
const cup = computed(() => ({ x: props.spot.x - dir.value * (back.value ? 50 : 44), y: back.value ? 628 : 664 }))
const short = (name) => (name.length > 11 ? `${name.slice(0, 10)}…` : name)

function sit(e) {
  if (props.sitter || !props.canSit) return
  e?.stopPropagation()
  emit('sit', props.spot.seat)
}
</script>

<template>
  <g v-if="layer === 'table'">
    <g v-if="sitter?.coffee" :transform="`translate(${cup.x} ${cup.y}) scale(0.6)`">
      <CoffeeCup :id="sitter.coffee" />
    </g>
    <!-- Il segnaposto, sul tavolo davanti a chi siede dietro -->
    <g v-if="sitter && back" :transform="`translate(${spot.x} 626)`">
      <path d="M -34 0 L -30 -18 L 30 -18 L 34 0 Z" fill="#fff8e6" stroke="#2d2a4a" stroke-width="3" stroke-linejoin="round" />
      <text y="-4" text-anchor="middle" class="card" :class="{ me: sitter.me }">{{ short(sitter.name) }}</text>
    </g>
  </g>

  <g
    v-else
    class="seat"
    :class="{ free: !sitter, clickable: !sitter && canSit }"
    :role="!sitter && canSit ? 'button' : null"
    :tabindex="!sitter && canSit ? 0 : null"
    :aria-label="!sitter && canSit ? `Siediti al posto ${spot.seat + 1}` : null"
    @click="sit"
    @keydown.enter.prevent="sit"
    @keydown.space.prevent="sit"
    @contextmenu="sitter && !sitter.me && emit('menu', $event)"
  >
    <!-- Dietro: lo schienale spunta sopra il tavolo, dietro a chi è seduto -->
    <g v-if="back" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round">
      <rect :x="spot.x - 30" y="508" width="60" height="84" rx="14" class="chair" />
      <rect :x="spot.x - 22" y="518" width="44" height="44" rx="10" fill="#fff8e6" opacity="0.18" stroke="none" />
    </g>
    <!-- Davanti si sta sulla seduta, un po' più in alto dei piedi della sedia -->
    <g v-if="sitter" :transform="`translate(${spot.x} ${back ? spot.y : spot.y - 16}) scale(${SCALE})`">
      <Avatar :look="sitter.look" :dir="dir" :back="!back" />
    </g>
    <!-- Davanti: lo schienale copre la schiena, sotto il piede con le rotelle -->
    <g v-if="!back" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <rect :x="spot.x - 6" :y="spot.y" width="12" height="18" fill="#6b6890" />
      <path :d="`M ${spot.x - 30} ${spot.y + 26} L ${spot.x + 30} ${spot.y + 26}`" fill="none" stroke-width="6" />
      <circle :cx="spot.x - 30" :cy="spot.y + 30" r="5" fill="#2d2a4a" />
      <circle :cx="spot.x + 30" :cy="spot.y + 30" r="5" fill="#2d2a4a" />
      <rect :x="spot.x - 32" :y="spot.y - 34" width="64" height="38" rx="12" class="chair" />
      <rect :x="spot.x - 24" :y="spot.y - 27" width="48" height="16" rx="7" fill="#fff8e6" opacity="0.18" stroke="none" />
    </g>
    <text v-if="sitter && !back" :x="spot.x" :y="spot.y + 50" text-anchor="middle" class="name" :class="{ me: sitter.me }">{{ sitter.name }}</text>
    <!-- Libero: si illumina passandoci sopra -->
    <g v-if="!sitter && canSit" class="invite">
      <rect :x="spot.x - 40" :y="back ? 498 : spot.y - 46" width="80" :height="back ? 100 : 84" rx="16" fill="transparent" stroke="#ffd54a" stroke-width="5" />
    </g>
  </g>
</template>

<style scoped>
.chair {
  fill: #4b5fa0;
}
.free .chair {
  fill: #5a6fb4;
}
.clickable {
  cursor: pointer;
  outline: none;
}
.invite rect {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.clickable:hover .invite rect,
.clickable:focus-visible .invite rect {
  opacity: 1;
}
.card {
  fill: #2d2a4a;
  font-size: 13px;
}
.card.me {
  fill: #b3541e;
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
</style>
