<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Sea from './components/Sea.vue'
import Ship from './components/Ship.vue'
import Port from './components/Port.vue'
import Buoy from './components/Buoy.vue'
import TimeSlider from './components/TimeSlider.vue'
import { minutesSinceMonday, shipPosition } from './shipPosition.js'

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

// La nave va dalla banchina del porto (progress 0) fino a fianco della boa (progress 1).
const shipStyle = computed(() => ({
  left: `calc(var(--port-w) + (100% - var(--port-w) - var(--buoy-zone) - var(--ship-w)) * ${position.value.progress})`,
}))

const status = {
  right: 'In navigazione verso la boa',
  left: 'Giro di boa fatto, rientro in porto',
  docked: 'Ormeggiata in porto',
}
const statusText = computed(
  () => `${status[position.value.direction]} · ${Math.round(position.value.progress * 100)}%`,
)
</script>

<template>
  <Sea>
    <Port />
    <Buoy />
    <div class="ship-wrap" :class="{ simulating: !live }" :style="shipStyle">
      <Ship :facing-left="position.direction === 'left'" />
    </div>
  </Sea>

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
</style>
