<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { armor as armorOf, MATERIALS, RARITY_NAMES, weapon as weaponOf } from '@dev-city/shared/catalog'
import { coffee as coffeeOf } from '@dev-city/shared/coffee'
import { BOSS, MAX_WAVES, PLAYER_HP, simulateRun, SOUP_BELOW, SOUP_HEAL, statsOf } from '@dev-city/shared/dungeon'
import { authClient, displayName } from '../../auth.js'
import SoupBowl from '../../components/SoupBowl.vue'
import { useInventory } from '../../composables/useInventory.js'
import { BACKEND_ENABLED } from '../../config.js'
import Avatar from '../Avatar.vue'
import { DEFAULT_LOOK, lookOf } from '../avatar.js'
import MaterialIcon from '../dungeon/MaterialIcon.vue'
import Monster from '../dungeon/Monster.vue'
import TicketBottle from '../dungeon/TicketBottle.vue'
import GearIcon from '../mine/GearIcon.vue'
import { monsterX, STAGE, useRunPlayback } from '../dungeon/useRunPlayback.js'
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  'Si entra con un ticket: si ripesca al lago, in una bottiglia, una volta su 15.',
  `Si parte con ${PLAYER_HP} HP (di più con l'armatura) e arrivano ondate di bug sempre più forti; ogni 5 c'è il boss.`,
  `Va tutto da solo, si guarda e basta. Sotto i ${SOUP_BELOW} HP si beve una zuppa di pesce (+${SOUP_HEAL} HP), finché ce ne sono.`,
  'Arma e armatura forgiate col crafting contano: più danni a ogni colpo, più vita, meno danni presi.',
  'Monete e materiali per armi e armature restano anche quando si perde.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
const look = computed(() => (user.value ? lookOf(displayName(user.value), inventory.equipment.value) : DEFAULT_LOOK))
// L'arma e l'armatura indossate, se si hanno ancora (come le conta l'API), con cosa danno nel dungeon.
const weapon = computed(() => (inventory.count(inventory.equipment.value.weapon) ? weaponOf(inventory.equipment.value.weapon) : null))
const armor = computed(() => (inventory.count(inventory.equipment.value.armor) ? armorOf(inventory.equipment.value.armor) : null))
// Il caffè al ginseng, se lo si è bevuto all'ufficio: vale per la prossima run.
const ginseng = computed(() => {
  const c = inventory.coffee.value
  return c && Date.parse(c.until) > Date.now() && coffeeOf(c.id)?.dungeon ? coffeeOf(c.id) : null
})
const stats = computed(() => statsOf({ weapon: weapon.value?.id, armor: armor.value?.id, coffee: ginseng.value?.id }))
// Quelle della run in corso, fissate all'ingresso: la run di prova si fa senza.
const runGear = ref({ weapon: null, armor: null })

// lobby (l'ingresso), run (si guarda) o end (il resoconto).
const phase = ref('lobby')
const demo = ref(false)
const { state, start, skip } = useRunPlayback()

// La run la gioca l'API e l'inventario aggiornato arriva subito: si mette a fine run, così
// monete e materiali si vedono arrivare dai mostri.
let applyInventory = null
const soupsAtStart = ref(0)
async function enter() {
  const res = await inventory.runDungeon()
  if (!res) return
  demo.value = false
  applyInventory = res.apply
  soupsAtStart.value = inventory.soups.value
  runGear.value = { weapon: weapon.value?.id ?? null, armor: armor.value?.id ?? null }
  start(res.run, soupsAtStart.value)
  phase.value = 'run'
}
// Senza backend o senza login: una run di prova, simulata qui, che non dà niente.
const DEMO_SOUPS = 3
function enterDemo() {
  demo.value = true
  soupsAtStart.value = DEMO_SOUPS
  runGear.value = { weapon: null, armor: null }
  start(simulateRun(DEMO_SOUPS), DEMO_SOUPS)
  phase.value = 'run'
}
function finish() {
  applyInventory?.()
  applyInventory = null
  phase.value = 'end'
}
watch(() => state.done, (done) => done && finish())
onUnmounted(() => applyInventory?.())

const canPlay = computed(() => BACKEND_ENABLED && user.value && inventory.ready.value)
const hpPercent = computed(() => (state.hp / state.maxHp) * 100)
const dropped = computed(() => MATERIALS.filter((m) => state.materials[m.id]).map((m) => ({ ...m, n: state.materials[m.id] })))
const looted = computed(() => dropped.value.reduce((sum, m) => sum + m.n, 0))
// Le ondate superate: tutte se ripulito, altrimenti quelle prima di quella in cui si è caduti.
const wavesBeaten = computed(() => (state.cleared ? state.wave : state.wave - 1))
const soupsDrunk = computed(() => soupsAtStart.value - state.soups)

const alive = computed(() => state.monsters.filter((m) => !m.dead))
const xOf = (m) => (m.dead ? m.x : monsterX(alive.value.indexOf(m)))
const barY = (m) => (m.kind === BOSS.id ? -230 : -140)
</script>

<template>
  <InteriorLayout :place="place" :plans="plans" tint="#3a2d5c" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#3a3550" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <!-- Muro di pietre -->
        <g fill="#5a5675">
          <template v-for="r in 6" :key="r">
            <rect
              v-for="c in 9"
              :key="c"
              :x="(c - 1) * 200 - (r % 2) * 100"
              :y="(r - 1) * 90"
              width="196"
              height="86"
              rx="12"
            />
          </template>
        </g>
        <!-- Pavimento -->
        <rect x="-10" y="540" width="1620" height="370" fill="#2b2740" />
        <!-- Celle -->
        <g v-for="x in [240, 1160]" :key="x">
          <path :d="`M ${x} 540 L ${x} 300 Q ${x + 100} 220 ${x + 200} 300 L ${x + 200} 540 Z`" fill="#120f1f" />
          <path :d="`M ${x + 40} 540 L ${x + 40} 270 M ${x + 80} 540 L ${x + 80} 250 M ${x + 120} 540 L ${x + 120} 250 M ${x + 160} 540 L ${x + 160} 270`" fill="none" stroke="#8e93aa" stroke-width="10" />
          <circle :cx="x + 85" cy="420" r="8" fill="#ff4a4a" stroke="none" class="eye" />
          <circle :cx="x + 115" cy="420" r="8" fill="#ff4a4a" stroke="none" class="eye" />
        </g>
        <!-- Torce -->
        <g v-for="x in [640, 960]" :key="x">
          <path :d="`M ${x} 340 L ${x} 260`" fill="none" stroke="#a0673a" stroke-width="14" />
          <path class="fire" :d="`M ${x - 26} 262 Q ${x} 160 ${x + 26} 262 Z`" fill="#ff9a2e" />
        </g>
        <!-- Catene -->
        <path d="M 760 0 L 760 200 M 840 0 L 840 160" fill="none" stroke="#8e93aa" stroke-width="8" stroke-dasharray="14 8" />
      </g>
    </svg>

    <!-- La scena della run: il giocatore a sinistra, i mostri in fila a destra. -->
    <div v-if="phase === 'run'" class="stage">
      <svg :viewBox="`0 0 ${STAGE.width} ${STAGE.height}`" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        <g :transform="`translate(${STAGE.playerX} ${STAGE.floor}) scale(1.5)`">
          <g :key="`swing-${state.swing}`" class="swing">
            <g :key="`hurt-${state.hurt}`" :class="{ ouch: state.hurt }">
              <Avatar :look="look" />
            </g>
          </g>
          <!-- L'armatura, sul petto -->
          <g v-if="runGear.armor" transform="translate(2 -30) scale(0.55)">
            <GearIcon :id="runGear.armor" />
          </g>
          <!-- L'arma forgiata, con l'impugnatura nella mano, o la spada di legno di partenza -->
          <g :key="`sword-${state.swing}`" class="sword">
            <g v-if="runGear.weapon" transform="translate(34 -46) rotate(-8) scale(1.2) translate(10 -10)">
              <GearIcon :id="runGear.weapon" />
            </g>
            <g v-else stroke="#2d2a4a" stroke-width="4" stroke-linecap="round">
              <path d="M 34 -46 L 74 -100" stroke-width="10" />
              <path d="M 34 -46 L 74 -100" stroke="#e8c48a" stroke-width="5" />
              <path d="M 26 -54 L 42 -38" stroke="#a0673a" stroke-width="7" />
            </g>
          </g>
        </g>
        <!-- Le zampe arrivano da destra a ogni ondata: la chiave cambia e l'ingresso riparte -->
        <g v-for="m in state.monsters" :key="m.id" class="slot" :class="{ dead: m.dead }" :style="{ transform: `translate(${xOf(m)}px, ${STAGE.floor}px)` }">
          <g class="enter">
            <g :key="`attack-${m.attack}`" :class="{ strike: m.attack }">
              <g :key="`flash-${m.flash}`" :class="{ flash: m.flash }">
                <Monster :kind="m.kind" />
              </g>
            </g>
            <g v-if="!m.dead" :transform="`translate(0 ${barY(m)})`">
              <rect x="-50" y="-7" width="100" height="14" rx="7" fill="#2d2a4a" />
              <rect x="-47" y="-4" :width="Math.max(0, 94 * (m.hp / m.max))" height="8" rx="4" fill="#ff5a6e" />
            </g>
          </g>
        </g>
        <!-- Danni, cure e bottino che salgono e svaniscono -->
        <g v-for="f in state.floats" :key="f.id" class="float" :class="f.tone" :style="{ transform: `translate(${f.x}px, ${f.y}px)` }">
          <g v-if="f.icon === 'soup'" transform="translate(-58 0) scale(0.45)"><SoupBowl :steam="false" /></g>
          <g v-else-if="f.icon" transform="scale(0.8)"><MaterialIcon :id="f.icon" /></g>
          <g v-if="f.tone === 'gold'" transform="translate(-34 -10)" stroke="#2d2a4a" stroke-width="4">
            <circle r="14" fill="#ffd54a" />
            <circle r="7" fill="none" stroke="#e0a82e" stroke-width="3" />
          </g>
          <text v-if="f.text" :x="f.tone === 'gold' ? -12 : 0" y="0">{{ f.text }}</text>
        </g>
      </svg>
    </div>

    <!-- In alto durante la run: ondata, vita, zuppe e bottino -->
    <div v-if="phase === 'run'" class="run-hud" role="status">
      <span class="wave">Ondata {{ state.wave }}<small>/{{ MAX_WAVES }}</small></span>
      <span class="hp" :title="`${state.hp} HP su ${state.maxHp}`">
        <span class="hp-fill" :class="{ low: state.hp <= SOUP_BELOW }" :style="{ width: `${hpPercent}%` }" />
        <span class="hp-text">❤ {{ state.hp }}</span>
      </span>
      <span class="pill" title="Zuppe di pesce rimaste">
        <svg viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl :steam="false" /></svg>{{ state.soups }}
      </span>
      <span class="pill" title="Monete raccolte">🪙 {{ state.gold }}</span>
      <span class="pill" title="Materiali raccolti">🎒 {{ looted }}</span>
      <button class="skip" @click="skip">Salta ⏭</button>
    </div>

    <!-- L'ingresso: ticket, zuppe e il pulsante per entrare -->
    <section v-if="phase === 'lobby'" class="panel" aria-labelledby="dungeon-title">
      <h2 id="dungeon-title">Ingresso del dungeon</h2>
      <template v-if="canPlay">
        <div class="supplies">
          <div class="supply">
            <svg viewBox="-50 -60 100 115" aria-hidden="true"><TicketBottle /></svg>
            <strong>{{ inventory.tickets.value }}</strong>
            <span>ticket</span>
          </div>
          <div class="supply">
            <svg viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl /></svg>
            <strong>{{ inventory.soups.value }}</strong>
            <span>{{ inventory.soups.value === 1 ? 'zuppa' : 'zuppe' }}</span>
          </div>
        </div>
        <div class="gear">
          <div class="gear-slot" :class="{ none: !weapon }">
            <svg v-if="weapon" viewBox="-36 -36 72 72" aria-hidden="true"><GearIcon :id="weapon.id" /></svg>
            <span v-else class="gear-empty" aria-hidden="true">⚔</span>
            <span class="gear-text"><small>Arma</small>{{ weapon?.name ?? 'Spada di legno' }}</span>
          </div>
          <div class="gear-slot" :class="{ none: !armor }">
            <svg v-if="armor" viewBox="-36 -36 72 72" aria-hidden="true"><GearIcon :id="armor.id" /></svg>
            <span v-else class="gear-empty" aria-hidden="true">🛡</span>
            <span class="gear-text"><small>Armatura</small>{{ armor?.name ?? 'Nessuna' }}</span>
          </div>
          <p class="gear-stats">⚔ {{ stats.damage[0] }}–{{ stats.damage[1] }} danni · ❤ {{ stats.maxHp }} HP · 🛡 −{{ Math.round(stats.defense * 100) }}% danni</p>
        </div>
        <p v-if="ginseng" class="note coffee">☕ {{ ginseng.name }}: +{{ ginseng.dungeon.damage }} danni a colpo e +{{ ginseng.dungeon.hp }} HP in questa run (poi è finito).</p>
        <p v-if="!weapon || !armor" class="note">Armi e armature si forgiano col crafting <kbd>R</kbd> (minerali della miniera e materiali del dungeon) e si indossano dalla finestra del personaggio <kbd>C</kbd>.</p>
        <p v-if="!inventory.tickets.value" class="note">Nessun ticket. Al lago, una volta su 15, insieme al pesce sale una bottiglia con un ticket dentro.</p>
        <p v-else-if="!inventory.soups.value" class="note">Niente zuppe: la run sarà breve. Col crafting <kbd>R</kbd> 3 pesci diventano una zuppa, che sotto i {{ SOUP_BELOW }} HP ti ridà {{ SOUP_HEAL }} HP.</p>
        <p v-else class="note">Le zuppe si bevono da sole sotto i {{ SOUP_BELOW }} HP: più ne hai, più ondate superi e più bottino porti a casa.</p>
        <p v-if="inventory.error.value" class="error" role="alert">{{ inventory.error.value }}</p>
        <button class="go" :disabled="!inventory.tickets.value || inventory.busy.value" @click="enter">Entra · usa 1 ticket</button>
      </template>
      <template v-else>
        <p class="note">{{ BACKEND_ENABLED ? 'Accedi (in basso al centro) per entrare coi tuoi ticket.' : 'Demo: con il backend si entra coi ticket pescati al lago.' }}</p>
        <button class="go" @click="enterDemo">Guarda una run di prova</button>
      </template>
    </section>

    <!-- Il resoconto -->
    <section v-if="phase === 'end'" class="panel" aria-labelledby="result-title">
      <h2 id="result-title">{{ state.cleared ? 'Dungeon ripulito!' : `Sconfitto all'ondata ${state.wave}` }}</h2>
      <p v-if="demo" class="note">Run di prova: niente premi.</p>
      <ul class="stats">
        <li><strong>{{ wavesBeaten }}</strong> {{ wavesBeaten === 1 ? 'ondata superata' : 'ondate superate' }}</li>
        <li><strong>🪙 {{ state.gold }}</strong> monete</li>
        <li><strong>{{ soupsDrunk }}</strong> {{ soupsDrunk === 1 ? 'zuppa bevuta' : 'zuppe bevute' }}</li>
      </ul>
      <ul v-if="dropped.length" class="loot">
        <li v-for="m in dropped" :key="m.id" class="material" :class="m.rarity" :title="`${m.name} · ${RARITY_NAMES[m.rarity]}`">
          <svg viewBox="-34 -34 68 68" aria-hidden="true"><MaterialIcon :id="m.id" /></svg>
          <span>{{ m.name }}</span>
          <strong>× {{ m.n }}</strong>
        </li>
      </ul>
      <p v-else class="note">Nessun materiale questa volta.</p>
      <div class="actions">
        <button v-if="!demo && inventory.tickets.value" class="go" :disabled="inventory.busy.value" @click="enter">Entra ancora · {{ inventory.tickets.value }} ticket</button>
        <button class="back-to-lobby" @click="phase = 'lobby'">Ok</button>
      </div>
    </section>
  </InteriorLayout>
</template>

<style scoped>
/* La scena sta tra l'HUD in alto, la chat in basso a sinistra e il cartello in basso a destra. */
.stage {
  position: absolute;
  inset: 150px 16px 90px 372px;
  pointer-events: none;
}
.stage svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.slot {
  transition: transform 0.35s ease;
}
.slot.dead {
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.35s ease;
}
.enter {
  animation: enter 0.6s cubic-bezier(0.2, 0.7, 0.3, 1);
}
@keyframes enter {
  from {
    translate: 700px 0;
  }
}
.strike {
  animation: strike 0.25s ease-out;
}
@keyframes strike {
  50% {
    translate: -26px 0;
  }
}
.flash {
  animation: flash 0.2s steps(1);
}
@keyframes flash {
  0% {
    filter: brightness(2.2);
  }
}
.swing {
  animation: swing 0.22s ease-out;
}
@keyframes swing {
  50% {
    translate: 18px 0;
  }
}
.sword {
  transform-origin: 30px -46px;
  animation: slash 0.22s ease-out;
}
@keyframes slash {
  50% {
    rotate: 50deg;
  }
}
.ouch {
  animation: ouch 0.25s steps(1);
}
@keyframes ouch {
  0% {
    filter: sepia(1) saturate(6) hue-rotate(-30deg);
  }
}
.float {
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 40px;
  paint-order: stroke;
  stroke: #2d2a4a;
  stroke-width: 8px;
  stroke-linejoin: round;
  text-anchor: middle;
  animation: rise 1.2s ease-out forwards;
}
.float text {
  fill: #fff8e6;
}
.float.hurt text {
  fill: #ff5a6e;
}
.float.heal text {
  fill: #9ccc65;
}
.float.gold text {
  fill: #ffd54a;
}
@keyframes rise {
  from {
    opacity: 1;
    translate: 0 0;
  }
  70% {
    opacity: 1;
  }
  to {
    opacity: 0;
    translate: 0 -70px;
  }
}
.run-hud {
  position: absolute;
  top: 84px;
  left: 50%;
  translate: -50% 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
  max-width: calc(100% - 32px);
  box-sizing: border-box;
  padding: 8px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 17px;
}
.wave {
  padding: 2px 10px 4px;
  border-radius: 9px;
  background: #3a2d5c;
  color: #fff8e6;
}
.wave small {
  opacity: 0.7;
}
.hp {
  position: relative;
  width: 150px;
  height: 26px;
  overflow: hidden;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #e6e2d6;
}
.hp-fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: #9ccc65;
  transition: width 0.2s ease;
}
.hp-fill.low {
  background: #ff7a59;
}
.hp-text {
  position: relative;
  display: block;
  text-align: center;
  line-height: 24px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 9px 3px;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #fff;
  font-variant-numeric: tabular-nums;
}
.pill svg {
  width: 24px;
  height: 22px;
}
button {
  font: inherit;
  cursor: pointer;
}
.skip {
  padding: 2px 10px 4px;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #ffd54a;
  color: #2d2a4a;
  font-size: 15px;
}
.panel {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
  width: min(460px, calc(100% - 32px));
  max-height: calc(100% - 200px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 18px 22px 22px;
  border: 5px solid #2d2a4a;
  border-radius: 20px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  text-align: center;
}
h2 {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: normal;
  color: #6b4bd8;
  text-shadow: 0 3px 0 #2d2a4a33;
}
.supplies {
  display: flex;
  justify-content: center;
  gap: 14px;
}
.supply {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
  padding: 8px 6px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff;
}
.supply svg {
  width: 70px;
  height: 66px;
}
.supply strong {
  font-size: 26px;
  font-weight: normal;
  line-height: 1;
}
.supply span {
  color: #6b6890;
  font-size: 14px;
}
.gear {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 12px;
}
.gear-slot {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px 4px 4px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
  text-align: left;
}
.gear-slot.none {
  background: #f1ede2;
}
.gear-slot svg {
  flex: none;
  width: 40px;
  height: 40px;
}
.gear-empty {
  display: grid;
  place-items: center;
  flex: none;
  width: 40px;
  height: 40px;
  font-size: 22px;
  opacity: 0.3;
}
.gear-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  font-size: 14px;
  line-height: 1.15;
}
.gear-text small {
  color: #6b6890;
  font-size: 12px;
}
.gear-stats {
  grid-column: 1 / -1;
  margin: 0;
  padding: 3px 8px 5px;
  border-radius: 10px;
  background: #3a2d5c;
  color: #fff8e6;
  font-size: 14px;
}
.note,
.error {
  margin: 12px 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.note {
  color: #6b6890;
}
.note.coffee {
  color: #b3541e;
  font-weight: 600;
}
.error {
  color: #c0262d;
  font-weight: 600;
}
kbd {
  padding: 0 5px 1px;
  border: 2px solid #2d2a4a;
  border-bottom-width: 3px;
  border-radius: 5px;
  background: #fff;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 12px;
}
.go,
.back-to-lobby {
  padding: 6px 20px 8px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #9ccc65;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 20px;
}
.back-to-lobby {
  background: #ffd54a;
}
.go:active:not(:disabled),
.back-to-lobby:active {
  translate: 0 3px;
  box-shadow: none;
}
.go:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
.stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin: 0 0 12px;
  padding: 0;
  list-style: none;
  font-size: 16px;
}
.stats strong {
  font-weight: normal;
  font-size: 22px;
}
.loot {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}
.material {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 6px 8px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
  font-size: 14px;
}
.material.uncommon {
  background: #d8f3ff;
}
.material.rare {
  background: #f1dcff;
}
.material svg {
  width: 44px;
  height: 44px;
}
.material strong {
  font-weight: normal;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
@media (max-width: 1240px) {
  .stage {
    bottom: 150px;
  }
}
/* Sui telefoni l'HUD scende sotto il cartello del luogo, la scena sopra la chat. */
@media (max-width: 720px) {
  .run-hud {
    top: 176px;
    width: calc(100% - 32px);
    font-size: 15px;
  }
  .hp {
    width: 110px;
  }
  .stage {
    inset: 280px 8px 175px;
  }
}
.fire {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: flicker 0.35s ease-in-out infinite alternate;
}
@keyframes flicker {
  from { transform: scale(0.85, 0.9); fill: #ff7a2e; }
  to { transform: scale(1.1, 1.15); fill: #ffc53d; }
}
.eye {
  animation: blink 3.5s steps(1) infinite;
}
@keyframes blink {
  92%, 96% { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .enter, .strike, .flash, .swing, .sword, .ouch {
    animation: none;
  }
}
</style>
