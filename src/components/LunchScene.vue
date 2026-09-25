<script setup>
import Seagulls from './Seagulls.vue'

// Gli 8 commensali. x è il centro nel viewBox del tavolo (0–1000);
// end = seduto a capotavola. Chi sta a destra di 500 è specchiato, così brinda verso il centro.
const diners = [
  { x: 85, end: true, skin: '#f1c27d', hair: 'short', hairColor: '#3b2a1a', shirt: '#2e86c1', beard: true },
  { x: 215, skin: '#e0ac69', hair: 'long', hairColor: '#6b3e1f', shirt: '#e74c3c' },
  { x: 329, skin: '#ffdbac', hair: 'curly', hairColor: '#d9a441', shirt: '#27ae60', glasses: true },
  { x: 443, skin: '#c68642', hair: 'bald', hairColor: '#2b1d12', shirt: '#8e44ad', beard: true },
  { x: 557, skin: '#f1c27d', hair: 'bun', hairColor: '#1c1c1c', shirt: '#f39c12' },
  { x: 671, skin: '#ffdbac', hair: 'short', hairColor: '#a0522d', shirt: '#16a085', glasses: true },
  { x: 785, skin: '#8d5524', hair: 'curly', hairColor: '#1c1c1c', shirt: '#d35400' },
  { x: 915, end: true, skin: '#e0ac69', hair: 'long', hairColor: '#b5472b', shirt: '#34495e' },
].map((d, i) => ({
  ...d,
  transform: `translate(${d.x} ${d.end ? 40 : 0})${d.x > 500 ? ' scale(-1 1)' : ''}`,
  talk: `${2.2 + (i % 3) * 0.7}s`,
  nod: `${3.1 + (i % 4) * 0.6}s`,
  delay: `${i * -0.9}s`,
  toastDelay: `${i * 0.08}s`,
}))
const seated = diners.filter((d) => !d.end)
const atEnds = diners.filter((d) => d.end)

const plates = [...seated.map((d) => ({ x: d.x, y: 272 })), { x: 175, y: 286 }, { x: 825, y: 286 }]

const HAIR_SHORT = 'M-31 140 C-34 102 34 102 31 140 C26 124 12 118 -4 122 C-16 124 -26 130 -31 140 Z'
const CURLS = [[-24, 121, 11], [-12, 110, 12], [3, 107, 12], [17, 111, 12], [27, 123, 10]]
</script>

<template>
  <div class="lunch">
    <div class="sky">
      <div class="sun" />
      <Seagulls />
    </div>
    <div class="horizon">
      <div class="wave-strip" />
    </div>
    <div class="rail">
      <span class="lifebuoy" />
    </div>
    <div class="deck" />

    <svg class="table" viewBox="0 0 1000 460" xmlns="http://www.w3.org/2000/svg" aria-label="Pranzo a bordo">
      <defs>
        <pattern id="check" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#fdf6f0" />
          <rect width="20" height="20" fill="#d64541" />
          <rect x="20" y="20" width="20" height="20" fill="#d64541" />
        </pattern>
      </defs>

      <text class="cheers" x="500" y="70" text-anchor="middle">Cin cin!</text>

      <!-- commensali dietro al tavolo, centrati su x = 0; il braccio col bicchiere è disegnato dopo il tavolo -->
      <g v-for="d in seated" :key="d.x" :transform="d.transform">
        <rect x="-44" y="150" width="88" height="130" rx="10" fill="#8d5a2b" />
        <g class="head" :style="{ animationDuration: d.nod, animationDelay: d.delay }">
          <path v-if="d.hair === 'long'" d="M-34 138 C-37 96 37 96 34 138 L37 198 H-37 Z" :fill="d.hairColor" />
        </g>
        <path d="M-38 262 V205 Q-38 180 -12 178 H12 Q38 180 38 205 V262 Z" :fill="d.shirt" />
        <rect x="-8" y="164" width="16" height="18" :fill="d.skin" />
        <g class="head" :style="{ animationDuration: d.nod, animationDelay: d.delay }">
          <circle cy="140" r="30" :fill="d.skin" />
          <path v-if="['short', 'long', 'bun'].includes(d.hair)" :d="HAIR_SHORT" :fill="d.hairColor" />
          <circle v-if="d.hair === 'bun'" cy="103" r="12" :fill="d.hairColor" />
          <g v-if="d.hair === 'curly'" :fill="d.hairColor">
            <circle v-for="c in CURLS" :key="c[0]" :cx="c[0]" :cy="c[1]" :r="c[2]" />
          </g>
          <path
            v-if="d.beard"
            d="M-28 146 Q-26 176 0 178 Q26 176 28 146 Q16 160 0 160 Q-16 160 -28 146 Z"
            :fill="d.hairColor"
          />
          <g class="eyes" :style="{ animationDelay: d.delay }">
            <circle cx="-10" cy="138" r="3.4" fill="#222" />
            <circle cx="10" cy="138" r="3.4" fill="#222" />
          </g>
          <g v-if="d.glasses" fill="none" stroke="#333" stroke-width="2">
            <circle cx="-10" cy="138" r="8" />
            <circle cx="10" cy="138" r="8" />
            <line x1="-2" y1="138" x2="2" y2="138" />
          </g>
          <circle cx="-17" cy="150" r="5" fill="#ff7b7b" opacity="0.35" />
          <circle cx="17" cy="150" r="5" fill="#ff7b7b" opacity="0.35" />
          <ellipse
            class="mouth"
            cy="156"
            rx="7"
            ry="4.5"
            fill="#7a2e2e"
            :style="{ animationDuration: d.talk, animationDelay: d.delay }"
          />
        </g>
      </g>

      <!-- tavolo -->
      <path d="M150 250 H850 L875 300 H125 Z" fill="#fdf6f0" />
      <rect x="125" y="300" width="750" height="80" fill="url(#check)" />
      <rect x="125" y="300" width="750" height="6" fill="rgba(0, 0, 0, 0.12)" />

      <!-- piatti di spaghetti col vapore -->
      <g v-for="(p, i) in plates" :key="i" :transform="`translate(${p.x} ${p.y})`">
        <ellipse rx="34" ry="11" fill="#fff" stroke="#d5dde3" stroke-width="2" />
        <ellipse cy="-2" rx="22" ry="7" fill="#f4c542" />
        <ellipse cy="-4" rx="10" ry="4" fill="#c0392b" />
        <ellipse cx="4" cy="-6" rx="4" ry="2" fill="#3c9a3c" />
        <g class="steam" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round">
          <path d="M-8 -12 q-5 -8 0 -16 t0 -16" :style="{ animationDelay: `${i * -0.5}s` }" />
          <path d="M8 -12 q5 -8 0 -16 t0 -16" :style="{ animationDelay: `${i * -0.5 - 1}s` }" />
        </g>
      </g>

      <!-- bottiglie e pane -->
      <rect x="480" y="208" width="20" height="60" rx="6" fill="#1e5631" />
      <rect x="486" y="186" width="8" height="24" rx="2" fill="#1e5631" />
      <rect x="480" y="228" width="20" height="18" fill="#f3e3b5" />
      <rect x="506" y="214" width="18" height="54" rx="6" fill="rgba(160, 215, 250, 0.85)" />
      <rect x="511" y="198" width="8" height="18" rx="2" fill="#2e86c1" />
      <g v-for="bx in [272, 728]" :key="bx" :transform="`translate(${bx} 292)`">
        <ellipse cy="-6" rx="14" ry="8" fill="#e3a857" />
        <ellipse cx="-8" cy="-9" rx="10" ry="6" fill="#f0c27b" />
        <path d="M-22 -6 H22 L16 8 H-16 Z" fill="#a0692f" />
      </g>

      <!-- braccia col bicchiere, davanti al tavolo -->
      <g v-for="d in seated" :key="`arm-${d.x}`" :transform="d.transform">
        <g class="arm" :style="{ animationDelay: d.toastDelay }">
          <line x1="28" y1="196" x2="44" y2="262" :stroke="d.shirt" stroke-width="15" stroke-linecap="round" />
          <g class="glass" :style="{ animationDelay: d.toastDelay }">
            <line x1="44" y1="240" x2="44" y2="264" stroke="#dfe8ee" stroke-width="2.5" />
            <path d="M33 220 Q33 242 44 242 Q55 242 55 220 Z" fill="rgba(255, 255, 255, 0.55)" />
            <path d="M34.5 229 Q35 241 44 241 Q53 241 53.5 229 Z" fill="#8e1b3a" />
          </g>
          <circle cx="44" cy="256" r="8" :fill="d.skin" />
        </g>
      </g>

      <!-- capotavola: seduti di lato al tavolo, si vedono per intero -->
      <g v-for="d in atEnds" :key="d.x" :transform="d.transform">
        <rect x="-44" y="150" width="88" height="130" rx="10" fill="#8d5a2b" />
        <rect x="-40" y="280" width="8" height="60" fill="#6e4420" />
        <rect x="32" y="280" width="8" height="60" fill="#6e4420" />
        <rect x="-46" y="272" width="92" height="12" rx="3" fill="#6e4420" />
        <rect x="-30" y="258" width="24" height="76" rx="6" fill="#2c3e50" />
        <rect x="6" y="258" width="24" height="76" rx="6" fill="#2c3e50" />
        <ellipse cx="-18" cy="338" rx="15" ry="6" fill="#1b1b1b" />
        <ellipse cx="18" cy="338" rx="15" ry="6" fill="#1b1b1b" />
        <g class="head" :style="{ animationDuration: d.nod, animationDelay: d.delay }">
          <path v-if="d.hair === 'long'" d="M-34 138 C-37 96 37 96 34 138 L37 198 H-37 Z" :fill="d.hairColor" />
        </g>
        <path d="M-38 266 V205 Q-38 180 -12 178 H12 Q38 180 38 205 V266 Z" :fill="d.shirt" />
        <rect x="-8" y="164" width="16" height="18" :fill="d.skin" />
        <g class="head" :style="{ animationDuration: d.nod, animationDelay: d.delay }">
          <circle cy="140" r="30" :fill="d.skin" />
          <path :d="HAIR_SHORT" :fill="d.hairColor" />
          <path
            v-if="d.beard"
            d="M-28 146 Q-26 176 0 178 Q26 176 28 146 Q16 160 0 160 Q-16 160 -28 146 Z"
            :fill="d.hairColor"
          />
          <g class="eyes" :style="{ animationDelay: d.delay }">
            <circle cx="-10" cy="138" r="3.4" fill="#222" />
            <circle cx="10" cy="138" r="3.4" fill="#222" />
          </g>
          <circle cx="-17" cy="150" r="5" fill="#ff7b7b" opacity="0.35" />
          <circle cx="17" cy="150" r="5" fill="#ff7b7b" opacity="0.35" />
          <ellipse
            class="mouth"
            cy="156"
            rx="7"
            ry="4.5"
            fill="#7a2e2e"
            :style="{ animationDuration: d.talk, animationDelay: d.delay }"
          />
        </g>
        <g class="arm" :style="{ animationDelay: d.toastDelay }">
          <line x1="28" y1="196" x2="44" y2="262" :stroke="d.shirt" stroke-width="15" stroke-linecap="round" />
          <g class="glass" :style="{ animationDelay: d.toastDelay }">
            <line x1="44" y1="240" x2="44" y2="264" stroke="#dfe8ee" stroke-width="2.5" />
            <path d="M33 220 Q33 242 44 242 Q55 242 55 220 Z" fill="rgba(255, 255, 255, 0.55)" />
            <path d="M34.5 229 Q35 241 44 241 Q53 241 53.5 229 Z" fill="#8e1b3a" />
          </g>
          <circle cx="44" cy="256" r="8" :fill="d.skin" />
        </g>
      </g>
    </svg>

    <div class="caption">Pausa pranzo a bordo · si riparte alle 14:00</div>
  </div>
</template>

<style scoped>
.lunch {
  /* Mare, parapetto e ponte si agganciano all'altezza del tavolo (0.46 × larghezza),
     così la scena regge sia in orizzontale sia sul telefono. */
  --tw: min(1100px, 96vw);
  --table-bottom: 5%;
  --deck-h: calc(var(--table-bottom) + var(--tw) * 0.22);
  --rail-h: calc(var(--tw) * 0.15);
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 15;
  background: #8f5f33;
}
.sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(#8ecdf0, #d6eefa);
}
.sun {
  position: absolute;
  top: 14%;
  left: 10%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6b0 0%, #ffd54a 60%, #ffb300 100%);
  box-shadow: 0 0 60px 20px rgba(255, 213, 74, 0.5);
}
/* È la nave che dondola: dal ponte si vede l'orizzonte salire e scendere. */
.horizon {
  position: absolute;
  left: -5%;
  right: -5%;
  bottom: var(--deck-h);
  height: calc(var(--rail-h) + 6vh);
  background: linear-gradient(#3f8fc4, #1a5283);
  overflow: hidden;
  animation: rock 7s ease-in-out infinite alternate;
}
.wave-strip {
  position: absolute;
  inset: 0 -200px 0 0;
  background: repeating-linear-gradient(
      90deg,
      transparent 0 60px,
      rgba(255, 255, 255, 0.35) 60px 90px,
      transparent 90px 200px
    )
    0 30% / 100% 3px no-repeat,
    repeating-linear-gradient(
      90deg,
      transparent 0 110px,
      rgba(255, 255, 255, 0.25) 110px 150px,
      transparent 150px 200px
    )
    0 70% / 100% 3px no-repeat;
  animation: waves 6s linear infinite;
}
.rail {
  position: absolute;
  left: 0;
  right: 0;
  bottom: var(--deck-h);
  height: var(--rail-h);
  background:
    linear-gradient(#ffffff, #dfe6ea) top / 100% 12px no-repeat,
    linear-gradient(#eef2f4, #cfd8dd) 0 55% / 100% 8px no-repeat,
    repeating-linear-gradient(90deg, #f4f7f9 0 10px, transparent 10px 110px);
}
.lifebuoy {
  position: absolute;
  top: 15%;
  left: 5%;
  height: min(64px, 75%);
  aspect-ratio: 1;
  border-radius: 50%;
  background: conic-gradient(#e8542f 0 25%, #fff 0 50%, #e8542f 0 75%, #fff 0);
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
    linear-gradient(rgba(0, 0, 0, 0.25), transparent) top / 100% 10px no-repeat,
    repeating-linear-gradient(0deg, #b07a45 0 34px, #8f5f33 34px 36px);
}
.table {
  position: absolute;
  left: 50%;
  bottom: var(--table-bottom);
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
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #0e3a63;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}

.head {
  animation: nod ease-in-out infinite alternate;
  transform-origin: 0 175px;
}
.eyes {
  animation: blink 5s infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.mouth {
  animation: talk ease-in-out infinite;
  transform-box: fill-box;
  transform-origin: center;
}
.steam path {
  animation: steam 2.4s ease-out infinite;
}
/* Brindisi: il braccio si alza dalla spalla e il bicchiere resta dritto. */
.arm {
  animation: toast 12s ease-in-out infinite;
  transform-origin: 28px 196px;
}
.glass {
  animation: level 12s ease-in-out infinite;
  transform-origin: 44px 256px;
}
.cheers {
  font: 800 44px system-ui, sans-serif;
  fill: #fff;
  stroke: #0e3a63;
  stroke-width: 3px;
  paint-order: stroke;
  opacity: 0;
  animation: cheers 12s ease-in-out infinite;
}

@keyframes rock {
  from { transform: translateY(-6px) rotate(-0.8deg); }
  to { transform: translateY(8px) rotate(0.8deg); }
}
@keyframes waves {
  to { transform: translateX(-200px); }
}
@keyframes nod {
  from { transform: rotate(-3deg); }
  to { transform: rotate(3deg); }
}
@keyframes blink {
  0%, 92%, 100% { transform: scaleY(1); }
  96% { transform: scaleY(0.1); }
}
@keyframes talk {
  0%, 100% { transform: scaleY(0.35); }
  50% { transform: scaleY(1); }
}
@keyframes steam {
  0% { transform: translateY(0); opacity: 0; }
  30% { opacity: 0.7; }
  100% { transform: translateY(-14px); opacity: 0; }
}
@keyframes toast {
  0%, 62%, 92%, 100% { transform: rotate(0); }
  70%, 84% { transform: rotate(-120deg); }
  77% { transform: rotate(-112deg); }
}
@keyframes level {
  0%, 62%, 92%, 100% { transform: rotate(0); }
  70%, 84% { transform: rotate(120deg); }
  77% { transform: rotate(112deg); }
}
@keyframes cheers {
  0%, 66%, 90%, 100% { opacity: 0; transform: translateY(10px); }
  72%, 84% { opacity: 1; transform: translateY(0); }
}
</style>
