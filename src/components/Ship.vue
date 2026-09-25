<script setup>
defineProps({
  facingLeft: { type: Boolean, default: false },
})
</script>

<template>
  <div class="ship" :class="{ 'facing-left': facingLeft }">
    <svg viewBox="0 0 220 150" xmlns="http://www.w3.org/2000/svg" aria-label="Nave">
      <!-- fumo -->
      <g class="smoke" fill="#e8eef3">
        <circle cx="128" cy="18" r="7" />
        <circle cx="116" cy="10" r="9" />
        <circle cx="100" cy="6" r="6" />
      </g>
      <!-- ciminiera -->
      <rect x="122" y="28" width="18" height="34" fill="#c0392b" />
      <rect x="122" y="28" width="18" height="7" fill="#222" />
      <!-- sovrastruttura -->
      <rect x="60" y="60" width="100" height="30" rx="3" fill="#f4f4f4" />
      <rect x="80" y="44" width="56" height="18" rx="3" fill="#ffffff" />
      <g fill="#5dade2">
        <rect x="88" y="49" width="10" height="8" rx="1.5" />
        <rect x="103" y="49" width="10" height="8" rx="1.5" />
        <rect x="118" y="49" width="10" height="8" rx="1.5" />
        <circle cx="75" cy="75" r="4.5" />
        <circle cx="93" cy="75" r="4.5" />
        <circle cx="111" cy="75" r="4.5" />
        <circle cx="129" cy="75" r="4.5" />
        <circle cx="147" cy="75" r="4.5" />
      </g>
      <!-- scafo (prua a destra) -->
      <path d="M10 90 H210 L185 132 H35 Z" fill="#1f3a5f" />
      <path d="M22 110 H198 L193 118 H28 Z" fill="#c0392b" />
      <!-- bandiera a poppa -->
      <line x1="22" y1="90" x2="22" y2="62" stroke="#333" stroke-width="2" />
      <path class="flag" d="M22 62 L4 67 L22 72 Z" fill="#f1c40f" />
    </svg>
  </div>
</template>

<style scoped>
.ship {
  width: 100%;
  animation: bob 3.2s ease-in-out infinite;
  transform-origin: 50% 90%;
}
.ship svg {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 0.8s ease;
}
.facing-left svg {
  transform: scaleX(-1);
}
.smoke circle {
  animation: puff 3s ease-out infinite;
  opacity: 0.8;
}
.smoke circle:nth-child(2) { animation-delay: 1s; }
.smoke circle:nth-child(3) { animation-delay: 2s; }

@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(-1.2deg); }
  50% { transform: translateY(6px) rotate(1.2deg); }
}
@keyframes puff {
  0% { transform: translate(0, 0) scale(0.7); opacity: 0.8; }
  100% { transform: translate(-14px, -10px) scale(1.4); opacity: 0; }
}
</style>
