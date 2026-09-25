<template>
  <div class="port">
    <!-- edifici sopra la banchina -->
    <svg class="buildings" viewBox="0 0 260 230" xmlns="http://www.w3.org/2000/svg" aria-label="Porto">
      <!-- gru -->
      <g stroke="#e0a526" stroke-width="5" fill="none" stroke-linecap="round">
        <line x1="40" y1="230" x2="40" y2="60" />
        <line x1="40" y1="62" x2="150" y2="62" />
        <line x1="40" y1="100" x2="75" y2="62" />
        <line x1="40" y1="62" x2="20" y2="62" />
      </g>
      <rect x="10" y="58" width="16" height="14" fill="#7f8c8d" />
      <line x1="140" y1="62" x2="140" y2="130" stroke="#333" stroke-width="1.5" />
      <rect x="130" y="130" width="20" height="14" fill="#2e86c1" />
      <rect x="131" y="131" width="18" height="12" fill="none" stroke="#1b4f72" stroke-width="1" />

      <!-- magazzino -->
      <path d="M60 230 V160 L100 135 L140 160 V230 Z" fill="#b5651d" />
      <path d="M56 162 L100 132 L144 162" fill="none" stroke="#7b3f10" stroke-width="5" />
      <rect x="85" y="190" width="30" height="40" fill="#5d3310" />
      <rect x="73" y="168" width="12" height="10" fill="#fce8a8" />
      <rect x="115" y="168" width="12" height="10" fill="#fce8a8" />

      <!-- casetta -->
      <rect x="148" y="185" width="44" height="45" fill="#f5e6c8" />
      <path d="M144 187 L170 165 L196 187 Z" fill="#c0392b" />
      <rect x="156" y="196" width="10" height="10" fill="#5dade2" />
      <rect x="174" y="205" width="11" height="25" fill="#7b3f10" />

      <!-- faro in punta alla banchina -->
      <path d="M214 230 L220 110 H244 L250 230 Z" fill="#fff" />
      <path d="M216.5 180 H247.5 L248.6 200 H215.4 Z" fill="#c0392b" />
      <path d="M218.8 135 H245.2 L246.3 155 H217.7 Z" fill="#c0392b" />
      <rect x="216" y="104" width="32" height="7" fill="#333" />
      <rect x="222" y="84" width="20" height="20" fill="#fdf2b3" stroke="#333" stroke-width="2" />
      <path d="M218 84 L232 70 L246 84 Z" fill="#c0392b" />
      <circle class="beacon" cx="232" cy="94" r="16" fill="#fff59d" />
    </svg>

    <!-- banchina in pietra -->
    <div class="quay">
      <span class="bollard" style="left: 3%" />
      <span class="bollard" style="left: 76%" />
      <span class="fender" style="top: 30%" />
      <span class="fender" style="top: 62%" />
    </div>
  </div>
</template>

<style scoped>
.port {
  position: absolute;
  left: 0;
  bottom: 0;
  width: var(--port-w);
  height: 100%;
  z-index: 5;
}
.quay {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: var(--quay-h);
  background:
    linear-gradient(#bfb8a8 0 10px, transparent 10px),
    repeating-linear-gradient(0deg, transparent 0 22px, #6f6a5e 22px 24px),
    repeating-linear-gradient(90deg, transparent 0 46px, #6f6a5e 46px 48px),
    #948d7c;
  border-top-right-radius: 4px;
  box-shadow: inset -6px 0 0 rgba(0, 0, 0, 0.18);
}
.bollard {
  position: absolute;
  top: -12px;
  width: 12px;
  height: 14px;
  background: #2c2c2c;
  border-radius: 5px 5px 2px 2px;
}
.fender {
  position: absolute;
  right: -6px;
  width: 12px;
  height: 26px;
  background: #1e1e1e;
  border-radius: 6px;
}
.buildings {
  position: absolute;
  left: 0;
  bottom: var(--quay-h);
  width: 100%;
  height: auto;
  display: block;
}
.beacon {
  animation: blink 4s ease-in-out infinite;
  filter: blur(3px);
}
@keyframes blink {
  0%, 60%, 100% { opacity: 0.15; }
  70%, 85% { opacity: 1; }
}
</style>
