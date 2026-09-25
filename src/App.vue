<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Sea from './components/Sea.vue'
import Ship from './components/Ship.vue'
import Port from './components/Port.vue'
import Buoy from './components/Buoy.vue'
import Seagulls from './components/Seagulls.vue'
import Kraken from './components/Kraken.vue'
import Pterodactyl from './components/Pterodactyl.vue'
import Poseidon from './components/Poseidon.vue'
import Sharks from './components/Sharks.vue'
import Weather from './components/Weather.vue'
import LunchScene from './components/LunchScene.vue'
import PortScene from './components/PortScene.vue'
import RestScene from './components/RestScene.vue'
import TimeSlider from './components/TimeSlider.vue'
import { isLunchTime, isRestTime, minutesSinceMonday, shipPosition } from './shipPosition.js'
import { isKrakenTime, isPoseidonTime, isPterodactylTime } from './monsters.js'
import { weatherAt } from './weather.js'
import { weekId } from './weekRandom.js'

const liveMinutes = ref(minutesSinceMonday(new Date()))
const liveWeek = ref(weekId(new Date()))

// Orario simulato con lo slider (null = tempo reale).
// ?at=2026-09-23T13:30 apre direttamente la simulazione a quell'istante.
const atParam = new URLSearchParams(location.search).get('at')
const simulatedMinutes = ref(atParam ? minutesSinceMonday(new Date(atParam)) : null)
// Settimana simulata: serve allo pterodattilo, che ogni settimana passa in un giorno diverso.
const simulatedWeek = ref(atParam ? weekId(new Date(atParam)) : null)

const live = computed(() => simulatedMinutes.value === null)
const minutes = computed(() => (live.value ? liveMinutes.value : simulatedMinutes.value))
const week = computed(() => (live.value ? liveWeek.value : (simulatedWeek.value ?? liveWeek.value)))

function goLive() {
  simulatedMinutes.value = null
  simulatedWeek.value = null
}

let timer
onMounted(() => {
  timer = setInterval(() => {
    const now = new Date()
    liveMinutes.value = minutesSinceMonday(now)
    liveWeek.value = weekId(now)
  }, 1000)
})
onUnmounted(() => clearInterval(timer))

const position = computed(() => shipPosition(minutes.value))
// Scena ravvicinata, in ordine di precedenza: pranzo a bordo, lavori in porto quando la nave
// è ormeggiata, riposo dell'equipaggio la sera e la notte in navigazione.
const scene = computed(() => {
  if (isLunchTime(minutes.value)) return 'lunch'
  if (position.value.direction === 'docked') return 'port'
  if (isRestTime(minutes.value)) return 'rest'
  return null
})

// Mostri: solo nella vista del mare aperto, mai durante le scene ravvicinate.
const monsters = computed(() => ({
  kraken: !scene.value && isKrakenTime(minutes.value),
  pterodactyl: !scene.value && isPterodactylTime(minutes.value, week.value),
  poseidon: !scene.value && isPoseidonTime(minutes.value),
}))

// Maltempo: anche questo solo nella vista del mare aperto.
const weather = computed(() => (scene.value ? null : weatherAt(minutes.value, week.value)))

// La nave va dalla banchina del porto (progress 0) fino a fianco della boa (progress 1).
const shipLeft = computed(
  () => `(var(--port-w) + (100% - var(--port-w) - var(--buoy-zone) - var(--ship-w)) * ${position.value.progress})`,
)
const shipStyle = computed(() => ({ left: `calc${shipLeft.value}` }))
// Poseidone sta attaccato alla poppa (la nave rientra verso sinistra), un po' nascosto dietro lo scafo.
const poseidonStyle = computed(() => ({ left: `calc(${shipLeft.value} + var(--ship-w) * 0.72)` }))

// Lo zoom delle scene (pranzo, porto, riposo) punta al ponte della nave: la nave poggia all'85%
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
  rest: 'Fine turno: l\'equipaggio riposa',
}
const weatherStatus = {
  storm: 'Tempesta in mare!',
  fog: 'Nebbia fitta',
}
const monsterStatus = {
  kraken: 'Il Kraken è emerso!',
  pterodactyl: 'Uno pterodattilo in cielo!',
  poseidon: 'Poseidone spinge la nave verso casa',
}
const statusText = computed(() => {
  if (scene.value) return sceneStatus[scene.value]
  const sighted = Object.keys(monsterStatus).filter((k) => monsters.value[k])
  return [
    `${status[position.value.direction]} · ${Math.round(position.value.progress * 100)}%`,
    ...(weather.value ? [weatherStatus[weather.value]] : []),
    ...sighted.map((k) => monsterStatus[k]),
  ].join(' · ')
})
</script>

<template>
  <div class="world" :class="{ zoomed: scene, storm: weather === 'storm' }" :style="worldStyle">
    <Sea>
      <template #sky>
        <Seagulls />
        <Transition name="monster-fly">
          <Pterodactyl v-if="monsters.pterodactyl" />
        </Transition>
      </template>
      <Port />
      <Buoy />
      <Transition name="monster">
        <Kraken v-if="monsters.kraken" />
      </Transition>
      <Transition name="monster">
        <Poseidon v-if="monsters.poseidon" class="follow-ship" :class="{ simulating: !live }" :style="poseidonStyle" />
      </Transition>
      <Sharks />
      <div class="ship-wrap" :class="{ simulating: !live }" :style="shipStyle">
        <Ship :facing-left="position.direction === 'left'" />
      </div>
    </Sea>
    <Transition name="weather">
      <Weather v-if="weather" :key="weather" :kind="weather" />
    </Transition>
  </div>

  <Transition name="scene" mode="out-in">
    <LunchScene v-if="scene === 'lunch'" />
    <PortScene v-else-if="scene === 'port'" />
    <RestScene v-else-if="scene === 'rest'" />
  </Transition>

  <TimeSlider
    :minutes="minutes"
    :live="live"
    :status="statusText"
    @simulate="simulatedMinutes = $event"
    @go-live="goLive"
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
  --poseidon-w: clamp(110px, 18vw, 250px);
}
.ship-wrap {
  position: absolute;
  bottom: 30%;
  width: var(--ship-w);
  z-index: 10;
}
.ship-wrap,
.follow-ship {
  transition: left 1s linear;
}
/* Mentre si trascina lo slider la nave (e chi la segue) si sposta subito, senza ritardo. */
.ship-wrap.simulating,
.follow-ship.simulating {
  transition: left 0.25s ease-out;
}

/* I mostri marini salgono dall'acqua e ci tornano; lo pterodattilo compare e sparisce in volo. */
.monster-enter-active,
.monster-leave-active {
  transition: opacity 1.2s ease, translate 1.2s ease;
}
.monster-enter-from,
.monster-leave-to {
  opacity: 0;
  translate: 0 60%;
}
/* Con la tempesta la nave rolla di più e più in fretta. */
.world.storm .ship {
  animation: storm-roll 1.6s ease-in-out infinite;
}
@keyframes storm-roll {
  0%, 100% { transform: translateY(-4px) rotate(-5deg); }
  50% { transform: translateY(8px) rotate(5deg); }
}
/* Il maltempo arriva e se ne va piano. */
.weather-enter-active,
.weather-leave-active {
  transition: opacity 2.5s ease;
}
.weather-enter-from,
.weather-leave-to {
  opacity: 0;
}

.monster-fly-enter-active,
.monster-fly-leave-active {
  transition: opacity 1s ease;
}
.monster-fly-enter-from,
.monster-fly-leave-to {
  opacity: 0;
}

/* Pausa pranzo, lavori in porto e riposo: zoom sulla nave, poi compare la scena.
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
