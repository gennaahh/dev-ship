<script setup>
// Gabbiani che attraversano lentamente il cielo. I delay negativi li mettono
// già in volo al caricamento, invece di farli entrare tutti insieme dal bordo.
const gulls = [
  { top: '20%', size: 34, duration: 70, delay: -10, reverse: false },
  { top: '26%', size: 26, duration: 85, delay: -50, reverse: false },
  { top: '32%', size: 40, duration: 60, delay: -35, reverse: true },
  { top: '17%', size: 22, duration: 95, delay: -70, reverse: true },
  { top: '36%', size: 30, duration: 78, delay: -20, reverse: false },
]
</script>

<template>
  <div
    v-for="(g, i) in gulls"
    :key="i"
    class="gull"
    :style="{
      top: g.top,
      width: `${g.size}px`,
      animationDuration: `${g.duration}s`,
      animationDelay: `${g.delay}s`,
      animationDirection: g.reverse ? 'reverse' : 'normal',
    }"
  >
    <svg
      viewBox="0 0 40 20"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      :style="{ animationDelay: `${i * -1.3}s` }"
    >
      <g fill="none" stroke="#4a4f55" stroke-width="2.2" stroke-linecap="round">
        <path class="wing left" d="M20 10 Q12 1 2 7" :style="{ animationDelay: `${i * -0.7}s` }" />
        <path class="wing right" d="M20 10 Q28 1 38 7" :style="{ animationDelay: `${i * -0.7}s` }" />
      </g>
      <ellipse cx="20" cy="10.5" rx="2.2" ry="1.6" fill="#4a4f55" />
    </svg>
  </div>
</template>

<style scoped>
.gull {
  position: absolute;
  animation: fly linear infinite;
}
.gull svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  animation: glide 7s ease-in-out infinite alternate;
}
/* Due battiti d'ala e poi una lunga planata. */
.wing {
  animation: flap 3.4s ease-in-out infinite;
  transform-origin: 20px 10px;
}
.wing.right {
  animation-name: flap-right;
}

@keyframes fly {
  from { left: 0; transform: translateX(-60px); }
  to { left: 100%; transform: translateX(0); }
}
@keyframes glide {
  from { transform: translateY(-8px); }
  to { transform: translateY(8px); }
}
@keyframes flap {
  0%, 30%, 100% { transform: rotate(0); }
  8%, 22% { transform: rotate(-28deg); }
}
@keyframes flap-right {
  0%, 30%, 100% { transform: rotate(0); }
  8%, 22% { transform: rotate(28deg); }
}
</style>
