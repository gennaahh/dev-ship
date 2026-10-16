<script setup>
// Un mostro del dungeon (kind: id di packages/shared/src/dungeon.ts), da mettere dentro un
// <svg>. Come Avatar l'origine è tra i piedi, ed è girato a sinistra, verso il giocatore.
// Sono i bug-mostri dell'ingresso del dungeon, ognuno con la sua stranezza.
defineProps({ kind: { type: String, required: true } })
</script>

<template>
  <g class="monster" :class="kind" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
    <ellipse cx="0" cy="0" rx="58" ry="12" fill="#000" stroke="none" opacity="0.25" />

    <!-- Memory leak: una pozza di gelatina che cola, senza zampe -->
    <g v-if="kind === 'leak'" class="wobble">
      <path d="M -62 -4 Q -66 -70 -10 -84 Q 50 -90 60 -30 Q 66 -4 52 -2 Q 46 10 36 -2 Q 20 6 4 -2 Q -14 10 -26 -2 Q -48 4 -62 -4 Z" fill="#6fb7ff" />
      <ellipse cx="-30" cy="-58" rx="8" ry="12" fill="#fff" stroke="none" opacity="0.5" transform="rotate(30 -30 -58)" />
      <circle cx="-20" cy="-40" r="10" fill="#fff" />
      <circle cx="6" cy="-42" r="10" fill="#fff" />
      <circle cx="-23" cy="-39" r="4.5" fill="#2d2a4a" stroke="none" />
      <circle cx="3" cy="-41" r="4.5" fill="#2d2a4a" stroke="none" />
      <path d="M -16 -18 Q -8 -12 0 -18" fill="none" />
      <path class="drip" d="M 30 -2 Q 34 12 30 18 Q 26 12 30 -2 Z" fill="#6fb7ff" stroke-width="3" />
    </g>

    <!-- Incidente in produzione: il boss, un bug enorme e rosso, in fiamme, col lampeggiante -->
    <g v-else-if="kind === 'incident'" transform="scale(1.55)">
      <path class="flame" d="M -40 -70 Q -46 -100 -30 -110 Q -28 -92 -18 -96 Q -20 -118 0 -128 Q 0 -106 12 -104 Q 14 -118 30 -112 Q 44 -96 36 -70 Z" fill="#ff9a2e" stroke-width="4" />
      <path d="M -50 -14 L -78 -34 M -54 -30 L -86 -22 M -44 0 L -70 18 M 50 -14 L 78 -34 M 54 -30 L 86 -22 M 44 0 L 70 18" fill="none" />
      <ellipse cx="0" cy="-34" rx="58" ry="40" fill="#ff4a4a" />
      <path d="M 0 -72 V 4" fill="none" />
      <circle cx="-34" cy="-76" r="24" fill="#4b4870" />
      <path d="M -50 -88 L -38 -82 M -18 -88 L -30 -82" fill="none" stroke-width="5" />
      <circle cx="-42" cy="-76" r="7" fill="#fff" />
      <circle cx="-26" cy="-76" r="7" fill="#fff" />
      <circle cx="-44" cy="-75" r="3.5" fill="#ff4a4a" stroke="none" />
      <circle cx="-28" cy="-75" r="3.5" fill="#ff4a4a" stroke="none" />
      <path d="M -44 -64 Q -34 -70 -24 -64" fill="none" stroke-width="4" />
      <rect class="siren" x="-10" y="-84" width="20" height="14" rx="6" fill="#ffd54a" stroke-width="4" />
    </g>

    <!-- Bug, Glitch e Race condition: lo scarafaggio dell'ingresso, coi suoi colori -->
    <g v-else class="scuttle">
      <!-- Glitch: un'ombra spostata, come un'immagine che non si carica bene -->
      <ellipse v-if="kind === 'glitch'" class="ghost" cx="8" cy="-30" rx="44" ry="32" fill="#4fe0ff" stroke="none" opacity="0.6" />
      <path d="M -36 -22 L -56 -36 M -38 -10 L -62 -8 M -32 0 L -52 14 M 36 -22 L 56 -36 M 38 -10 L 62 -8 M 32 0 L 52 14" fill="none" />
      <ellipse cx="0" cy="-30" rx="44" ry="32" :fill="kind === 'glitch' ? '#ff6fb5' : kind === 'race' ? '#ffd54a' : '#7dff8a'" />
      <path d="M 0 -60 V 0" fill="none" />
      <path v-if="kind === 'glitch'" d="M 14 -46 L 24 -36 L 14 -30 L 26 -20" fill="none" stroke="#fff" stroke-width="4" />
      <!-- Race condition: due teste che vogliono arrivare prima -->
      <g v-if="kind === 'race'" transform="translate(-6 34)">
        <circle cx="-34" cy="-86" r="18" fill="#4b4870" />
        <path d="M -42 -102 L -50 -118" fill="none" />
        <circle cx="-40" cy="-88" r="6" fill="#fff" />
        <circle cx="-41" cy="-87" r="3" fill="#2d2a4a" stroke="none" />
      </g>
      <circle cx="-30" cy="-62" r="20" fill="#4b4870" />
      <path d="M -36 -80 L -50 -100 M -22 -80 L -18 -102" fill="none" />
      <circle cx="-38" cy="-64" r="6.5" fill="#fff" />
      <circle cx="-24" cy="-64" r="6.5" fill="#fff" />
      <circle cx="-40" cy="-63" r="3" fill="#2d2a4a" stroke="none" />
      <circle cx="-26" cy="-63" r="3" fill="#2d2a4a" stroke="none" />
    </g>
  </g>
</template>

<style scoped>
.scuttle {
  animation: scuttle 0.5s ease-in-out infinite alternate;
}
.race .scuttle {
  animation-duration: 0.18s;
}
@keyframes scuttle {
  to {
    translate: 0 -4px;
  }
}
.ghost {
  animation: glitch 0.9s steps(1) infinite;
}
@keyframes glitch {
  0% { translate: -14px 0; }
  30% { translate: 10px -4px; }
  60% { translate: 0 0; opacity: 0; }
}
.wobble {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: wobble 1.2s ease-in-out infinite alternate;
}
@keyframes wobble {
  to {
    scale: 1.06 0.94;
  }
}
.drip {
  animation: drip 1.6s ease-in infinite;
}
@keyframes drip {
  from { translate: 0 0; opacity: 1; }
  to { translate: 0 14px; opacity: 0; }
}
.flame {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flame 0.3s ease-in-out infinite alternate;
}
@keyframes flame {
  from { scale: 0.92 0.9; fill: #ff7a2e; }
  to { scale: 1.06 1.1; fill: #ffc53d; }
}
.siren {
  animation: siren 0.6s steps(1) infinite;
}
@keyframes siren {
  50% { fill: #ff4a4a; }
}
@media (prefers-reduced-motion: reduce) {
  .scuttle, .ghost, .wobble, .drip, .flame, .siren {
    animation: none;
  }
}
</style>
