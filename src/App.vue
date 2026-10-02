<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AccountButton from './components/AccountButton.vue'
import ServiceStatus from './components/ServiceStatus.vue'
import CityView from './city/CityView.vue'
import DevShipFullscreen from './components/DevShipFullscreen.vue'
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
</script>

<template>
  <!-- La città resta montata sotto gli interni: la dev-ship continua a girare
       e all'uscita la camera riparte dalla porta dell'edificio. -->
  <CityView :inside="place?.id ?? null" @enter="enter" @fullscreen="fullscreen = true" />
  <Transition name="interior">
    <component :is="place.interior" v-if="place" :key="place.id" :place="place" @leave="leave" />
  </Transition>
  <template v-if="BACKEND_ENABLED">
    <AccountButton />
    <ServiceStatus />
  </template>
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
