<script setup>
import { computed, ref } from 'vue'
import DevShip from '../components/DevShip.vue'
import Leaderboard from './Leaderboard.vue'
import Changelog from './Changelog.vue'

const props = defineProps({
  zoomed: { type: Boolean, default: false },
})
const emit = defineEmits(['zoom', 'fullscreen'])

// Lo schermo alterna dev-ship, classifica e changelog ogni 5 secondi. Il cambio lo dà la fine
// dell'animazione della barra di avanzamento: mettendola in pausa si ferma anche la rotazione.
const VIEWS = [
  { id: 'ship', label: 'Dev-ship' },
  { id: 'leaderboard', label: 'Classifica' },
  { id: 'changelog', label: 'Changelog' },
]
const current = ref(0)
// Cambia a ogni giro, così la barra riparte anche quando si sceglie a mano la stessa vista.
const cycle = ref(0)
const view = computed(() => VIEWS[current.value].id)

function show(i) {
  current.value = i
  cycle.value++
}
const next = () => show((current.value + 1) % VIEWS.length)

// Da vicino, col puntatore sullo schermo, la rotazione si ferma: si può usare lo slider in pace.
const hovering = ref(false)
const paused = computed(() => props.zoomed && hovering.value)

function onClick() {
  if (!props.zoomed) emit('zoom')
}
</script>

<template>
  <div class="billboard" :class="{ zoomed }" @click="onClick">
    <svg class="supports" viewBox="0 380 620 240" aria-hidden="true">
      <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round">
        <path d="M 150 392 L 470 560 M 470 392 L 150 560" stroke-width="10" />
        <path d="M 150 392 L 470 560 M 470 392 L 150 560" stroke="#7d7aa6" stroke-width="4" />
        <rect x="104" y="388" width="32" height="216" fill="#57537f" />
        <rect x="484" y="388" width="32" height="216" fill="#57537f" />
        <rect x="112" y="388" width="8" height="216" fill="#7d7aa6" stroke="none" />
        <rect x="492" y="388" width="8" height="216" fill="#7d7aa6" stroke="none" />
        <rect x="86" y="596" width="68" height="20" rx="4" fill="#b9b2a4" />
        <rect x="466" y="596" width="68" height="20" rx="4" fill="#b9b2a4" />
      </g>
    </svg>

    <div class="bulbs" aria-hidden="true">
      <span v-for="i in 16" :key="i" />
    </div>

    <div class="frame">
      <span v-for="c in ['tl', 'tr', 'bl', 'br']" :key="c" class="rivet" :class="c" />
      <div
        class="screen"
        @pointerenter="hovering = true"
        @pointerleave="hovering = false"
      >
        <div class="screen-inner">
          <div class="view" :class="{ active: view === 'ship' }">
            <DevShip :controls="zoomed && view === 'ship'" />
          </div>
          <div class="view" :class="{ active: view === 'leaderboard' }">
            <Leaderboard />
          </div>
          <div class="view" :class="{ active: view === 'changelog' }">
            <Changelog :active="view === 'changelog'" />
          </div>
        </div>
        <div :key="cycle" class="glitch" aria-hidden="true" />
        <div class="glare" aria-hidden="true" />
        <span v-if="paused" class="pause">❚❚ in pausa</span>
      </div>

      <div class="tabs">
        <button
          v-for="(v, i) in VIEWS"
          :key="v.id"
          class="tab"
          :class="{ active: i === current }"
          :tabindex="zoomed ? 0 : -1"
          :title="v.id === 'ship' ? 'Doppio clic: dev-ship a schermo intero' : undefined"
          @click.stop="zoomed ? show(i) : onClick()"
          @dblclick.stop="v.id === 'ship' && emit('fullscreen')"
        >
          <span class="led" />
          {{ v.label }}
          <span class="bar">
            <span
              v-if="i === current"
              :key="cycle"
              class="fill"
              :class="{ paused }"
              @animationend="next"
            />
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.billboard {
  position: absolute;
  left: 490px;
  top: 140px;
  width: 620px;
  height: 392px;
  cursor: zoom-in;
}
.billboard.zoomed {
  cursor: default;
}
.supports {
  position: absolute;
  left: 0;
  top: 380px;
  width: 620px;
  height: 240px;
  overflow: visible;
}

.bulbs {
  position: absolute;
  left: 16px;
  right: 16px;
  top: -16px;
  display: flex;
  justify-content: space-between;
}
.bulbs span {
  width: 18px;
  height: 18px;
  border: 4px solid #2d2a4a;
  border-radius: 50%;
  background: #fff3a8;
  box-shadow: 0 0 12px 3px rgba(255, 220, 90, 0.8);
  animation: blink 1.2s steps(1) infinite;
}
.bulbs span:nth-child(even) {
  animation-delay: -0.6s;
}
@keyframes blink {
  50% {
    background: #c9a94a;
    box-shadow: none;
  }
}

.frame {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  border: 6px solid #2d2a4a;
  border-radius: 18px;
  background: linear-gradient(#6a669a, #4b4870);
  box-shadow: inset 0 6px 0 rgba(255, 255, 255, 0.18), 0 10px 0 rgba(45, 42, 74, 0.35);
}
.rivet {
  position: absolute;
  width: 10px;
  height: 10px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
  background: #b9b6d8;
}
.rivet.tl { left: 4px; top: 4px; }
.rivet.tr { right: 4px; top: 4px; }
.rivet.bl { left: 4px; bottom: 4px; }
.rivet.br { right: 4px; bottom: 4px; }

/* Lo schermo è 576 × 324: dentro, le schermate girano a 1280 × 720 scalate. */
.screen {
  position: absolute;
  left: 12px;
  top: 12px;
  width: 576px;
  height: 324px;
  border: 4px solid #2d2a4a;
  border-radius: 6px;
  overflow: hidden;
  background: #111;
  pointer-events: none;
}
.zoomed .screen {
  pointer-events: auto;
}
.screen-inner {
  position: absolute;
  left: 0;
  top: 0;
  width: 1280px;
  height: 720px;
  transform: scale(0.45);
  transform-origin: 0 0;
}
/* Cambio vista: la nuova scende dall'alto come una tendina sopra la vecchia. */
.view {
  position: absolute;
  inset: 0;
  z-index: 0;
  clip-path: inset(0 0 100% 0);
  transition: clip-path 0s linear 0.7s;
}
.view.active {
  z-index: 1;
  clip-path: inset(0 0 0 0);
  transition: clip-path 0.7s cubic-bezier(0.5, 0, 0.3, 1);
}
.glitch {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: repeating-linear-gradient(transparent 0 3px, rgba(255, 255, 255, 0.25) 3px 4px);
  animation: glitch 0.7s ease-out forwards;
}
@keyframes glitch {
  from { opacity: 1; }
  to { opacity: 0; }
}
.glare {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: linear-gradient(115deg, rgba(255, 255, 255, 0.22) 0 18%, transparent 18% 26%, rgba(255, 255, 255, 0.1) 26% 30%, transparent 30%);
  transition: opacity 0.6s ease;
}
.zoomed .glare {
  opacity: 0.35;
}

.tabs {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 4px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 24px;
  padding: 0 10px 0 6px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #3b3860;
  color: #b9b6d8;
  font: inherit;
  font-size: 14px;
  white-space: nowrap;
  cursor: inherit;
}
.zoomed .tab {
  cursor: pointer;
}
.tab.active {
  background: #2d2a4a;
  color: #fff3a8;
}
.led {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #6d6a8f;
}
.tab.active .led {
  background: #7dff8a;
  box-shadow: 0 0 6px #7dff8a;
}
.bar {
  position: relative;
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: #57537f;
  overflow: hidden;
}
.fill {
  position: absolute;
  inset: 0;
  transform-origin: 0 50%;
  background: #fff3a8;
  animation: progress 5s linear forwards;
}
.fill.paused {
  animation-play-state: paused;
}
@keyframes progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
.pause {
  position: absolute;
  right: 10px;
  bottom: 8px;
  z-index: 4;
  pointer-events: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>
