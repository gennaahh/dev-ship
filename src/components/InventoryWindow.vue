<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { SPECIAL_KG, SPECIAL_MULTIPLIER } from '@dev-city/shared/catalog'
import { authClient, displayName } from '../auth.js'
import Avatar from '../city/Avatar.vue'
import { COLORS, HATS, lookOf } from '../city/avatar.js'
import Fish from '../city/fishing/Fish.vue'
import { formatKg } from '../city/fishing/lake.js'
import { useInventory } from '../composables/useInventory.js'

// L'inventario del giocatore, tutto in una finestra: a sinistra il personaggio con quello che
// indossa, a destra i pesci (da vendere per monete d'oro), i cappelli e i colori (da indossare).
// Si apre dal personaggio in alto a destra o col tasto I.
const emit = defineEmits(['close'])

const session = authClient.useSession()
const name = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : ''
})
const inventory = useInventory()
const { equipment, fish, gold, busy, error } = inventory
const look = computed(() => lookOf(name.value, equipment.value))

const hats = computed(() => HATS.filter(inventory.owns))
const colors = computed(() => COLORS.filter(inventory.owns))
const hat = computed(() => HATS.find((h) => h.id === equipment.value.hat) ?? null)
const color = computed(() => COLORS.find((c) => c.id === equipment.value.color) ?? null)

const wear = (slot, id) => inventory.equip(slot, equipment.value[slot] === id ? null : id)

// "Vendi tutti" chiede conferma: un secondo clic entro qualche secondo.
const total = computed(() => fish.value.reduce((sum, f) => sum + f.price, 0))
const confirming = ref(false)
let confirmTimer = 0
function sellAll() {
  if (!confirming.value) {
    confirming.value = true
    confirmTimer = setTimeout(() => (confirming.value = false), 3000)
    return
  }
  clearTimeout(confirmTimer)
  confirming.value = false
  inventory.sell(fish.value.map((f) => f.id))
}
// Più grossi i pesci più pesanti, senza uscire dalla carta.
const fishScale = (kg) => 0.7 + Math.min(kg, 20) / 80

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
onUnmounted(() => clearTimeout(confirmTimer))
// Esc chiude l'inventario e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="inventory" aria-labelledby="inventory-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="inventory-title">Inventario</h2>
      <span class="gold" title="Monete d'oro">🪙 {{ gold }}</span>
      <kbd title="Si apre e chiude anche col tasto I">I</kbd>
      <button class="x" aria-label="Chiudi l'inventario" @click="emit('close')">✕</button>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="body">
      <section class="me">
        <svg viewBox="-70 -150 140 175" aria-hidden="true">
          <Avatar :look="look" />
        </svg>
        <p class="who">{{ name }}</p>
        <h3>Equipaggiamento</h3>
        <div class="slot">
          <span class="slot-icon">
            <svg v-if="hat" viewBox="-55 -135 110 100" aria-hidden="true"><Avatar :look="{ color: look.color, hat: hat.id }" /></svg>
            <span v-else class="empty-slot" aria-hidden="true">🎩</span>
          </span>
          <span class="slot-text">
            <small>Cappello</small>
            {{ hat?.name ?? 'Nessuno' }}
          </span>
          <button v-if="hat" class="small" :disabled="busy" @click="inventory.equip('hat', null)">Togli</button>
        </div>
        <div class="slot">
          <span class="slot-icon">
            <span class="dot" :style="{ background: look.color }" aria-hidden="true" />
          </span>
          <span class="slot-text">
            <small>Colore</small>
            {{ color?.name ?? 'Il tuo di sempre' }}
          </span>
          <button v-if="color" class="small" :disabled="busy" @click="inventory.equip('color', null)">Togli</button>
        </div>
      </section>

      <div class="bag">
        <section>
          <div class="section-head">
            <h3>Pesci <span class="count">{{ fish.length }}</span></h3>
            <button v-if="fish.length > 1" class="small sell-all" :class="{ confirming }" :disabled="busy" @click="sellAll">
              {{ confirming ? 'Sicuro?' : 'Vendi tutti' }} · 🪙 {{ total }}
            </button>
          </div>
          <p v-if="!fish.length" class="empty">Nessun pesce: siediti a una sedia della zona di pesca e aspetta che abbocchi.</p>
          <ul v-else class="grid fish-grid">
            <li v-for="f in fish" :key="f.id" class="card">
              <svg viewBox="-68 -36 136 72" aria-hidden="true">
                <Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" />
              </svg>
              <span class="item-name">{{ f.species.name }}</span>
              <span class="weight">{{ formatKg(f.weightKg) }}</span>
              <span v-if="f.weightKg >= SPECIAL_KG" class="special" :title="`Pesce speciale: vale ${SPECIAL_MULTIPLIER} volte tanto`">Speciale ×{{ SPECIAL_MULTIPLIER }}</span>
              <button class="small sell" :disabled="busy" @click="inventory.sell([f.id])">Vendi · 🪙 {{ f.price }}</button>
            </li>
          </ul>
        </section>

        <section>
          <h3>Cappelli <span class="count">{{ hats.length }}</span></h3>
          <p v-if="!hats.length" class="empty">Nessun cappello: si comprano allo shop della piazza, con le monete dei pesci.</p>
          <div v-else class="grid">
            <button v-for="h in hats" :key="h.id" class="card wearable" :class="{ on: equipment.hat === h.id }" :disabled="busy" @click="wear('hat', h.id)">
              <svg viewBox="-55 -135 110 100" aria-hidden="true"><Avatar :look="{ color: look.color, hat: h.id }" /></svg>
              <span class="item-name">{{ h.name }}</span>
              <span class="state">{{ equipment.hat === h.id ? 'Indossato ✓' : 'Indossa' }}</span>
            </button>
          </div>
        </section>

        <section>
          <h3>Colori <span class="count">{{ colors.length }}</span></h3>
          <div class="colors">
            <button
              v-for="c in colors"
              :key="c.id"
              class="swatch"
              :class="{ on: equipment.color === c.id }"
              :style="{ background: c.value }"
              :title="equipment.color === c.id ? `${c.name} (indossato)` : `Indossa ${c.name}`"
              :aria-label="c.name"
              :aria-pressed="equipment.color === c.id"
              :disabled="busy"
              @click="wear('color', c.id)"
            />
          </div>
        </section>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.inventory {
  width: min(860px, calc(100% - 32px));
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
.inventory::backdrop {
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
  color: #6b4bd8;
  text-shadow: 0 3px 0 #2d2a4a33;
}
.gold {
  padding: 3px 12px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  font-size: 18px;
  font-variant-numeric: tabular-nums;
}
kbd {
  padding: 1px 7px 3px;
  border: 2px solid #2d2a4a;
  border-bottom-width: 4px;
  border-radius: 7px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  opacity: 0.7;
}
button {
  font: inherit;
  cursor: pointer;
}
button:disabled {
  cursor: progress;
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
  font-size: 18px;
}
.error {
  margin: -4px 0 12px;
  color: #c0262d;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
}
.body {
  display: grid;
  grid-template-columns: 230px 1fr;
  gap: 20px;
}
.me {
  align-self: start;
  padding: 12px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: radial-gradient(circle at 50% 30%, #fff 0 20%, #e6defc 60%);
}
.me > svg {
  width: 100%;
  height: 190px;
  overflow: visible;
}
.who {
  margin: 4px 0 10px;
  overflow: hidden;
  font-size: 20px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: normal;
}
.count {
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #2d2a4a;
  color: #fff8e6;
  font-size: 14px;
}
.slot {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
}
.slot-icon {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
}
.slot-icon svg {
  width: 100%;
  height: 100%;
}
.empty-slot {
  font-size: 22px;
  opacity: 0.25;
}
.dot {
  width: 26px;
  height: 26px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
}
.slot-text {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.15;
}
.slot-text small {
  color: #6b6890;
  font-size: 12px;
}
.small {
  flex: none;
  padding: 3px 10px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  box-shadow: 0 2px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 14px;
}
.small:active {
  translate: 0 2px;
  box-shadow: none;
}
.bag {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.section-head h3 {
  margin: 0;
}
.sell-all {
  background: #9ccc65;
}
.sell-all.confirming {
  background: #ff7a59;
  color: #fff8e6;
}
.empty {
  margin: 0;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
/* Tanti pesci: la lista scorre, il resto della finestra resta lì. */
.fish-grid {
  max-height: 330px;
  overflow-y: auto;
  padding: 2px 4px 6px 2px;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 8px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
}
.card svg {
  width: 100%;
  height: 60px;
}
.item-name {
  font-size: 15px;
  text-align: center;
}
.weight {
  color: #6b6890;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.special {
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #ffd54a;
  font-size: 13px;
}
.sell {
  margin-top: 4px;
  background: #9ccc65;
  white-space: nowrap;
}
.wearable {
  transition: transform 0.15s ease;
}
.wearable:hover {
  transform: translateY(-2px);
}
.wearable.on {
  border-color: #6b4bd8;
  background: #e6defc;
}
.state {
  color: #6b4bd8;
  font-size: 14px;
}
.colors {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.swatch {
  width: 40px;
  height: 40px;
  border: 4px solid #2d2a4a;
  border-radius: 50%;
  transition: transform 0.15s ease;
}
.swatch:hover,
.swatch.on {
  transform: scale(1.12);
}
.swatch.on {
  box-shadow: 0 0 0 4px #fff8e6, 0 0 0 8px #6b4bd8;
}
@media (max-width: 640px) {
  .body {
    grid-template-columns: 1fr;
  }
  .me > svg {
    height: 140px;
  }
  /* Qui scorre già tutta la finestra. */
  .fish-grid {
    max-height: none;
    overflow: visible;
  }
  kbd {
    display: none;
  }
}
</style>
