<template>
  <div class="scene">
    <div class="sun" />
    <div class="cloud c1" />
    <div class="cloud c2" />
    <div class="cloud c3" />
    <slot name="sky" />

    <div class="sea">
      <div
        v-for="(w, i) in waves"
        :key="i"
        class="wave"
        :style="{
          bottom: w.bottom,
          height: w.height,
          animationDuration: w.duration,
          animationDirection: w.reverse ? 'reverse' : 'normal',
          zIndex: w.z,
        }"
      >
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0 Z"
            :fill="w.color"
          />
        </svg>
        <svg viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path
            d="M0 50 Q150 0 300 50 T600 50 T900 50 T1200 50 V100 H0 Z"
            :fill="w.color"
          />
        </svg>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup>
// z-index: le onde con z > 10 passano davanti alla nave (che ha z-index 10).
const waves = [
  { bottom: '52%', height: '9%', color: '#3f8fc4', duration: '22s', reverse: false, z: 1 },
  { bottom: '38%', height: '10%', color: '#2f7bb3', duration: '17s', reverse: true, z: 2 },
  { bottom: '22%', height: '11%', color: '#23679c', duration: '13s', reverse: false, z: 11 },
  { bottom: '0%', height: '24%', color: '#1a5283', duration: '10s', reverse: true, z: 12 },
]
</script>

<style scoped>
.scene {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(#8ecdf0 0%, #cdeafa 45%, #fdf1d6 55%);
}
.sun {
  position: absolute;
  top: 8%;
  right: 12%;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6b0 0%, #ffd54a 60%, #ffb300 100%);
  box-shadow: 0 0 60px 20px rgba(255, 213, 74, 0.5);
}
.cloud {
  position: absolute;
  height: 34px;
  background: #fff;
  border-radius: 40px;
  opacity: 0.9;
  animation: drift linear infinite;
}
.cloud::before,
.cloud::after {
  content: '';
  position: absolute;
  background: #fff;
  border-radius: 50%;
}
.cloud::before { width: 50px; height: 50px; top: -25px; left: 18px; }
.cloud::after { width: 38px; height: 38px; top: -16px; left: 56px; }
.c1 { top: 10%; width: 120px; animation-duration: 90s; animation-delay: -20s; }
.c2 { top: 22%; width: 150px; animation-duration: 120s; animation-delay: -70s; }
.c3 { top: 5%; width: 100px; animation-duration: 75s; animation-delay: -45s; }

.sea {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 50%;
  background: linear-gradient(#4a9fd4, #0e3a63);
}
.wave {
  position: absolute;
  left: 0;
  width: 200%;
  display: flex;
  animation: roll linear infinite;
}
.wave svg {
  width: 50%;
  height: 100%;
  display: block;
}

@keyframes roll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes drift {
  from { transform: translateX(-200px); left: 0; }
  to { transform: translateX(0); left: 100%; }
}
</style>
