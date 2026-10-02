<script setup>
// Sfondo della città: cielo, montagne, colline, prato, piazza e vialetti verso gli edifici.
// Usa le stesse coordinate del palco (1600 × 1000) ma si allarga ben oltre i bordi,
// così con qualsiasi proporzione della finestra (e durante gli zoom) non resta mai il vuoto.
const trees = [
  { x: 445, y: 560, s: 0.9 },
  { x: 1150, y: 560, s: 1 },
  { x: 1190, y: 1010, s: 1.1 },
  { x: 440, y: 1000, s: 1.15 },
  { x: 30, y: 960, s: 1.2 },
  { x: 1580, y: 960, s: 1.2 },
  { x: -120, y: 640, s: 1.3 },
  { x: 1720, y: 640, s: 1.3 },
  { x: -300, y: 820, s: 1.4 },
  { x: 1900, y: 840, s: 1.4 },
  { x: 1585, y: 560, s: 0.8 },
  { x: 25, y: 590, s: 0.8 },
]
const clouds = [
  { x: 200, y: 90, s: 1, d: 90, delay: -10 },
  { x: 700, y: 50, s: 0.8, d: 120, delay: -70 },
  { x: 1150, y: 160, s: 1.2, d: 100, delay: -40 },
]
const lamps = [
  { x: 470, y: 720 },
  { x: 1130, y: 720 },
]
// Pietre della piazza, disposte su due anelli attorno alla fontana.
const cobbles = []
for (const [rx, ry, n] of [[300, 62, 22], [200, 40, 15]]) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rx
    cobbles.push({ x: 800 + Math.cos(a) * rx, y: 750 + Math.sin(a) * ry })
  }
}
</script>

<template>
  <svg class="backdrop" viewBox="-1600 -1000 4800 4000" aria-hidden="true">
    <defs>
      <linearGradient id="city-sky" gradientUnits="userSpaceOnUse" x1="0" y1="-1000" x2="0" y2="540">
        <stop offset="0" stop-color="#4fb3ea" />
        <stop offset="0.6" stop-color="#6cc6f5" />
        <stop offset="1" stop-color="#d4f3ff" />
      </linearGradient>
      <radialGradient id="city-sun">
        <stop offset="0" stop-color="#fff6b0" />
        <stop offset="0.7" stop-color="#ffd54a" />
        <stop offset="1" stop-color="#ffb300" />
      </radialGradient>
    </defs>

    <rect x="-1600" y="-1000" width="4800" height="1560" fill="url(#city-sky)" />

    <!-- Sole -->
    <g class="sun" transform="translate(1460 110)">
      <g class="rays">
        <rect v-for="i in 12" :key="i" x="-6" y="-100" width="12" height="30" rx="6" fill="#ffd54a" :transform="`rotate(${i * 30})`" />
      </g>
      <circle r="58" fill="url(#city-sun)" stroke="#2d2a4a" stroke-width="5" />
      <path d="M -22 -6 q 6 -8 12 0 M 10 -6 q 6 -8 12 0 M -18 16 q 18 16 36 0" fill="none" stroke="#2d2a4a" stroke-width="5" stroke-linecap="round" />
    </g>

    <!-- Nuvole -->
    <g v-for="(c, i) in clouds" :key="i" class="cloud" :style="{ animationDuration: `${c.d}s`, animationDelay: `${c.delay}s` }">
      <g :transform="`translate(${c.x} ${c.y}) scale(${c.s})`">
        <path
          d="M -70 30 q -40 0 -36 -30 q 6 -30 44 -22 q 10 -40 56 -34 q 40 6 42 40 q 40 -6 44 26 q 2 22 -30 22 z"
          fill="#fff"
          stroke="#2d2a4a"
          stroke-width="5"
          stroke-linejoin="round"
        />
      </g>
    </g>

    <!-- Montagne lontane -->
    <path
      d="M -1600 540 L -1300 330 L -1100 450 L -850 280 L -600 470 L -400 360 L -150 520 L 60 300 L 330 470 L 520 380 L 700 500
         L 1000 520 L 1150 400 L 1330 300 L 1520 440 L 1700 330 L 1950 480 L 2200 300 L 2500 460 L 2800 340 L 3200 540 Z"
      fill="#a9c8ea"
      stroke="#5a6f9a"
      stroke-width="4"
      stroke-linejoin="round"
    />
    <path
      d="M 30 336 L 60 300 L 92 336 L 76 330 L 62 344 L 48 330 Z M 1300 336 L 1330 300 L 1362 334 L 1344 330 L 1330 342 L 1316 330 Z
         M 2170 336 L 2200 300 L 2230 334 L 2214 330 L 2200 342 L 2186 330 Z M -880 316 L -850 280 L -818 316 L -834 310 L -850 322 L -864 310 Z"
      fill="#fff"
      stroke="#5a6f9a"
      stroke-width="3"
      stroke-linejoin="round"
    />

    <!-- Colline -->
    <path
      d="M -1600 520 Q -1300 440 -1000 510 T -400 500 T 200 490 T 800 500 T 1400 480 T 2000 500 T 2600 490 T 3200 500 L 3220 3100 L -1620 3100 Z"
      fill="#74c264"
      stroke="#2d2a4a"
      stroke-width="5"
    />
    <!-- Prato -->
    <path
      d="M -1600 560 Q -800 530 0 555 T 1600 550 T 3200 560 L 3200 3000 L -1600 3000 Z"
      fill="#8ed16f"
    />
    <!-- Ciuffi d'erba -->
    <g fill="none" stroke="#5fa84c" stroke-width="4" stroke-linecap="round">
      <path v-for="(g, i) in [[120, 680], [520, 900], [1080, 880], [1500, 700], [700, 610], [960, 640], [380, 640], [1250, 940], [-200, 900], [1800, 760], [300, 980], [1460, 1000]]" :key="i" :d="`M ${g[0]} ${g[1]} l -6 -14 M ${g[0] + 8} ${g[1]} l 0 -18 M ${g[0] + 16} ${g[1]} l 6 -14`" />
    </g>

    <!-- Vialetti dalla piazza agli edifici -->
    <g fill="none" stroke-linecap="round">
      <g stroke="#2d2a4a" stroke-width="54">
        <path d="M 520 730 C 400 690 300 600 230 530" />
        <path d="M 500 770 C 380 800 300 830 250 880" />
        <path d="M 1080 730 C 1200 690 1320 620 1400 545" />
        <path d="M 1100 770 C 1220 790 1300 820 1355 860" />
        <path d="M 800 800 L 800 860" />
      </g>
      <g stroke="#f0dcb0" stroke-width="44">
        <path d="M 520 730 C 400 690 300 600 230 530" />
        <path d="M 500 770 C 380 800 300 830 250 880" />
        <path d="M 1080 730 C 1200 690 1320 620 1400 545" />
        <path d="M 1100 770 C 1220 790 1300 820 1355 860" />
        <path d="M 800 800 L 800 860" />
      </g>
    </g>

    <!-- Piazza: il gradino del bordo, il selciato e il lastricato su cui sta la fontana -->
    <ellipse cx="800" cy="760" rx="360" ry="86" fill="#c9a874" stroke="#2d2a4a" stroke-width="5" />
    <ellipse cx="800" cy="750" rx="360" ry="86" fill="#f0dcb0" stroke="#2d2a4a" stroke-width="5" />
    <ellipse cx="800" cy="750" rx="330" ry="72" fill="none" stroke="#d9bf8c" stroke-width="4" stroke-dasharray="18 12" />
    <ellipse v-for="(c, i) in cobbles" :key="i" :cx="c.x" :cy="c.y" rx="10" ry="5" :fill="i % 3 ? '#d9bf8c' : '#e3ca9a'" />
    <ellipse cx="800" cy="752" rx="92" ry="23" fill="#e8d1a2" stroke="#d9bf8c" stroke-width="4" />

    <!-- Lampioni -->
    <g v-for="(l, i) in lamps" :key="i" :transform="`translate(${l.x} ${l.y})`" stroke="#2d2a4a" stroke-width="4">
      <rect x="-5" y="-110" width="10" height="110" fill="#4b4870" />
      <rect x="-14" y="-8" width="28" height="12" rx="4" fill="#4b4870" />
      <path d="M -16 -110 L 16 -110 L 10 -140 L -10 -140 Z" fill="#fff3a8" class="lamp-glass" />
      <path d="M -20 -140 L 20 -140 L 0 -156 Z" fill="#4b4870" stroke-linejoin="round" />
    </g>

    <!-- Alberi -->
    <g v-for="(t, i) in trees" :key="i" :transform="`translate(${t.x} ${t.y}) scale(${t.s})`" stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
      <ellipse cx="0" cy="0" rx="34" ry="9" fill="#5fa84c" stroke="none" />
      <path d="M -9 0 L -7 -60 L 7 -60 L 9 0 Z" fill="#a0673a" />
      <circle cx="0" cy="-88" r="40" fill="#4fae55" />
      <circle cx="-14" cy="-100" r="12" fill="#76cf6a" stroke="none" />
    </g>
  </svg>
</template>

<style scoped>
.backdrop {
  position: absolute;
  left: -1600px;
  top: -1000px;
  width: 4800px;
  height: 4000px;
}
.rays {
  animation: spin 40s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.cloud {
  animation: drift linear infinite alternate;
}
@keyframes drift {
  from { transform: translateX(-160px); }
  to { transform: translateX(160px); }
}
</style>
