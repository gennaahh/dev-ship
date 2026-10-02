<script setup>
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Trofei dei rilasci leggendari, uno per ogni sprint chiuso alla grande.',
  'Ritratti dei vincitori della classifica settimanale.',
  'Vetrine con i bug più assurdi mai trovati (ormai innocui).',
]
const frames = [
  { x: 160, c: '#ff7a59', label: 'v1.0' },
  { x: 560, c: '#4fc3f7', label: 'MVP' },
  { x: 960, c: '#9ccc65', label: 'Go-live' },
]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#7a4a2a" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#f3ead2" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <!-- Pavimento a scacchi -->
        <rect x="-10" y="600" width="1620" height="310" fill="#e2d4b0" />
        <path v-for="i in 17" :key="i" :d="`M ${(i - 1) * 100 - 400} 900 L ${(i - 1) * 100} 600`" fill="none" stroke="#cfbf96" stroke-width="4" />
        <path d="M -10 680 L 1610 680 M -10 780 L 1610 780" fill="none" stroke="#cfbf96" stroke-width="4" />
        <path d="M -10 600 L 1610 600" fill="none" />
        <!-- Colonne -->
        <g v-for="x in [60, 1480]" :key="x">
          <rect :x="x" y="40" width="70" height="560" fill="#fffaf0" />
          <rect :x="x - 14" y="40" width="98" height="30" rx="4" fill="#e2d4b0" />
        </g>
        <!-- Quadri -->
        <g v-for="f in frames" :key="f.label">
          <rect :x="f.x + 40" y="120" width="300" height="220" rx="6" fill="#e8a31a" />
          <rect :x="f.x + 62" y="142" width="256" height="176" :fill="f.c" stroke-width="4" />
          <path :d="`M ${f.x + 120} 280 L ${f.x + 190} 190 L ${f.x + 260} 280 Z`" fill="#fff8e6" stroke-width="4" />
          <rect :x="f.x + 140" y="356" width="100" height="34" rx="6" fill="#fff8e6" stroke-width="4" />
          <text :x="f.x + 190" y="381" text-anchor="middle" class="plate" fill="#2d2a4a" stroke="none">{{ f.label }}</text>
        </g>
        <!-- Piedistalli con trofei -->
        <g v-for="(x, i) in [380, 800, 1220]" :key="x">
          <rect :x="x - 70" y="560" width="140" height="200" fill="#fffaf0" />
          <rect :x="x - 84" y="540" width="168" height="26" rx="4" fill="#e2d4b0" />
          <g class="trophy" :style="{ animationDelay: `${-i * 0.6}s` }">
            <path :d="`M ${x - 46} 440 L ${x + 46} 440 Q ${x + 46} 500 ${x} 506 Q ${x - 46} 500 ${x - 46} 440 Z`" fill="#ffd54a" />
            <path :d="`M ${x - 46} 452 q -30 0 -26 24 q 6 18 30 14 M ${x + 46} 452 q 30 0 26 24 q -6 18 -30 14`" fill="none" />
            <rect :x="x - 10" y="506" width="20" height="18" fill="#ffd54a" />
            <rect :x="x - 34" y="522" width="68" height="18" rx="4" fill="#b3541e" />
          </g>
        </g>
        <!-- Cordoni -->
        <g v-for="x in [180, 590, 1010, 1420]" :key="x">
          <rect :x="x - 8" y="700" width="16" height="110" fill="#e8a31a" />
          <circle :cx="x" cy="696" r="14" fill="#e8a31a" />
        </g>
        <path d="M 180 720 Q 385 790 590 720 Q 800 790 1010 720 Q 1215 790 1420 720" fill="none" stroke="#c0392b" stroke-width="12" />
      </g>
    </svg>
  </InteriorLayout>
</template>

<style scoped>
.plate {
  font: 22px 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.trophy {
  animation: shine 3s ease-in-out infinite;
}
@keyframes shine {
  50% { filter: brightness(1.25) drop-shadow(0 0 16px #ffe14a); }
}
</style>
