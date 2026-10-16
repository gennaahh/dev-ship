<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { mineral } from '@dev-city/shared/catalog'
import MineralIcon from './MineralIcon.vue'
import { ago } from './mine.js'

// Il cartellone della miniera, appeso alla parete in alto a sinistra (dentro l'<svg>, in
// coordinate della scena). Alterna da solo la classifica di oggi, della settimana e di sempre
// (per valore delle scoperte) e le ultime scoperte; un clic passa alla prossima.
const props = defineProps({
  // { day, week, all }: righe { name, finds, best, value }; recent: { name, itemId, foundAt },
  // dalla più recente. null finché non arriva.
  board: { type: Object, default: null },
  failed: { type: Boolean, default: false },
  demo: { type: Boolean, default: false },
})

const TABS = [
  { id: 'day', label: 'OGGI' },
  { id: 'week', label: 'SETTIMANA' },
  { id: 'all', label: 'SEMPRE' },
  { id: 'recent', label: 'ULTIME' },
]
const CYCLE_MS = 7000
const ROWS = 5

const tab = ref(0)
// Cambia a ogni giro, anche tornando sulla stessa scheda: fa ripartire barra e animazioni.
const turn = ref(0)
let timer = 0
function next() {
  tab.value = (tab.value + 1) % TABS.length
  turn.value++
  clearInterval(timer)
  timer = setInterval(next, CYCLE_MS)
}
onMounted(() => (timer = setInterval(next, CYCLE_MS)))
onUnmounted(() => clearInterval(timer))

const rows = computed(() => props.board?.[TABS[tab.value].id]?.slice(0, ROWS) ?? [])
const message = computed(() => {
  if (rows.value.length) return ''
  if (props.failed) return 'Cartellone non raggiungibile'
  if (!props.board) return 'Caricamento…'
  return tab.value === 0 ? 'Oggi ancora niente: prendi il piccone!' : 'Ancora nessuna scoperta: scava per primo!'
})
const recent = computed(() => TABS[tab.value].id === 'recent')
const short = (name, max = 14) => (name.length > max ? `${name.slice(0, max - 1)}…` : name)
const nameOf = (id) => mineral(id)?.name ?? id
const MEDALS = ['#ffd54a', '#c9d3e6', '#d9925a']

// Il pannello: x 80-450, y 64-300.
const TAB_X = [100, 168, 278, 360]
const TAB_W = [62, 104, 76, 70]
</script>

<template>
  <g class="board" role="button" tabindex="0" aria-label="Cartellone della miniera: passa alla prossima" @click.stop="next" @keydown.enter.prevent="next">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Appeso a una trave con due catene -->
      <path d="M 150 22 L 150 64 M 380 22 L 380 64" fill="none" stroke="#8e93aa" stroke-width="6" stroke-dasharray="10 6" />
      <rect x="110" y="10" width="310" height="18" rx="6" fill="#a0673a" />
      <!-- Cornice -->
      <rect x="80" y="64" width="370" height="236" rx="16" fill="#6b4a32" stroke-width="6" />
      <circle v-for="i in 8" :key="i" :cx="80 + i * 41 - 4" cy="296" r="6" fill="#ffd54a" class="bulb" :style="{ animationDelay: `${(i % 3) * -0.4}s` }" />
      <rect x="94" y="78" width="342" height="208" rx="8" fill="#2a2238" />
    </g>

    <text x="265" y="106" text-anchor="middle" class="title">{{ recent ? '💎 Ultime scoperte' : '⛏ Classifica della miniera' }}</text>

    <!-- Schede: oggi, settimana, sempre, ultime scoperte -->
    <g v-for="(t, i) in TABS" :key="t.id">
      <rect :x="TAB_X[i]" y="116" :width="TAB_W[i]" height="24" rx="12" :fill="i === tab ? '#ffd54a' : 'rgba(255,255,255,0.12)'" />
      <text :x="TAB_X[i] + TAB_W[i] / 2" y="134" text-anchor="middle" class="tab" :class="{ on: i === tab }">{{ t.label }}</text>
    </g>
    <rect :key="`bar-${turn}`" x="104" y="146" width="322" height="3" rx="1.5" fill="#ffd54a" class="progress" :style="{ animationDuration: `${CYCLE_MS}ms` }" />

    <g :key="`rows-${turn}`">
      <text v-if="message" x="265" y="216" text-anchor="middle" class="empty">{{ message }}</text>
      <g v-for="(r, i) in rows" :key="recent ? `${r.foundAt}-${i}` : r.name" :transform="`translate(0 ${172 + i * 25})`">
        <g v-if="recent" class="row" :style="{ animationDelay: `${i * 0.07}s` }">
          <rect x="102" y="-17" width="326" height="22" rx="7" :fill="(mineral(r.itemId)?.price ?? 0) >= 9 ? 'rgba(255,213,74,0.22)' : 'rgba(255,255,255,0.06)'" />
          <g transform="translate(116 -6) scale(0.36)"><MineralIcon :id="r.itemId" /></g>
          <text x="130" y="0" class="name">{{ short(r.name, 12) }}</text>
          <text x="330" y="0" text-anchor="end" class="item">{{ nameOf(r.itemId) }}</text>
          <text x="420" y="0" text-anchor="end" class="meta">{{ ago(r.foundAt) }}</text>
        </g>
        <g v-else class="row" :style="{ animationDelay: `${i * 0.07}s` }">
          <rect x="102" y="-17" width="326" height="22" rx="7" :fill="i === 0 ? 'rgba(255,213,74,0.22)' : 'rgba(255,255,255,0.06)'" />
          <circle cx="118" cy="-6" r="9" :fill="MEDALS[i] ?? 'rgba(255,255,255,0.15)'" stroke="#2d2a4a" stroke-width="2.5" />
          <text x="118" y="-1" text-anchor="middle" class="rank">{{ i + 1 }}</text>
          <text x="134" y="0" class="name">{{ short(r.name) }}</text>
          <text x="318" y="0" text-anchor="end" class="meta">{{ r.finds }} {{ r.finds === 1 ? 'scoperta' : 'scoperte' }}</text>
          <g v-if="r.best" transform="translate(334 -6) scale(0.36)"><MineralIcon :id="r.best" /></g>
          <text x="420" y="0" text-anchor="end" class="points">🪙{{ r.value }}</text>
        </g>
      </g>
    </g>

    <g v-if="demo" transform="translate(410 74) rotate(10)">
      <rect x="-30" y="-12" width="60" height="24" rx="6" fill="#ff7a59" stroke="#2d2a4a" stroke-width="3" />
      <text x="0" y="6" text-anchor="middle" class="demo">DEMO</text>
    </g>
  </g>
</template>

<style scoped>
.board {
  cursor: pointer;
  outline: none;
}
.board:focus-visible {
  filter: drop-shadow(0 0 10px rgba(255, 245, 160, 0.9));
}
text {
  fill: #fff8e6;
}
.title {
  fill: #ffd54a;
  font-size: 21px;
}
.tab {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.8;
}
.tab.on {
  fill: #2d2a4a;
  opacity: 1;
}
.progress {
  transform-box: fill-box;
  transform-origin: left;
  animation: progress linear forwards;
}
@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.row {
  animation: row-in 0.4s ease-out backwards;
}
@keyframes row-in {
  from { opacity: 0; transform: translateX(-16px); }
}
.rank {
  fill: #2d2a4a;
  font-size: 12px;
}
.name {
  font-size: 15px;
}
.meta {
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 11px;
  opacity: 0.75;
}
.points {
  fill: #ffd54a;
  font-size: 16px;
}
.item {
  fill: #ffd54a;
  font-size: 13px;
}
.empty {
  font-size: 15px;
  opacity: 0.8;
}
.demo {
  font-size: 13px;
}
.bulb {
  animation: bulb 1.2s steps(1) infinite;
}
@keyframes bulb {
  50% { fill: #fff3a8; }
}
</style>
