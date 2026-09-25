<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Sea from './components/Sea.vue'
import Ship from './components/Ship.vue'
import Port from './components/Port.vue'
import Buoy from './components/Buoy.vue'
import Seagulls from './components/Seagulls.vue'
import Kraken from './components/Kraken.vue'
import Sharks from './components/Sharks.vue'
import LunchScene from './components/LunchScene.vue'
import PortScene from './components/PortScene.vue'
import TimeSlider from './components/TimeSlider.vue'
import { isLunchTime, minutesSinceMonday, shipPosition } from './shipPosition.js'

const liveMinutes = ref(minutesSinceMonday(new Date()))

// Orario simulato con lo slider (null = tempo reale).
// ?at=2026-09-23T13:30 apre direttamente la simulazione a quell'istante.
const atParam = new URLSearchParams(location.search).get('at')
const simulatedMinutes = ref(atParam ? minutesSinceMonday(new Date(atParam)) : null)

const live = computed(() => simulatedMinutes.value === null)
const minutes = computed(() => (live.value ? liveMinutes.value : simulatedMinutes.value))

let timer
onMounted(() => {
  timer = setInterval(() => (liveMinutes.value = minutesSinceMonday(new Date())), 1000)
})
onUnmounted(() => clearInterval(timer))

const position = computed(() => shipPosition(minutes.value))
// Scena ravvicinata: pranzo a bordo (ha la precedenza) oppure lavori in porto quando la nave è ormeggiata.
const scene = computed(() => {
  if (isLunchTime(minutes.value)) return 'lunch'
  if (position.value.direction === 'docked') return 'port'
  return null
})

// La nave va dalla banchina del porto (progress 0) fino a fianco della boa (progress 1).
const shipLeft = computed(
  () => `(var(--port-w) + (100% - var(--port-w) - var(--buoy-zone) - var(--ship-w)) * ${position.value.progress})`,
)
const shipStyle = computed(() => ({ left: `calc${shipLeft.value}` }))

// Lo zoom delle scene (pranzo, porto) punta al ponte della nave: la nave poggia all'85%
// dell'altezza (30% del mare, che è la metà bassa) ed è alta circa 0.68 × larghezza.
const worldStyle = computed(() => ({
  transformOrigin: `calc(${shipLeft.value} + var(--ship-w) / 2) calc(85% - var(--ship-w) * 0.36)`,
}))

const status = {
  right: 'In navigazione verso la boa',
  left: 'Giro di boa fatto, rientro in porto',
  docked: 'Ormeggiata in porto',
}
const sceneStatus = {
  lunch: 'Pausa pranzo a bordo',
  port: 'In porto: carico merci e riparazioni',
}
const statusText = computed(
  () =>
    sceneStatus[scene.value] ?? `${status[position.value.direction]} · ${Math.round(position.value.progress * 100)}%`,
)
</script>

<template>
  <div class="world" :class="{ zoomed: scene }" :style="worldStyle">
    <Sea>
      <template #sky>
        <Seagulls />
      </template>
      <Port />
      <Buoy />
      <Kraken />
      <Sharks />
      <div class="ship-wrap" :class="{ simulating: !live }" :style="shipStyle">
        <Ship :facing-left="position.direction === 'left'" />
      </div>
    </Sea>
  </div>

  <Transition name="scene" mode="out-in">
    <LunchScene v-if="scene === 'lunch'" />
    <PortScene v-else-if="scene === 'port'" />
  </Transition>

  <TimeSlider
    :minutes="minutes"
    :live="live"
    :status="statusText"
    @simulate="simulatedMinutes = $event"
    @go-live="simulatedMinutes = null"
  />
</template>

<style>
html, body {
  margin: 0;
  height: 100%;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  background: #0e3a63;
}
:root {
  --ship-w: clamp(120px, 22vw, 280px);
  --port-w: clamp(110px, 20vw, 280px);
  --quay-h: 45%;
  --buoy-w: clamp(44px, 6vw, 80px);
  --buoy-zone: clamp(70px, 11vw, 160px);
}
.ship-wrap {
  position: absolute;
  bottom: 30%;
  width: var(--ship-w);
  z-index: 10;
  transition: left 1s linear;
}
/* Mentre si trascina lo slider la nave segue subito, senza ritardo. */
.ship-wrap.simulating {
  transition: left 0.25s ease-out;
}

/* Pausa pranzo e lavori in porto: zoom sulla nave, poi compare la scena.
   All'uscita la scena sfuma e solo dopo parte lo zoom out. */
.world {
  position: fixed;
  inset: 0;
  overflow: hidden;
  transition: transform 1.4s cubic-bezier(0.2, 0.7, 0.3, 1) 0.3s;
}
.world.zoomed {
  transform: scale(6);
  transition: transform 1.4s cubic-bezier(0.6, 0, 0.8, 0.4);
}
.scene-enter-active {
  transition: opacity 0.7s ease 1s, transform 1.2s ease-out 1s;
}
.scene-enter-from {
  opacity: 0;
  transform: scale(1.2);
}
.scene-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease-in;
}
.scene-leave-to {
  opacity: 0;
  transform: scale(0.85);
}
</style>
