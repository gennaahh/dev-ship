<template>
  <svg viewBox="0 0 600 210" aria-hidden="true">
    <defs>
      <clipPath id="fishing-lake">
        <ellipse cx="320" cy="140" rx="270" ry="66" />
      </clipPath>
    </defs>
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Lago -->
      <ellipse cx="320" cy="140" rx="270" ry="66" fill="#4fa8e0" />
      <g clip-path="url(#fishing-lake)" fill="none" stroke="#fff" stroke-width="4" opacity="0.6">
        <path class="ripple" d="M 120 130 q 20 -8 40 0 M 400 170 q 20 -8 40 0 M 260 180 q 16 -6 32 0 M 470 120 q 16 -6 32 0" />
      </g>
      <!-- Ninfee -->
      <path d="M 470 160 a 18 10 0 1 0 1 -6 l -12 4 Z" fill="#5fbf5a" stroke-width="4" />
      <path d="M 200 176 a 14 8 0 1 0 1 -5 l -10 3 Z" fill="#5fbf5a" stroke-width="4" />
      <!-- Canne palustri -->
      <g v-for="(x, i) in [548, 562, 576]" :key="i">
        <path :d="`M ${x} 150 L ${x + (i - 1) * 4} ${92 + i * 8}`" fill="none" stroke="#3f8f3a" stroke-width="4" />
        <rect :x="x + (i - 1) * 4 - 5" :y="80 + i * 8" width="10" height="22" rx="5" fill="#8b5a2b" stroke-width="3" />
      </g>
      <!-- Capanno dell'esca -->
      <rect x="18" y="52" width="92" height="70" fill="#c07d45" />
      <path d="M 8 56 L 64 14 L 120 56 Z" fill="#ff7a59" />
      <rect x="50" y="80" width="28" height="42" fill="#7a4a2a" />
      <path d="M 26 66 h 18 v 14 h -18 Z" fill="#a9d8ff" stroke-width="4" />
      <!-- Pontile -->
      <path d="M 96 118 L 300 118 L 300 134 L 96 134 Z" fill="#c98a4b" />
      <path d="M 140 118 v 16 M 180 118 v 16 M 220 118 v 16 M 260 118 v 16" fill="none" stroke-width="3" />
      <path d="M 130 134 v 26 M 210 134 v 26 M 290 134 v 26" fill="none" stroke-width="7" />
      <!-- Pescatore -->
      <rect x="262" y="88" width="26" height="30" rx="8" fill="#ffca28" />
      <circle cx="275" cy="76" r="13" fill="#ffd9b0" />
      <path d="M 260 72 Q 275 54 290 72 Z" fill="#3d5fa0" />
      <path d="M 282 96 L 300 104" fill="none" />
      <path d="M 296 106 Q 360 20 420 40" fill="none" stroke="#7a4a2a" stroke-width="4" />
      <path d="M 420 40 L 420 140" fill="none" stroke="#2d2a4a" stroke-width="2" />
      <g class="bobber">
        <circle cx="420" cy="144" r="8" fill="#ff4a4a" stroke-width="3" />
      </g>
      <!-- Pesce che salta -->
      <g class="fish">
        <path d="M 0 0 q 18 -14 36 0 q -18 14 -36 0 Z M 36 0 l 12 -9 l 0 18 Z" fill="#ffb74d" stroke-width="4" />
      </g>
      <!-- Barchetta -->
      <g class="boat">
        <path d="M 330 164 L 400 164 L 388 182 L 342 182 Z" fill="#fff8e6" />
        <path d="M 365 164 L 365 128 L 388 160 Z" fill="#ff7a59" stroke-width="4" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.bobber {
  animation: bob 1.8s ease-in-out infinite;
}
@keyframes bob {
  50% { transform: translateY(5px); }
}
.fish {
  opacity: 0;
  animation: jump 5s ease-in-out infinite;
}
@keyframes jump {
  0% { opacity: 0; transform: translate(170px, 160px) rotate(-40deg); }
  6% { opacity: 1; }
  15% { transform: translate(200px, 110px) rotate(0deg); }
  25% { opacity: 1; transform: translate(230px, 160px) rotate(40deg); }
  26%, 100% { opacity: 0; transform: translate(230px, 170px) rotate(40deg); }
}
.boat {
  animation: drift 7s ease-in-out infinite alternate;
}
@keyframes drift {
  from { transform: translate(-10px, 0) rotate(-2deg); }
  to { transform: translate(30px, 2px) rotate(2deg); }
}
.ripple {
  animation: ripple 3s ease-in-out infinite alternate;
}
@keyframes ripple {
  to { transform: translateX(14px); }
}
</style>
