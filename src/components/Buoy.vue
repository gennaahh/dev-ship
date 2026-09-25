<template>
  <div class="buoy">
    <svg viewBox="0 0 60 110" xmlns="http://www.w3.org/2000/svg" aria-label="Boa">
      <circle class="light" cx="30" cy="10" r="9" fill="#ff5252" />
      <circle cx="30" cy="10" r="4" fill="#ff8a80" />
      <!-- gabbia -->
      <g stroke="#2c2c2c" stroke-width="2.5">
        <line x1="22" y1="55" x2="27" y2="16" />
        <line x1="38" y1="55" x2="33" y2="16" />
        <line x1="30" y1="55" x2="30" y2="16" />
        <line x1="24" y1="36" x2="36" y2="36" />
      </g>
      <!-- corpo a strisce -->
      <path d="M10 55 H50 L46 95 H14 Z" fill="#e53935" />
      <path d="M11.2 67 H48.8 L47.8 80 H12.2 Z" fill="#fafafa" />
      <!-- zavorra -->
      <ellipse cx="30" cy="97" rx="20" ry="6" fill="#8e1b1b" />
    </svg>
  </div>
</template>

<style scoped>
.buoy {
  position: absolute;
  right: calc((var(--buoy-zone) - var(--buoy-w)) / 2);
  bottom: 26%;
  width: var(--buoy-w);
  z-index: 10;
  animation: bob 2.6s ease-in-out infinite;
  transform-origin: 50% 90%;
}
.buoy svg {
  display: block;
  width: 100%;
  height: auto;
}
.light {
  animation: flash 2s steps(1) infinite;
  filter: blur(2px);
}
@keyframes bob {
  0%, 100% { transform: translateY(0) rotate(4deg); }
  50% { transform: translateY(5px) rotate(-4deg); }
}
@keyframes flash {
  0%, 100% { opacity: 1; }
  30% { opacity: 0.1; }
}
</style>
