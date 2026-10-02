<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

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

// Il pannello si può ripiegare sul solo nome, per lasciare libera la scena.
// Sui telefoni parte ripiegato: lì sta in alto, sopra la scena.
const open = ref(!matchMedia('(max-width: 720px)').matches)

// Entrando, il focus resta sul pulsante del luogo nella città, qui sotto: lo si porta
// sull'interno, così Invio apre la chat invece di cliccarlo di nuovo.
const root = ref(null)

const onKey = (e) => {
  // defaultPrevented: Esc già usato da altri (es. per chiudere la finestra del login).
  if (e.key === 'Escape' && !e.defaultPrevented) emit('leave')
}
onMounted(() => {
  addEventListener('keydown', onKey)
  root.value.focus({ preventScroll: true })
})
onUnmounted(() => removeEventListener('keydown', onKey))
</script>

<template>
  <div ref="root" class="interior" tabindex="-1">
    <div class="art">
      <slot />
    </div>

    <button class="back" @click="emit('leave')">← Torna in città</button>

    <div class="card" :class="{ folded: !open }" :style="{ '--tint': tint }">
      <span class="draft">BOZZA</span>
      <button
        class="fold"
        :aria-expanded="open"
        :aria-label="open ? 'Ripiega il pannello' : 'Apri il pannello'"
        @click="open = !open"
      >
        {{ open ? '−' : '+' }}
      </button>
      <h1>{{ place.name }}</h1>
      <template v-if="open">
        <p class="tagline">{{ place.tagline }}</p>
        <ul v-if="plans.length">
          <li v-for="p in plans" :key="p">{{ p }}</li>
        </ul>
      </template>
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
  outline: none;
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
/* Quando l'account e le spie lasciano il centro (.hud in App.vue) il pannello sale sopra
   di loro; sui telefoni, dove in basso ci sono anche la chat, va sotto al pulsante per tornare. */
@media (max-width: 1240px) {
  .card {
    bottom: 72px;
  }
}
@media (max-width: 720px) {
  .card {
    top: 96px;
    bottom: auto;
  }
}
.card.folded {
  width: auto;
  padding: 10px 22px 12px 60px;
}
.card.folded h1 {
  font-size: 30px;
}
.fold {
  position: absolute;
  top: -18px;
  left: 18px;
  width: 34px;
  height: 34px;
  padding: 0 0 3px;
  border: 4px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  color: #2d2a4a;
  font: inherit;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
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
