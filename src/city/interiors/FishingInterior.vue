<script setup>
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Minigioco di pesca per staccare la testa tra un task e l\'altro.',
  'I pesci rari sono easter egg che danno punti bonus.',
  'Si pesca meglio il venerdì pomeriggio, ovviamente.',
]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#1f5d86" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="fish-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ff9e7a" />
          <stop offset="1" stop-color="#ffe0a3" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#fish-sky)" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <!-- Sole al tramonto e colline -->
        <circle cx="1100" cy="430" r="120" fill="#ffd54a" />
        <path d="M -10 460 Q 300 360 600 440 T 1200 420 T 1610 440 L 1610 500 L -10 500 Z" fill="#7a9a6a" />
        <!-- Lago -->
        <rect x="-10" y="480" width="1620" height="430" fill="#3f8fc4" />
        <g fill="none" stroke="#fff" stroke-width="5" opacity="0.6" class="waves">
          <path d="M 200 580 q 30 -12 60 0 M 900 560 q 30 -12 60 0 M 1300 660 q 30 -12 60 0 M 500 760 q 30 -12 60 0 M 1100 820 q 30 -12 60 0" />
        </g>
        <path d="M 1020 520 h 160 M 1050 556 h 100 M 1070 590 h 60" fill="none" stroke="#ffd54a" stroke-width="8" opacity="0.7" />
        <!-- Pontile -->
        <path d="M -10 640 L 760 600 L 760 640 L -10 690 Z" fill="#c98a4b" />
        <path d="M 120 680 L 120 860 M 380 662 L 380 840 M 640 646 L 640 820" fill="none" stroke-width="14" />
        <!-- Pescatore seduto -->
        <rect x="560" y="520" width="70" height="86" rx="18" fill="#ffca28" />
        <circle cx="595" cy="490" r="36" fill="#ffd9b0" />
        <path d="M 552 480 Q 595 430 638 480 Z" fill="#3d5fa0" />
        <path d="M 600 620 L 680 640" fill="none" stroke-width="16" />
        <path d="M 620 560 L 680 520 L 940 300" fill="none" stroke="#7a4a2a" stroke-width="8" />
        <path d="M 940 300 Q 960 480 1000 640" fill="none" stroke-width="2" />
        <circle class="bobber" cx="1000" cy="644" r="14" fill="#ff4a4a" stroke-width="4" />
        <!-- Secchio -->
        <path d="M 380 600 L 390 536 L 470 536 L 480 600 Z" fill="#9aa6b8" />
        <path d="M 400 540 q 10 -30 30 -6 M 440 536 q 14 -26 26 0" fill="#ffb74d" stroke-width="4" />
        <!-- Canne palustri -->
        <g v-for="(x, i) in [1400, 1440, 1480, 1520]" :key="x">
          <path :d="`M ${x} 640 L ${x + (i - 1.5) * 10} ${460 + (i % 2) * 30}`" fill="none" stroke="#3f8f3a" stroke-width="6" />
          <rect :x="x + (i - 1.5) * 10 - 9" :y="440 + (i % 2) * 30" width="18" height="44" rx="9" fill="#8b5a2b" stroke-width="4" />
        </g>
      </g>
    </svg>
  </InteriorLayout>
</template>

<style scoped>
.bobber {
  animation: bob 1.8s ease-in-out infinite;
}
@keyframes bob {
  50% { transform: translateY(8px); }
}
.waves {
  animation: waves 3s ease-in-out infinite alternate;
}
@keyframes waves {
  to { transform: translateX(24px); }
}
</style>
