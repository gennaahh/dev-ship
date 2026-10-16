<script setup>
import { TROPHIES } from '@dev-city/shared/trophies'

// La bacheca dei trofei, in fondo a destra contro la parete, da mettere dentro l'<svg> del museo
// (coordinate della scena; i piedi sono a y 520): una vetrina di legno e vetro con tre ripiani.
// I trofei (packages/shared/src/trophies.ts) stanno sui ripiani da sinistra a destra, dall'alto;
// per ora non ce n'è nessuno, e sui ripiani ci sono solo i piedistalli vuoti. Un clic la avvicina.
const emit = defineEmits(['open'])
const open = (e) => {
  e?.stopPropagation()
  emit('open')
}
// I ripiani (y del piano) e i posti su ognuno (x del centro).
const SHELVES = [236, 336, 436]
const SLOTS = [1272, 1345, 1418]
const spots = SHELVES.flatMap((y) => SLOTS.map((x) => ({ x, y })))
</script>

<template>
  <g class="case" role="button" tabindex="0" aria-label="Bacheca dei trofei: guardala da vicino" @click="open" @keydown.enter.prevent="open" @keydown.space.prevent="open">
    <ellipse cx="1345" cy="522" rx="170" ry="12" fill="#2d2a4a" opacity="0.16" />
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
      <!-- Il mobile: cappello, fianchi e zoccolo -->
      <rect x="1200" y="130" width="290" height="390" rx="10" fill="#8a5432" />
      <rect x="1200" y="130" width="290" height="390" rx="10" fill="none" class="halo" stroke="#ffd54a" stroke-width="10" />
      <rect x="1188" y="116" width="314" height="26" rx="6" fill="#a0673a" />
      <rect x="1216" y="156" width="258" height="300" rx="4" fill="#d9eef8" />
      <rect x="1206" y="462" width="278" height="50" rx="6" fill="#a0673a" />
      <circle cx="1345" cy="487" r="7" fill="#ffd54a" stroke-width="3" />
      <!-- I ripiani, coi piedistalli -->
      <g v-for="y in SHELVES" :key="y">
        <rect x="1216" :y="y" width="258" height="10" fill="#c98a4b" stroke-width="3" />
      </g>
      <g v-for="(s, i) in spots" :key="i">
        <template v-if="!TROPHIES[i]">
          <path :d="`M ${s.x - 18} ${s.y} L ${s.x - 14} ${s.y - 14} L ${s.x + 14} ${s.y - 14} L ${s.x + 18} ${s.y} Z`" fill="#b3541e" stroke-width="3" />
          <rect :x="s.x - 14" :y="s.y - 18" width="28" height="5" rx="2" fill="#c0392b" stroke-width="2" />
        </template>
      </g>
      <!-- Il vetro: due ante con i riflessi -->
      <path d="M 1345 156 L 1345 456" fill="none" stroke-width="4" />
      <path d="M 1236 180 L 1270 156 M 1236 214 L 1300 168 M 1362 300 L 1420 258 M 1362 330 L 1400 304" fill="none" stroke="#fff" stroke-width="5" opacity="0.7" />
    </g>
    <!-- Il cartellino sulla vetrina, finché è vuota -->
    <g v-if="!TROPHIES.length" transform="translate(1345 296) rotate(-4)">
      <rect x="-92" y="-22" width="184" height="40" rx="8" fill="#fff8e6" stroke="#2d2a4a" stroke-width="4" />
      <text y="4" text-anchor="middle" class="card">Presto i trofei!</text>
    </g>
    <text x="1345" y="100" text-anchor="middle" class="hint">Clicca per guardare</text>
  </g>
</template>

<style scoped>
.case {
  cursor: zoom-in;
  outline: none;
}
.card {
  fill: #2d2a4a;
  font-size: 20px;
}
.halo,
.hint {
  opacity: 0;
  transition: opacity 0.2s ease;
}
.hint {
  fill: #2d2a4a;
  font-size: 18px;
}
.case:hover .halo,
.case:focus-visible .halo,
.case:hover .hint,
.case:focus-visible .hint {
  opacity: 1;
}
</style>
