<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { FISH_SOUP, RARITY_NAMES, recipe, SPECIAL_KG, SPECIAL_MULTIPLIER } from '@dev-city/shared/catalog'
import { SOUP_BELOW } from '@dev-city/shared/dungeon'
import MaterialIcon from '../city/dungeon/MaterialIcon.vue'
import TicketBottle from '../city/dungeon/TicketBottle.vue'
import Fish from '../city/fishing/Fish.vue'
import { formatKg } from '../city/fishing/lake.js'
import { useInventory } from '../composables/useInventory.js'
import SoupBowl from './SoupBowl.vue'

// L'inventario del giocatore: le monete d'oro, i pesci presi, da vendere, quello che serve per il
// dungeon (zuppe dal crafting, tasto R, e ticket dalla pesca) e i materiali portati via dal
// dungeon. Si apre dallo zainetto in alto a destra o col tasto I. Cappelli e colori si
// indossano dalla finestra del personaggio (tasto C).
const emit = defineEmits(['close'])

const inventory = useInventory()
const { fish, soups, tickets, materials, gold, busy, error } = inventory
const soup = recipe(FISH_SOUP)

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
        <div class="section-head">
          <h3>Per il dungeon</h3>
          <button class="small cook" @click="inventory.open.value = 'craft'">Cucina zuppe</button>
        </div>
        <ul class="grid">
          <li class="card" :class="{ none: !tickets }">
            <svg viewBox="-50 -60 100 115" aria-hidden="true"><TicketBottle /></svg>
            <span class="item-name">Ticket in bottiglia</span>
            <span class="weight">× {{ tickets }}</span>
            <span class="tag">Per una run</span>
          </li>
          <li class="card" :class="{ none: !soups }">
            <svg viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl :steam="soups > 0" /></svg>
            <span class="item-name">{{ soup.name }}</span>
            <span class="weight">× {{ soups }}</span>
            <span class="heal" :title="`Nel dungeon si beve da sola sotto i ${SOUP_BELOW} HP`">❤ Cura {{ soup.heal }} HP</span>
          </li>
        </ul>
        <p v-if="!tickets" class="empty">I ticket si ripescano al lago: una volta su 15 col pesce sale una bottiglia.</p>
        <p v-else-if="!soups" class="empty">Col crafting <kbd>R</kbd> 3 pesci diventano una zuppa: nel dungeon allunga la run.</p>
      </section>

      <section>
        <h3>Materiali</h3>
        <ul class="grid materials">
          <li v-for="m in materials" :key="m.id" class="card material" :class="[m.rarity, { none: !m.quantity }]" :title="`${RARITY_NAMES[m.rarity]} · per ${m.use === 'armor' ? 'le armature' : 'le armi'}`">
            <svg viewBox="-34 -34 68 68" aria-hidden="true"><MaterialIcon :id="m.id" /></svg>
            <span class="item-name">{{ m.name }}</span>
            <span class="weight">× {{ m.quantity }}</span>
          </li>
        </ul>
        <p class="empty">Li lasciano i mostri del dungeon: serviranno per armi e armature.</p>
      </section>

      <p class="hint">Cappelli e colori si indossano dalla finestra del personaggio <kbd>C</kbd></p>
    </div>
  </dialog>
</template>

<style scoped>
.inventory {
  width: min(700px, calc(100% - 32px));
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
  color: #e0782f;
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
h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
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
.sell-all {
  background: #9ccc65;
}
.sell-all.confirming {
  background: #ff7a59;
  color: #fff8e6;
}
.empty,
.hint {
  margin: 0;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.empty kbd,
.hint kbd {
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 12px;
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
  max-height: 420px;
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
.heal {
  margin-top: 4px;
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #ff8a9a;
  font-size: 13px;
}
.cook {
  background: #ff9a4a;
}
.tag {
  margin-top: 4px;
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #e6defc;
  font-size: 13px;
}
.card.none {
  opacity: 0.55;
}
.materials {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  margin: 8px 0;
}
.material svg {
  height: 44px;
}
.material.uncommon {
  background: #d8f3ff;
}
.material.rare {
  background: #f1dcff;
}
.sell {
  margin-top: 4px;
  background: #9ccc65;
  white-space: nowrap;
}
@media (max-width: 640px) {
  /* Qui scorre già tutta la finestra. */
  .fish-grid {
    max-height: none;
    overflow: visible;
  }
  kbd,
  .hint {
    display: none;
  }
}
</style>
