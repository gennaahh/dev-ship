<template>
  <!-- Emerge dietro la poppa della nave che rientra (verso sinistra): la spinge con la mano
       e le soffia vento alle spalle. Il busto sparisce sotto l'onda davanti (z-index 11). -->
  <div class="poseidon">
    <svg viewBox="0 0 220 230" xmlns="http://www.w3.org/2000/svg" aria-label="Poseidone">
      <!-- tridente nella mano destra, dietro al corpo -->
      <g fill="#e0a526">
        <rect x="176" y="30" width="7" height="200" rx="3" />
        <path d="M160 46 V14 L166 24 V42 H193 V24 L199 14 V46 Z" />
        <path d="M175 36 V4 L179.5 -6 L184 4 V36 Z" />
      </g>
      <circle cx="180" cy="158" r="12" fill="#e8c39e" />

      <!-- busto e braccio destro -->
      <path d="M62 230 V170 Q62 128 110 126 Q158 128 160 170 V230 Z" fill="#e8c39e" />
      <path d="M150 150 Q170 150 178 160" fill="none" stroke="#e8c39e" stroke-width="20" stroke-linecap="round" />
      <path d="M64 175 Q110 200 158 175" fill="none" stroke="#d4a77f" stroke-width="3" />

      <!-- braccio sinistro teso che spinge la poppa -->
      <g class="push">
        <path d="M80 146 Q40 140 14 128" fill="none" stroke="#e8c39e" stroke-width="20" stroke-linecap="round" />
        <path d="M2 112 Q-6 128 4 142 Q14 140 18 128 Q16 114 2 112 Z" fill="#e8c39e" />
      </g>

      <!-- testa, capelli e barba a onde -->
      <path d="M72 76 Q66 40 110 34 Q154 40 148 76 Q156 96 146 116 L74 116 Q64 96 72 76 Z" fill="#eef3f7" />
      <circle cx="110" cy="84" r="30" fill="#e8c39e" />
      <path
        d="M78 92 Q76 150 110 158 Q144 150 142 92 Q134 110 124 104 Q110 116 96 104 Q86 110 78 92 Z"
        fill="#eef3f7"
      />
      <path d="M90 124 q6 8 12 0 M110 128 q6 8 12 0 M100 142 q6 8 12 0" fill="none" stroke="#c7d3dc" stroke-width="2.5" />
      <g stroke="#9fb1bf" stroke-width="4" stroke-linecap="round">
        <line x1="88" y1="72" x2="102" y2="76" />
        <line x1="118" y1="76" x2="132" y2="72" />
      </g>
      <circle cx="96" cy="82" r="3.5" fill="#1b4f72" />
      <circle cx="122" cy="82" r="3.5" fill="#1b4f72" />
      <!-- guance gonfie e bocca che soffia verso la nave -->
      <circle cx="90" cy="96" r="7" fill="#f2a58e" opacity="0.6" />
      <ellipse cx="102" cy="104" rx="5" ry="6" fill="#7a2e2e" />

      <!-- corona -->
      <path d="M80 56 L84 30 L96 46 L110 22 L124 46 L136 30 L140 56 Z" fill="#f1c40f" stroke="#d4ac0d" stroke-width="2" />
      <circle cx="110" cy="44" r="4" fill="#2e86c1" />

      <!-- vento che parte dalla bocca verso sinistra -->
      <g class="wind" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round">
        <path d="M92 100 Q60 90 30 96" />
        <path d="M92 106 Q56 110 20 104" style="animation-delay: -0.5s" />
        <path d="M90 94 Q66 76 40 78" style="animation-delay: -1s" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.poseidon {
  position: absolute;
  /* il taglio del busto deve cadere dentro l'onda davanti (22%–27% sempre coperto) */
  bottom: 24%;
  width: var(--poseidon-w);
  /* come la nave: davanti alla boa, dietro allo scafo (viene dopo nel DOM) e alle onde in primo piano */
  z-index: 10;
  animation: heave 4s ease-in-out infinite alternate;
}
.poseidon svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}
.push {
  animation: push 2.4s ease-in-out infinite;
}
.wind path {
  stroke-dasharray: 30 90;
  animation: blow 1.5s linear infinite;
  opacity: 0.85;
}

@keyframes heave {
  from { transform: translateY(0); }
  to { transform: translateY(8px); }
}
@keyframes push {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-8px); }
}
@keyframes blow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -120; }
}
</style>
