<script setup>
// Tentacoli: la base è sul pelo dell'acqua (y = 120), coperta dall'onda davanti.
const tentacles = [
  { d: 'M20 120 C12 96 2 78 12 58 C20 44 36 48 32 60', base: '20px 120px', duration: 5.2 },
  { d: 'M45 120 C44 100 30 88 36 70 C40 58 54 56 54 66', base: '45px 120px', duration: 4.4 },
  { d: 'M155 120 C156 100 170 88 164 70 C160 58 146 56 146 66', base: '155px 120px', duration: 4.8 },
  { d: 'M180 120 C188 96 198 78 188 58 C180 44 164 48 168 60', base: '180px 120px', duration: 5.6 },
]
</script>

<template>
  <div class="kraken">
    <svg viewBox="-8 36 216 84" xmlns="http://www.w3.org/2000/svg" aria-label="Kraken">
      <g
        v-for="(t, i) in tentacles"
        :key="i"
        class="tentacle"
        :style="{
          transformOrigin: t.base,
          animationDuration: `${t.duration}s`,
          animationDirection: i % 2 ? 'alternate-reverse' : 'alternate',
        }"
      >
        <path :d="t.d" fill="none" stroke="#6d2450" stroke-width="11" stroke-linecap="round" />
        <path :d="t.d" fill="none" stroke="#9b3d6b" stroke-width="7" stroke-linecap="round" />
        <!-- ventose: tratteggio fatto solo di punti -->
        <path
          :d="t.d"
          fill="none"
          stroke="#f6c1d9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="0 7"
        />
      </g>

      <!-- testa -->
      <path d="M62 122 C60 72 80 50 100 50 C120 50 140 72 138 122 Z" fill="#9b3d6b" />
      <path d="M72 122 C72 80 86 58 100 56" fill="none" stroke="#b85a88" stroke-width="5" stroke-linecap="round" />
      <g fill="#6d2450">
        <circle cx="92" cy="64" r="3" />
        <circle cx="112" cy="68" r="4" />
        <circle cx="124" cy="80" r="2.5" />
      </g>

      <!-- occhi -->
      <g class="eyes">
        <ellipse cx="86" cy="90" rx="9" ry="8" fill="#f5d142" />
        <ellipse cx="114" cy="90" rx="9" ry="8" fill="#f5d142" />
        <ellipse cx="86" cy="90" rx="2.2" ry="6" fill="#1b1b1b" />
        <ellipse cx="114" cy="90" rx="2.2" ry="6" fill="#1b1b1b" />
      </g>
      <g stroke="#4a1535" stroke-width="3.5" stroke-linecap="round">
        <line x1="76" y1="78" x2="94" y2="83" />
        <line x1="124" y1="78" x2="106" y2="83" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.kraken {
  position: absolute;
  left: 56%;
  bottom: 27%;
  width: clamp(100px, 20vw, 280px);
  z-index: 3;
  animation: lurk 6s ease-in-out infinite alternate;
}
.kraken svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.tentacle {
  animation: sway ease-in-out infinite;
}
.eyes {
  animation: blink 7s infinite;
  transform-box: fill-box;
  transform-origin: center;
}

@keyframes lurk {
  from { transform: translateY(0); }
  to { transform: translateY(10px); }
}
@keyframes sway {
  from { transform: rotate(-7deg); }
  to { transform: rotate(7deg); }
}
@keyframes blink {
  0%, 94%, 100% { transform: scaleY(1); }
  97% { transform: scaleY(0.1); }
}
</style>
