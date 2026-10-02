<template>
  <svg viewBox="0 0 370 290" aria-hidden="true">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Frontone -->
      <path d="M 30 100 L 185 20 L 340 100 Z" fill="#f3ead2" />
      <path d="M 70 92 L 185 36 L 300 92 Z" fill="#e2d4b0" stroke-width="3" />
      <text x="185" y="84" text-anchor="middle" class="logo" fill="#b3541e" stroke="none">&lt;/&gt;</text>
      <rect x="22" y="100" width="326" height="22" rx="4" fill="#f3ead2" />
      <!-- Colonne -->
      <g v-for="i in 6" :key="i">
        <rect :x="40 + (i - 1) * 56" y="122" width="34" height="112" fill="#fffaf0" />
        <path :d="`M ${51 + (i - 1) * 56} 130 L ${51 + (i - 1) * 56} 226 M ${63 + (i - 1) * 56} 130 L ${63 + (i - 1) * 56} 226`" fill="none" stroke="#d9cba6" stroke-width="3" />
        <rect :x="34 + (i - 1) * 56" y="122" width="46" height="12" rx="3" fill="#f3ead2" stroke-width="4" />
      </g>
      <!-- Porta -->
      <path d="M 158 234 L 158 168 Q 185 146 212 168 L 212 234 Z" fill="#7a4a2a" />
      <!-- Stendardi -->
      <path class="banner" d="M 98 140 L 126 140 L 126 196 L 112 186 L 98 196 Z" fill="#ff7a59" stroke-width="4" />
      <path class="banner" d="M 244 140 L 272 140 L 272 196 L 258 186 L 244 196 Z" fill="#4fc3f7" stroke-width="4" />
      <!-- Gradini -->
      <rect x="18" y="232" width="334" height="18" rx="3" fill="#e2d4b0" />
      <rect x="8" y="250" width="354" height="18" rx="3" fill="#d9cba6" />
      <rect x="0" y="268" width="370" height="20" rx="3" fill="#cfbf96" />
    </g>
  </svg>
</template>

<style scoped>
.logo {
  font: bold 30px ui-monospace, monospace;
}
.banner {
  transform-box: fill-box;
  transform-origin: 50% 0;
  animation: sway 3s ease-in-out infinite alternate;
}
@keyframes sway {
  from { transform: skewX(-4deg); }
  to { transform: skewX(4deg); }
}
</style>
