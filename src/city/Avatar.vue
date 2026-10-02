<script setup>
import { computed } from 'vue'
import { DEFAULT_LOOK } from './avatar.js'

// Personaggio della città, da mettere dentro un <svg>. L'origine è tra i piedi:
// si posiziona con un transform sul gruppo che lo contiene. È alto circa 100 unità
// (120 col cappello), la misura dei pinguini di Club Penguin su una scena di 1600 × 900.
const props = defineProps({
  look: { type: Object, default: () => DEFAULT_LOOK },
  // 1 guarda a destra, -1 a sinistra.
  dir: { type: Number, default: 1 },
  walking: { type: Boolean, default: false },
  name: { type: String, default: '' },
  me: { type: Boolean, default: false },
})

const color = computed(() => props.look.color ?? DEFAULT_LOOK.color)
const shade = computed(() => ({ fill: `color-mix(in srgb, ${color.value} 72%, #2d2a4a)` }))
</script>

<template>
  <g class="avatar" :class="{ walking }">
    <ellipse cx="0" cy="0" rx="32" ry="9" fill="#2d2a4a" stroke="none" opacity="0.18" />
    <g :transform="`scale(${dir} 1)`" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
      <g class="foot back">
        <ellipse cx="-12" cy="-4" rx="11" ry="6" fill="#ffb347" />
      </g>
      <g class="foot front">
        <ellipse cx="14" cy="-4" rx="11" ry="6" fill="#ffb347" />
      </g>
      <g class="bob">
        <!-- Braccini, dietro al corpo -->
        <ellipse class="arm left" cx="-30" cy="-40" rx="7" ry="13" :style="shade" transform="rotate(18 -30 -40)" />
        <ellipse class="arm right" cx="32" cy="-40" rx="7" ry="13" :style="shade" transform="rotate(-18 32 -40)" />
        <!-- Corpo a caramella gommosa -->
        <path d="M -32 -22 C -34 -62 -24 -96 0 -96 C 24 -96 34 -62 32 -22 C 31 -10 18 -6 0 -6 C -18 -6 -31 -10 -32 -22 Z" :fill="color" />
        <ellipse cx="2" cy="-30" rx="19" ry="17" fill="#fff8e6" stroke="none" opacity="0.9" />
        <ellipse cx="-15" cy="-76" rx="5" ry="9" fill="#fff" stroke="none" opacity="0.45" transform="rotate(24 -15 -76)" />
        <!-- Faccia, un po' spostata verso dove guarda -->
        <g class="eyes">
          <ellipse cx="-7" cy="-62" rx="6.5" ry="8.5" fill="#2d2a4a" stroke="none" />
          <ellipse cx="15" cy="-62" rx="6.5" ry="8.5" fill="#2d2a4a" stroke="none" />
          <circle cx="-5" cy="-65.5" r="2.6" fill="#fff" stroke="none" />
          <circle cx="17" cy="-65.5" r="2.6" fill="#fff" stroke="none" />
          <circle cx="-8.5" cy="-58.5" r="1.3" fill="#fff" stroke="none" />
          <circle cx="13.5" cy="-58.5" r="1.3" fill="#fff" stroke="none" />
        </g>
        <ellipse cx="-17" cy="-49" rx="6" ry="3.5" fill="#ff8fa3" stroke="none" opacity="0.75" />
        <ellipse cx="25" cy="-49" rx="5" ry="3.5" fill="#ff8fa3" stroke="none" opacity="0.75" />
        <path d="M 0 -52 q 4 4 8 0" fill="none" stroke-width="3" />

        <!-- Cappelli -->
        <g v-if="look.hat === 'beanie'">
          <path d="M -26 -84 C -27 -114 27 -114 26 -84 Z" fill="#ff5c6c" />
          <path d="M -12 -106 L -10 -88 M 0 -109 L 0 -88 M 12 -106 L 10 -88" fill="none" stroke="#d63f50" stroke-width="3" />
          <rect x="-29" y="-90" width="58" height="12" rx="6" fill="#fff8e6" />
          <circle cx="0" cy="-113" r="8" fill="#fff8e6" />
        </g>
        <g v-else-if="look.hat === 'cap'">
          <path d="M 16 -88 Q 44 -90 48 -80 Q 32 -77 16 -81 Z" fill="#3d5fa0" />
          <path d="M -26 -82 C -28 -112 26 -112 26 -82 Z" fill="#4f7bd0" />
          <path d="M 0 -108 L 0 -82" fill="none" stroke="#3d5fa0" stroke-width="3" />
          <circle cx="0" cy="-109" r="4" fill="#3d5fa0" stroke-width="3" />
        </g>
        <g v-else-if="look.hat === 'chef'">
          <rect x="-20" y="-104" width="40" height="22" rx="3" fill="#fff" />
          <path d="M -22 -100 C -40 -104 -34 -128 -16 -124 C -12 -140 12 -140 16 -124 C 34 -128 40 -104 22 -100 Z" fill="#fff" />
          <path d="M -8 -102 L -8 -112 M 8 -102 L 8 -112" fill="none" stroke="#d9d4e6" stroke-width="3" />
        </g>
        <g v-else-if="look.hat === 'headphones'">
          <path d="M -31 -62 C -36 -116 38 -116 33 -62" fill="none" stroke-width="10" />
          <path d="M -31 -62 C -36 -116 38 -116 33 -62" fill="none" stroke="#4b4870" stroke-width="4" />
          <rect x="-40" y="-74" width="14" height="24" rx="6" fill="#ff7a59" />
          <rect x="28" y="-74" width="14" height="24" rx="6" fill="#ff7a59" />
        </g>
        <g v-else-if="look.hat === 'pirate'">
          <path d="M -40 -84 Q -34 -100 -20 -96 Q 0 -126 22 -96 Q 36 -100 42 -84 Q 0 -74 -40 -84 Z" fill="#3b3756" />
          <path d="M -34 -86 Q 0 -78 36 -86" fill="none" stroke="#ffd54a" stroke-width="3" />
          <circle cx="1" cy="-100" r="6" fill="#fff8e6" stroke-width="2.5" />
          <path d="M -3 -91 L 5 -91" fill="none" stroke="#fff8e6" stroke-width="3" />
        </g>
        <g v-else-if="look.hat === 'crown'">
          <path d="M -20 -88 L -24 -116 L -10 -102 L 0 -120 L 10 -102 L 24 -116 L 20 -88 Z" fill="#ffd54a" />
          <circle cx="0" cy="-96" r="4" fill="#ff4a6e" stroke-width="2.5" />
          <circle cx="-12" cy="-95" r="3" fill="#4fc3f7" stroke-width="2" />
          <circle cx="12" cy="-95" r="3" fill="#4fc3f7" stroke-width="2" />
        </g>
      </g>
    </g>

    <text v-if="name" class="name" :class="{ me }" y="28" text-anchor="middle">{{ name }}</text>

  </g>
</template>

<style scoped>
.name {
  fill: #fff8e6;
  stroke: #2d2a4a;
  stroke-width: 6px;
  stroke-linejoin: round;
  paint-order: stroke;
  font-size: 20px;
}
.name.me {
  fill: #ffd54a;
}
/* Le animazioni girano su gruppi senza transform propri, attorno all'origine (i piedi). */
.bob,
.foot {
  transform-origin: 0 0;
}
.bob {
  animation: breathe 2.6s ease-in-out infinite;
}
@keyframes breathe {
  50% { transform: scale(1.03, 0.97); }
}
.walking .bob {
  animation: waddle 0.36s ease-in-out infinite alternate;
}
@keyframes waddle {
  from { transform: translateY(0) rotate(-5deg); }
  to { transform: translateY(-6px) rotate(5deg); }
}
.walking .foot.front {
  animation: step 0.36s ease-in-out infinite alternate;
}
.walking .foot.back {
  animation: step 0.36s ease-in-out infinite alternate-reverse;
}
@keyframes step {
  from { transform: translateY(0); }
  to { transform: translateY(-5px); }
}
.eyes {
  transform-origin: 0 -62px;
  animation: blink 4.2s infinite;
}
@keyframes blink {
  0%, 94%, 100% { transform: scaleY(1); }
  97% { transform: scaleY(0.1); }
}
</style>
