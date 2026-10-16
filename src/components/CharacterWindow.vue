<script setup>
import { computed, onMounted, ref } from 'vue'
import { authClient, displayName } from '../auth.js'
import Avatar from '../city/Avatar.vue'
import { armor as armorOf, tool as toolOf, weapon as weaponOf } from '@dev-city/shared/catalog'
import { statsOf } from '@dev-city/shared/dungeon'
import { COLORS, HATS, lookOf } from '../city/avatar.js'
import { toolStat } from '../city/mine/tools.js'
import { useInventory } from '../composables/useInventory.js'
import ItemIcon from './ItemIcon.vue'
import Icon from './Icon.vue'
import IconText from './IconText.vue'

// Personaggio ed equipaggiamento: a sinistra il personaggio con quello che indossa (cappello,
// colore, arma, armatura, canna e piccone), come va nel dungeon e quanto aiutano gli attrezzi, a
// destra il guardaroba: armi, armature, canne e picconi forgiati col crafting (tasto R), i
// cappelli che si hanno e i colori, tutti gratis, da indossare. Si apre dal proprio personaggio
// in alto a destra o col tasto C. Pesci e monete stanno nell'inventario (tasto I).
const emit = defineEmits(['close'])

const session = authClient.useSession()
const name = computed(() => {
  const user = session.value.data?.user
  return user ? displayName(user) : ''
})
const inventory = useInventory()
const { equipment, busy, error } = inventory
const look = computed(() => lookOf(name.value, equipment.value))

const hats = computed(() => HATS.filter(inventory.owns))
const hat = computed(() => HATS.find((h) => h.id === equipment.value.hat) ?? null)
const color = computed(() => COLORS.find((c) => c.id === equipment.value.color) ?? null)

// Arma e armatura: solo quelle che si hanno ancora (una scambiata non conta più).
const weapon = computed(() => (inventory.count(equipment.value.weapon) ? weaponOf(equipment.value.weapon) : null))
const armor = computed(() => (inventory.count(equipment.value.armor) ? armorOf(equipment.value.armor) : null))
// Come si entra nel dungeon con quello che si indossa.
const stats = computed(() => statsOf({ weapon: weapon.value?.id, armor: armor.value?.id }))
const percent = (d) => `${Math.round(d * 100)}%`
// Canna e piccone in mano: anche questi solo se si hanno ancora.
const rod = computed(() => (inventory.count(equipment.value.rod) ? toolOf(equipment.value.rod) : null))
const pickaxe = computed(() => (inventory.count(equipment.value.pickaxe) ? toolOf(equipment.value.pickaxe) : null))
const tools = computed(() => [...inventory.rods.value, ...inventory.pickaxes.value])
const toolBonus = (t) => (t ? `−${percent(t.speed)} attesa · +${percent(t.luck)} rari` : 'come sempre')

const wear = (slot, id) => inventory.equip(slot, equipment.value[slot] === id ? null : id)

const dialog = ref(null)
onMounted(() => dialog.value.showModal())
// Esc chiude la finestra e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="character" aria-labelledby="character-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="character-title">Personaggio</h2>
      <kbd title="Si apre e chiude anche col tasto C">C</kbd>
      <button class="x" aria-label="Chiudi la finestra del personaggio" @click="emit('close')"><Icon name="close" /></button>
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
            <span v-else class="empty-slot" aria-hidden="true"><Icon name="hat" /></span>
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
        <div class="slot">
          <span class="slot-icon">
            <ItemIcon v-if="weapon" :id="weapon.id" />
            <span v-else class="empty-slot" aria-hidden="true"><Icon name="swords" /></span>
          </span>
          <span class="slot-text">
            <small>Arma</small>
            {{ weapon?.name ?? 'Spada di legno' }}
          </span>
          <button v-if="weapon" class="small" :disabled="busy" @click="inventory.equip('weapon', null)">Togli</button>
        </div>
        <div class="slot">
          <span class="slot-icon">
            <ItemIcon v-if="armor" :id="armor.id" />
            <span v-else class="empty-slot" aria-hidden="true"><Icon name="shield" /></span>
          </span>
          <span class="slot-text">
            <small>Armatura</small>
            {{ armor?.name ?? 'Nessuna' }}
          </span>
          <button v-if="armor" class="small" :disabled="busy" @click="inventory.equip('armor', null)">Togli</button>
        </div>
        <div class="slot">
          <span class="slot-icon">
            <ItemIcon v-if="rod" :id="rod.id" />
            <span v-else class="empty-slot" aria-hidden="true"><Icon name="rod" /></span>
          </span>
          <span class="slot-text">
            <small>Canna da pesca</small>
            {{ rod?.name ?? 'Canna di sempre' }}
          </span>
          <button v-if="rod" class="small" :disabled="busy" @click="inventory.equip('rod', null)">Togli</button>
        </div>
        <div class="slot">
          <span class="slot-icon">
            <ItemIcon v-if="pickaxe" :id="pickaxe.id" />
            <span v-else class="empty-slot" aria-hidden="true"><Icon name="pickaxe" /></span>
          </span>
          <span class="slot-text">
            <small>Piccone</small>
            {{ pickaxe?.name ?? 'Piccone di sempre' }}
          </span>
          <button v-if="pickaxe" class="small" :disabled="busy" @click="inventory.equip('pickaxe', null)">Togli</button>
        </div>
        <div class="stats" title="Con quello che indossi, nel dungeon">
          <small>Nel dungeon</small>
          <span><Icon name="swords" /> {{ stats.damage[0] }}–{{ stats.damage[1] }}</span>
          <span><Icon name="heart" /> {{ stats.maxHp }}</span>
          <span><Icon name="shield" /> −{{ percent(stats.defense) }}</span>
        </div>
        <div class="stats tools-stats" title="Con la canna e il piccone che hai in mano: quanto meno si aspetta e quanto più spesso arrivano pesci speciali e scoperte rare">
          <small>Al lago e in miniera</small>
          <span><Icon name="rod" /> {{ toolBonus(rod) }}</span>
          <span><Icon name="pickaxe" /> {{ toolBonus(pickaxe) }}</span>
        </div>
      </section>

      <div class="wardrobe">
        <section>
          <h3>Armi e armature <span class="count">{{ inventory.weapons.value.length + inventory.armors.value.length }}</span></h3>
          <p v-if="!inventory.weapons.value.length && !inventory.armors.value.length" class="empty">Nessuna: si forgiano col crafting (tasto R), coi minerali della miniera e i materiali del dungeon. Nel dungeon contano: più danni, più vita.</p>
          <div v-else class="grid">
            <button
              v-for="w in inventory.weapons.value"
              :key="w.id"
              class="card wearable"
              :class="{ on: weapon?.id === w.id }"
              :disabled="busy"
              @click="wear('weapon', w.id)"
            >
              <ItemIcon :id="w.id" />
              <span class="item-name">{{ w.name }}</span>
              <span class="gear-stat"><Icon name="swords" /> {{ w.damage[0] }}–{{ w.damage[1] }} danni</span>
              <span class="state">{{ weapon?.id === w.id ? 'Impugnata' : 'Impugna' }}<Icon v-if="weapon?.id === w.id" name="check" /></span>
            </button>
            <button
              v-for="a in inventory.armors.value"
              :key="a.id"
              class="card wearable"
              :class="{ on: armor?.id === a.id }"
              :disabled="busy"
              @click="wear('armor', a.id)"
            >
              <ItemIcon :id="a.id" />
              <span class="item-name">{{ a.name }}</span>
              <span class="gear-stat"><Icon name="heart" /> +{{ a.hp }} HP · <Icon name="shield" /> −{{ percent(a.defense) }}</span>
              <span class="state">{{ armor?.id === a.id ? 'Indossata' : 'Indossa' }}<Icon v-if="armor?.id === a.id" name="check" /></span>
            </button>
          </div>
        </section>

        <section>
          <h3>Canne e picconi <span class="count">{{ tools.length }}</span></h3>
          <p v-if="!tools.length" class="empty">Nessuno: si forgiano col crafting (tasto R). Al lago e in miniera fanno aspettare di meno e trovare più spesso le cose rare.</p>
          <div v-else class="grid">
            <button
              v-for="t in tools"
              :key="t.id"
              class="card wearable"
              :class="{ on: equipment[t.slot] === t.id }"
              :disabled="busy"
              @click="wear(t.slot, t.id)"
            >
              <ItemIcon :id="t.id" />
              <span class="item-name">{{ t.name }}</span>
              <IconText class="gear-stat" :parts="toolStat(t)" />
              <span class="state">{{ equipment[t.slot] === t.id ? 'In mano' : 'Prendi' }}<Icon v-if="equipment[t.slot] === t.id" name="check" /></span>
            </button>
          </div>
        </section>

        <section>
          <h3>Cappelli <span class="count">{{ hats.length }}</span></h3>
          <p v-if="!hats.length" class="empty">Nessun cappello: si comprano allo shop della piazza, con le monete dei pesci.</p>
          <div v-else class="grid">
            <button v-for="h in hats" :key="h.id" class="card wearable" :class="{ on: equipment.hat === h.id }" :disabled="busy" @click="wear('hat', h.id)">
              <svg viewBox="-55 -135 110 100" aria-hidden="true"><Avatar :look="{ color: look.color, hat: h.id }" /></svg>
              <span class="item-name">{{ h.name }}</span>
              <span class="state">{{ equipment.hat === h.id ? 'Indossato' : 'Indossa' }}<Icon v-if="equipment.hat === h.id" name="check" /></span>
            </button>
          </div>
        </section>

        <section>
          <h3>Colori <span class="free">gratis</span></h3>
          <div class="colors">
            <button
              v-for="c in COLORS"
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
.character {
  /* Le barre di scorrimento (App.vue) coi colori della finestra. */
  --scroll-thumb: #b9a4f5;
  --scroll-track: #ece6fb;
  width: min(820px, calc(100% - 32px));
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
.character::backdrop {
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
.free {
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #9ccc65;
  font-size: 14px;
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
.stats {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 12px;
  background: #3a2d5c;
  color: #fff8e6;
  font-size: 15px;
  font-variant-numeric: tabular-nums;
}
.tools-stats {
  flex-direction: column;
  align-items: flex-start;
  background: #2d5c4a;
  font-size: 13px;
}
.stats small {
  width: 100%;
  opacity: 0.7;
  font-size: 12px;
}
.gear-stat {
  color: #6b6890;
  font-size: 13px;
  text-align: center;
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
.wardrobe {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
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
  kbd {
    display: none;
  }
}
</style>
