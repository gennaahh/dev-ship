<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RECIPES } from '@dev-city/shared/catalog'
import { SOUP_BELOW } from '@dev-city/shared/dungeon'
import Fish from '../city/fishing/Fish.vue'
import { formatKg } from '../city/fishing/lake.js'
import { useInventory } from '../composables/useInventory.js'
import SoupBowl from './SoupBowl.vue'

// Il crafting: a sinistra le ricette, a destra quella scelta con gli ingredienti che usa e cosa
// ne esce. Si apre dalla pentola in alto a destra o col tasto R. Per ora c'è la zuppa di pesce:
// 3 pesci, i più leggeri (come li sceglie l'API), e la zuppa va nell'inventario.
const emit = defineEmits(['close'])

const inventory = useInventory()
const { fish, soups, busy, error } = inventory

const selected = ref(RECIPES[0])
// I pesci che finiscono in pentola: i più leggeri, a parità di peso il più vecchio.
const lightest = computed(() =>
  [...fish.value].sort((a, b) => a.weightKg - b.weightKg || a.id - b.id).slice(0, selected.value.fish),
)
const missing = computed(() => selected.value.fish - lightest.value.length)
const fishScale = (kg) => 0.55 + Math.min(kg, 20) / 100

// Dopo ogni zuppa un "+1" sale sulla scodella.
const cooked = ref(0)
let cookedTimer = 0
async function cook() {
  if (!(await inventory.craft(selected.value.id))) return
  cooked.value++
  clearTimeout(cookedTimer)
  cookedTimer = setTimeout(() => (cooked.value = 0), 1500)
}

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
onUnmounted(() => clearTimeout(cookedTimer))
// Esc chiude la finestra e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="crafting" aria-labelledby="crafting-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="crafting-title">Crafting</h2>
      <kbd title="Si apre e chiude anche col tasto R">R</kbd>
      <button class="x" aria-label="Chiudi il crafting" @click="emit('close')">✕</button>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="body">
      <section class="recipes">
        <h3>Ricette</h3>
        <button v-for="r in RECIPES" :key="r.id" class="recipe" :class="{ on: selected.id === r.id }" :aria-pressed="selected.id === r.id" @click="selected = r">
          <svg viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl :steam="false" /></svg>
          <span class="recipe-text">
            {{ r.name }}
            <small>{{ r.fish }} pesci</small>
          </span>
        </button>
      </section>

      <section class="detail">
        <h3>{{ selected.name }}</h3>
        <div class="formula">
          <div class="ingredients">
            <span class="label">Ingredienti <small>hai {{ fish.length }} {{ fish.length === 1 ? 'pesce' : 'pesci' }}</small></span>
            <ul>
              <li v-for="f in lightest" :key="f.id" class="slot" :title="`${f.species.name}, ${formatKg(f.weightKg)}`">
                <svg viewBox="-68 -36 136 72" aria-hidden="true">
                  <Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" />
                </svg>
                <span class="weight">{{ formatKg(f.weightKg) }}</span>
              </li>
              <li v-for="n in missing" :key="`missing-${n}`" class="slot missing">
                <span aria-hidden="true">?</span>
                <span class="weight">pesce</span>
              </li>
            </ul>
          </div>
          <span class="arrow" aria-hidden="true">➜</span>
          <div class="result">
            <svg viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl /></svg>
            <span v-if="cooked" :key="cooked" class="plus" aria-hidden="true">+1</span>
            <span class="heal">❤ Cura {{ selected.heal }} HP</span>
          </div>
        </div>

        <p class="note">Nel dungeon si beve da sola quando scendi sotto i {{ SOUP_BELOW }} HP, e la run dura di più: più ondate, più monete e materiali. Il cuoco usa i pesci più leggeri: quelli grossi e gli speciali restano da vendere.</p>

        <div class="actions">
          <button class="cook" :disabled="busy || missing > 0" @click="cook">
            {{ missing > 0 ? `Mancano ${missing} ${missing === 1 ? 'pesce' : 'pesci'}` : 'Cucina' }}
          </button>
          <span class="owned" aria-live="polite">Nell'inventario: <strong>{{ soups }}</strong> {{ soups === 1 ? 'zuppa' : 'zuppe' }}</span>
        </div>
      </section>
    </div>
  </dialog>
</template>

<style scoped>
.crafting {
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
.crafting::backdrop {
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
  color: #d8513a;
  text-shadow: 0 3px 0 #2d2a4a33;
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
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: normal;
}
.body {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
}
.recipes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recipes h3 {
  margin: 0;
}
.recipe {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 16px;
  text-align: left;
}
.recipe.on {
  background: #ffe9b0;
}
.recipe svg {
  flex: none;
  width: 44px;
  height: 44px;
}
.recipe-text {
  display: flex;
  flex-direction: column;
}
.recipe-text small {
  color: #6b6890;
  font-size: 13px;
}
.detail {
  padding: 14px 16px 16px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: radial-gradient(circle at 80% 30%, #fff 0 15%, #ffe2c8 70%);
}
.formula {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ingredients {
  flex: 1;
  min-width: 0;
}
.label {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
}
.label small {
  margin-left: 4px;
  color: #6b6890;
  font-size: 13px;
}
.ingredients ul {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 84px;
  padding: 4px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
}
.slot svg {
  width: 100%;
  height: 48px;
}
.slot.missing {
  border-style: dashed;
  background: #fff8e6;
  color: #6b6890;
  font-size: 30px;
}
.weight {
  color: #6b6890;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.arrow {
  flex: none;
  font-size: 28px;
}
.result {
  position: relative;
  display: flex;
  flex: none;
  flex-direction: column;
  align-items: center;
  width: 130px;
}
.result svg {
  width: 110px;
  height: 100px;
}
.heal {
  padding: 1px 10px 3px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ff8a9a;
  font-size: 14px;
  white-space: nowrap;
}
.plus {
  position: absolute;
  top: 10px;
  color: #3b8f2a;
  font-size: 26px;
  text-shadow: 0 2px 0 #fff;
  animation: plus 1.4s ease-out forwards;
  pointer-events: none;
}
@keyframes plus {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: 0 -40px;
  }
}
.note {
  margin: 14px 0;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}
.cook {
  padding: 6px 22px 8px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #9ccc65;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 20px;
}
.cook:active:not(:disabled) {
  translate: 0 3px;
  box-shadow: none;
}
.cook:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
.owned {
  font-size: 15px;
}
@media (max-width: 640px) {
  .body {
    grid-template-columns: 1fr;
  }
  .formula {
    flex-direction: column;
    align-items: stretch;
  }
  .arrow {
    align-self: center;
    rotate: 90deg;
  }
  .result {
    align-self: center;
  }
  kbd {
    display: none;
  }
}
</style>
