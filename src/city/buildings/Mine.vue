<template>
  <svg viewBox="0 0 400 300" aria-hidden="true">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Collina rocciosa -->
      <path d="M 10 285 C 20 200 60 140 110 110 C 140 60 200 30 250 50 C 300 60 330 110 360 150 C 385 190 395 240 392 285 Z" fill="#a98a6d" />
      <path d="M 60 170 q 30 -10 50 6 M 280 90 q 26 6 36 30 M 320 210 q 20 -6 34 8 M 150 80 q 14 -14 34 -10" fill="none" stroke="#7d634c" />
      <path d="M 250 50 C 300 60 330 110 360 150 C 385 190 395 240 392 285 L 340 285 C 350 220 330 150 290 100 Z" fill="#8f735a" stroke="none" />
      <!-- Cristalli -->
      <g class="gem">
        <path d="M 300 150 l 12 -30 l 12 30 l -12 12 Z" fill="#59e3ff" />
        <path d="M 322 160 l 8 -18 l 8 18 l -8 8 Z" fill="#b388ff" />
      </g>
      <g class="gem gem-2">
        <path d="M 80 200 l 10 -26 l 10 26 l -10 10 Z" fill="#ff6fb5" />
      </g>
      <!-- Ingresso con travi -->
      <path d="M 150 285 L 150 175 Q 215 130 280 175 L 280 285 Z" fill="#2d2a4a" />
      <path d="M 165 285 L 165 182 Q 215 148 265 182 L 265 285 Z" fill="#1a1830" />
      <rect x="138" y="168" width="24" height="120" fill="#a0673a" />
      <rect x="268" y="168" width="24" height="120" fill="#a0673a" />
      <path d="M 128 160 L 302 160 L 302 184 L 128 184 Z" fill="#c07d45" />
      <path d="M 150 168 L 160 176 M 270 168 L 280 176" fill="none" />
      <!-- Lanterna -->
      <path d="M 215 184 L 215 198" fill="none" />
      <rect class="lantern" x="203" y="198" width="24" height="28" rx="6" fill="#ffd54a" />
      <!-- Binari -->
      <path d="M 190 285 L 180 300 M 240 285 L 250 300" fill="none" stroke-width="6" />
      <path d="M 192 280 L 238 280 M 188 292 L 242 292" fill="none" stroke="#7d634c" stroke-width="6" />
      <!-- Carrello -->
      <g class="cart">
        <circle cx="76" cy="234" r="10" fill="#ffd54a" />
        <circle cx="95" cy="228" r="11" fill="#59e3ff" />
        <circle cx="113" cy="234" r="9" fill="#ff6fb5" />
        <path d="M 60 236 L 128 236 L 120 272 L 68 272 Z" fill="#6d7f92" />
        <path d="M 66 246 L 122 246" fill="none" stroke="#4d5b6b" />
        <circle cx="78" cy="278" r="9" fill="#4b4870" />
        <circle cx="112" cy="278" r="9" fill="#4b4870" />
      </g>
      <!-- Piccone -->
      <path d="M 330 286 L 300 222" fill="none" stroke="#a0673a" stroke-width="9" />
      <path d="M 278 226 Q 300 206 328 216" fill="none" stroke-width="9" />
      <path d="M 278 226 Q 300 206 328 216" fill="none" stroke="#c9d3dc" stroke-width="4" />
    </g>
  </svg>
</template>

<style scoped>
.lantern {
  animation: glow 2.4s ease-in-out infinite;
}
@keyframes glow {
  50% { fill: #ffb300; }
}
.gem {
  animation: sparkle 3s ease-in-out infinite;
}
.gem-2 {
  animation-delay: -1.5s;
}
@keyframes sparkle {
  50% { filter: brightness(1.5); }
}
</style>
