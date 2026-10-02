<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AccountButton from './components/AccountButton.vue'
import AreaChat from './components/AreaChat.vue'
import ServiceStatus from './components/ServiceStatus.vue'
import CityView from './city/CityView.vue'
import DevShipFullscreen from './components/DevShipFullscreen.vue'
import FullscreenButton from './components/FullscreenButton.vue'
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
// luogo (in basso a sinistra). La piazza ha
// la sua: passa dalla stanza della piazza, che mette i fumetti sui personaggi.
const chatChannel = computed(() => place.value?.id ?? 'city')
// Col cartellone zoomato la chat della città si ripiega, per non coprirne l'angolo.
const boardZoomed = ref(false)
const chatTitle = computed(() => (place.value ? `Chat: ${place.value.name}` : 'Chat della città'))
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
    <AreaChat v-if="chatChannel !== 'piazza'" :key="chatChannel" :channel="chatChannel" :title="chatTitle" :corner="place ? 'bottom' : 'top'" :fold="!place && boardZoomed" />
  </template>
  <FullscreenButton />
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
