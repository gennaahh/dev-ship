<script setup>
// Una scodella di zuppa di pesce da mettere dentro un <svg>, centrata sull'origine: larga circa
// 100 unità, col vapore che sale fin verso y = -50.
defineProps({
  // Il vapore che sale.
  steam: { type: Boolean, default: true },
})
</script>

<template>
  <g class="soup" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g v-if="steam" class="steam" fill="none" stroke="#b9ae9c" stroke-width="4">
      <path d="M -18 -20 q -6 -8 0 -15 t 0 -15" />
      <path d="M 0 -22 q -6 -8 0 -15 t 0 -15" />
      <path d="M 18 -20 q -6 -8 0 -15 t 0 -15" />
    </g>
    <!-- Il brodo, con la coda di un pesce che spunta, carote ed erbe. -->
    <ellipse cx="0" cy="-6" rx="46" ry="11" fill="#f2b84b" />
    <path d="M 14 -9 L 26 -24 Q 24 -13 34 -8 Z" fill="#4fc3f7" />
    <circle cx="-22" cy="-6" r="4" fill="#ff7a59" stroke-width="3" />
    <circle cx="-4" cy="-2" r="3.5" fill="#ff7a59" stroke-width="3" />
    <path d="M -12 -10 q 5 -5 9 0 q -5 4 -9 0 Z" fill="#7cb342" stroke-width="2.5" />
    <path d="M 2 -12 q 5 -4 8 1 q -5 3 -8 -1 Z" fill="#7cb342" stroke-width="2.5" />
    <!-- La scodella, col piedino e una riga bianca. -->
    <path d="M -50 -6 Q -48 34 0 36 Q 48 34 50 -6 Q 46 6 0 6 Q -46 6 -50 -6 Z" fill="#ff9a4a" />
    <path d="M -42 14 Q 0 26 42 14" fill="none" stroke="#fff8e6" stroke-width="5" opacity="0.8" />
    <path d="M -16 36 L -12 44 H 12 L 16 36" fill="#e0782f" />
  </g>
</template>

<style scoped>
.steam path {
  animation: steam 2.4s ease-in-out infinite;
}
.steam path:nth-child(2) {
  animation-delay: -0.8s;
}
.steam path:nth-child(3) {
  animation-delay: -1.6s;
}
@keyframes steam {
  0% {
    opacity: 0;
    translate: 0 6px;
  }
  40% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    translate: 0 -8px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .steam path {
    animation: none;
  }
}
</style>
