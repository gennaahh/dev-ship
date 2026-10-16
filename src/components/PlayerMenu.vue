<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTrade } from '../composables/useTrade.js'

// Il menu del tasto destro su un altro giocatore, dove si è cliccato (vedi useTrade().menu).
// Per ora una voce sola: chiedergli uno scambio. Si chiude cliccando fuori o con Esc.
const trade = useTrade()
const el = ref(null)
const MARGIN = 8
// Non esce dallo schermo: vicino ai bordi si apre dall'altra parte.
const style = computed(() => {
  const { x, y } = trade.menu.value
  return { left: `${Math.min(x, innerWidth - 220 - MARGIN)}px`, top: `${Math.min(y, innerHeight - 110 - MARGIN)}px` }
})

const close = () => (trade.menu.value = null)
const onPointer = (e) => !el.value?.contains(e.target) && close()
const onKey = (e) => {
  if (e.key !== 'Escape') return
  e.preventDefault()
  close()
}
onMounted(() => {
  addEventListener('pointerdown', onPointer, true)
  addEventListener('keydown', onKey, true)
  addEventListener('resize', close)
  el.value.querySelector('button')?.focus()
})
onUnmounted(() => {
  removeEventListener('pointerdown', onPointer, true)
  removeEventListener('keydown', onKey, true)
  removeEventListener('resize', close)
})
</script>

<template>
  <div ref="el" class="player-menu" role="menu" :aria-label="trade.menu.value.name" :style="style" @contextmenu.prevent>
    <p class="who">{{ trade.menu.value.name }}</p>
    <button role="menuitem" @click="trade.request(trade.menu.value.id)">🤝 Richiedi scambio</button>
  </div>
</template>

<style scoped>
.player-menu {
  position: fixed;
  z-index: 300;
  width: 220px;
  box-sizing: border-box;
  padding: 8px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.who {
  margin: 0 4px 6px;
  overflow: hidden;
  color: #6b6890;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
button {
  display: block;
  width: 100%;
  padding: 6px 10px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  color: #2d2a4a;
  font: inherit;
  font-size: 16px;
  text-align: left;
  cursor: pointer;
}
button:hover,
button:focus-visible {
  background: #ffe27a;
}
</style>
