<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

// Cornice comune degli interni: la scena disegnata riempie lo schermo, sopra c'è il cartello
// col nome del luogo, il pulsante per tornare in città e le idee per quando sarà giocabile.
const props = defineProps({
  place: { type: Object, required: true },
  // Idee di cosa ci sarà dentro: è ancora una bozza.
  plans: { type: Array, default: () => [] },
  // Colore del pannello, intonato all'ambiente.
  tint: { type: String, default: '#2d2a4a' },
})
const emit = defineEmits(['leave'])

// Il pannello resta aperto per INTRO_MS all'ingresso, poi si ripiega sul solo nome per
// lasciare libera la scena: si riapre passandoci sopra col mouse. Sugli schermi touch, dove
// non si passa sopra, il pulsante + lo tiene aperto (e − lo ripiega anche col mouse sopra).
const INTRO_MS = 2000
const intro = ref(true)
const hover = ref(false)
const pinned = ref(false)
const open = computed(() => intro.value || hover.value || pinned.value)
let introTimer = 0

function toggle() {
  if (open.value) {
    intro.value = hover.value = pinned.value = false
    clearTimeout(introTimer)
  } else {
    pinned.value = true
  }
}
// Solo il mouse: un tocco sullo schermo manda anche pointerenter, e aprirebbe il pannello.
const onEnter = (e) => {
  if (e.pointerType === 'mouse') hover.value = true
}
const onLeave = (e) => {
  if (e.pointerType === 'mouse') hover.value = false
}

// Da ripiegato è largo quanto il nome (a 30px, vedi .card.folded h1) più il margine per il
// pulsante: si misura per far scorrere la larghezza, che con width: auto non si animerebbe.
const title = ref(null)
const foldedWidth = ref(null)
function measure() {
  const h1 = title.value
  if (!h1) return
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.font = `30px ${getComputedStyle(h1).fontFamily}`
  // 60 + 22 di padding, 5 + 5 di bordo.
  foldedWidth.value = Math.ceil(ctx.measureText(props.place.name).width) + 94
}

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
  introTimer = setTimeout(() => (intro.value = false), INTRO_MS)
  measure()
  // Il font del titolo può arrivare dopo: si rimisura.
  document.fonts?.ready.then(measure)
})
onUnmounted(() => {
  removeEventListener('keydown', onKey)
  clearTimeout(introTimer)
})
</script>

<template>
  <div ref="root" class="interior" tabindex="-1">
    <div class="art">
      <slot />
    </div>

    <button class="back" @click="emit('leave')">← Torna in città</button>

    <div
      class="card"
      :class="{ folded: !open }"
      :style="{ '--tint': tint, '--folded-width': foldedWidth ? `${foldedWidth}px` : null }"
      @pointerenter="onEnter"
      @pointerleave="onLeave"
    >
      <span class="draft">BOZZA</span>
      <button
        class="fold"
        :aria-expanded="open"
        :aria-label="open ? 'Ripiega il pannello' : 'Apri il pannello'"
        @click="toggle"
      >
        {{ open ? '−' : '+' }}
      </button>
      <h1 ref="title">{{ place.name }}</h1>
      <div class="more" :inert="!open">
        <div>
          <p class="tagline">{{ place.tagline }}</p>
          <ul v-if="plans.length">
            <li v-for="p in plans" :key="p">{{ p }}</li>
          </ul>
        </div>
      </div>
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
  transition:
    width 0.35s ease,
    padding 0.35s ease;
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
  /* Senza misura (es. prima del primo frame) resta larga: si ripiega solo in altezza. */
  width: min(var(--folded-width, 380px), calc(100% - 32px));
  padding: 10px 22px 12px 60px;
}
.card.folded h1 {
  font-size: 30px;
}
/* Il resto del pannello scorre in altezza (da 1fr a 0fr) e sfuma. Il contenuto ha la larghezza
   del pannello aperto, così il testo non va a capo di nuovo mentre si stringe. */
.more {
  display: grid;
  grid-template-rows: 1fr;
  overflow: hidden;
  transition: grid-template-rows 0.35s ease;
}
.more > div {
  width: calc(min(380px, 100vw - 32px) - 54px);
  min-height: 0;
  transition: opacity 0.25s ease;
}
.folded .more {
  grid-template-rows: 0fr;
}
.folded .more > div {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .card,
  .card h1,
  .more,
  .more > div {
    transition: none;
  }
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
  white-space: nowrap;
  transition: font-size 0.35s ease;
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
