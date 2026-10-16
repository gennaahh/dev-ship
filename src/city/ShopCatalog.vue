<script setup>
import { computed, onMounted, ref } from 'vue'
import { useInventory } from '../composables/useInventory.js'
import { BACKEND_ENABLED } from '../config.js'
import Avatar from './Avatar.vue'
import { COLORS, HATS, lookOf } from './avatar.js'

// Catalogo dello shop della piazza: si provano colori e cappelli sull'anteprima e, da loggati,
// si comprano con le monete d'oro e si indossano. Senza login (o senza backend) si prova soltanto.
const props = defineProps({
  // Il nome del giocatore, null senza login.
  name: { type: String, default: null },
})
const emit = defineEmits(['close'])

const inventory = useInventory()
const { equipment, gold, busy, error } = inventory
const canBuy = computed(() => props.name !== null && inventory.ready.value)

const dialog = ref(null)
// Cosa si sta provando, come l'equipaggiamento: id del catalogo, null = niente.
const preview = ref({ ...equipment.value })
const look = computed(() => lookOf(props.name, preview.value))

const toggle = (slot, id) => (preview.value = { ...preview.value, [slot]: preview.value[slot] === id ? null : id })

// Quello che si sta provando e non si indossa ancora: da indossare, o prima da comprare.
const changes = computed(() =>
  ['color', 'hat']
    .filter((slot) => preview.value[slot] !== equipment.value[slot])
    .map((slot) => {
      const item = (slot === 'hat' ? HATS : COLORS).find((i) => i.id === preview.value[slot]) ?? null
      const label = item?.name ?? (slot === 'hat' ? 'Senza cappello' : 'Il tuo colore di sempre')
      return { slot, item, label, owned: !item || inventory.owns(item) }
    }),
)
async function apply({ slot, item, owned }) {
  if (!owned && !(await inventory.buy(item.id))) return
  await inventory.equip(slot, item?.id ?? null)
}

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
      <span v-if="canBuy" class="gold" title="Monete d'oro">🪙 {{ gold }}</span>
      <span v-else class="soon">SOLO PROVA</span>
      <button class="x" aria-label="Chiudi lo shop" @click="emit('close')">✕</button>
    </header>

    <div class="body">
      <div class="preview">
        <svg viewBox="-70 -150 140 175" aria-hidden="true">
          <Avatar :look="look" />
        </svg>
        <template v-if="canBuy">
          <ul v-if="changes.length" class="changes">
            <li v-for="c in changes" :key="c.slot">
              <span>{{ c.label }}</span>
              <button v-if="c.owned" class="buy" :disabled="busy" @click="apply(c)">Indossa</button>
              <button v-else-if="gold >= c.item.price" class="buy" :disabled="busy" @click="apply(c)">Compra · 🪙 {{ c.item.price }}</button>
              <span v-else class="short">Mancano 🪙 {{ c.item.price - gold }}</span>
            </li>
          </ul>
          <p v-else>È il tuo look. Scegli un colore o un cappello per provarlo.</p>
          <p v-if="error" class="error" role="alert">{{ error }}</p>
        </template>
        <p v-else-if="BACKEND_ENABLED">Prova pure: per comprare serve il login, e le monete si guadagnano vendendo i pesci.</p>
        <p v-else>Prova pure: per comprare serviranno le monete, in arrivo.</p>
      </div>

      <div class="items">
        <h3>Colori</h3>
        <div class="colors">
          <button
            v-for="c in COLORS"
            :key="c.id"
            class="swatch"
            :class="{ on: preview.color === c.id }"
            :style="{ background: c.value }"
            :title="`${c.name} · ${canBuy && inventory.owns(c) ? 'tuo' : c.price ? `${c.price} monete` : 'gratis'}`"
            :aria-label="c.name"
            @click="toggle('color', c.id)"
          />
        </div>

        <h3>Cappelli</h3>
        <div class="hats">
          <button v-for="h in HATS" :key="h.id" class="hat" :class="{ on: preview.hat === h.id }" @click="toggle('hat', h.id)">
            <svg viewBox="-55 -135 110 100" aria-hidden="true">
              <Avatar :look="{ color: look.color, hat: h.id }" />
            </svg>
            <span class="hat-name">{{ h.name }}</span>
            <span v-if="canBuy && inventory.owns(h)" class="price owned">{{ equipment.hat === h.id ? 'Indossato ✓' : 'Tuo ✓' }}</span>
            <span v-else class="price">🪙 {{ h.price }}</span>
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
.gold {
  padding: 3px 12px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
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
.preview .error {
  color: #c0262d;
  font-weight: 600;
}
.changes {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0 0;
  padding: 0;
  list-style: none;
  text-align: left;
}
.changes li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 15px;
}
.buy {
  flex: none;
  padding: 3px 10px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #9ccc65;
  box-shadow: 0 2px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}
.buy:active {
  translate: 0 2px;
  box-shadow: none;
}
.buy:disabled {
  cursor: progress;
}
.short {
  flex: none;
  color: #c0262d;
  font-size: 14px;
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
.price.owned {
  color: #6b4bd8;
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
