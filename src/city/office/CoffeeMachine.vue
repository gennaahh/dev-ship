<script setup>
// L'angolo del caffè, in fondo a destra: un tavolino appoggiato alla parete con sopra la
// macchinetta, le tazzine impilate e lo zucchero, e sotto la scorta di cialde. Da mettere
// dentro l'<svg> dell'ufficio (coordinate della scena), in ordine di profondità coi personaggi
// (i piedi del tavolino sono a y 496). Un clic apre il menu dei caffè. Mentre fa un caffè
// (brewing) la tazzina è sotto l'erogatore e scende il getto.
defineProps({
  brewing: { type: Boolean, default: false },
})
const emit = defineEmits(['open'])
const open = (e) => {
  e?.stopPropagation()
  emit('open')
}
// Le cialde nel cestino sotto il piano, coi colori dei caffè.
const PODS = ['#5a3a22', '#d9b48a', '#8a5a3a', '#c9935a', '#7a4a2a', '#6b4a3a']
</script>

<template>
  <g
    class="corner"
    :class="{ brewing }"
    role="button"
    tabindex="0"
    aria-label="Macchinetta del caffè: apri il menu"
    @click="open"
    @keydown.enter.prevent="open"
    @keydown.space.prevent="open"
  >
    <ellipse cx="1350" cy="498" rx="112" ry="10" fill="#2d2a4a" opacity="0.16" />
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Il tavolino: piano, gambe e il ripiano con le cialde -->
      <rect x="1256" y="414" width="12" height="82" fill="#8a5432" />
      <rect x="1432" y="414" width="12" height="82" fill="#8a5432" />
      <rect x="1262" y="456" width="176" height="10" rx="3" fill="#a0673a" />
      <path d="M 1300 456 L 1304 432 L 1396 432 L 1400 456 Z" fill="#e8c48a" stroke-width="4" />
      <circle v-for="(c, i) in PODS" :key="i" :cx="1316 + i * 14" cy="440" r="7" :fill="c" stroke-width="3" />
      <rect x="1240" y="398" width="220" height="18" rx="5" fill="#c98a4b" />
      <path d="M 1250 404 L 1450 404" fill="none" stroke="#d9a06a" stroke-width="3" />

      <!-- La macchinetta, con la vaschetta dell'acqua di fianco -->
      <g class="machine">
        <!-- Il fumo che esce ogni tanto dall'alto -->
        <g class="puff" fill="#fff8e6" stroke-width="3">
          <circle cx="1356" cy="272" r="8" />
          <circle cx="1366" cy="258" r="5" />
        </g>
        <rect x="1386" y="314" width="20" height="76" rx="6" fill="#bfe6ff" stroke-width="4" />
        <path d="M 1389 340 L 1403 340" fill="none" stroke="#4fc3f7" stroke-width="3" />
        <rect x="1298" y="300" width="92" height="98" rx="16" fill="#ff7a59" />
        <rect x="1298" y="300" width="92" height="98" rx="16" fill="none" class="halo" stroke="#ffd54a" stroke-width="9" />
        <!-- Lo scaldatazze in cima, con due tazzine -->
        <rect x="1294" y="292" width="100" height="14" rx="6" fill="#4b4870" />
        <g stroke-width="3">
          <path d="M 1312 292 L 1312 280 Q 1320 276 1328 280 L 1328 292" fill="#fff" />
          <path d="M 1336 292 L 1336 280 Q 1344 276 1352 280 L 1352 292" fill="#fff" />
        </g>
        <!-- I pulsanti e la spia -->
        <circle cx="1314" cy="320" r="5" fill="#ffd54a" stroke-width="3" />
        <circle cx="1330" cy="320" r="5" fill="#fff8e6" stroke-width="3" />
        <circle class="light" cx="1372" cy="320" r="5" fill="#7dff8a" stroke-width="3" />
        <!-- Il vano della tazzina: erogatore e griglia -->
        <rect x="1310" y="332" width="68" height="58" rx="8" fill="#2d2a4a" />
        <rect x="1334" y="332" width="20" height="12" rx="3" fill="#b8c2d4" stroke-width="3" />
        <path v-if="brewing" class="pour" d="M 1344 344 L 1344 372" fill="none" stroke="#7a4a2a" stroke-width="5" />
        <rect x="1314" y="382" width="60" height="6" rx="2" fill="#8e93aa" stroke-width="3" />
        <g v-if="brewing" stroke-width="3">
          <path d="M 1332 368 L 1356 368 Q 1356 382 1344 382 Q 1332 382 1332 368 Z" fill="#fff" />
          <path d="M 1356 371 q 6 0 5 5 q -1 4 -6 3" fill="none" />
        </g>
      </g>

      <!-- Le tazzine impilate e lo zucchero -->
      <g stroke-width="3">
        <path d="M 1256 398 L 1258 384 L 1284 384 L 1286 398 Z" fill="#fff" />
        <path d="M 1258 384 L 1260 370 L 1282 370 L 1284 384 Z" fill="#fff" />
        <path d="M 1260 370 L 1262 356 L 1280 356 L 1282 370 Z" fill="#fff" />
        <rect x="1420" y="368" width="28" height="30" rx="6" fill="#fff8e6" />
        <rect x="1418" y="362" width="32" height="8" rx="3" fill="#ff7a59" />
        <path d="M 1442 362 L 1452 340" fill="none" stroke="#b8c2d4" stroke-width="4" />
      </g>
    </g>
    <text x="1350" y="244" text-anchor="middle" class="hint">☕ Un caffè?</text>
  </g>
</template>

<style scoped>
.corner {
  cursor: pointer;
  outline: none;
}
.halo,
.hint {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.hint {
  fill: #2d2a4a;
  font-size: 20px;
}
.corner:hover .halo,
.corner:focus-visible .halo,
.corner:hover .hint,
.corner:focus-visible .hint {
  opacity: 1;
}
.light {
  animation: light 2.4s ease-in-out infinite;
}
@keyframes light {
  50% { fill: #3fa84c; }
}
.puff {
  animation: puff 6s ease-out infinite;
}
@keyframes puff {
  0%, 70% { opacity: 0; translate: 0 10px; }
  80% { opacity: 0.9; }
  100% { opacity: 0; translate: 0 -24px; }
}
.brewing .puff {
  animation-duration: 1.2s;
}
.pour {
  stroke-dasharray: 8 5;
  animation: pour 0.4s linear infinite;
}
@keyframes pour {
  to { stroke-dashoffset: -13; }
}
@media (prefers-reduced-motion: reduce) {
  .light,
  .puff,
  .pour {
    animation: none;
  }
}
</style>
