<script setup>
defineProps({
  kind: { type: String, required: true }, // 'storm' | 'fog'
})

// Gocce di pioggia, distribuite in modo deterministico su tutta la larghezza.
const drops = Array.from({ length: 110 }, (_, i) => ({
  left: `${(i * 61.8) % 104 - 2}%`,
  height: `${40 + (i % 5) * 12}px`,
  duration: `${0.55 + (i % 7) * 0.06}s`,
  delay: `${(i * -0.137) % 1}s`,
  opacity: 0.35 + (i % 4) * 0.12,
}))

const stormClouds = [
  { top: '2%', width: 420, duration: 55, delay: -10 },
  { top: '10%', width: 520, duration: 70, delay: -45 },
  { top: '-2%', width: 380, duration: 48, delay: -30 },
  { top: '16%', width: 300, duration: 62, delay: -5 },
]

// Banchi di nebbia: più densi vicino all'acqua, dove sta la nave.
const fogBanks = [
  { bottom: '44%', height: '22%', duration: 70, opacity: 0.55 },
  { bottom: '30%', height: '26%', duration: 55, opacity: 0.75, reverse: true },
  { bottom: '14%', height: '28%', duration: 80, opacity: 0.7 },
  { bottom: '-4%', height: '26%', duration: 62, opacity: 0.6, reverse: true },
]
</script>

<template>
  <div class="weather" :class="kind">
    <template v-if="kind === 'storm'">
      <div class="gloom" />
      <div
        v-for="(c, i) in stormClouds"
        :key="`c${i}`"
        class="storm-cloud"
        :style="{ top: c.top, width: `${c.width}px`, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }"
      />
      <div class="rain">
        <span
          v-for="(d, i) in drops"
          :key="i"
          :style="{
            left: d.left,
            height: d.height,
            opacity: d.opacity,
            animationDuration: d.duration,
            animationDelay: d.delay,
          }"
        />
      </div>
      <!-- lampi: il cielo si illumina e compare la saetta, due volte per ciclo in punti diversi -->
      <div class="flash" />
      <svg class="bolt b1" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M34 0 L14 88 L32 88 L10 200 L50 70 L30 70 L46 0 Z" fill="#fffbe0" />
      </svg>
      <svg class="bolt b2" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M34 0 L14 88 L32 88 L10 200 L50 70 L30 70 L46 0 Z" fill="#fffbe0" />
      </svg>
    </template>

    <template v-else>
      <div class="haze" />
      <div
        v-for="(f, i) in fogBanks"
        :key="i"
        class="fog-bank"
        :style="{
          bottom: f.bottom,
          height: f.height,
          opacity: f.opacity,
          animationDuration: `${f.duration}s`,
          animationDirection: f.reverse ? 'alternate-reverse' : 'alternate',
        }"
      />
    </template>
  </div>
</template>

<style scoped>
.weather {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 14;
}

/* --- tempesta --- */
.gloom {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(28, 32, 48, 0.82), rgba(40, 48, 66, 0.55) 50%, rgba(10, 20, 40, 0.4));
}
.storm-cloud {
  position: absolute;
  height: 90px;
  border-radius: 60px;
  background: #3a4150;
  box-shadow:
    60px -40px 0 10px #434a5a,
    160px -20px 0 20px #394050,
    260px -36px 0 6px #444b5b;
  animation: drift linear infinite;
}
.rain span {
  position: absolute;
  top: -80px;
  width: 2px;
  background: linear-gradient(transparent, rgba(210, 225, 245, 0.9));
  animation: fall linear infinite;
}
.flash {
  position: absolute;
  inset: 0;
  background: #f4f7ff;
  opacity: 0;
  animation: flash-sky 9s linear infinite;
}
.bolt {
  position: absolute;
  top: 6%;
  width: clamp(40px, 5vw, 70px);
  opacity: 0;
  filter: drop-shadow(0 0 12px #fff6b0);
  animation: flash 9s linear infinite;
}
.bolt.b1 {
  left: 30%;
}
.bolt.b2 {
  left: 72%;
  animation-delay: -4.2s;
}
/* --- nebbia --- */
.haze {
  position: absolute;
  inset: 0;
  background: linear-gradient(rgba(214, 222, 228, 0.7), rgba(226, 232, 236, 0.55) 45%, rgba(210, 220, 228, 0.5));
}
.fog-bank {
  position: absolute;
  left: -50%;
  width: 200%;
  background: radial-gradient(ellipse at center, rgba(240, 244, 247, 0.95) 0%, rgba(240, 244, 247, 0.6) 45%, transparent 70%);
  filter: blur(6px);
  animation: roll ease-in-out infinite alternate;
}

@keyframes drift {
  from { left: -40%; }
  to { left: 110%; }
}
@keyframes fall {
  from { transform: translate(0, 0) rotate(12deg); }
  to { transform: translate(-22vh, 115vh) rotate(12deg); }
}
/* doppio lampo ravvicinato, poi buio */
@keyframes flash {
  0%, 60%, 100% { opacity: 0; }
  61% { opacity: 1; }
  62% { opacity: 0.1; }
  63.5% { opacity: 1; }
  66% { opacity: 0; }
}
@keyframes flash-sky {
  0%, 13%, 60%, 100% { opacity: 0; }
  14%, 61% { opacity: 0.55; }
  15%, 62% { opacity: 0.05; }
  16.5%, 63.5% { opacity: 0.6; }
  19%, 66% { opacity: 0; }
}
@keyframes roll {
  from { transform: translateX(-12%); }
  to { transform: translateX(12%); }
}
</style>
