<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { armor, gear, itemName, MATERIALS, mineral, RECIPE_CATEGORIES, RECIPES, tool, weapon } from '@dev-city/shared/catalog'
import { BASE_DAMAGE, SOUP_BELOW } from '@dev-city/shared/dungeon'
import Fish from '../city/fishing/Fish.vue'
import { formatKg } from '../city/fishing/lake.js'
import { toolStat } from '../city/mine/tools.js'
import { useInventory } from '../composables/useInventory.js'
import ItemIcon from './ItemIcon.vue'
import Icon from './Icon.vue'
import IconText from './IconText.vue'

// Il crafting: in alto i banchi (la cucina, la forgia delle armi, delle armature, delle canne da
// pesca e dei picconi), a sinistra le ricette del banco con quante se ne possono fare, a destra
// quella scelta con gli ingredienti (quanti se ne hanno su quanti ne servono), cosa ne esce e
// com'è rispetto a quello che si ha addosso. Si apre dall'incudine in alto a destra o col tasto R.
// La zuppa usa i 3 pesci più leggeri (come li sceglie l'API); il resto i minerali della miniera e
// i materiali del dungeon, e si indossa da qui o dalla finestra del personaggio (tasto C).
const emit = defineEmits(['close'])

const inventory = useInventory()
const { fish, busy, error, equipment } = inventory

// Da dove arriva un ingrediente, per il suggerimento sopra la casella.
function source(id) {
  if (mineral(id)) return 'si trova in miniera'
  if (MATERIALS.some((m) => m.id === id)) return 'lo lasciano i mostri del dungeon'
  return ''
}

// Quante volte si può fare una ricetta con quello che si ha.
function craftable(r) {
  let n = r.fish ? Math.floor(fish.value.length / r.fish) : Infinity
  for (const [id, need] of Object.entries(r.needs)) n = Math.min(n, Math.floor(inventory.count(id) / need))
  return n === Infinity ? 0 : n
}

// La riga sotto il nome, nella lista: cosa fa, coi pezzi per IconText.
const percent = (d) => `${Math.round(d * 100)}%`
function statLine(r) {
  if (r.heal) return [{ text: `Cura ${r.heal} HP` }]
  const w = weapon(r.makes)
  if (w) return [{ text: `${w.damage[0]}–${w.damage[1]} danni` }]
  const a = armor(r.makes)
  if (a) return [{ text: `+${a.hp} HP` }, { text: `−${percent(a.defense)} danni` }]
  const t = tool(r.makes)
  return t ? toolStat(t) : []
}
// Come si dice di averlo addosso, e il pulsante per metterselo.
const WORN = { weapon: 'Impugnata', armor: 'Indossata', rod: 'In mano', pickaxe: 'In mano' }
const WEAR = { weapon: 'Impugna', armor: 'Indossa', rod: 'Prendi in mano', pickaxe: 'Prendi in mano' }

const tab = ref(RECIPE_CATEGORIES[0].id)
const recipes = computed(() => RECIPES.filter((r) => r.category === tab.value))
const ready = (cat) => RECIPES.filter((r) => r.category === cat && craftable(r) > 0).length
// La ricetta scelta in ogni banco: all'inizio la prima che si può fare, se no la prima.
const chosen = ref({})
const selected = computed(
  () => recipes.value.find((r) => r.id === chosen.value[tab.value]) ?? recipes.value.find((r) => craftable(r) > 0) ?? recipes.value[0],
)
const choose = (r) => (chosen.value = { ...chosen.value, [tab.value]: r.id })

// Gli ingredienti della ricetta scelta: i pesci (i più leggeri, a parità di peso il più vecchio)
// e gli oggetti a quantità, con quanti se ne hanno.
const lightest = computed(() =>
  [...fish.value].sort((a, b) => a.weightKg - b.weightKg || a.id - b.id).slice(0, selected.value.fish),
)
const missingFish = computed(() => selected.value.fish - lightest.value.length)
const needs = computed(() =>
  Object.entries(selected.value.needs).map(([id, need]) => ({ id, need, have: inventory.count(id), name: itemName(id), from: source(id) })),
)
const canMake = computed(() => craftable(selected.value))
const missingText = computed(() => {
  const parts = needs.value.filter((n) => n.have < n.need).map((n) => `${n.need - n.have} × ${n.name}`)
  if (missingFish.value > 0) parts.unshift(`${missingFish.value} ${missingFish.value === 1 ? 'pesce' : 'pesci'}`)
  return parts.join(', ')
})
const fishScale = (kg) => 0.55 + Math.min(kg, 20) / 100

// Cosa ne esce: per armi e armature le statistiche e il confronto con quello che si indossa.
const made = computed(() => gear(selected.value.makes) ?? null)
const owned = computed(() => inventory.count(selected.value.makes))
const worn = computed(() => !!made.value && equipment.value[made.value.slot] === made.value.id)
const sign = (v) => (v > 0 ? `+${v}` : `${v}`)
const comparison = computed(() => {
  const g = made.value
  if (!g) return null
  if (g.slot === 'rod' || g.slot === 'pickaxe') {
    const cur = tool(equipment.value[g.slot])
    const what = g.slot === 'rod' ? 'la canna' : 'il piccone'
    if (cur?.id === g.id) return { text: `È ${what} che hai in mano`, tone: 'same' }
    const speed = Math.round((g.speed - (cur?.speed ?? 0)) * 100)
    const luck = Math.round((g.luck - (cur?.luck ?? 0)) * 100)
    const better = Math.sign(speed) + Math.sign(luck)
    return {
      text: `${sign(-speed)}% di attesa e ${sign(luck)}% di rari rispetto a: ${cur?.name ?? `${what} di sempre`}`,
      tone: better > 0 ? 'up' : better < 0 ? 'down' : 'same',
    }
  }
  if (g.slot === 'weapon') {
    const cur = weapon(equipment.value.weapon)
    if (cur?.id === g.id) return { text: 'È l\'arma che impugni', tone: 'same' }
    const avg = (d) => (d[0] + d[1]) / 2
    const diff = Math.round(avg(g.damage) - avg(cur?.damage ?? BASE_DAMAGE))
    const name = cur?.name ?? 'Spada di legno'
    if (!diff) return { text: `Come: ${name}`, tone: 'same' }
    return { text: `${sign(diff)} danni a colpo rispetto a: ${name}`, tone: diff > 0 ? 'up' : 'down' }
  }
  const cur = armor(equipment.value.armor)
  if (cur?.id === g.id) return { text: 'È l\'armatura che indossi', tone: 'same' }
  const hp = g.hp - (cur?.hp ?? 0)
  const def = Math.round((g.defense - (cur?.defense ?? 0)) * 100)
  const better = Math.sign(hp) + Math.sign(def)
  return {
    text: `${sign(hp)} HP e ${sign(def)}% di danni fermati rispetto a: ${cur?.name ?? 'nessuna armatura'}`,
    tone: better > 0 ? 'up' : better < 0 ? 'down' : 'same',
  }
})

const NOTES = {
  kitchen: `Nel dungeon la zuppa si beve da sola quando scendi sotto i ${SOUP_BELOW} HP, e la run dura di più: più ondate, più monete e materiali. Il cuoco usa i pesci più leggeri: quelli grossi e gli speciali restano da vendere.`,
  weapon: 'L\'arma che impugni dà i danni di ogni colpo nel dungeon, al posto della spada di legno (12–18). Metalli e gemme si trovano in miniera, zanne, cristalli e nuclei li lasciano i mostri del dungeon.',
  armor: 'L\'armatura dà punti vita in più nel dungeon e ferma una parte di ogni colpo. Metalli e gemme si trovano in miniera, pelli, seta e scaglie li lasciano i mostri del dungeon.',
  rod: 'Con la canna in mano al lago si aspetta di meno che abbocchi, e i pesci speciali da 5 kg in su arrivano più spesso. Metalli e gemme si trovano in miniera, la seta di ragnatela per la lenza e le pelli per l\'impugnatura le lasciano i mostri del dungeon.',
  pickaxe: 'Col piccone in mano in miniera si aspetta di meno tra una pietra e l\'altra e tra una scoperta e l\'altra, e minerali e gemme rari escono più spesso. Metalli e gemme si trovano in miniera, zanne, cristalli e nuclei li lasciano i mostri del dungeon.',
}

// Dopo ogni ricetta riuscita un "+1" sale sul risultato.
const cooked = ref(0)
let cookedTimer = 0
async function make() {
  // La scelta resta su questa ricetta anche quando, finiti gli ingredienti, non è più la prima pronta.
  choose(selected.value)
  if (!(await inventory.craft(selected.value.id))) return
  cooked.value++
  clearTimeout(cookedTimer)
  cookedTimer = setTimeout(() => (cooked.value = 0), 1500)
}
watch(selected, () => (cooked.value = 0))
const wear = () => made.value && inventory.equip(made.value.slot, made.value.id)

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
      <button class="x" aria-label="Chiudi il crafting" @click="emit('close')"><Icon name="close" /></button>
    </header>

    <nav class="tabs" role="tablist" aria-label="Banchi del crafting">
      <button
        v-for="c in RECIPE_CATEGORIES"
        :key="c.id"
        role="tab"
        class="tab"
        :class="[c.id, { on: tab === c.id }]"
        :aria-selected="tab === c.id"
        @click="tab = c.id"
      >
        {{ c.name }}
        <span v-if="ready(c.id)" class="ready" :title="`${ready(c.id)} ${ready(c.id) === 1 ? 'ricetta pronta' : 'ricette pronte'}`">{{ ready(c.id) }}</span>
      </button>
    </nav>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="body">
      <section class="recipes" aria-label="Ricette">
        <button
          v-for="r in recipes"
          :key="r.id"
          class="recipe"
          :class="{ on: selected.id === r.id, can: craftable(r) > 0 }"
          :aria-pressed="selected.id === r.id"
          @click="choose(r)"
        >
          <ItemIcon :id="r.makes" />
          <span class="recipe-text">
            {{ r.name }}
            <small><IconText :parts="statLine(r)" /></small>
          </span>
          <span v-if="r.category !== 'kitchen' && inventory.count(r.makes)" class="have" :title="`Ne hai ${inventory.count(r.makes)}`"><Icon v-if="Object.values(equipment).includes(r.makes)" name="check" /><template v-else>hai {{ inventory.count(r.makes) }}</template></span>
          <span class="badge" :class="{ can: craftable(r) > 0 }" :title="craftable(r) > 0 ? `Ne puoi fare ${craftable(r)}` : 'Mancano ingredienti'">
            {{ craftable(r) > 0 ? `× ${craftable(r)}` : 'manca' }}
          </span>
        </button>
      </section>

      <section class="detail">
        <div class="title">
          <h3>{{ selected.name }}</h3>
          <span v-if="made" class="tier">Livello {{ made.tier }}</span>
          <span v-if="worn" class="tier worn">{{ WORN[made.slot] }} <Icon name="check" /></span>
        </div>
        <div class="formula">
          <div class="ingredients">
            <span class="label">Ingredienti <small v-if="selected.fish">hai {{ fish.length }} {{ fish.length === 1 ? 'pesce' : 'pesci' }}</small></span>
            <ul>
              <li v-for="f in lightest" :key="f.id" class="slot" :title="`${f.species.name}, ${formatKg(f.weightKg)}: si pesca al lago`">
                <svg viewBox="-68 -36 136 72" aria-hidden="true">
                  <Fish :kg="f.weightKg" :wiggle="false" :transform="`scale(${fishScale(f.weightKg)})`" />
                </svg>
                <span class="weight">{{ formatKg(f.weightKg) }}</span>
              </li>
              <li v-for="n in missingFish" :key="`missing-${n}`" class="slot missing" title="Un pesce: si pesca al lago">
                <span aria-hidden="true">?</span>
                <span class="weight">pesce</span>
              </li>
              <li v-for="n in needs" :key="n.id" class="slot" :class="{ short: n.have < n.need }" :title="`${n.name}: ${n.from}`">
                <ItemIcon :id="n.id" />
                <span class="slot-name">{{ n.name }}</span>
                <span class="counter">{{ n.have }}/{{ n.need }}</span>
              </li>
            </ul>
          </div>
          <span class="arrow" aria-hidden="true"><Icon name="arrow-right" /></span>
          <div class="result">
            <ItemIcon :id="selected.makes" />
            <span v-if="cooked" :key="cooked" class="plus" aria-hidden="true">+1</span>
            <span v-if="selected.heal" class="stat heal"><Icon name="heart" /> Cura {{ selected.heal }} HP</span>
            <span v-else-if="made?.slot === 'weapon'" class="stat damage"><Icon name="swords" /> {{ made.damage[0] }}–{{ made.damage[1] }} danni</span>
            <template v-else-if="made?.slot === 'rod' || made?.slot === 'pickaxe'">
              <span class="stat speed"><Icon name="timer" /> −{{ percent(made.speed) }} attesa</span>
              <span class="stat luck"><Icon name="clover" /> +{{ percent(made.luck) }} rari</span>
            </template>
            <template v-else-if="made">
              <span class="stat heal"><Icon name="heart" /> +{{ made.hp }} HP</span>
              <span class="stat defense"><Icon name="shield" /> −{{ percent(made.defense) }} danni</span>
            </template>
          </div>
        </div>

        <p v-if="comparison" class="compare" :class="comparison.tone">{{ comparison.text }}</p>
        <p class="note">{{ NOTES[selected.category] }}</p>

        <div class="actions">
          <button class="make" :disabled="busy || canMake < 1" @click="make">
            {{ canMake < 1 ? 'Mancano ingredienti' : selected.category === 'kitchen' ? 'Cucina' : 'Forgia' }}
          </button>
          <button v-if="made && owned > 0 && !worn" class="wear" :disabled="busy" @click="wear">
            {{ WEAR[made.slot] }}
          </button>
          <span class="owned" aria-live="polite">Nell'inventario: <strong>{{ owned }}</strong></span>
        </div>
        <p v-if="canMake < 1" class="missing-list">Mancano: {{ missingText }}</p>
      </section>
    </div>
  </dialog>
</template>

<style scoped>
.crafting {
  /* Le barre di scorrimento (App.vue) coi colori della finestra. */
  --scroll-thumb: #ff9e80;
  --scroll-track: #f6e2d8;
  width: min(900px, calc(100% - 32px));
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
  margin-bottom: 12px;
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
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}
.tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 16px 6px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 18px;
}
.tab.on {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.tab.on.kitchen {
  background: #ffcf9e;
}
.tab.on.weapon {
  background: #ffd0c8;
}
.tab.on.armor {
  background: #cfe3ff;
}
.tab.on.rod {
  background: #c8f0e0;
}
.tab.on.pickaxe {
  background: #e3dcf7;
}
.ready {
  min-width: 20px;
  padding: 0 6px 2px;
  border-radius: 8px;
  background: #3b8f2a;
  color: #fff8e6;
  font-size: 13px;
  text-align: center;
}
.error {
  margin: -4px 0 12px;
  color: #c0262d;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
}
h3 {
  margin: 0;
  font-size: 22px;
  font-weight: normal;
}
.body {
  display: grid;
  grid-template-columns: 270px 1fr;
  gap: 20px;
}
/* Tante ricette: la lista scorre, il dettaglio resta lì. */
.recipes {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 460px;
  overflow-y: auto;
  padding: 2px 6px 6px 2px;
}
.recipe {
  display: flex;
  flex: none;
  align-items: center;
  gap: 8px;
  padding: 6px 8px 6px 6px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #f1ede2;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
  text-align: left;
}
.recipe.can {
  background: #fff;
}
.recipe:not(.can) svg {
  opacity: 0.6;
}
.recipe.on {
  background: #ffe9b0;
}
.recipe svg {
  flex: none;
  width: 42px;
  height: 42px;
}
.recipe-text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}
.recipe-text small {
  color: #6b6890;
  font-size: 13px;
}
.have {
  flex: none;
  padding: 0 6px 2px;
  border-radius: 8px;
  background: #e6defc;
  color: #6b4bd8;
  font-size: 12px;
}
.badge {
  flex: none;
  padding: 0 7px 2px;
  border-radius: 8px;
  background: #e6e2d6;
  color: #6b6890;
  font-size: 12px;
}
.badge.can {
  background: #9ccc65;
  color: #2d2a4a;
}
.detail {
  min-width: 0;
  padding: 14px 16px 16px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: radial-gradient(circle at 80% 30%, #fff 0 15%, #ffe2c8 70%);
}
.title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.tier {
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #2d2a4a;
  color: #fff8e6;
  font-size: 13px;
}
.tier.worn {
  background: #6b4bd8;
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
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
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
  gap: 2px;
  min-height: 90px;
  padding: 4px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
}
.slot svg {
  width: 100%;
  height: 44px;
}
.slot.missing {
  border-style: dashed;
  background: #fff8e6;
  color: #6b6890;
  font-size: 30px;
}
.slot.short {
  border-style: dashed;
  background: #ffe6e2;
}
.slot.short svg {
  opacity: 0.55;
}
.slot-name {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.1;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.counter {
  padding: 0 6px 1px;
  border-radius: 7px;
  background: #9ccc65;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.slot.short .counter {
  background: #ff7a59;
  color: #fff8e6;
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
  gap: 4px;
  width: 140px;
}
.result svg {
  width: 100px;
  height: 92px;
}
.stat {
  padding: 1px 10px 3px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  font-size: 14px;
  white-space: nowrap;
}
.heal {
  background: #ff8a9a;
}
.damage {
  background: #ffd54a;
}
.defense {
  background: #9fd3ff;
}
.speed {
  background: #c8f0e0;
}
.luck {
  background: #c5ef9a;
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
.compare {
  margin: 12px 0 0;
  font-size: 15px;
}
.compare.up {
  color: #3b8f2a;
}
.compare.down {
  color: #c0262d;
}
.compare.same {
  color: #6b4bd8;
}
.note {
  margin: 10px 0 14px;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.missing-list {
  margin: 10px 0 0;
  color: #c0262d;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.make,
.wear {
  padding: 6px 22px 8px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #9ccc65;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 20px;
}
.wear {
  background: #b9a4f5;
}
.make:active:not(:disabled),
.wear:active:not(:disabled) {
  translate: 0 3px;
  box-shadow: none;
}
.make:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
.owned {
  font-size: 15px;
}
@media (max-width: 720px) {
  .body {
    grid-template-columns: 1fr;
  }
  .recipes {
    max-height: 220px;
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
  .result svg {
    height: 72px;
  }
  kbd {
    display: none;
  }
}
</style>
