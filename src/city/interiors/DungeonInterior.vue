<script setup>
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'I bug aperti sono mostri da sconfiggere: chiuderli fa salire di livello.',
  'Più un bug è vecchio, più il mostro è grosso.',
  'Il venerdì può comparire il boss: un incidente in produzione.',
]
const bugs = [
  { x: 420, y: 700, s: 1.2, c: '#7dff8a' },
  { x: 800, y: 620, s: 0.8, c: '#ff6fb5' },
  { x: 1120, y: 720, s: 1, c: '#ffd54a' },
]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#3a2d5c" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#3a3550" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <!-- Muro di pietre -->
        <g fill="#5a5675">
          <template v-for="r in 6" :key="r">
            <rect
              v-for="c in 9"
              :key="c"
              :x="(c - 1) * 200 - (r % 2) * 100"
              :y="(r - 1) * 90"
              width="196"
              height="86"
              rx="12"
            />
          </template>
        </g>
        <!-- Pavimento -->
        <rect x="-10" y="540" width="1620" height="370" fill="#2b2740" />
        <!-- Celle -->
        <g v-for="x in [240, 1160]" :key="x">
          <path :d="`M ${x} 540 L ${x} 300 Q ${x + 100} 220 ${x + 200} 300 L ${x + 200} 540 Z`" fill="#120f1f" />
          <path :d="`M ${x + 40} 540 L ${x + 40} 270 M ${x + 80} 540 L ${x + 80} 250 M ${x + 120} 540 L ${x + 120} 250 M ${x + 160} 540 L ${x + 160} 270`" fill="none" stroke="#8e93aa" stroke-width="10" />
          <circle :cx="x + 85" cy="420" r="8" fill="#ff4a4a" stroke="none" class="eye" />
          <circle :cx="x + 115" cy="420" r="8" fill="#ff4a4a" stroke="none" class="eye" />
        </g>
        <!-- Torce -->
        <g v-for="x in [640, 960]" :key="x">
          <path :d="`M ${x} 340 L ${x} 260`" fill="none" stroke="#a0673a" stroke-width="14" />
          <path class="fire" :d="`M ${x - 26} 262 Q ${x} 160 ${x + 26} 262 Z`" fill="#ff9a2e" />
        </g>
        <!-- Catene -->
        <path d="M 760 0 L 760 200 M 840 0 L 840 160" fill="none" stroke="#8e93aa" stroke-width="8" stroke-dasharray="14 8" />
        <!-- Bug-mostri -->
        <g v-for="(b, i) in bugs" :key="i" class="bug" :style="{ animationDelay: `${-i * 0.7}s` }">
          <g :transform="`translate(${b.x} ${b.y}) scale(${b.s})`">
            <path d="M -60 10 L -90 -10 M -60 30 L -96 34 M -50 46 L -80 70 M 60 10 L 90 -10 M 60 30 L 96 34 M 50 46 L 80 70" fill="none" />
            <ellipse cx="0" cy="20" rx="66" ry="48" :fill="b.c" />
            <path d="M 0 -26 L 0 66" fill="none" />
            <circle cx="0" cy="-36" r="30" fill="#4b4870" />
            <path d="M -14 -60 L -30 -90 M 14 -60 L 30 -90" fill="none" />
            <circle cx="-11" cy="-40" r="9" fill="#fff" />
            <circle cx="11" cy="-40" r="9" fill="#fff" />
            <circle cx="-9" cy="-38" r="4" fill="#2d2a4a" stroke="none" />
            <circle cx="13" cy="-38" r="4" fill="#2d2a4a" stroke="none" />
          </g>
        </g>
      </g>
    </svg>
  </InteriorLayout>
</template>

<style scoped>
.fire {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.35s ease-in-out infinite alternate;
}
@keyframes flicker {
  from { transform: scale(0.85, 0.9); fill: #ff7a2e; }
  to { transform: scale(1.1, 1.15); fill: #ffc53d; }
}
.bug {
  animation: scuttle 2.4s ease-in-out infinite alternate;
}
@keyframes scuttle {
  from { transform: translateX(-24px); }
  to { transform: translateX(24px); }
}
.eye {
  animation: blink 3.5s steps(1) infinite;
}
@keyframes blink {
  92%, 96% { opacity: 0; }
}
</style>
