<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AccountButton from './components/AccountButton.vue'
import AreaChat from './components/AreaChat.vue'
import CharacterWindow from './components/CharacterWindow.vue'
import CraftingButton from './components/CraftingButton.vue'
import CraftingWindow from './components/CraftingWindow.vue'
import ServiceStatus from './components/ServiceStatus.vue'
import CityView from './city/CityView.vue'
import DevShipFullscreen from './components/DevShipFullscreen.vue'
import FullscreenButton from './components/FullscreenButton.vue'
import InventoryButton from './components/InventoryButton.vue'
import InventoryWindow from './components/InventoryWindow.vue'
import MissionButton from './components/MissionButton.vue'
import MissionWindow from './components/MissionWindow.vue'
import PlayerBadge from './components/PlayerBadge.vue'
import PlayerMenu from './components/PlayerMenu.vue'
import TradeInvites from './components/TradeInvites.vue'
import TradeWindow from './components/TradeWindow.vue'
import { useInventory } from './composables/useInventory.js'
import { useTrade } from './composables/useTrade.js'
import { BACKEND_ENABLED } from './config.js'
import { PLACES } from './city/places.js'

// Routing minimale con l'hash: #/ è la città, #/<id> l'interno di un edificio.
// Così il build a file singolo funziona anche aperto da disco.
const hash = ref(location.hash)
const onHash = () => (hash.value = location.hash)
onMounted(() => addEventListener('hashchange', onHash))
onUnmounted(() => removeEventListener('hashchange', onHash))

const place = computed(() => PLACES.find((p) => `#/${p.id}` === hash.value) ?? null)

function enter(id) {
  location.hash = `#/${id}`
}
function leave() {
  location.hash = '#/'
}

// Dev-ship a schermo intero, aperta dal cartellone.
const fullscreen = ref(false)

// Fuori dagli edifici la chat è quella della città (in alto a sinistra), dentro quella del
// luogo (in basso a sinistra). La piazza, la zona di pesca e la miniera hanno la loro: passa dalla stanza
// del luogo, che mette i fumetti sui personaggi.
const OWN_CHAT = ['piazza', 'pesca', 'miniera']
const chatChannel = computed(() => place.value?.id ?? 'city')
// Col cartellone zoomato la chat della città si ripiega, per non coprirne l'angolo.
const boardZoomed = ref(false)
const chatTitle = computed(() => (place.value ? `Chat: ${place.value.name}` : 'Chat della città'))

// Le finestre del giocatore: I l'inventario, C il personaggio, R il crafting (le ricette), M la
// missione dell'ufficio. Lo
// stesso tasto chiude, gli altri passano a un'altra finestra. Niente mentre si scrive, da sloggati o con un'altra finestra aperta
// (shop, conferme).
const inventory = useInventory()
const WINDOW_KEYS = { i: 'bag', c: 'character', r: 'craft', m: 'mission' }
const TYPING = 'input, textarea, select, [contenteditable]'
function onKey(e) {
  const which = WINDOW_KEYS[e.key.toLowerCase()]
  if (!which || e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing) return
  if (e.target.closest?.(TYPING) || !inventory.ready.value) return
  if (!inventory.open.value && document.querySelector('dialog[open]')) return
  e.preventDefault()
  inventory.open.value = inventory.open.value === which ? null : which
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))
// Chiude solo se è ancora quella aperta: passando da una finestra all'altra, quella che se ne
// va non deve chiudere la nuova.
function closeWindow(which) {
  if (inventory.open.value === which) inventory.open.value = null
}

// Gli scambi tra giocatori, in piazza e al lago: menu del tasto destro, inviti e finestra.
const trade = useTrade()
</script>

<template>
  <!-- La città resta montata sotto gli interni: la dev-ship continua a girare
       e all'uscita la camera riparte dalla porta dell'edificio. -->
  <CityView :inside="place?.id ?? null" @enter="enter" @fullscreen="fullscreen = true" @zoom="boardZoomed = $event" />
  <Transition name="interior">
    <component :is="place.interior" v-if="place" :key="place.id" :place="place" @leave="leave" />
  </Transition>
  <template v-if="BACKEND_ENABLED">
    <!-- In basso al centro, l'accesso e di fianco lo stato dei servizi. -->
    <div class="hud" :class="{ 'beside-chat': place }">
      <AccountButton />
      <ServiceStatus />
    </div>
    <AreaChat v-if="!OWN_CHAT.includes(chatChannel)" :key="chatChannel" :channel="chatChannel" :title="chatTitle" :corner="place ? 'bottom' : 'top'" :fold="!place && boardZoomed" />
    <InventoryWindow v-if="inventory.open.value === 'bag'" @close="closeWindow('bag')" />
    <CharacterWindow v-if="inventory.open.value === 'character'" @close="closeWindow('character')" />
    <CraftingWindow v-if="inventory.open.value === 'craft'" @close="closeWindow('craft')" />
    <MissionWindow v-if="inventory.open.value === 'mission'" @close="closeWindow('mission')" />
    <TradeWindow v-if="trade.trade.value || trade.done.value" />
    <TradeInvites />
    <PlayerMenu v-if="trade.menu.value" />
  </template>
  <!-- In alto a destra il proprio personaggio, lo zainetto dell'inventario, l'incudine del
       crafting, la cartellina della missione (solo con una missione in corso) e lo schermo intero. -->
  <div class="corner">
    <PlayerBadge v-if="BACKEND_ENABLED" />
    <InventoryButton v-if="BACKEND_ENABLED" />
    <CraftingButton v-if="BACKEND_ENABLED" />
    <MissionButton v-if="BACKEND_ENABLED" />
    <FullscreenButton />
  </div>
  <DevShipFullscreen v-if="fullscreen" @close="fullscreen = false" />
</template>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #8ed16f;
}
/* Sopra la città e sopra gli interni (z-index 100). Al centro dello schermo; dentro i luoghi,
   quando la chat in basso a sinistra non lascia spazio, al centro dello spazio alla sua destra. */
.hud {
  position: fixed;
  left: 50%;
  bottom: 16px;
  z-index: 150;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  translate: -50% 0;
  pointer-events: none;
}
.hud > * {
  pointer-events: auto;
}
@media (max-width: 1240px) {
  .hud.beside-chat {
    left: 372px; /* chat larga 340, a 16 dal bordo, più 16 di respiro */
    right: 16px;
    translate: none;
  }
}
/* Sui telefoni la riga è larga quanto lo schermo; dentro i luoghi la chat sale sopra di lei. */
@media (max-width: 720px) {
  .hud,
  .hud.beside-chat {
    left: 16px;
    right: 16px;
    translate: none;
  }
}
.corner {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 150;
  display: flex;
  gap: 12px;
}
@media (max-width: 720px) {
  .corner {
    gap: 8px;
  }
}
.interior-enter-active {
  transition: opacity 0.6s ease, transform 0.8s cubic-bezier(0.2, 0.7, 0.3, 1);
}
.interior-leave-active {
  transition: opacity 0.4s ease;
}
.interior-enter-from {
  opacity: 0;
  transform: scale(1.08);
}
.interior-leave-to {
  opacity: 0;
}
</style>
