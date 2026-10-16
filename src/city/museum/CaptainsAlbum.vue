<script setup>
import { computed } from 'vue'
import CaptainPortrait from './CaptainPortrait.vue'
import { weekLabel } from './museum.js'

// L'albo dei capitani visto da vicino, sopra la scena del museo (che ci ha zoomato sopra): tutti
// i quadri, dal più recente, ognuno con la settimana e il podio coi punti. close: ci si allontana
// (anche con Esc o un clic fuori, lo gestisce il museo).
const props = defineProps({
  // { weeks: [{ weekStart, wins, podium: [{ rank, name, points, look }] }], demo? } o null.
  album: { type: Object, default: null },
  failed: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const weeks = computed(() => props.album?.weeks ?? [])
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
</script>

<template>
  <section class="album" aria-labelledby="album-title" @click.stop>
    <header>
      <button class="close" aria-label="Allontanati dall'albo" @click="emit('close')">← Torna alla sala</button>
      <h2 id="album-title">Albo dei capitani</h2>
      <span v-if="album?.demo" class="demo">DEMO</span>
    </header>
    <p class="intro">Ogni lunedì, quando la nave riparte, il podio della settimana prima diventa un quadro. Le stelle sulla cornice sono le vittorie del capitano.</p>

    <p v-if="!weeks.length" class="empty">
      {{ failed ? 'L\'albo non è raggiungibile.' : !album ? 'Caricamento…' : 'Ancora nessun quadro: il primo si appende lunedì, col podio di questa settimana.' }}
    </p>
    <ul v-else class="frames">
      <li v-for="w in weeks" :key="w.weekStart" class="frame">
        <svg viewBox="-24 -32 348 266" aria-hidden="true"><CaptainPortrait :podium="w.podium" :wins="w.wins" /></svg>
        <h3>Settimana del {{ weekLabel(w.weekStart) }}</h3>
        <ol class="podium">
          <li v-for="p in w.podium" :key="p.rank" :class="`rank-${p.rank}`">
            <span class="medal" aria-hidden="true">{{ MEDALS[p.rank] }}</span>
            <span class="name">{{ p.name }}</span>
            <span class="pts">{{ p.points }} pt</span>
          </li>
        </ol>
        <p v-if="w.wins > 1" class="wins">★ {{ w.wins }}ª vittoria di {{ w.podium[0].name }}</p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.album {
  position: absolute;
  top: 84px;
  left: 50%;
  translate: -50% 0;
  width: min(1040px, calc(100% - 32px));
  max-height: calc(100% - 200px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 16px 20px 20px;
  border: 10px solid #a0673a;
  outline: 4px solid #2d2a4a;
  border-radius: 16px;
  background: #f3ead2;
  box-shadow: 0 8px 0 #2d2a4a;
  color: #2d2a4a;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}
h2 {
  margin: 0;
  font-size: 30px;
  font-weight: normal;
  color: #b3541e;
  text-shadow: 0 3px 0 #2d2a4a22;
}
.demo {
  padding: 2px 10px;
  border: 3px solid #ff7a59;
  border-radius: 8px;
  color: #ff7a59;
  font-size: 16px;
  rotate: 6deg;
}
button {
  font: inherit;
  cursor: pointer;
}
.close {
  padding: 2px 12px 4px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
}
.close:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.intro,
.empty {
  margin: 8px 0 14px;
  color: #6b5a40;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.empty {
  padding: 30px 0;
  font-size: 17px;
  text-align: center;
}
.frames {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 18px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.frame {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fffaf0;
}
.frame svg {
  width: 100%;
  height: auto;
}
h3 {
  margin: 0;
  font-size: 18px;
  font-weight: normal;
  text-align: center;
}
.podium {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.podium li {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 15px;
}
.podium .rank-1 {
  background: #ffe9b0;
}
.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pts {
  color: #b3541e;
  font-variant-numeric: tabular-nums;
}
.wins {
  margin: 0;
  color: #b3541e;
  font-size: 14px;
  text-align: center;
}
@media (max-width: 720px) {
  .album {
    top: 160px;
    max-height: max(240px, calc(100% - 160px - 380px));
  }
}
</style>
