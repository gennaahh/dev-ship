<script setup>
import { computed } from 'vue'
import Avatar from '../city/Avatar.vue'
import Seagulls from './Seagulls.vue'

// Al timone della dev-ship: i primi tre della classifica della settimana, col loro look. Il primo
// tiene la ruota del timone, il secondo e il terzo gli stanno ai lati, girati verso di lui, ognuno
// col cartellino del nome e dei punti. La dev-ship ci zooma sopra ogni tanto, mentre naviga.
const props = defineProps({
  // [{ name, points, look }], dal primo; anche meno di tre.
  crew: { type: Array, required: true },
})

// Dove stanno nel viewBox (1000 × 460): x, piedi, misura, verso dove guardano e il cartellino.
const SPOTS = [
  { x: 500, y: 446, scale: 2.1, dir: 1, tag: 150, medal: '#ffd54a', label: '1°' },
  { x: 250, y: 452, scale: 1.75, dir: 1, tag: 220, medal: '#c9d3e6', label: '2°' },
  { x: 750, y: 452, scale: 1.75, dir: -1, tag: 220, medal: '#d9925a', label: '3°' },
]
const crew = computed(() => props.crew.slice(0, 3).map((p, i) => ({ ...p, ...SPOTS[i] })))
const SPOKES = Array.from({ length: 8 }, (_, i) => i * 45)
const short = (name) => (name.length > 16 ? `${name.slice(0, 15)}…` : name)
</script>

<template>
  <div class="helm">
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

    <svg class="crew" viewBox="0 0 1000 460" xmlns="http://www.w3.org/2000/svg" aria-label="Al timone, i primi tre della settimana">
      <!-- La bandierina sull'albero, dietro -->
      <g stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round">
        <rect x="904" y="20" width="10" height="300" fill="#8f5f33" />
        <path class="flag" d="M 914 26 L 990 44 L 914 64 Z" fill="#ff7a59" />
      </g>

      <!-- Chi c'è, dal secondo e il terzo ai lati al primo in mezzo -->
      <g v-for="p in [...crew].reverse()" :key="p.name">
        <g :transform="`translate(${p.x} ${p.y}) scale(${p.scale})`">
          <Avatar :look="p.look" :dir="p.dir" />
        </g>
      </g>

      <!-- La ruota del timone, davanti al primo, sul suo piedistallo -->
      <g v-if="crew.length" stroke="#2d2a4a" stroke-linejoin="round" stroke-linecap="round">
        <path d="M 480 462 L 487 426 L 513 426 L 520 462 Z" fill="#8f5f33" stroke-width="4" />
        <g class="wheel">
          <g v-for="a in SPOKES" :key="a" :transform="`rotate(${a} 500 416)`">
            <path d="M 500 416 L 500 340" stroke="#a0673a" stroke-width="9" />
            <path d="M 500 348 L 500 330" stroke="#c98a4b" stroke-width="11" />
          </g>
          <circle cx="500" cy="416" r="64" fill="none" stroke-width="15" />
          <circle cx="500" cy="416" r="64" fill="none" stroke="#c98a4b" stroke-width="9" />
          <circle cx="500" cy="416" r="16" fill="#ffd54a" stroke-width="4" />
        </g>
      </g>

      <!-- I cartellini: posto, nome e punti -->
      <g v-for="p in crew" :key="`tag-${p.name}`" :transform="`translate(${p.x} ${p.tag})`">
        <rect x="-110" y="-34" width="220" height="44" rx="12" fill="#fff8e6" stroke="#2d2a4a" stroke-width="4" />
        <circle cx="-86" cy="-12" r="16" :fill="p.medal" stroke="#2d2a4a" stroke-width="3" />
        <text x="-86" y="-6" text-anchor="middle" class="rank">{{ p.label }}</text>
        <text x="-62" y="-16" class="who">{{ short(p.name) }}</text>
        <text x="-62" y="4" class="pts">{{ p.points }} punti</text>
      </g>
    </svg>
    <div class="caption">Al timone questa settimana: i primi 3 della classifica</div>
  </div>
</template>

<style scoped>
.helm {
  /* Mare, parapetto e ponte si agganciano all'altezza della scena (0.46 × larghezza), come a
     pranzo, così regge sia in orizzontale sia sul telefono. */
  --tw: min(1100px, 96cqw);
  --bottom: 5%;
  --deck-h: calc(var(--bottom) + var(--tw) * 0.16);
  --rail-h: calc(var(--tw) * 0.15);
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 15;
  background: #8f5f33;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(#8ecdf0, #d6eefa);
}
.sun {
  position: absolute;
  top: 12%;
  right: 12%;
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
  height: calc(var(--rail-h) + 6cqh);
  background: linear-gradient(#3f8fc4, #1a5283);
  overflow: hidden;
  animation: rock 7s ease-in-out infinite alternate;
}
.wave-strip {
  position: absolute;
  inset: 0 -200px 0 0;
  background:
    repeating-linear-gradient(90deg, transparent 0 60px, rgba(255, 255, 255, 0.35) 60px 90px, transparent 90px 200px) 0 30% / 100% 3px no-repeat,
    repeating-linear-gradient(90deg, transparent 0 110px, rgba(255, 255, 255, 0.25) 110px 150px, transparent 150px 200px) 0 70% / 100% 3px no-repeat;
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
.crew {
  position: absolute;
  left: 50%;
  bottom: var(--bottom);
  width: var(--tw);
  height: auto;
  transform: translateX(-50%);
  overflow: visible;
}
/* Il timone gira piano di qua e di là: si tiene la rotta. */
.wheel {
  transform-origin: 500px 416px;
  animation: steer 6s ease-in-out infinite alternate;
}
.flag {
  transform-origin: 914px 44px;
  animation: flap 1.4s ease-in-out infinite alternate;
}
.rank {
  fill: #2d2a4a;
  font-size: 15px;
}
.who {
  fill: #2d2a4a;
  font-size: 20px;
}
.pts {
  fill: #b3541e;
  font-size: 16px;
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
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
}
@keyframes rock {
  from { transform: translateY(-6px) rotate(-0.8deg); }
  to { transform: translateY(8px) rotate(0.8deg); }
}
@keyframes waves {
  to { transform: translateX(-200px); }
}
@keyframes steer {
  from { transform: rotate(-14deg); }
  to { transform: rotate(14deg); }
}
@keyframes flap {
  from { transform: scaleX(1); }
  to { transform: scaleX(0.82); }
}
@media (prefers-reduced-motion: reduce) {
  .horizon,
  .wave-strip,
  .wheel,
  .flag {
    animation: none;
  }
}
</style>
