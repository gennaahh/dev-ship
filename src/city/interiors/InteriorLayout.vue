<script setup>
import { onMounted, onUnmounted } from 'vue'

// Cornice comune degli interni: la scena disegnata riempie lo schermo, sopra c'è il cartello
// col nome del luogo, il pulsante per tornare in città e le idee per quando sarà giocabile.
defineProps({
  place: { type: Object, required: true },
  // Idee di cosa ci sarà dentro: è ancora una bozza.
  plans: { type: Array, default: () => [] },
  // Colore del pannello, intonato all'ambiente.
  tint: { type: String, default: '#2d2a4a' },
})
const emit = defineEmits(['leave'])

const onKey = (e) => {
  if (e.key === 'Escape') emit('leave')
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))
</script>

<template>
  <div class="interior">
    <div class="art">
      <slot />
    </div>

    <button class="back" @click="emit('leave')">← Torna in città</button>

    <div class="card" :style="{ '--tint': tint }">
      <span class="draft">BOZZA</span>
      <h1>{{ place.name }}</h1>
      <p class="tagline">{{ place.tagline }}</p>
      <ul v-if="plans.length">
        <li v-for="p in plans" :key="p">{{ p }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.interior {
  position: fixed;
  inset: 0;
  z-index: 100;
  overflow: hidden;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  background: #2d2a4a;
}
.art {
  position: absolute;
  inset: 0;
}
.art > :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
.back {
  position: absolute;
  top: 16px;
  left: 16px;
  padding: 10px 16px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #ffd54a;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}
.back:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.card {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: min(380px, calc(100% - 32px));
  box-sizing: border-box;
  padding: 18px 22px 20px;
  border: 5px solid #2d2a4a;
  border-radius: 18px;
  background: color-mix(in srgb, var(--tint) 88%, transparent);
  box-shadow: 0 6px 0 #2d2a4a;
  color: #fff8e6;
}
.draft {
  position: absolute;
  top: -18px;
  right: 18px;
  padding: 4px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 10px;
  background: #ff7a59;
  color: #fff8e6;
  font-size: 16px;
  rotate: 6deg;
}
h1 {
  margin: 0;
  font-size: 40px;
  font-weight: normal;
  color: #ffd54a;
  text-shadow: 0 4px 0 #2d2a4a;
}
.tagline {
  margin: 4px 0 0;
  font-size: 18px;
  opacity: 0.9;
}
ul {
  margin: 14px 0 0;
  padding: 12px 0 0 20px;
  border-top: 3px dashed rgba(255, 248, 230, 0.35);
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 15px;
  line-height: 1.45;
}
li + li {
  margin-top: 4px;
}
</style>
