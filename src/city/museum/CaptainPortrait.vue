<script setup>
import { computed } from 'vue'
import Avatar from '../Avatar.vue'
import { lookOf } from '../avatar.js'

// Il quadro di una settimana dell'albo dei capitani, da mettere dentro un <svg>: il ponte della
// dev-ship dipinto, col primo al timone e il secondo e il terzo ai lati, girati verso di lui,
// dentro una cornice dorata. Il dipinto sta tra 0,0 e 300,210, la cornice ci gira attorno (16 di
// spessore): chi lo usa lo posiziona e lo scala. Le stelle sulla cornice sono le vittorie del
// primo fino a quella settimana (dalla seconda in su).
const props = defineProps({
  // [{ rank, name, points, look }], dal primo; anche meno di tre.
  podium: { type: Array, required: true },
  wins: { type: Number, default: 1 },
})

const PLACES = {
  1: { x: 150, y: 200, scale: 0.78, dir: 1 },
  2: { x: 72, y: 198, scale: 0.62, dir: 1 },
  3: { x: 228, y: 198, scale: 0.62, dir: -1 },
}
// Prima il secondo e il terzo, poi il primo davanti a tutti.
const crew = computed(() =>
  [...props.podium].sort((a, b) => b.rank - a.rank).map((p) => ({ ...p, ...PLACES[p.rank], look: lookOf(p.name, p.look) })),
)
const stars = computed(() => (props.wins > 1 ? Math.min(props.wins, 5) : 0))
const SPOKES = [0, 45, 90, 135]
</script>

<template>
  <g class="portrait">
    <!-- La cornice -->
    <rect x="-16" y="-16" width="332" height="242" rx="6" fill="#e8a31a" stroke="#2d2a4a" stroke-width="5" />
    <rect x="-8" y="-8" width="316" height="226" rx="3" fill="none" stroke="#ffd54a" stroke-width="3" />
    <!-- Il dipinto: cielo, mare, parapetto e ponte -->
    <rect width="300" height="210" fill="#bfe3f6" stroke="#2d2a4a" stroke-width="4" />
    <circle cx="252" cy="34" r="16" fill="#ffe082" />
    <path d="M 40 40 q 6 -5 12 0 q 6 -5 12 0 M 90 28 q 5 -4 10 0 q 5 -4 10 0" fill="none" stroke="#5a6b8a" stroke-width="2" />
    <rect y="104" width="300" height="34" fill="#4f9bcf" />
    <path d="M 20 116 h 40 M 120 126 h 50 M 210 114 h 36" stroke="#a9d6f2" stroke-width="2" />
    <path d="M 0 138 H 300 M 0 150 H 300" stroke="#f4f7f9" stroke-width="4" />
    <path v-for="x in [30, 100, 170, 240]" :key="x" :d="`M ${x} 138 V 150`" stroke="#f4f7f9" stroke-width="4" />
    <rect y="150" width="300" height="60" fill="#b07a45" />
    <path d="M 0 168 H 300 M 0 188 H 300" stroke="#8f5f33" stroke-width="2" />
    <!-- Il podio -->
    <g v-for="p in crew" :key="p.rank" :transform="`translate(${p.x} ${p.y}) scale(${p.scale})`">
      <Avatar :look="p.look" :dir="p.dir" />
    </g>
    <!-- La ruota del timone davanti al primo -->
    <g v-if="crew.length" stroke="#2d2a4a" stroke-linecap="round">
      <g v-for="a in SPOKES" :key="a" :transform="`rotate(${a} 150 184)`">
        <path d="M 150 158 L 150 210" stroke="#a0673a" stroke-width="4" />
      </g>
      <circle cx="150" cy="184" r="20" fill="none" stroke="#c98a4b" stroke-width="6" />
      <circle cx="150" cy="184" r="20" fill="none" stroke-width="2" />
      <circle cx="150" cy="184" r="5" fill="#ffd54a" stroke-width="2" />
    </g>
    <!-- Una stella sulla cornice per ogni vittoria del primo, dalla seconda -->
    <g v-for="i in stars" :key="`star${i}`" :transform="`translate(${150 + (i - (stars + 1) / 2) * 22} -16)`">
      <path d="M 0 -9 L 2.6 -2.8 L 9 -2.8 L 3.8 1.2 L 5.6 7.8 L 0 4 L -5.6 7.8 L -3.8 1.2 L -9 -2.8 L -2.6 -2.8 Z" fill="#fff8e6" stroke="#2d2a4a" stroke-width="2.5" stroke-linejoin="round" />
    </g>
  </g>
</template>
