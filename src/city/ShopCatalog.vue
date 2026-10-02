<script setup>
import { onMounted, ref } from 'vue'
import Avatar from './Avatar.vue'
import { COLORS, HATS } from './avatar.js'

// Catalogo dello shop della piazza. Comprare non si può ancora (mancano monete e salvataggio
// del look): si provano colori e cappelli sull'anteprima, il proprio personaggio non cambia.
const props = defineProps({
  look: { type: Object, required: true },
})
const emit = defineEmits(['close'])

const dialog = ref(null)
const preview = ref({ ...props.look })

const tryColor = (c) => (preview.value = { ...preview.value, color: c.value })
const tryHat = (h) => (preview.value = { ...preview.value, hat: preview.value.hat === h.id ? null : h.id })

onMounted(() => dialog.value.showModal())
// Esc chiude il catalogo e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="shop" aria-labelledby="shop-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="shop-title">Shop della piazza</h2>
      <span class="soon">PRESTO</span>
      <button class="x" aria-label="Chiudi lo shop" @click="emit('close')">✕</button>
    </header>

    <div class="body">
      <div class="preview">
        <svg viewBox="-70 -150 140 175" aria-hidden="true">
          <Avatar :look="preview" />
        </svg>
        <p>Prova pure: per comprare serviranno le monete, in arrivo.</p>
      </div>

      <div class="items">
        <h3>Colori</h3>
        <div class="colors">
          <button
            v-for="c in COLORS"
            :key="c.id"
            class="swatch"
            :class="{ on: preview.color === c.value }"
            :style="{ background: c.value }"
            :title="`${c.name} · ${c.price ? `${c.price} monete` : 'gratis'}`"
            :aria-label="c.name"
            @click="tryColor(c)"
          />
        </div>

        <h3>Cappelli</h3>
        <div class="hats">
          <button v-for="h in HATS" :key="h.id" class="hat" :class="{ on: preview.hat === h.id }" @click="tryHat(h)">
            <svg viewBox="-55 -135 110 100" aria-hidden="true">
              <Avatar :look="{ color: preview.color, hat: h.id }" />
            </svg>
            <span class="hat-name">{{ h.name }}</span>
            <span class="price">🪙 {{ h.price }}</span>
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.shop {
  width: min(760px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  box-sizing: border-box;
  padding: 18px 22px 22px;
  border: 5px solid #2d2a4a;
  border-radius: 20px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.shop::backdrop {
  background: rgba(45, 42, 74, 0.55);
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
h2 {
  margin: 0;
  font-size: 30px;
  font-weight: normal;
  color: #e0457b;
  text-shadow: 0 3px 0 #2d2a4a33;
}
.soon {
  padding: 3px 10px;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #ff7a59;
  color: #fff8e6;
  font-size: 15px;
  rotate: -4deg;
}
.x {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}
.body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 20px;
}
.preview {
  padding: 12px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 40%, #fff 0 30%, #ffe3ec 70%);
  text-align: center;
}
.preview svg {
  width: 100%;
  height: 230px;
  overflow: visible;
}
.preview p {
  margin: 6px 0 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.35;
}
h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: normal;
}
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}
.swatch {
  width: 40px;
  height: 40px;
  border: 4px solid #2d2a4a;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.swatch:hover,
.swatch.on {
  transform: scale(1.12);
}
.swatch.on {
  box-shadow: 0 0 0 4px #fff8e6, 0 0 0 8px #e0457b;
}
.hats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 10px;
}
.hat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 8px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  cursor: pointer;
  transition: transform 0.15s ease;
}
.hat:hover {
  transform: translateY(-2px);
}
.hat.on {
  background: #ffe3ec;
  border-color: #e0457b;
}
.hat svg {
  width: 100%;
  height: 80px;
}
.hat-name {
  font-size: 15px;
}
.price {
  margin-top: 2px;
  font-size: 14px;
  color: #9c6332;
}
@media (max-width: 600px) {
  .body {
    grid-template-columns: 1fr;
  }
  .preview svg {
    height: 160px;
  }
}
</style>
