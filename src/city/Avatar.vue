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
        <g v-else-if="look.hat === 'propeller'">
          <!-- Spicchi arcobaleno che si incontrano in cima, visiera ed elica che gira -->
          <g stroke="none">
            <path d="M -26 -82 Q -27 -102 0 -105 Q -24 -102 -22.5 -82 Z" fill="#ff5c6c" />
            <path d="M -22.5 -82 Q -24 -102 0 -105 Q -14 -103 -13 -82 Z" fill="#ffb347" />
            <path d="M -13 -82 Q -14 -103 0 -105 L 0 -82 Z" fill="#ffd54a" />
            <path d="M 0 -82 L 0 -105 Q 14 -103 13 -82 Z" fill="#9ccc65" />
            <path d="M 13 -82 Q 14 -103 0 -105 Q 24 -102 22.5 -82 Z" fill="#4fc3f7" />
            <path d="M 22.5 -82 Q 24 -102 0 -105 Q 27 -102 26 -82 Z" fill="#ba68c8" />
          </g>
          <path d="M -26 -82 C -28 -112 26 -112 26 -82 Z" fill="none" />
          <path d="M 16 -86 Q 42 -88 46 -79 Q 30 -76 16 -80 Z" fill="#ff5c6c" />
          <path d="M 0 -104 L 0 -116" fill="none" stroke-width="3" />
          <g class="propeller">
            <ellipse cx="-11" cy="-117" rx="11" ry="3.5" fill="#ff5c6c" stroke-width="2.5" />
            <ellipse cx="11" cy="-117" rx="11" ry="3.5" fill="#4fc3f7" stroke-width="2.5" />
          </g>
          <circle cx="0" cy="-117" r="3.5" fill="#ffd54a" stroke-width="2.5" />
        </g>
        <g v-else-if="look.hat === 'captain'">
          <path d="M -34 -100 C -34 -114 34 -114 34 -100 Q 30 -94 24 -92 L -24 -92 Q -30 -94 -34 -100 Z" fill="#fff" />
          <path d="M -24 -92 L 24 -92 L 25 -82 L -25 -82 Z" fill="#2d3e6e" />
          <path d="M -23 -85 L 23 -85" fill="none" stroke="#ffd54a" stroke-width="2.5" />
          <path d="M 8 -84 Q 34 -86 41 -78 Q 22 -74 8 -79 Z" fill="#3b3756" />
          <circle cx="4" cy="-98" r="5" fill="#ffd54a" stroke-width="2.5" />
          <path d="M 4 -101 L 4 -95 M 1.5 -96.5 Q 4 -94 6.5 -96.5" fill="none" stroke-width="1.5" />
        </g>
        <g v-else-if="look.hat === 'wizard'">
          <ellipse cx="0" cy="-86" rx="36" ry="7" fill="#6b4bd8" />
          <path d="M -22 -88 C -14 -102 -6 -116 4 -134 C 8 -126 14 -122 24 -122 C 16 -114 18 -102 22 -88 Z" fill="#7e5ee8" />
          <path d="M -20 -92 Q 0 -86 21 -92" fill="none" stroke="#ffd54a" stroke-width="3" />
          <g fill="#ffd54a" stroke="none">
            <path d="M -4 -112 l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z" />
            <path d="M 10 -102 l 1.5 3.5 l 3.5 1.5 l -3.5 1.5 l -1.5 3.5 l -1.5 -3.5 l -3.5 -1.5 l 3.5 -1.5 Z" />
            <circle cx="5" cy="-122" r="1.8" />
          </g>
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
/* L'elica gira: le pale si scambiano di posto restringendosi, come viste di lato. */
.propeller {
  transform-origin: 0 -117px;
  animation: propeller 0.22s linear infinite alternate;
}
@keyframes propeller {
  from { transform: scaleX(1); }
  to { transform: scaleX(-1); }
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
