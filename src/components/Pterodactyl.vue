<template>
  <!-- attraversa il cielo da destra a sinistra, più volte nei suoi 5 minuti -->
  <div class="pterodactyl">
    <svg viewBox="0 0 140 70" xmlns="http://www.w3.org/2000/svg" aria-label="Pterodattilo">
      <g class="wing back">
        <path d="M72 34 L126 8 Q116 26 128 34 Q104 34 76 40 Z" fill="#6b5a3e" />
      </g>
      <!-- coda, corpo, testa con cresta e becco lungo rivolto a sinistra -->
      <path d="M84 36 L112 42 L84 40 Z" fill="#8a7450" />
      <ellipse cx="72" cy="37" rx="16" ry="7" fill="#8a7450" />
      <path d="M58 32 Q52 26 44 30 L6 33 L44 37 Q52 40 60 38 Z" fill="#9c8558" />
      <path d="M50 29 L70 14 L58 30 Z" fill="#b5472b" />
      <circle cx="47" cy="32" r="2" fill="#1b1b1b" />
      <path d="M66 44 L62 54 M76 44 L74 54" stroke="#6b5a3e" stroke-width="2.5" stroke-linecap="round" />
      <g class="wing front">
        <path d="M68 36 L20 4 Q34 24 14 34 Q42 34 64 42 Z" fill="#9c8558" />
        <path d="M68 36 L20 4" fill="none" stroke="#6b5a3e" stroke-width="2" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pterodactyl {
  position: absolute;
  /* sotto al pannello dello slider, che in alto lo coprirebbe */
  top: max(20%, 180px);
  width: clamp(200px, 30vw, 460px);
  animation: cross 28s linear infinite;
  z-index: 1;
}
.pterodactyl svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
  animation: soar 5s ease-in-out infinite alternate;
}
.wing {
  animation: flap 1.1s ease-in-out infinite;
  transform-origin: 68px 36px;
}
.wing.back {
  animation-delay: -0.1s;
}

@keyframes cross {
  from { left: 100%; transform: translateX(20px); }
  to { left: 0; transform: translateX(-100%); }
}
@keyframes soar {
  from { transform: translateY(-14px) rotate(-3deg); }
  to { transform: translateY(18px) rotate(3deg); }
}
@keyframes flap {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(-0.5); }
}
</style>
