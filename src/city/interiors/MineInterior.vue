<script setup>
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Ogni ticket del backlog è una vena da scavare: chiudendolo si trovano gemme.',
  'Le PR mergiate riempiono il carrello e fanno punti in classifica.',
  'Più si scende nei livelli, più il codice legacy è antico (e prezioso).',
]
const gems = [
  { x: 180, y: 300, c: '#59e3ff' },
  { x: 260, y: 520, c: '#ff6fb5' },
  { x: 1380, y: 260, c: '#b388ff' },
  { x: 1300, y: 480, c: '#ffd54a' },
  { x: 560, y: 200, c: '#7dff8a' },
  { x: 1060, y: 190, c: '#59e3ff' },
]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#5a4330" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id="mine-light" cx="50%" cy="45%" r="60%">
          <stop offset="0" stop-color="#8a6a4c" />
          <stop offset="1" stop-color="#2e2219" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#mine-light)" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <!-- Galleria che si allontana -->
        <path d="M 640 620 L 640 360 Q 800 260 960 360 L 960 620 Z" fill="#1a1410" />
        <path d="M 560 700 L 560 300 L 1040 300 L 1040 700" fill="none" stroke="#a0673a" stroke-width="26" />
        <path d="M 400 900 L 400 160 L 1200 160 L 1200 900" fill="none" stroke="#a0673a" stroke-width="40" />
        <path d="M 400 900 L 400 160 L 1200 160 L 1200 900" fill="none" stroke="#2d2a4a" stroke-width="6" />
        <!-- Binari -->
        <path d="M 760 620 L 560 900 M 840 620 L 1040 900" fill="none" stroke="#9aa6b8" stroke-width="10" />
        <path d="M 740 650 L 860 650 M 712 700 L 888 700 M 676 760 L 924 760 M 630 830 L 970 830" fill="none" stroke="#7a4a2a" stroke-width="14" />
        <!-- Gemme nelle pareti -->
        <g v-for="(g, i) in gems" :key="i" class="gem" :style="{ animationDelay: `${-i * 0.5}s` }">
          <path :d="`M ${g.x} ${g.y} l 22 -50 l 22 50 l -22 22 Z`" :fill="g.c" />
        </g>
        <!-- Lanterne -->
        <g v-for="x in [480, 1120]" :key="x">
          <path :d="`M ${x} 180 L ${x} 220`" fill="none" />
          <rect class="lamp" :x="x - 20" y="220" width="40" height="50" rx="10" fill="#ffd54a" />
        </g>
        <!-- Carrello -->
        <g transform="translate(660 600)">
          <circle cx="40" cy="20" r="26" fill="#ffd54a" />
          <circle cx="90" cy="10" r="30" fill="#59e3ff" />
          <circle cx="140" cy="22" r="24" fill="#ff6fb5" />
          <path d="M 0 30 L 180 30 L 160 120 L 20 120 Z" fill="#6d7f92" />
          <circle cx="45" cy="130" r="20" fill="#4b4870" />
          <circle cx="135" cy="130" r="20" fill="#4b4870" />
        </g>
      </g>
    </svg>
  </InteriorLayout>
</template>

<style scoped>
.gem {
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
</style>
