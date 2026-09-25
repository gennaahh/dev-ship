<script setup>
// Due squali che fanno avanti e indietro nello specchio d'acqua tra porto e boa.
const sharks = [
  { bottom: '9%', width: 'clamp(46px, 5vw, 72px)', duration: 48, delay: -6 },
  { bottom: '3%', width: 'clamp(56px, 6.5vw, 90px)', duration: 64, delay: -40 },
]
</script>

<template>
  <div class="sharks">
    <div
      v-for="(s, i) in sharks"
      :key="i"
      class="shark"
      :style="{
        bottom: s.bottom,
        width: s.width,
        animationDuration: `${s.duration}s`,
        animationDelay: `${s.delay}s`,
      }"
    >
      <!-- pinna rivolta a destra; il flip la gira quando torna indietro -->
      <svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg" aria-label="Squalo">
        <ellipse cx="40" cy="40" rx="36" ry="7" fill="rgba(5, 25, 50, 0.35)" />
        <path d="M22 35 Q32 26 30 4 Q52 14 64 35 Z" fill="#56687a" />
        <path d="M30 8 Q46 16 56 30" fill="none" stroke="#7d91a4" stroke-width="2.5" stroke-linecap="round" />
        <g class="foam" fill="none" stroke="#e8f4fb" stroke-width="2" stroke-linecap="round">
          <path d="M14 35 Q20 31 26 35" />
          <path d="M60 35 Q67 30 74 35" />
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.sharks {
  position: absolute;
  left: var(--port-w);
  right: var(--buoy-zone);
  bottom: 0;
  height: 24%;
  z-index: 13;
  pointer-events: none;
}
.shark {
  position: absolute;
  animation: patrol linear infinite;
}
.shark svg {
  display: block;
  width: 100%;
  height: auto;
  animation: bob 2.4s ease-in-out infinite alternate;
}
.foam {
  animation: splash 1.2s ease-in-out infinite alternate;
}

/* Va a destra, gira su se stesso, torna a sinistra e rigira. */
@keyframes patrol {
  0% { left: 0; transform: translateX(0) scaleX(1); }
  47% { left: 100%; transform: translateX(-100%) scaleX(1); }
  50% { left: 100%; transform: translateX(-100%) scaleX(-1); }
  97% { left: 0; transform: translateX(0) scaleX(-1); }
  100% { left: 0; transform: translateX(0) scaleX(1); }
}
@keyframes bob {
  from { transform: translateY(0); }
  to { transform: translateY(3px); }
}
@keyframes splash {
  from { opacity: 0.9; }
  to { opacity: 0.3; }
}
</style>
