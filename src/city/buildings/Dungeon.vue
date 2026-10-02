<template>
  <svg viewBox="0 0 370 350" aria-hidden="true">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Torri laterali -->
      <rect x="30" y="140" width="80" height="200" fill="#7a7f96" />
      <path d="M 20 144 L 70 60 L 120 144 Z" fill="#7b4fb8" />
      <rect x="260" y="140" width="80" height="200" fill="#7a7f96" />
      <path d="M 250 144 L 300 60 L 350 144 Z" fill="#7b4fb8" />
      <rect x="58" y="190" width="24" height="34" rx="12" fill="#2d2a4a" />
      <rect x="288" y="190" width="24" height="34" rx="12" fill="#2d2a4a" />
      <!-- Mastio -->
      <path d="M 100 70 L 100 340 L 270 340 L 270 70 L 250 70 L 250 50 L 226 50 L 226 70 L 196 70 L 196 50 L 174 50 L 174 70 L 144 70 L 144 50 L 120 50 L 120 70 Z" fill="#8e93aa" />
      <!-- Pietre -->
      <path d="M 110 110 h 30 M 160 130 h 34 M 220 104 h 30 M 118 170 h 28 M 230 160 h 26 M 116 250 h 24 M 236 240 h 22 M 200 190 h 20" fill="none" stroke="#6b7088" />
      <!-- Bandiera -->
      <path d="M 185 50 L 185 6" fill="none" />
      <path class="flag" d="M 185 8 L 222 18 L 185 30 Z" fill="#b24bf3" />
      <!-- Finestra con occhi -->
      <rect x="164" y="96" width="42" height="48" rx="21" fill="#2d2a4a" />
      <g class="eyes" fill="#ffe14a" stroke="none">
        <ellipse cx="177" cy="122" rx="5" ry="4" />
        <ellipse cx="193" cy="122" rx="5" ry="4" />
      </g>
      <!-- Teschio -->
      <circle cx="185" cy="186" r="16" fill="#f3ead2" />
      <rect x="176" y="196" width="18" height="12" rx="3" fill="#f3ead2" />
      <circle cx="179" cy="186" r="4" fill="#2d2a4a" stroke="none" />
      <circle cx="191" cy="186" r="4" fill="#2d2a4a" stroke="none" />
      <!-- Portone con grata -->
      <path d="M 136 340 L 136 262 Q 185 214 234 262 L 234 340 Z" fill="#1a1830" />
      <g class="door-eyes" fill="#ff4a4a" stroke="none">
        <circle cx="170" cy="292" r="5" />
        <circle cx="198" cy="292" r="5" />
      </g>
      <path d="M 158 340 L 158 248 M 185 340 L 185 238 M 212 340 L 212 248 M 140 280 L 230 280 M 138 310 L 232 310" fill="none" stroke="#6b7088" stroke-width="6" />
      <!-- Torce -->
      <g v-for="x in [118, 252]" :key="x">
        <path :d="`M ${x} 270 L ${x} 240`" fill="none" stroke="#a0673a" stroke-width="8" />
        <path class="fire" :d="`M ${x - 10} 238 Q ${x} 200 ${x + 10} 238 Z`" fill="#ff9a2e" />
      </g>
      <!-- Pipistrelli -->
      <g class="bat" fill="#2d2a4a" stroke="none">
        <path d="M 300 30 q 10 -12 18 0 q 4 -6 8 0 q 8 -12 18 0 q -10 0 -22 10 q -12 -10 -22 -10 Z" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.fire {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.35s ease-in-out infinite alternate;
}
@keyframes flicker {
  from { transform: scale(0.85, 0.9); fill: #ff7a2e; }
  to { transform: scale(1.1, 1.15); fill: #ffc53d; }
}
.eyes,
.door-eyes {
  animation: blink-eyes 4s steps(1) infinite;
}
.door-eyes {
  animation-delay: -2s;
}
@keyframes blink-eyes {
  0%, 90% { opacity: 1; }
  92%, 96% { opacity: 0; }
}
.flag {
  transform-box: fill-box;
  transform-origin: 0 50%;
  animation: wave 1.2s ease-in-out infinite alternate;
}
@keyframes wave {
  to { transform: scaleX(0.75) skewY(6deg); }
}
.bat {
  animation: bat 6s ease-in-out infinite;
}
@keyframes bat {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-40px, 16px); }
  50% { transform: translate(-90px, -6px); }
  75% { transform: translate(-30px, -14px); }
}
</style>
