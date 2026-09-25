<script setup>
// Stelle fisse, generate in modo deterministico così non cambiano a ogni apertura.
const stars = Array.from({ length: 60 }, (_, i) => ({
  left: `${(i * 37.3) % 100}%`,
  top: `${(i * 23.7) % 62}%`,
  size: `${1 + (i % 3)}px`,
  delay: `${(i % 7) * -0.6}s`,
}))

// Due amache ai lati, la seconda specchiata. x = gancio sinistro, disegno largo 320.
const hammocks = [
  { x: 60, skin: '#f1c27d', hair: '#3b2a1a', shirt: '#2e86c1', blanket: '#e74c3c', swing: '0s' },
  { x: 940, mirror: true, skin: '#8d5524', hair: '#1c1c1c', shirt: '#16a085', blanket: '#f39c12', swing: '-2.3s' },
].map((h) => ({ ...h, transform: `translate(${h.x} 150)${h.mirror ? ' scale(-1 1)' : ''}` }))
const POSTS = [60, 380, 620, 940]
const zzz = [0, 1, 2]
</script>

<template>
  <div class="rest">
    <div class="sky">
      <span
        v-for="(s, i) in stars"
        :key="i"
        class="star"
        :style="{ left: s.left, top: s.top, width: s.size, height: s.size, animationDelay: s.delay }"
      />
      <div class="moon" />
    </div>
    <div class="horizon">
      <div class="moonlight" />
      <div class="wave-strip" />
    </div>
    <div class="rail">
      <span class="lifebuoy" />
    </div>
    <div class="deck" />

    <svg class="crew" viewBox="0 0 1000 460" xmlns="http://www.w3.org/2000/svg" aria-label="L'equipaggio riposa">
      <defs>
        <radialGradient id="rest-glow">
          <stop offset="0" stop-color="#ffd56b" stop-opacity="0.55" />
          <stop offset="1" stop-color="#ffd56b" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- pali delle amache -->
      <g v-for="x in POSTS" :key="x">
        <rect :x="x - 7" y="120" width="14" height="310" rx="3" fill="#6e4420" />
        <rect :x="x - 16" y="420" width="32" height="12" rx="3" fill="#5a3718" />
        <circle :cx="x" cy="150" r="4" fill="#3b2a1a" />
      </g>

      <!-- lanterna appesa al palo, con la luce che tremola -->
      <circle class="glow" cx="410" cy="170" r="110" fill="url(#rest-glow)" />
      <path d="M380 130 H412 V140" fill="none" stroke="#3b2a1a" stroke-width="4" />
      <rect x="398" y="140" width="28" height="6" rx="2" fill="#2c2c2c" />
      <rect x="400" y="146" width="24" height="34" rx="4" fill="#ffe08a" stroke="#2c2c2c" stroke-width="3" />
      <ellipse class="flame" cx="412" cy="164" rx="4" ry="7" fill="#ff9f1c" />
      <rect x="398" y="180" width="28" height="6" rx="2" fill="#2c2c2c" />

      <!-- amache con chi dorme dentro; oscillano piano -->
      <g v-for="h in hammocks" :key="h.x" :transform="h.transform">
        <g class="hammock" :style="{ animationDelay: h.swing }">
          <g stroke="#e8dcc0" stroke-width="2">
            <line x1="0" y1="0" x2="40" y2="76" />
            <line x1="0" y1="0" x2="44" y2="86" />
            <line x1="320" y1="0" x2="280" y2="76" />
            <line x1="320" y1="0" x2="276" y2="86" />
          </g>
          <g class="breathe">
            <path d="M70 102 C110 72 200 82 262 86 L262 118 C200 132 110 132 70 122 Z" :fill="h.blanket" />
            <path d="M70 102 C84 90 96 84 110 82 L112 116 L70 118 Z" :fill="h.shirt" />
          </g>
          <ellipse cx="268" cy="80" rx="7" ry="11" :fill="h.skin" />
          <ellipse cx="257" cy="82" rx="7" ry="11" :fill="h.skin" />
          <ellipse cx="58" cy="94" rx="24" ry="12" fill="#f4f1ea" />
          <g transform="translate(62 72) rotate(-18)">
            <circle r="21" :fill="h.skin" />
            <path d="M-21 -2 C-22 -26 22 -26 21 -2 C14 -12 -10 -14 -21 -2 Z" :fill="h.hair" />
            <path d="M-11 3 q4 4 8 0 M4 3 q4 4 8 0" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" />
            <ellipse class="snore" cy="13" rx="3.5" ry="3" fill="#7a2e2e" />
          </g>
          <path d="M40 80 Q160 150 280 80 Q160 205 40 80 Z" fill="#d8c9a3" />
          <path d="M40 80 Q160 150 280 80" fill="none" stroke="#b8a67c" stroke-width="3" />
          <path d="M60 104 Q160 170 260 104" fill="none" stroke="#c0392b" stroke-width="3" opacity="0.6" />
          <!-- nell'amaca specchiata le z vanno raddrizzate, altrimenti si leggono al contrario -->
          <g class="zzz" :transform="h.mirror ? 'scale(-1 1)' : undefined">
            <text v-for="z in zzz" :key="z" :x="h.mirror ? -90 : 90" y="40" :style="{ animationDelay: `${z * -1}s` }">z</text>
          </g>
        </g>
      </g>

      <!-- sdraio al centro: chi legge si è addormentato col libro sulla pancia -->
      <g stroke="#8d5a2b" stroke-width="6" stroke-linecap="round">
        <line x1="462" y1="300" x2="440" y2="430" />
        <line x1="492" y1="378" x2="505" y2="430" />
        <line x1="598" y1="386" x2="606" y2="430" />
      </g>
      <path d="M450 240 L488 372 L604 384" fill="none" stroke="#fdf6f0" stroke-width="24" stroke-linejoin="round" />
      <path
        d="M450 240 L488 372 L604 384"
        fill="none"
        stroke="#2e86c1"
        stroke-width="24"
        stroke-dasharray="14 14"
        stroke-linejoin="round"
      />
      <line x1="484" y1="352" x2="600" y2="352" stroke="#2c3e50" stroke-width="22" stroke-linecap="round" />
      <ellipse cx="610" cy="340" rx="9" ry="13" fill="#1b1b1b" />
      <g class="breathe">
        <line x1="466" y1="262" x2="490" y2="346" stroke="#8e44ad" stroke-width="42" stroke-linecap="round" />
      </g>
      <path d="M470 312 L500 296 L512 322 L482 336 Z" fill="#c0392b" />
      <path d="M491 304 L503 330" stroke="#fdf6f0" stroke-width="2" />
      <circle cx="486" cy="330" r="8" fill="#c68642" />
      <circle cx="504" cy="318" r="8" fill="#c68642" />
      <g transform="translate(458 226) rotate(14)">
        <circle r="25" fill="#c68642" />
        <path d="M-25 -2 C-26 -32 26 -32 25 -2 C16 -14 -12 -16 -25 -2 Z" fill="#2b1d12" />
        <path d="M-12 3 q5 4 9 0 M5 3 q5 4 9 0" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" />
        <path d="M-24 8 Q-22 28 0 29 Q22 28 24 8 Q12 18 0 18 Q-12 18 -24 8 Z" fill="#2b1d12" />
      </g>
      <g class="zzz">
        <text v-for="z in zzz" :key="z" x="486" y="190" :style="{ animationDelay: `${z * -1}s` }">z</text>
      </g>

      <!-- tazza lasciata sul ponte -->
      <path d="M392 404 H412 L410 428 H394 Z" fill="#ecf0f1" />
      <path d="M412 410 q9 2 0 12" fill="none" stroke="#ecf0f1" stroke-width="3" />
    </svg>

    <div class="caption">Fine turno, l'equipaggio riposa · si riprende alle 09:00</div>
  </div>
</template>

<style scoped>
.rest {
  /* Stessa impostazione della scena del pranzo: mare, parapetto e ponte seguono la larghezza del disegno. */
  --tw: min(1100px, 96vw);
  --crew-bottom: 4%;
  --deck-h: calc(var(--crew-bottom) + var(--tw) * 0.22);
  --rail-h: calc(var(--tw) * 0.15);
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 15;
  background: #4a3120;
}
.sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(#081a33, #1d3a66 70%, #3b4f7a);
}
.star {
  position: absolute;
  border-radius: 50%;
  background: #fff;
  animation: twinkle 3s ease-in-out infinite alternate;
}
.moon {
  position: absolute;
  top: 12%;
  right: 14%;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #f6f1d5;
  box-shadow: 0 0 40px 10px rgba(246, 241, 213, 0.35);
}
.horizon {
  position: absolute;
  left: -5%;
  right: -5%;
  bottom: var(--deck-h);
  height: calc(var(--rail-h) + 6vh);
  background: linear-gradient(#1d4470, #0c2440);
  overflow: hidden;
  animation: rock 8s ease-in-out infinite alternate;
}
/* Riflesso della luna sull'acqua, sotto la luna. */
.moonlight {
  position: absolute;
  top: 0;
  right: calc(14% + 35px - 60px);
  width: 120px;
  height: 100%;
  background: repeating-linear-gradient(transparent 0 6px, rgba(246, 241, 213, 0.35) 6px 9px);
  -webkit-mask: linear-gradient(90deg, transparent, #000 40%, #000 60%, transparent);
  mask: linear-gradient(90deg, transparent, #000 40%, #000 60%, transparent);
  animation: shimmer 2.5s ease-in-out infinite alternate;
}
.wave-strip {
  position: absolute;
  inset: 0 -200px 0 0;
  background: repeating-linear-gradient(
      90deg,
      transparent 0 60px,
      rgba(255, 255, 255, 0.15) 60px 90px,
      transparent 90px 200px
    )
    0 30% / 100% 3px no-repeat,
    repeating-linear-gradient(
      90deg,
      transparent 0 110px,
      rgba(255, 255, 255, 0.1) 110px 150px,
      transparent 150px 200px
    )
    0 70% / 100% 3px no-repeat;
  animation: waves 8s linear infinite;
}
.rail {
  position: absolute;
  left: 0;
  right: 0;
  bottom: var(--deck-h);
  height: var(--rail-h);
  background:
    linear-gradient(#aab4c4, #8793a6) top / 100% 12px no-repeat,
    linear-gradient(#9aa5b6, #7c889b) 0 55% / 100% 8px no-repeat,
    repeating-linear-gradient(90deg, #a3adbd 0 10px, transparent 10px 110px);
}
.lifebuoy {
  position: absolute;
  top: 15%;
  left: 5%;
  height: min(64px, 75%);
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(#a8452c 0 25%, #b9c0c9 0 50%, #a8452c 0 75%, #b9c0c9 0);
  -webkit-mask: radial-gradient(circle, transparent 42%, #000 43%);
  mask: radial-gradient(circle, transparent 42%, #000 43%);
}
.deck {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: var(--deck-h);
  background:
    linear-gradient(rgba(0, 0, 0, 0.3), transparent) top / 100% 10px no-repeat,
    repeating-linear-gradient(0deg, #6b4a2c 0 34px, #4a3120 34px 36px);
}
.crew {
  position: absolute;
  left: 50%;
  bottom: var(--crew-bottom);
  width: var(--tw);
  height: auto;
  transform: translateX(-50%);
  overflow: visible;
}
.caption {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  max-width: calc(100vw - 32px);
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #0e3a63;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.hammock {
  animation: swing 4.6s ease-in-out infinite alternate;
  transform-origin: 160px 0;
}
.breathe {
  animation: breathe 3.2s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.snore {
  animation: snore 3.2s ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.zzz text {
  font: 800 26px system-ui, sans-serif;
  fill: #e8eef7;
  opacity: 0;
  animation: zzz 3s ease-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.glow {
  animation: flicker 2.2s ease-in-out infinite alternate;
  transform-box: fill-box;
  transform-origin: center;
}
.flame {
  animation: flicker 0.7s ease-in-out infinite alternate;
  transform-box: fill-box;
  transform-origin: 50% 100%;
}

@keyframes twinkle {
  from { opacity: 0.35; }
  to { opacity: 1; }
}
@keyframes rock {
  from { transform: translateY(-5px) rotate(-0.6deg); }
  to { transform: translateY(6px) rotate(0.6deg); }
}
@keyframes shimmer {
  from { opacity: 0.6; transform: scaleX(0.9); }
  to { opacity: 1; transform: scaleX(1.1); }
}
@keyframes waves {
  to { transform: translateX(-200px); }
}
@keyframes swing {
  from { transform: rotate(-2.5deg); }
  to { transform: rotate(2.5deg); }
}
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.07); }
}
@keyframes snore {
  0%, 100% { transform: scale(0.6); }
  50% { transform: scale(1.2); }
}
@keyframes zzz {
  0% { opacity: 0; transform: translate(0, 0) scale(0.6); }
  20% { opacity: 1; }
  100% { opacity: 0; transform: translate(28px, -60px) scale(1.3); }
}
@keyframes flicker {
  from { opacity: 0.8; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1.04); }
}
</style>
