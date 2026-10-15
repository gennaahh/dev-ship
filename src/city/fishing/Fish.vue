<script setup>
import { computed } from 'vue'
import { speciesFor } from './lake.js'

// Un pesce da mettere dentro un <svg>, centrato sull'origine e girato a destra. È lungo circa
// 90 unità: si ingrandisce col peso, da chi lo contiene o con scale.
const props = defineProps({
  kg: { type: Number, required: true },
  // Dimena la coda.
  wiggle: { type: Boolean, default: true },
})

const s = computed(() => speciesFor(props.kg))
const belly = computed(() => `color-mix(in srgb, ${s.value.color} 45%, #fff8e6)`)
const fin = computed(() => `color-mix(in srgb, ${s.value.color} 70%, #2d2a4a)`)
</script>

<template>
  <g class="fish" :class="{ wiggle, legendary: s.legendary }" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g class="tail">
      <path d="M -36 0 L -60 -22 Q -54 0 -60 22 Z" :fill="fin" />
    </g>
    <path d="M -8 -24 Q 4 -40 22 -26 Z" :fill="fin" />
    <path d="M -40 0 C -30 -30 24 -34 46 -4 Q 50 0 46 4 C 24 34 -30 30 -40 0 Z" :fill="s.color" />
    <path d="M -30 6 C -12 22 24 22 40 8" :fill="belly" stroke="none" />
    <template v-if="s.stripes">
      <path d="M -14 -20 L -18 16 M 0 -23 L -3 19 M 14 -21 L 12 17" fill="none" stroke-width="5" opacity="0.4" />
    </template>
    <template v-if="s.spots">
      <circle cx="-14" cy="-8" r="3" fill="#2d2a4a" stroke="none" opacity="0.45" />
      <circle cx="2" cy="-14" r="2.5" fill="#2d2a4a" stroke="none" opacity="0.45" />
      <circle cx="10" cy="-4" r="3" fill="#2d2a4a" stroke="none" opacity="0.45" />
      <circle cx="-4" cy="2" r="2.5" fill="#2d2a4a" stroke="none" opacity="0.45" />
    </template>
    <path v-if="s.whiskers" d="M 42 4 Q 56 10 62 24 M 40 6 Q 50 16 50 30" fill="none" stroke-width="3" />
    <path v-if="s.legendary" d="M -20 -10 L -8 -16 L 4 -10 L 16 -16 L 28 -10" fill="none" stroke="#fff8e6" stroke-width="3" />
    <path d="M 20 -18 Q 28 0 20 16" fill="none" stroke-width="3" opacity="0.6" />
    <circle cx="32" cy="-6" r="6" fill="#fff" stroke-width="3" />
    <circle cx="34" cy="-6" r="3" fill="#2d2a4a" stroke="none" />
    <path d="M 44 6 q -4 3 -8 1" fill="none" stroke-width="3" />
  </g>
</template>

<style scoped>
.tail {
  transform-box: fill-box;
  transform-origin: 100% 50%;
}
.wiggle .tail {
  animation: tail 0.22s ease-in-out infinite alternate;
}
@keyframes tail {
  from { transform: scaleY(1) rotate(-14deg); }
  to { transform: scaleY(0.8) rotate(14deg); }
}
.legendary {
  animation: shimmer 1.2s linear infinite;
}
@keyframes shimmer {
  50% { filter: brightness(1.35) drop-shadow(0 0 6px #fff3a8); }
}
</style>
