<script setup>
import { NOTE_COLORS } from './office.js'
import Icon from '../../components/Icon.vue'

// La bacheca delle missioni appesa alla parete, in fondo a sinistra, da mettere dentro l'<svg>
// dell'ufficio (coordinate della scena): da lontano si vedono i foglietti, colore e premio. Un
// clic la avvicina (open), e da vicino la si legge e si prendono le missioni (MissionBoard).
defineProps({
  // Le missioni da fare, come le dà la bacheca ({ slot, difficulty, title, reward }), o null.
  missions: { type: Array, default: null },
  // La propria missione in corso è pronta da consegnare: un segno sulla cornice.
  ready: { type: Boolean, default: false },
})
const emit = defineEmits(['open'])
const open = (e) => {
  e?.stopPropagation()
  emit('open')
}
// I quattro foglietti, 2 × 2, appena storti.
const NOTES = [
  { x: 150, y: 168, r: -3 },
  { x: 345, y: 164, r: 2 },
  { x: 152, y: 268, r: 1.5 },
  { x: 342, y: 270, r: -2 },
]
const short = (t) => (t.length > 18 ? `${t.slice(0, 17)}…` : t)
</script>

<template>
  <g class="wallboard" role="button" tabindex="0" aria-label="Bacheca delle missioni: guardala da vicino" @click="open" @keydown.enter.prevent="open" @keydown.space.prevent="open">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
      <rect x="112" y="112" width="436" height="270" rx="14" fill="#a0673a" />
      <rect x="112" y="112" width="436" height="270" rx="14" fill="none" class="halo" stroke="#ffd54a" stroke-width="10" />
      <rect x="126" y="126" width="408" height="242" rx="8" fill="#c98f5a" />
      <!-- Il cartello in cima -->
      <rect x="250" y="92" width="160" height="36" rx="8" fill="#fff8e6" />
      <text x="330" y="118" text-anchor="middle" class="title" stroke="none">MISSIONI</text>
      <circle v-if="ready" cx="404" cy="96" r="12" fill="#9ccc65" stroke-width="3" />
      <Icon v-if="ready" name="check" :x="396" :y="88" :size="16" style="color: #2d2a4a" />
    </g>
    <g v-for="(n, i) in NOTES" :key="i" :transform="`rotate(${n.r} ${n.x + 82} ${n.y + 42})`">
      <template v-if="missions?.[i]">
        <rect :x="n.x" :y="n.y" width="164" height="84" rx="4" :fill="NOTE_COLORS[missions[i].difficulty]" stroke="#2d2a4a" stroke-width="4" />
        <circle :cx="n.x + 82" :cy="n.y + 2" r="7" fill="#e8453c" stroke="#2d2a4a" stroke-width="3" />
        <text :x="n.x + 12" :y="n.y + 34" class="note-title">{{ short(missions[i].title) }}</text>
        <Icon name="coin" :x="n.x + 10" :y="n.y + 49" :size="21" />
        <text :x="n.x + 35" :y="n.y + 66" class="note-reward">{{ missions[i].reward.gold }}</text>
        <template v-if="missions[i].reward.items.dungeon_ticket">
          <text :x="n.x + 86" :y="n.y + 66" class="note-reward">+</text>
          <Icon name="ticket" :x="n.x + 100" :y="n.y + 47" :size="26" />
        </template>
      </template>
      <rect v-else :x="n.x" :y="n.y" width="164" height="84" rx="4" fill="#fff8e6" opacity="0.4" stroke="#2d2a4a" stroke-width="3" stroke-dasharray="8 6" />
    </g>
    <text x="330" y="404" text-anchor="middle" class="hint">Clicca per leggerla</text>
  </g>
</template>

<style scoped>
.wallboard {
  cursor: zoom-in;
  outline: none;
}
.title {
  fill: #2d2a4a;
  font-size: 22px;
  letter-spacing: 2px;
}
.note-title {
  fill: #2d2a4a;
  font-size: 17px;
}
.note-reward {
  fill: #2d2a4a;
  font-size: 19px;
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
.wallboard:hover .halo,
.wallboard:focus-visible .halo,
.wallboard:hover .hint,
.wallboard:focus-visible .hint {
  opacity: 1;
}
</style>
