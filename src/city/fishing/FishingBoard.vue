<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatKg, speciesFor } from './lake.js'
import Icon from '../../components/Icon.vue'

// Il cartellone della classifica, in alto a sinistra nella zona di pesca (dentro l'<svg>,
// in coordinate della scena). Alterna da solo oggi, settimana, sempre e gli ultimi pesci presi;
// un clic passa alla prossima.
const props = defineProps({
  // { day, week, all }: righe { name, fish, biggestKg, points }; recent: { name, weightKg,
  // caughtAt }, dal più recente. null finché non arriva.
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
  if (props.failed) return 'Classifica non raggiungibile'
  if (!props.board) return 'Caricamento…'
  return tab.value === 0 ? 'Oggi ancora niente: siediti e sii il primo!' : 'Ancora nessun pesce: siediti e sii il primo!'
})
const recent = computed(() => TABS[tab.value].id === 'recent')
const short = (name, max = 14) => (name.length > max ? `${name.slice(0, max - 1)}…` : name)
const MEDALS = ['#ffd54a', '#c9d3e6', '#d9925a']

// Quanto tempo fa, a grandi linee. Si ricalcola a ogni giro del cartellone.
function ago(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (min < 1) return 'ora'
  if (min < 60) return `${min} min fa`
  if (min < 24 * 60) return `${Math.floor(min / 60)} h fa`
  return `${Math.floor(min / (24 * 60))} g fa`
}

// Il pannello: x 80-450, y 64-300.
const TAB_X = [100, 168, 278, 360]
const TAB_W = [62, 104, 76, 70]
</script>

<template>
  <g class="board" role="button" tabindex="0" aria-label="Classifica della pesca: passa alla prossima" @click.stop="next" @keydown.enter.prevent="next">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Pali -->
      <ellipse cx="140" cy="350" rx="30" ry="8" fill="#2d2a4a" stroke="none" opacity="0.16" />
      <ellipse cx="390" cy="350" rx="30" ry="8" fill="#2d2a4a" stroke="none" opacity="0.16" />
      <rect x="128" y="290" width="24" height="60" fill="#7a4a2a" />
      <rect x="378" y="290" width="24" height="60" fill="#7a4a2a" />
      <path d="M 140 302 L 390 340 M 390 302 L 140 340" fill="none" stroke="#7a4a2a" stroke-width="8" />
      <!-- Cornice -->
      <rect x="80" y="64" width="370" height="236" rx="16" fill="#4b4870" stroke-width="6" />
      <circle v-for="i in 8" :key="i" :cx="80 + i * 41 - 4" cy="54" r="7" fill="#fff3a8" class="bulb" :style="{ animationDelay: `${(i % 3) * -0.4}s` }" />
      <rect x="94" y="78" width="342" height="208" rx="8" fill="#1f2a5c" />
    </g>

    <Icon name="rod" :x="104" :y="87" :size="24" ink="#fff8e6" />
    <text x="265" y="106" text-anchor="middle" class="title">{{ recent ? 'Ultimi pesci presi' : 'Classifica della pesca' }}</text>

    <!-- Schede: oggi, settimana, sempre, ultime catture -->
    <g v-for="(t, i) in TABS" :key="t.id">
      <rect :x="TAB_X[i]" y="116" :width="TAB_W[i]" height="24" rx="12" :fill="i === tab ? '#ffd54a' : 'rgba(255,255,255,0.12)'" />
      <text :x="TAB_X[i] + TAB_W[i] / 2" y="134" text-anchor="middle" class="tab" :class="{ on: i === tab }">{{ t.label }}</text>
    </g>
    <rect :key="`bar-${turn}`" x="104" y="146" width="322" height="3" rx="1.5" fill="#ffd54a" class="progress" :style="{ animationDuration: `${CYCLE_MS}ms` }" />

    <g :key="`rows-${turn}`">
      <text v-if="message" x="265" y="216" text-anchor="middle" class="empty">{{ message }}</text>
      <g v-for="(r, i) in rows" :key="recent ? `${r.caughtAt}-${i}` : r.name" :transform="`translate(0 ${172 + i * 25})`">
        <g v-if="recent" class="row" :style="{ animationDelay: `${i * 0.07}s` }">
          <rect x="102" y="-17" width="326" height="22" rx="7" :fill="r.weightKg >= 5 ? 'rgba(255,213,74,0.22)' : 'rgba(255,255,255,0.06)'" />
          <path d="M 112 -6 C 116 -13 126 -13 132 -6 C 126 1 116 1 112 -6 Z M 113 -6 L 107 -11 L 107 -1 Z" :fill="speciesFor(r.weightKg).color" stroke="#2d2a4a" stroke-width="2" stroke-linejoin="round" />
          <text x="138" y="0" class="name">{{ short(r.name, 12) }}</text>
          <text x="316" y="0" text-anchor="end" class="species">{{ speciesFor(r.weightKg).name.split(' ')[0] }} <tspan class="kg">{{ formatKg(r.weightKg) }}</tspan></text>
          <text x="420" y="0" text-anchor="end" class="meta">{{ ago(r.caughtAt) }}</text>
        </g>
        <g v-else class="row" :style="{ animationDelay: `${i * 0.07}s` }">
        <rect x="102" y="-17" width="326" height="22" rx="7" :fill="i === 0 ? 'rgba(255,213,74,0.22)' : 'rgba(255,255,255,0.06)'" />
        <circle cx="118" cy="-6" r="9" :fill="MEDALS[i] ?? 'rgba(255,255,255,0.15)'" stroke="#2d2a4a" stroke-width="2.5" />
        <text x="118" y="-1" text-anchor="middle" class="rank">{{ i + 1 }}</text>
        <text x="134" y="0" class="name">{{ short(r.name) }}</text>
        <text x="330" y="0" text-anchor="end" class="meta">{{ r.fish }} {{ r.fish === 1 ? 'pesce' : 'pesci' }} · {{ formatKg(r.biggestKg) }}</text>
        <text x="420" y="0" text-anchor="end" class="points">{{ r.points }}</text>
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
.species {
  font-size: 13px;
  opacity: 0.85;
}
.kg {
  fill: #ffd54a;
  font-size: 15px;
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
  50% { fill: #ffd54a; }
}
</style>
