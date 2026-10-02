<script setup>
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Bacheca kanban con i task dello sprint, da spostare tra le colonne.',
  'Calendario delle riunioni: una riunione evitata vale doppio.',
  'La macchinetta del caffè dà un bonus per la mattina.',
]
const columns = [
  { title: 'TODO', notes: ['#ffe082', '#ffe082', '#ffab91'] },
  { title: 'DOING', notes: ['#80deea', '#ffe082'] },
  { title: 'DONE', notes: ['#a5d6a7', '#a5d6a7', '#a5d6a7', '#a5d6a7'] },
]
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#2f4d85" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#dfe8f5" />
      <rect y="620" width="1600" height="280" fill="#b0bfd6" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M -10 620 L 1610 620" fill="none" />
        <!-- Finestra sulla città -->
        <rect x="1060" y="120" width="420" height="300" rx="10" fill="#8ecdf0" />
        <path d="M 1060 340 Q 1160 300 1270 340 T 1480 330 L 1480 420 L 1060 420 Z" fill="#74c264" stroke-width="5" />
        <path d="M 1270 120 L 1270 420 M 1060 270 L 1480 270" fill="none" stroke-width="10" />
        <!-- Kanban -->
        <rect x="120" y="100" width="640" height="380" rx="14" fill="#fff8e6" />
        <g v-for="(col, ci) in columns" :key="col.title">
          <text :x="200 + ci * 200" y="150" text-anchor="middle" class="col-title" fill="#2d2a4a" stroke="none">{{ col.title }}</text>
          <rect
            v-for="(n, ni) in col.notes"
            :key="ni"
            :x="150 + ci * 200 + (ni % 2) * 52"
            :y="176 + Math.floor(ni / 2) * 90 + (ni % 2) * 12"
            width="90"
            height="72"
            :fill="n"
            stroke-width="4"
            :transform="`rotate(${(ni % 3) - 1} ${195 + ci * 200} ${210 + ni * 40})`"
          />
        </g>
        <path d="M 320 130 L 320 460 M 520 130 L 520 460" fill="none" stroke="#c9d3dc" stroke-width="4" />
        <!-- Orologio -->
        <circle cx="900" cy="170" r="60" fill="#fff8e6" />
        <path d="M 900 170 L 900 128" fill="none" class="hand" />
        <path d="M 900 170 L 930 170" fill="none" />
        <!-- Scrivanie -->
        <g v-for="x in [180, 640]" :key="x">
          <rect :x="x" y="580" width="360" height="30" rx="6" fill="#c07d45" />
          <rect :x="x + 20" y="610" width="20" height="160" fill="#a0673a" />
          <rect :x="x + 320" y="610" width="20" height="160" fill="#a0673a" />
          <rect :x="x + 100" y="430" width="180" height="120" rx="10" fill="#4b4870" />
          <rect :x="x + 112" y="442" width="156" height="96" rx="4" fill="#2d3a5c" />
          <path :d="`M ${x + 126} 466 h 60 M ${x + 126} 488 h 90 M ${x + 140} 510 h 50`" fill="none" stroke="#7dff8a" stroke-width="5" class="code" />
          <rect :x="x + 170" y="550" width="40" height="30" fill="#4b4870" />
        </g>
        <!-- Macchinetta del caffè -->
        <rect x="1180" y="440" width="140" height="300" rx="12" fill="#ff7a59" />
        <rect x="1200" y="470" width="100" height="70" rx="6" fill="#2d2a4a" />
        <text x="1250" y="515" text-anchor="middle" class="col-title" fill="#ffd54a" stroke="none">☕</text>
        <rect x="1215" y="600" width="70" height="80" rx="6" fill="#2d2a4a" />
        <path d="M 1236 660 L 1238 640 L 1262 640 L 1264 660 Z" fill="#fff8e6" stroke-width="4" />
        <!-- Pianta -->
        <path d="M 1440 780 L 1450 700 L 1530 700 L 1540 780 Z" fill="#c07d45" />
        <circle cx="1470" cy="660" r="44" fill="#4fae55" />
        <circle cx="1520" cy="640" r="36" fill="#4fae55" />
      </g>
    </svg>
  </InteriorLayout>
</template>

<style scoped>
.col-title {
  font: 28px 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.hand {
  transform-origin: 900px 170px;
  animation: tick 60s steps(60) infinite;
}
@keyframes tick {
  to { transform: rotate(360deg); }
}
.code {
  stroke-dasharray: 100;
  animation: type 2.5s steps(10) infinite;
}
@keyframes type {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}
</style>
