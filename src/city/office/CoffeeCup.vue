<script setup>
import { computed } from 'vue'
import { coffee } from '@dev-city/shared/coffee'

// Una tazza di caffè da mettere dentro un <svg>, col piattino nell'origine: alta circa 50 unità.
// Tazzina, tazza grande o bicchiere secondo il caffè (packages/shared/src/coffee.ts), col fumo
// che sale se steam. Il cappuccino ha il cuore nella schiuma, il marocchino gli strati.
const props = defineProps({
  id: { type: String, required: true },
  steam: { type: Boolean, default: true },
})
const c = computed(() => coffee(props.id) ?? coffee('espresso'))
const foam = computed(() => props.id === 'cappuccino')
</script>

<template>
  <g class="cup" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <g v-if="steam" class="steam" fill="none" stroke="#fff8e6" stroke-width="4" opacity="0.85">
      <path d="M -6 -40 q -6 -8 0 -16 q 6 -8 0 -16" />
      <path d="M 6 -44 q -6 -8 0 -16 q 6 -8 0 -16" />
    </g>
    <ellipse cx="0" cy="-3" rx="26" ry="6" fill="#fff8e6" />
    <!-- Bicchiere del marocchino: caffè, cacao e schiuma a strati -->
    <template v-if="c.cup === 'glass'">
      <path d="M -14 -44 L 14 -44 L 11 -6 L -11 -6 Z" fill="#e8f4ff" />
      <path d="M -12.6 -26 L 12.6 -26 L 11 -6 L -11 -6 Z" :fill="c.color" stroke="none" />
      <path d="M -13.2 -34 L 13.2 -34 L 12.6 -26 L -12.6 -26 Z" fill="#fff8e6" stroke="none" />
      <path d="M -14 -44 L 14 -44 L 13.2 -34 L -13.2 -34 Z" fill="#a0673a" stroke="none" />
      <path d="M -14 -44 L 14 -44 L 11 -6 L -11 -6 Z" fill="none" />
    </template>
    <!-- Tazza grande (americano, cappuccino) -->
    <template v-else-if="c.cup === 'big'">
      <path d="M 20 -32 q 14 0 12 12 q -2 10 -14 8" fill="none" stroke-width="5" />
      <path d="M -22 -38 L 22 -38 Q 22 -6 0 -6 Q -22 -6 -22 -38 Z" fill="#fff" />
      <ellipse cx="0" cy="-37" rx="20" ry="4.5" :fill="foam ? '#fff8e6' : c.color" stroke-width="3" />
      <path v-if="foam" d="M 0 -35 q -6 -4 -3 -6 q 2 -1 3 1 q 1 -2 3 -1 q 3 2 -3 6 Z" :fill="c.color" stroke="none" />
    </template>
    <!-- Tazzina (espresso, ginseng, deca) -->
    <template v-else>
      <path d="M 13 -24 q 10 0 9 8 q -1 7 -10 6" fill="none" stroke-width="4" />
      <path d="M -15 -28 L 15 -28 Q 15 -6 0 -6 Q -15 -6 -15 -28 Z" fill="#fff" />
      <ellipse cx="0" cy="-27" rx="13.5" ry="3.5" :fill="c.color" stroke-width="3" />
    </template>
  </g>
</template>

<style scoped>
.steam path {
  animation: steam 2.4s ease-in-out infinite;
}
.steam path + path {
  animation-delay: -1.2s;
}
@keyframes steam {
  0% { opacity: 0; translate: 0 6px; }
  40% { opacity: 0.9; }
  100% { opacity: 0; translate: 0 -10px; }
}
@media (prefers-reduced-motion: reduce) {
  .steam path {
    animation: none;
  }
}
</style>
