<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { DUNGEON_TICKET, FISH_SOUP, HATS, itemName } from '@dev-city/shared/catalog'
import Fish from '../city/fishing/Fish.vue'
import { formatKg, speciesFor } from '../city/fishing/lake.js'
import { useInventory } from '../composables/useInventory.js'
import { useTrade } from '../composables/useTrade.js'
import ItemIcon from './ItemIcon.vue'
import Icon from './Icon.vue'

// La finestra dello scambio, per tutti e due i giocatori: a sinistra la propria offerta (monete,
// pesci e oggetti scelti dal proprio inventario: zuppe, ticket, materiali, minerali, armi,
// armature e cappelli), a destra quella dell'altro. Poi la doppia
// conferma: "Pronto" blocca le offerte, quando lo sono tutti e due si passa al controllo finale
// e a "Conferma scambio". Ogni cambio di offerta toglie le conferme di tutti e due.
// Finito lo scambio, mostra cosa si è dato e ricevuto.
const trade = useTrade()
const inventory = useInventory()
const t = trade.trade
const done = trade.done

// La propria offerta si cambia qui e si manda al server dopo un attimo; quella che torna dal
// server (controllata) la rimette a posto se qualcosa non c'era.
const draft = reactive({ gold: 0, fish: [], items: {} })
let sendTimer = 0
function changed() {
  clearTimeout(sendTimer)
  sendTimer = setTimeout(() => {
    sendTimer = 0
    trade.offer({ gold: draft.gold || 0, fish: [...draft.fish], items: { ...draft.items } })
  }, 300)
}
watch(
  () => t.value?.me.offer,
  (offer) => {
    if (!offer || sendTimer) return
    draft.gold = offer.gold
    draft.fish = offer.fish.map((f) => f.id)
    draft.items = { ...offer.items }
  },
  { immediate: true },
)

const editable = computed(() => t.value && t.value.stage === 'offer' && !t.value.me.ready && !t.value.busy)

// Quello che si ha e non è ancora nell'offerta.
const gold = computed(() => inventory.gold.value)
const freeFish = computed(() => inventory.fish.value.filter((f) => !draft.fish.includes(f.id)))
const stock = computed(() => [
  { id: FISH_SOUP, n: inventory.soups.value },
  { id: DUNGEON_TICKET, n: inventory.tickets.value },
  ...inventory.materials.value.map((m) => ({ id: m.id, n: m.quantity })),
  ...inventory.minerals.value.map((m) => ({ id: m.id, n: m.quantity })),
  ...[...inventory.weapons.value, ...inventory.armors.value, ...inventory.rods.value, ...inventory.pickaxes.value].map((g) => ({ id: g.id, n: g.quantity, worn: inventory.equipment.value[g.slot] === g.id })),
  ...HATS.filter((h) => inventory.owns(h)).map((h) => ({ id: h.id, n: 1, worn: inventory.equipment.value.hat === h.id })),
].map((s) => ({ ...s, left: s.n - (draft.items[s.id] ?? 0) })).filter((s) => s.left > 0))

function setGold(e) {
  const v = Math.floor(Number(e.target.value))
  draft.gold = Number.isFinite(v) ? Math.max(0, Math.min(gold.value, v)) : 0
  e.target.value = draft.gold
  changed()
}
function addFish(id) {
  draft.fish.push(id)
  changed()
}
function addItem(id) {
  draft.items[id] = (draft.items[id] ?? 0) + 1
  changed()
}
function removeFish(id) {
  draft.fish = draft.fish.filter((f) => f !== id)
  changed()
}
function removeItem(id) {
  if (--draft.items[id] <= 0) delete draft.items[id]
  changed()
}

// La propria offerta come si vede: dal draft, coi pesci presi dall'inventario.
const mine = computed(() => ({
  gold: draft.gold,
  fish: draft.fish.map((id) => inventory.fish.value.find((f) => f.id === id) ?? { id, weightKg: 0 }).filter((f) => f.weightKg),
  items: draft.items,
}))
const isEmpty = (o) => !o.gold && !o.fish.length && !Object.keys(o.items).length
const fishScale = (kg) => 0.55 + Math.min(kg, 20) / 100
// Un riassunto in una riga, per il controllo finale e il resoconto.
function summary(o) {
  const parts = []
  if (o.gold) parts.push(`${o.gold} ${o.gold === 1 ? 'moneta' : 'monete'}`)
  if (o.fish.length) parts.push(`${o.fish.length} ${o.fish.length === 1 ? 'pesce' : 'pesci'}`)
  for (const [id, n] of Object.entries(o.items)) parts.push(`${n} × ${itemName(id)}`)
  return parts.join(', ') || 'niente'
}

// Dopo ogni cambio "Pronto" si sblocca dopo qualche secondo: il server dice quanto manca.
const now = ref(Date.now())
const readyAt = ref(0)
watch(t, (v) => v && (readyAt.value = Date.now() + v.readyIn), { immediate: true })
const clock = setInterval(() => (now.value = Date.now()), 250)
const wait = computed(() => Math.ceil(Math.max(0, readyAt.value - now.value) / 1000))

const state = (side) => (side.confirmed ? 'Ha confermato' : side.ready ? 'Pronto' : 'Sta scegliendo…')

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
onUnmounted(() => {
  clearInterval(clock)
  clearTimeout(sendTimer)
})
// Esc annulla lo scambio (o chiude il resoconto), e basta: l'interno non lo usa per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  close()
}
function close() {
  if (t.value) trade.cancel()
  else done.value = null
}
</script>

<template>
  <dialog ref="dialog" class="trade" aria-labelledby="trade-title" @keydown="onKeydown" @cancel.prevent>
    <!-- Lo scambio in corso -->
    <template v-if="t">
      <header>
        <h2 id="trade-title">Scambio con {{ t.them.name }}</h2>
        <button class="x" aria-label="Annulla lo scambio" :disabled="t.busy" @click="close"><Icon name="close" /></button>
      </header>

      <div class="sides">
        <section class="side" :class="{ ready: t.me.ready }">
          <h3>Tu offri <span class="state">{{ state(t.me) }}<Icon v-if="t.me.ready || t.me.confirmed" name="check" /></span></h3>
          <div class="offer">
            <label class="gold-row">
              <Icon name="coin" />
              <input type="number" min="0" :max="gold" :value="draft.gold" :disabled="!editable" aria-label="Monete da offrire" @input="setGold" />
              <small>di {{ gold }}</small>
            </label>
            <ul class="cards">
              <li v-for="f in mine.fish" :key="`f${f.id}`" class="card">
                <svg viewBox="-68 -36 136 72" aria-hidden="true"><Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" /></svg>
                <span>{{ formatKg(f.weightKg) }}</span>
                <button v-if="editable" class="remove" :aria-label="`Togli il pesce da ${formatKg(f.weightKg)}`" @click="removeFish(f.id)"><Icon name="close" /></button>
              </li>
              <li v-for="(n, id) in mine.items" :key="id" class="card">
                <ItemIcon :id="id" />
                <span>{{ itemName(id) }}<b v-if="n > 1"> × {{ n }}</b></span>
                <button v-if="editable" class="remove" :aria-label="`Togli un ${itemName(id)}`" @click="removeItem(id)"><Icon name="close" /></button>
              </li>
            </ul>
            <p v-if="!mine.fish.length && !Object.keys(mine.items).length" class="empty">Scegli qui sotto cosa offrire.</p>
          </div>

          <div v-if="editable" class="stock">
            <h4>Il tuo inventario <small>un clic per aggiungere</small></h4>
            <ul class="cards small">
              <li v-for="s in stock" :key="s.id">
                <button class="card pick" :title="`Aggiungi ${itemName(s.id)}`" @click="addItem(s.id)">
                  <ItemIcon :id="s.id" />
                  <span>{{ itemName(s.id) }}</span>
                  <b>× {{ s.left }}</b>
                  <em v-if="s.worn">indossato</em>
                </button>
              </li>
              <li v-for="f in freeFish" :key="`p${f.id}`">
                <button class="card pick" :title="`Aggiungi ${f.species.name} da ${formatKg(f.weightKg)}`" @click="addFish(f.id)">
                  <svg viewBox="-68 -36 136 72" aria-hidden="true"><Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" /></svg>
                  <span>{{ f.species.name }}</span>
                  <b>{{ formatKg(f.weightKg) }}</b>
                </button>
              </li>
            </ul>
            <p v-if="!stock.length && !freeFish.length" class="empty">Nient'altro da offrire.</p>
          </div>
        </section>

        <section class="side theirs" :class="{ ready: t.them.ready }">
          <h3>{{ t.them.name }} offre <span class="state">{{ state(t.them) }}<Icon v-if="t.them.ready || t.them.confirmed" name="check" /></span></h3>
          <div class="offer">
            <p class="gold-row"><Icon name="coin" /> <strong>{{ t.them.offer.gold }}</strong></p>
            <ul class="cards">
              <li v-for="f in t.them.offer.fish" :key="`f${f.id}`" class="card" :title="speciesFor(f.weightKg).name">
                <svg viewBox="-68 -36 136 72" aria-hidden="true"><Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" /></svg>
                <span>{{ formatKg(f.weightKg) }}</span>
              </li>
              <li v-for="(n, id) in t.them.offer.items" :key="id" class="card">
                <ItemIcon :id="id" />
                <span>{{ itemName(id) }}<b v-if="n > 1"> × {{ n }}</b></span>
              </li>
            </ul>
            <p v-if="!t.them.offer.fish.length && !Object.keys(t.them.offer.items).length" class="empty">Ancora niente oggetti.</p>
          </div>
        </section>
      </div>

      <footer>
        <p v-if="t.busy" class="step">Scambio in corso…</p>
        <template v-else-if="t.stage === 'offer'">
          <p class="step"><b>1 di 2</b> · Quando le offerte vanno bene a tutti e due, premete "Pronto": si bloccano.</p>
          <div class="actions">
            <button v-if="!t.me.ready" class="go" :disabled="wait > 0 || (isEmpty(mine) && isEmpty(t.them.offer))" @click="trade.ready(true)">
              {{ wait > 0 ? `Pronto (${wait})` : 'Pronto' }}
            </button>
            <button v-else class="back" @click="trade.ready(false)">Voglio cambiare</button>
            <button class="cancel" @click="close">Annulla scambio</button>
          </div>
        </template>
        <template v-else>
          <p class="step"><b>2 di 2</b> · Ultimo controllo. <span class="give">Dai: {{ summary(t.me.offer) }}</span> · <span class="get">Ricevi: {{ summary(t.them.offer) }}</span></p>
          <div class="actions">
            <button v-if="!t.me.confirmed" class="go" @click="trade.confirm()">Conferma scambio</button>
            <span v-else class="waiting">Aspetti la conferma di {{ t.them.name }}…</span>
            <button class="back" @click="trade.ready(false)">Voglio cambiare</button>
            <button class="cancel" @click="close">Annulla</button>
          </div>
        </template>
      </footer>
    </template>

    <!-- Com'è andata -->
    <template v-else-if="done">
      <header>
        <h2 id="trade-title">Scambio fatto! <Icon name="trade" /></h2>
      </header>
      <p class="result"><span class="get">Hai ricevuto da {{ done.with }}: {{ summary(done.got) }}</span></p>
      <p class="result"><span class="give">Hai dato: {{ summary(done.gave) }}</span></p>
      <div class="actions">
        <button class="go" autofocus @click="close">Ok</button>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.trade {
  /* Le barre di scorrimento (App.vue) coi colori della finestra. */
  --scroll-thumb: #7fd1b0;
  --scroll-track: #e2f3ec;
  width: min(860px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  box-sizing: border-box;
  padding: 18px 22px 20px;
  border: 5px solid #2d2a4a;
  border-radius: 20px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.trade::backdrop {
  background: rgba(45, 42, 74, 0.55);
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
h2 {
  margin: 0;
  font-size: 28px;
  font-weight: normal;
  color: #2e8b6e;
  text-shadow: 0 3px 0 #2d2a4a33;
}
button {
  font: inherit;
  cursor: pointer;
}
button:disabled {
  cursor: not-allowed;
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
.sides {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.side {
  min-width: 0;
  padding: 10px 12px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: #fff;
}
.side.ready {
  background: #eaf6dc;
}
h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 19px;
  font-weight: normal;
}
.state {
  flex: none;
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #e6e2d6;
  font-size: 13px;
}
.ready .state {
  background: #9ccc65;
}
h4 {
  margin: 12px 0 6px;
  font-size: 15px;
  font-weight: normal;
}
h4 small {
  color: #6b6890;
  font-size: 12px;
}
.gold-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 18px;
}
.gold-row input {
  width: 110px;
  padding: 3px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #fff8e6;
  color: #2d2a4a;
  font: inherit;
  font-size: 18px;
}
.gold-row small {
  color: #6b6890;
  font-size: 14px;
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.cards.small {
  max-height: 200px;
  overflow-y: auto;
  padding: 2px;
}
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 4px 6px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff8e6;
  color: #2d2a4a;
  font-size: 13px;
  text-align: center;
}
.card :deep(svg),
.card > svg {
  width: 100%;
  height: 40px;
}
.card b {
  font-weight: normal;
  color: #6b6890;
}
.card em {
  font-style: normal;
  font-size: 11px;
  color: #6b4bd8;
}
.pick:hover {
  background: #ffe9b0;
}
.remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 2px solid #2d2a4a;
  border-radius: 50%;
  background: #ff7a59;
  color: #fff8e6;
  font-size: 12px;
  line-height: 1;
}
.empty {
  margin: 4px 0 0;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13px;
}
footer {
  margin-top: 14px;
}
.step,
.result {
  margin: 0 0 10px;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.step b {
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-weight: normal;
}
.give {
  color: #c0262d;
}
.get {
  color: #2e7d32;
}
.result {
  font-size: 16px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.go,
.back,
.cancel {
  padding: 5px 18px 7px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 18px;
}
.go {
  background: #9ccc65;
}
.go:disabled {
  background: #e6e2d6;
  color: #6b6890;
}
.back {
  background: #ffd54a;
}
.cancel {
  margin-left: auto;
  background: #fff;
  font-size: 15px;
}
.waiting {
  color: #6b6890;
}
@media (max-width: 640px) {
  .sides {
    grid-template-columns: 1fr;
  }
}
</style>
