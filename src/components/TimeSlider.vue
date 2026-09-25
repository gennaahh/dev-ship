<script setup>
import { computed } from 'vue'
import { DAYS, END, START, TURN, WEEK, formatWeekMinute } from '../shipPosition.js'

const props = defineProps({
  minutes: { type: Number, required: true },
  live: { type: Boolean, required: true },
  status: { type: String, required: true },
})
const emit = defineEmits(['simulate', 'go-live'])

const pct = (m) => `${(m / WEEK) * 100}%`

// Traccia: grigia fuori orario, blu durante la navigazione.
const trackStyle = computed(() => ({
  background: `linear-gradient(90deg,
    var(--off) 0 ${pct(START)},
    var(--sail) ${pct(START)} ${pct(END)},
    var(--off) ${pct(END)} 100%)`,
}))

const markers = [
  { m: START, label: 'Partenza' },
  { m: TURN, label: 'Boa' },
  { m: END, label: 'Rientro' },
]

const label = computed(() => formatWeekMinute(props.minutes, props.live))
</script>

<template>
  <div class="panel">
    <div class="head">
      <div>
        <div class="time">{{ label }}</div>
        <div class="status">{{ status }}</div>
      </div>
      <span v-if="live" class="badge">● Live</span>
      <button v-else class="live-btn" @click="emit('go-live')">Torna all'ora attuale</button>
    </div>

    <div class="slider">
      <!-- rail rientra di mezzo cursore per allinearsi alla corsa reale del thumb -->
      <div class="rail">
        <div class="track" :style="trackStyle" />
        <span
          v-for="mk in markers"
          :key="mk.label"
          class="marker"
          :style="{ left: pct(mk.m) }"
          :title="`${mk.label} · ${formatWeekMinute(mk.m)}`"
        />
      </div>
      <input
        type="range"
        min="0"
        :max="WEEK - 1"
        step="5"
        :value="minutes"
        aria-label="Simula l'orario della settimana"
        @input="emit('simulate', Number($event.target.value))"
      />
    </div>

    <div class="days">
      <span v-for="d in DAYS" :key="d">{{ d.slice(0, 3) }}</span>
    </div>
  </div>
</template>

<style scoped>
.panel {
  --off: #c9d3dc;
  --sail: #2e86c1;
  --thumb-r: 9px;
  position: fixed;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: min(720px, calc(100% - 32px));
  box-sizing: border-box;
  padding: 12px 16px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(6px);
  color: #0e3a63;
  z-index: 20;
  box-shadow: 0 4px 16px rgba(14, 58, 99, 0.15);
}
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.time {
  font-size: 1.1rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.status {
  font-size: 0.85rem;
  opacity: 0.8;
}
.badge {
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #c0392b;
}
.live-btn {
  flex-shrink: 0;
  font: inherit;
  font-size: 0.8rem;
  padding: 6px 10px;
  border: 0;
  border-radius: 8px;
  background: #0e3a63;
  color: #fff;
  cursor: pointer;
}
.slider {
  position: relative;
  height: 28px;
  margin-top: 8px;
}
.rail {
  position: absolute;
  inset: 0 var(--thumb-r);
}
.track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 6px;
  margin-top: -3px;
  border-radius: 3px;
}
.marker {
  position: absolute;
  top: 50%;
  width: 4px;
  height: 16px;
  margin: -8px 0 0 -2px;
  border-radius: 2px;
  background: #0e3a63;
}
input[type='range'] {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  appearance: none;
  cursor: pointer;
}
input[type='range']::-webkit-slider-runnable-track {
  background: transparent;
}
input[type='range']::-moz-range-track {
  background: transparent;
}
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: calc(var(--thumb-r) * 2);
  height: calc(var(--thumb-r) * 2);
  border-radius: 50%;
  background: #fff;
  border: 3px solid #0e3a63;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}
input[type='range']::-moz-range-thumb {
  width: calc(var(--thumb-r) * 2 - 6px);
  height: calc(var(--thumb-r) * 2 - 6px);
  border-radius: 50%;
  background: #fff;
  border: 3px solid #0e3a63;
}
input[type='range']:focus-visible {
  outline: 2px solid #2e86c1;
  outline-offset: 2px;
  border-radius: 4px;
}
.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0 var(--thumb-r);
  text-align: center;
  font-size: 0.72rem;
  opacity: 0.7;
}
.days span + span {
  border-left: 1px solid rgba(14, 58, 99, 0.2);
}
</style>
