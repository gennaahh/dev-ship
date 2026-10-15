<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import Fish from './Fish.vue'
import { formatKg, speciesFor } from './lake.js'

// La festa per un pesce da 5 kg o più, sopra tutta la zona di pesca: lampo, raggi che girano,
// coriandoli, il pesce gigante e i punti che salgono. La vede chiunque sia nella zona.
// Si chiude da sola dopo qualche secondo, o con un clic.
const props = defineProps({
  // { name, weight, points, mine }
  fish: { type: Object, required: true },
})
const emit = defineEmits(['done'])

const SHOW_MS = 6500
const COUNT_MS = 1400

const species = computed(() => speciesFor(props.fish.weight))
const legendary = computed(() => species.value.legendary)
const headline = computed(() => (legendary.value ? 'LEGGENDARIO!' : 'PESCE ENORME!'))
const who = computed(() => (props.fish.mine ? 'Hai preso' : `${props.fish.name} ha preso`))

const COLORS = ['#ffd54a', '#ff7a59', '#4fc3f7', '#9ccc65', '#f06292', '#ba68c8', '#fff8e6']
const confetti = Array.from({ length: 48 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  background: COLORS[i % COLORS.length],
  animationDelay: `${Math.random() * 1.2}s`,
  animationDuration: `${2.4 + Math.random() * 2}s`,
  '--spin': `${(Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 720)}deg`,
  '--drift': `${(Math.random() - 0.5) * 220}px`,
  width: `${8 + Math.random() * 8}px`,
  height: `${12 + Math.random() * 10}px`,
}))

// I punti contano da zero, come in sala giochi.
const shown = ref(0)
let raf = 0
let timer = 0
onMounted(() => {
  const start = performance.now() + 600
  const tick = (now) => {
    const t = Math.min(1, Math.max(0, (now - start) / COUNT_MS))
    shown.value = Math.round(props.fish.points * (1 - (1 - t) ** 3))
    if (t < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  timer = setTimeout(() => emit('done'), SHOW_MS)
})
onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearTimeout(timer)
})
</script>

<template>
  <div class="big-catch" :class="{ legendary }" role="alert" @click="emit('done')">
    <div class="flash" />
    <div class="rays" />
    <div class="confetti">
      <span v-for="(c, i) in confetti" :key="i" :style="c" />
    </div>

    <div class="stage">
      <h2 class="headline" :aria-label="headline">
        <span v-for="(ch, i) in headline" :key="i" :style="{ animationDelay: `${0.25 + i * 0.05}s` }">{{ ch === ' ' ? ' ' : ch }}</span>
      </h2>
      <svg class="fish" viewBox="-110 -80 220 160" aria-hidden="true">
        <g class="splash" fill="#bfefff" stroke="#2d2a4a" stroke-width="3">
          <circle v-for="i in 10" :key="i" r="7" :style="{ '--a': `${i * 36}deg` }" />
        </g>
        <g class="jump">
          <g class="wobble">
            <Fish :kg="fish.weight" />
          </g>
        </g>
      </svg>
      <p class="who">{{ who }} {{ species.a }} <b>{{ species.name }}</b></p>
      <div class="numbers">
        <span class="kg">{{ formatKg(fish.weight) }}</span>
        <span class="points">+{{ shown }} pt</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.big-catch {
  position: absolute;
  inset: 0;
  z-index: 50;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: radial-gradient(circle at 50% 50%, rgba(31, 42, 92, 0.35), rgba(31, 42, 92, 0.85));
  color: #fff8e6;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  cursor: pointer;
  animation: fade-in 0.25s ease-out, fade-out 0.6s 5.9s ease-in forwards;
}
@keyframes fade-in {
  from { opacity: 0; }
}
@keyframes fade-out {
  to { opacity: 0; }
}
.flash {
  position: absolute;
  inset: 0;
  background: #fff;
  pointer-events: none;
  animation: flash 0.7s ease-out forwards;
}
@keyframes flash {
  from { opacity: 0.95; }
  to { opacity: 0; }
}
.rays {
  position: absolute;
  width: 220vmax;
  height: 220vmax;
  background: repeating-conic-gradient(rgba(255, 213, 74, 0.32) 0 10deg, transparent 10deg 20deg);
  mask-image: radial-gradient(circle, #000 0 18%, transparent 52%);
  animation: rays 9s linear infinite;
}
.legendary .rays {
  background: repeating-conic-gradient(rgba(143, 211, 255, 0.4) 0 8deg, rgba(255, 122, 168, 0.25) 8deg 16deg, transparent 16deg 24deg);
}
@keyframes rays {
  to { rotate: 360deg; }
}
.confetti span {
  position: absolute;
  top: -30px;
  border: 2px solid #2d2a4a;
  border-radius: 3px;
  animation: fall linear forwards;
}
@keyframes fall {
  to { transform: translate(var(--drift), 110vh) rotate(var(--spin)); }
}
.stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 16px;
  text-align: center;
}
.headline {
  margin: 0;
  font-size: clamp(44px, 9vw, 104px);
  font-weight: normal;
  line-height: 1;
  white-space: nowrap;
  color: #ffd54a;
  -webkit-text-stroke: 6px #2d2a4a;
  paint-order: stroke fill;
  text-shadow: 0 8px 0 #b3541e;
}
.legendary .headline span {
  animation:
    letter 0.5s cubic-bezier(0.3, 1.8, 0.5, 1) backwards,
    rainbow 1.6s linear infinite;
}
.headline span {
  display: inline-block;
  animation: letter 0.5s cubic-bezier(0.3, 1.8, 0.5, 1) backwards;
}
@keyframes letter {
  from { transform: translateY(-80px) scale(0.2) rotate(-30deg); opacity: 0; }
}
@keyframes rainbow {
  0%, 100% { color: #ffd54a; }
  33% { color: #8fd3ff; }
  66% { color: #ff7aa8; }
}
.fish {
  width: min(440px, 80vw);
  margin: -10px 0 -20px;
  overflow: visible;
}
.jump {
  animation: jump 0.9s cubic-bezier(0.2, 1.4, 0.4, 1) backwards;
}
@keyframes jump {
  from { transform: translateY(140px) scale(0.3) rotate(-60deg); opacity: 0; }
}
.wobble {
  animation: wobble 0.7s 0.9s ease-in-out infinite alternate;
}
@keyframes wobble {
  from { transform: rotate(-8deg) translateY(4px); }
  to { transform: rotate(8deg) translateY(-6px); }
}
.splash circle {
  opacity: 0;
  animation: splash 1s 0.15s ease-out forwards;
}
@keyframes splash {
  0% { transform: rotate(var(--a)) translateY(20px) scale(1.6); opacity: 1; }
  100% { transform: rotate(var(--a)) translateY(-110px) scale(0.3); opacity: 0; }
}
.who {
  margin: 0;
  font-size: clamp(20px, 3vw, 32px);
  -webkit-text-stroke: 4px #2d2a4a;
  paint-order: stroke fill;
  animation: rise 0.5s 0.7s ease-out backwards;
}
.who b {
  font-weight: normal;
  color: #ffd54a;
}
.numbers {
  display: flex;
  gap: 18px;
  margin-top: 12px;
  animation: rise 0.5s 0.9s ease-out backwards;
}
.numbers span {
  padding: 6px 18px 8px;
  border: 5px solid #2d2a4a;
  border-radius: 16px;
  box-shadow: 0 5px 0 #2d2a4a;
  font-size: clamp(24px, 3.6vw, 40px);
}
.kg {
  background: #4fc3f7;
  color: #2d2a4a;
}
.points {
  min-width: 4.5ch;
  background: #ffd54a;
  color: #2d2a4a;
}
@keyframes rise {
  from { transform: translateY(30px); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .big-catch,
  .big-catch * {
    animation-duration: 0.01s !important;
    animation-iteration-count: 1 !important;
  }
  .big-catch {
    animation: none;
  }
  .confetti {
    display: none;
  }
}
</style>
