<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { weapon as weaponOf } from '@dev-city/shared/catalog'
import { COFFEES } from '@dev-city/shared/coffee'
import { statsOf } from '@dev-city/shared/dungeon'
import { authClient } from '../../auth.js'
import { useInventory } from '../../composables/useInventory.js'
import { BACKEND_ENABLED } from '../../config.js'
import CoffeeCup from './CoffeeCup.vue'
import { activeCoffee, coffeeEffects, durationText, leftText } from './coffee.js'
import Icon from '../../components/Icon.vue'

// Il menu della macchinetta del caffè: i caffè con prezzo, durata ed effetti, e quello che si ha
// in circolo. Un caffè alla volta: berne un altro sostituisce quello di prima. Per il ginseng si
// vede anche cosa cambia con la propria arma e armatura, così si capisce quanto vale. brewed: un
// caffè è appena uscito (la macchinetta lo fa vedere).
const emit = defineEmits(['close', 'brewed'])

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
const { busy, error, gold } = inventory
const canDrink = computed(() => BACKEND_ENABLED && !!user.value && inventory.ready.value)

const now = ref(Date.now())
let tick = 0
const active = computed(() => activeCoffee(inventory.coffee.value, now.value))

// L'ultimo bevuto, per il "glu glu" sulla sua tazza.
const sipped = ref(null)
let sipTimer = 0
async function drink(c) {
  if (!(await inventory.drinkCoffee(c.id))) return
  now.value = Date.now()
  sipped.value = c.id
  clearTimeout(sipTimer)
  sipTimer = setTimeout(() => (sipped.value = null), 1800)
  emit('brewed', c.id)
}
// Arma e armatura che contano nel dungeon: quelle indossate, se si hanno ancora (come per l'API).
const gear = computed(() => {
  const worn = inventory.equipment.value
  return { weapon: inventory.count(worn.weapon) ? worn.weapon : null, armor: inventory.count(worn.armor) ? worn.armor : null }
})
// Un caffè per il dungeon col proprio equipaggiamento: "Spada di legno: 12–18 → 15–21 danni,
// 100 → 120 HP" (le frecce sono icone).
function onGear(c) {
  const before = statsOf(gear.value)
  const after = statsOf({ ...gear.value, coffee: c.id })
  return {
    name: weaponOf(gear.value.weapon)?.name ?? 'Spada di legno',
    damage: [`${before.damage[0]}–${before.damage[1]}`, `${after.damage[0]}–${after.damage[1]}`],
    hp: [before.maxHp, after.maxHp],
  }
}

const dialog = ref(null)
onMounted(() => {
  dialog.value.showModal()
  tick = setInterval(() => (now.value = Date.now()), 15_000)
})
onUnmounted(() => {
  clearInterval(tick)
  clearTimeout(sipTimer)
})
// Esc chiude il menu e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="coffee" aria-labelledby="coffee-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="coffee-title"><Icon name="coffee" /> Macchinetta del caffè</h2>
      <span v-if="canDrink" class="purse" title="Le tue monete"><Icon name="coin" /> {{ gold }}</span>
      <button class="x" aria-label="Chiudi il menu" @click="emit('close')"><Icon name="close" /></button>
    </header>

    <div v-if="active" class="active" aria-live="polite">
      <svg viewBox="-34 -70 68 76" aria-hidden="true"><CoffeeCup :id="active.id" /></svg>
      <p>
        <strong>{{ active.name }}</strong> in circolo · ancora {{ leftText(active.left) }}
        <small>{{ coffeeEffects(active).map((e) => e.text).join(' · ') }}</small>
      </p>
    </div>
    <p v-else class="note">{{ canDrink ? 'Un caffè alla volta: dà una spinta per un po\', da adesso.' : BACKEND_ENABLED ? 'Accedi (in basso al centro) per bere un caffè.' : 'Demo: con il backend il caffè si beve davvero.' }}</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <ul class="menu">
      <li v-for="c in COFFEES" :key="c.id" class="drink" :class="{ on: active?.id === c.id }">
        <svg viewBox="-34 -70 68 76" aria-hidden="true"><CoffeeCup :id="c.id" /></svg>
        <span v-if="sipped === c.id" class="sip" aria-hidden="true">Glu glu!</span>
        <div class="text">
          <h3>{{ c.name }} <small>{{ durationText(c.minutes) }}</small></h3>
          <p class="blurb">{{ c.blurb }}</p>
          <ul class="effects">
            <li v-for="e in coffeeEffects(c)" :key="e.text" :class="e.tone"><Icon :name="e.icon" /> {{ e.text }}</li>
          </ul>
          <p v-if="c.dungeon" class="on-gear">
            {{ onGear(c).name }}: {{ onGear(c).damage[0] }} <Icon name="arrow-right" /> {{ onGear(c).damage[1] }} danni, {{ onGear(c).hp[0] }} <Icon name="arrow-right" /> {{ onGear(c).hp[1] }} HP
          </p>
        </div>
        <button class="buy" :disabled="!canDrink || busy || gold < c.price" @click="drink(c)">
          <template v-if="canDrink && gold >= c.price">Bevi · </template>{{ c.price }} <Icon name="coin" /><template v-if="canDrink && gold < c.price"> · non bastano</template>
        </button>
      </li>
    </ul>
    <p v-if="active && canDrink" class="note small">Bevendone un altro, {{ active.name.toLowerCase() }} finisce subito: vale solo l'ultimo. Lago e miniera ne tengono conto dalla prossima attesa.</p>
  </dialog>
</template>

<style scoped>
.coffee {
  /* Le barre di scorrimento (App.vue) coi colori della finestra. */
  --scroll-thumb: #e0a46a;
  --scroll-track: #f3e6d4;
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
.coffee::backdrop {
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
  color: #b3541e;
  text-shadow: 0 3px 0 #2d2a4a33;
}
.purse {
  padding: 1px 10px 3px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  font-size: 16px;
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
.active {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 6px 14px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #ffe2c8;
  animation: pop 0.4s cubic-bezier(0.2, 0.7, 0.3, 1.4);
}
.active svg {
  flex: none;
  width: 46px;
  height: 52px;
}
.active p {
  margin: 0;
  font-size: 17px;
}
.active small {
  display: block;
  color: #6b4a3a;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13px;
}
@keyframes pop {
  from {
    scale: 0.9;
    opacity: 0;
  }
}
.note,
.error {
  margin: 0 0 12px;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.note {
  color: #6b6890;
}
.note.small {
  margin: 12px 0 0;
  font-size: 13px;
}
.error {
  color: #c0262d;
  font-weight: 600;
}
.menu {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.drink {
  position: relative;
  display: grid;
  grid-template-columns: 56px 1fr;
  grid-template-rows: 1fr auto;
  gap: 6px 10px;
  padding: 10px 12px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 16px;
  background: #fff;
}
.drink.on {
  background: #ffe9b0;
}
.drink > svg {
  grid-row: 1 / 3;
  width: 56px;
  height: 64px;
}
.sip {
  position: absolute;
  top: 2px;
  left: 8px;
  color: #b3541e;
  font-size: 16px;
  text-shadow: 0 2px 0 #fff;
  animation: sip 1.6s ease-out forwards;
  pointer-events: none;
}
@keyframes sip {
  from {
    opacity: 1;
    translate: 0 0;
  }
  to {
    opacity: 0;
    translate: 0 -28px;
  }
}
h3 {
  margin: 0;
  font-size: 19px;
  font-weight: normal;
}
h3 small {
  margin-left: 4px;
  padding: 0 7px 2px;
  border-radius: 8px;
  background: #2d2a4a;
  color: #fff8e6;
  font-size: 12px;
  vertical-align: 2px;
}
.blurb {
  margin: 2px 0 6px;
  color: #6b6890;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13px;
}
.effects {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.effects li {
  padding: 1px 8px 2px;
  border: 2px solid #2d2a4a;
  border-radius: 8px;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
}
.effects .speed {
  background: #c8f0e0;
}
.effects .luck {
  background: #c5ef9a;
}
.effects .dungeon {
  background: #ffd0c8;
}
.effects .none {
  background: #eee9dc;
}
.on-gear {
  margin: 6px 0 0;
  color: #b3541e;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.buy {
  grid-column: 2;
  justify-self: start;
  padding: 3px 14px 5px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #9ccc65;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 16px;
}
.buy:active:not(:disabled) {
  translate: 0 3px;
  box-shadow: none;
}
.buy:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
@media (max-width: 720px) {
  .menu {
    grid-template-columns: 1fr;
  }
}
</style>
