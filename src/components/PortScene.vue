<script setup>
import Seagulls from './Seagulls.vue'

// Traliccio della gru: zig-zag del braccio (y 70–88) e della torre (x 25–55).
const zigzag = (count, point) => Array.from({ length: count + 1 }, (_, i) => point(i).join(',')).join(' ')
const JIB = zigzag(34, (i) => [40 + i * 20, i % 2 ? 70 : 88])
const COUNTER_JIB = zigzag(13, (i) => [-90 + i * 10, i % 2 ? 72 : 88])
const TOWER = zigzag(10, (i) => [i % 2 ? 55 : 25, 240 - i * 16])

// Container già a bordo, impilati a poppa: [x, y, colore].
const deckStack = [
  [445, 250, '#2e86c1'],
  [445, 200, '#27ae60'],
]
const RIVETS = [[520, 334], [538, 334], [520, 354], [538, 354]]
</script>

<template>
  <div class="port-scene">
    <div class="sky">
      <div class="sun" />
      <Seagulls />
    </div>

    <svg class="harbour" viewBox="-100 0 1100 560" xmlns="http://www.w3.org/2000/svg" aria-label="Carico merci e riparazioni in porto">
      <defs>
        <linearGradient id="port-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3f8fc4" />
          <stop offset="1" stop-color="#1a5283" />
        </linearGradient>
        <pattern id="port-stone" width="48" height="24" patternUnits="userSpaceOnUse">
          <rect width="48" height="24" fill="#948d7c" />
          <path d="M0 23 H48 M24 0 V11 M0 11 H48 M47 11 V23" stroke="#6f6a5e" stroke-width="2" />
        </pattern>
        <!-- il cavo della gru si vede solo sotto al carrello -->
        <clipPath id="port-cable">
          <rect x="-300" y="94" width="600" height="600" />
        </clipPath>
        <g id="port-container">
          <rect x="-55" width="110" height="50" rx="2" />
          <path d="M-40 4 V46 M-25 4 V46 M-10 4 V46 M5 4 V46 M20 4 V46 M35 4 V46" stroke="rgba(0, 0, 0, 0.18)" stroke-width="3" />
        </g>
      </defs>

      <!-- mare, esteso oltre i bordi così copre qualsiasi schermo -->
      <rect x="-3000" y="400" width="7000" height="2000" fill="url(#port-sea)" />

      <!-- sovrastruttura della nave, container a bordo e fumo -->
      <g class="ship">
        <g class="smoke" fill="#e8eef3">
          <circle cx="895" cy="100" r="10" />
          <circle cx="880" cy="88" r="13" />
          <circle cx="860" cy="80" r="9" />
        </g>
        <rect x="880" y="112" width="26" height="56" fill="#c0392b" />
        <rect x="880" y="112" width="26" height="11" fill="#222" />
        <rect x="800" y="200" width="130" height="100" rx="4" fill="#f4f4f4" />
        <rect x="815" y="164" width="100" height="40" rx="4" fill="#fff" />
        <g fill="#5dade2">
          <rect x="826" y="174" width="18" height="14" rx="2" />
          <rect x="856" y="174" width="18" height="14" rx="2" />
          <rect x="886" y="174" width="18" height="14" rx="2" />
          <circle cx="825" cy="240" r="7" />
          <circle cx="853" cy="240" r="7" />
          <circle cx="881" cy="240" r="7" />
          <circle cx="909" cy="240" r="7" />
        </g>
        <use v-for="([x, y, color], i) in deckStack" :key="i" href="#port-container" :x="x + 55" :y="y" :fill="color" />
      </g>

      <!-- gru: portale sulla banchina, torre, braccio che arriva sopra la stiva -->
      <g class="crane">
        <g stroke="#e0a526" stroke-width="7" stroke-linecap="round">
          <line x1="-30" y1="380" x2="10" y2="250" />
          <line x1="110" y1="380" x2="70" y2="250" />
        </g>
        <rect x="-5" y="238" width="90" height="16" rx="3" fill="#e0a526" />
        <g fill="none" stroke="#e0a526" stroke-width="4" stroke-linejoin="round">
          <polyline :points="TOWER" />
          <line x1="25" y1="240" x2="25" y2="80" />
          <line x1="55" y1="240" x2="55" y2="80" />
          <polyline :points="JIB" />
          <line x1="40" y1="70" x2="720" y2="70" />
          <line x1="40" y1="88" x2="720" y2="88" />
          <polyline :points="COUNTER_JIB" />
          <line x1="-90" y1="72" x2="40" y2="72" />
          <line x1="-90" y1="88" x2="40" y2="88" />
          <path d="M25 72 L40 28 L55 72" />
        </g>
        <g stroke="#7f8c8d" stroke-width="2">
          <line x1="40" y1="30" x2="700" y2="70" />
          <line x1="40" y1="30" x2="-80" y2="72" />
        </g>
        <rect x="-92" y="88" width="44" height="28" fill="#7f8c8d" />
        <!-- cabina con il gruista -->
        <rect x="55" y="92" width="40" height="30" rx="4" fill="#f4f4f4" />
        <rect x="62" y="97" width="27" height="15" rx="2" fill="#aed6f1" />
        <circle cx="75" cy="108" r="5" fill="#f1c27d" />
        <path d="M69.5 107 A5.5 5.5 0 0 1 80.5 107 Z" fill="#f1c40f" />

        <!-- carrello che scorre sul braccio, con cavo, gancio e container -->
        <g class="trolley">
          <g clip-path="url(#port-cable)">
            <g class="hook">
              <line x1="0" y1="-400" x2="0" y2="-10" stroke="#333" stroke-width="2.5" />
              <rect x="-9" y="-12" width="18" height="10" rx="2" fill="#555" />
              <path d="M0 -2 V4 Q0 10 5 8" fill="none" stroke="#555" stroke-width="3" stroke-linecap="round" />
              <g class="load">
                <path d="M0 4 L-48 12 M0 4 L48 12" stroke="#333" stroke-width="1.5" />
                <use href="#port-container" y="12" fill="#d35400" />
              </g>
            </g>
          </g>
          <rect x="-20" y="86" width="40" height="10" rx="2" fill="#555" />
          <circle cx="-12" cy="86" r="3.5" fill="#333" />
          <circle cx="12" cy="86" r="3.5" fill="#333" />
        </g>
      </g>

      <!-- scafo: sta davanti al container, che così scompare dentro la stiva -->
      <g class="ship">
        <path d="M392 300 H996 L950 432 H408 Z" fill="#1f3a5f" />
        <rect x="392" y="294" width="604" height="7" fill="#e8eef3" />
        <rect x="598" y="288" width="124" height="12" fill="#16304f" />
        <path d="M397 392 H961 L956 408 H400 Z" fill="#c0392b" />
        <text x="880" y="352" text-anchor="middle" class="ship-name">DEV SHIP</text>

        <!-- riparazione: lamiera nuova rivettata sullo scafo -->
        <rect x="514" y="328" width="32" height="32" rx="2" fill="#95a5a6" />
        <circle v-for="([cx, cy], i) in RIVETS" :key="i" :cx="cx" :cy="cy" r="2.2" fill="#5d6d7e" />

        <!-- l'omino su un'asse appesa al parapetto -->
        <g stroke="#c9a66b" stroke-width="2">
          <line x1="438" y1="300" x2="438" y2="390" />
          <line x1="522" y1="300" x2="522" y2="390" />
        </g>
        <rect x="428" y="388" width="104" height="8" rx="2" fill="#a0692f" />
        <rect x="438" y="376" width="20" height="12" rx="2" fill="#c0392b" />
        <g transform="translate(474 388)">
          <rect x="-10" y="-28" width="9" height="26" rx="3" fill="#e67e22" />
          <rect x="1" y="-28" width="9" height="26" rx="3" fill="#e67e22" />
          <rect x="-12" y="-5" width="12" height="5" rx="2" fill="#3b2a1a" />
          <rect x="0" y="-5" width="12" height="5" rx="2" fill="#3b2a1a" />
          <path d="M-13 -26 V-48 Q-13 -56 -5 -56 H5 Q13 -56 13 -48 V-26 Z" fill="#e67e22" />
          <rect x="-13" y="-40" width="26" height="4" fill="#f4d03f" />
          <line x1="-10" y1="-50" x2="-16" y2="-32" stroke="#e67e22" stroke-width="7" stroke-linecap="round" />
          <circle cx="-16" cy="-31" r="4" fill="#f1c27d" />
          <circle cy="-66" r="11" fill="#f1c27d" />
          <circle cx="-4" cy="-66" r="1.6" fill="#222" />
          <circle cx="4" cy="-66" r="1.6" fill="#222" />
          <path d="M-4 -60 Q0 -57 4 -60" fill="none" stroke="#7a2e2e" stroke-width="1.5" stroke-linecap="round" />
          <path d="M-12 -68 A12 12 0 0 1 12 -68 Z" fill="#f1c40f" />
          <rect x="-15" y="-70" width="30" height="3.5" rx="1.5" fill="#d4ac0d" />
          <!-- martello: colpisce la lamiera alla fine di ogni oscillazione -->
          <g class="hammer-arm">
            <line x1="10" y1="-50" x2="24" y2="-44" stroke="#e67e22" stroke-width="7" stroke-linecap="round" />
            <line x1="24" y1="-44" x2="37" y2="-44" stroke="#8d5a2b" stroke-width="3.5" stroke-linecap="round" />
            <rect x="36" y="-52" width="7" height="16" rx="1.5" fill="#566573" />
            <circle cx="24" cy="-44" r="4" fill="#f1c27d" />
          </g>
          <g class="bang">
            <path d="M44 -44 l10 -8 M44 -44 l12 0 M44 -44 l10 8" stroke="#fff59d" stroke-width="2.5" stroke-linecap="round" />
            <text x="52" y="-58" class="toc">toc!</text>
          </g>
        </g>
      </g>

      <!-- acqua davanti alla chiglia -->
      <rect x="-3000" y="404" width="7000" height="2000" fill="#2a6ea3" opacity="0.92" />
      <g class="waves" stroke="rgba(255, 255, 255, 0.35)" stroke-width="3" stroke-linecap="round">
        <line x1="-1400" y1="424" x2="2400" y2="424" stroke-dasharray="50 150" />
        <line x1="-1300" y1="470" x2="2400" y2="470" stroke-dasharray="30 170" />
        <line x1="-1350" y1="520" x2="2400" y2="520" stroke-dasharray="60 140" />
      </g>
      <!-- banchina, bitte, parabordi e cime d'ormeggio -->
      <rect x="-3000" y="380" width="3360" height="2000" fill="url(#port-stone)" />
      <rect x="-3000" y="380" width="3360" height="10" fill="#bfb8a8" />
      <rect x="352" y="380" width="8" height="2000" fill="rgba(0, 0, 0, 0.18)" />
      <rect x="326" y="364" width="16" height="18" rx="6" fill="#2c2c2c" />
      <rect x="-60" y="364" width="16" height="18" rx="6" fill="#2c2c2c" />
      <g fill="none" stroke="#1e1e1e" stroke-width="7">
        <circle cx="366" cy="404" r="9" />
        <circle cx="366" cy="436" r="9" />
      </g>
      <g fill="none" stroke="#c9a66b" stroke-width="3">
        <path d="M334 368 Q378 356 404 302" />
        <path d="M334 368 Q392 380 420 302" />
      </g>

      <!-- camion che porta i container sotto la gru -->
      <g class="truck">
        <rect x="-68" y="350" width="136" height="10" fill="#2c3e50" />
        <rect x="-112" y="318" width="46" height="42" rx="6" fill="#2e86c1" />
        <rect x="-106" y="324" width="22" height="15" rx="2" fill="#d6eaf8" />
        <rect x="-116" y="350" width="6" height="8" fill="#f7dc6f" />
        <g fill="#1b1b1b">
          <circle cx="-90" cy="368" r="12" />
          <circle cx="-38" cy="368" r="12" />
          <circle cx="42" cy="368" r="12" />
        </g>
        <g fill="#aab7b8">
          <circle cx="-90" cy="368" r="4" />
          <circle cx="-38" cy="368" r="4" />
          <circle cx="42" cy="368" r="4" />
        </g>
        <use class="cargo" href="#port-container" y="300" fill="#d35400" />
      </g>

    </svg>

    <div class="caption">In porto: carico merci e riparazioni · si salpa lunedì alle 09:00</div>
  </div>
</template>

<style scoped>
.port-scene {
  /* In verticale il disegno si allarga oltre i bordi: meglio tagliare i lati che vederlo minuscolo. */
  --tw: min(1200px, max(98vw, 60vh));
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 15;
  background: #1a5283;
}
.sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(#8ecdf0, #d6eefa);
}
.sun {
  position: absolute;
  top: 12%;
  right: 12%;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, #fff6b0 0%, #ffd54a 60%, #ffb300 100%);
  box-shadow: 0 0 60px 20px rgba(255, 213, 74, 0.5);
}
/* Il disegno esce dal viewBox (mare e banchina) per riempire tutto lo schermo. */
.harbour {
  position: absolute;
  left: 50%;
  bottom: 6%;
  width: var(--tw);
  height: auto;
  transform: translateX(-50%);
  overflow: visible;
}
.caption {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  max-width: calc(100vw - 32px);
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.85);
  color: #0e3a63;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}
.ship-name {
  font: 800 22px system-ui, sans-serif;
  fill: #e8eef3;
  letter-spacing: 2px;
}

.ship {
  animation: bob 4s ease-in-out infinite;
}
.smoke circle {
  animation: puff 3s ease-out infinite;
  opacity: 0.8;
  transform-box: fill-box;
  transform-origin: center;
}
.smoke circle:nth-child(2) { animation-delay: 1s; }
.smoke circle:nth-child(3) { animation-delay: 2s; }

/* Ciclo di carico (12 s): il gancio risale vuoto dalla stiva, torna sopra il camion,
   aggancia il container a metà ciclo, lo porta sopra la nave e lo cala nella stiva.
   Nello stesso ciclo il camion arriva in retromarcia, viene scaricato e riparte. */
.trolley {
  animation: trolley 12s ease-in-out infinite;
}
.hook {
  animation: hook 12s ease-in-out infinite;
}
.load {
  animation: load 12s step-end infinite;
}
.truck {
  animation: truck 12s ease-in-out infinite;
}
.cargo {
  animation: cargo 12s step-end infinite;
}
.waves {
  animation: waves 8s linear infinite;
}
.hammer-arm {
  animation: hammer 0.9s ease-in infinite;
  transform-origin: 10px -50px;
}
.bang {
  animation: bang 0.9s linear infinite;
}
.toc {
  font: 800 14px system-ui, sans-serif;
  fill: #fff;
  stroke: #0e3a63;
  stroke-width: 3px;
  paint-order: stroke;
}

@keyframes trolley {
  0%, 15% { transform: translateX(660px); }
  35%, 65% { transform: translateX(270px); }
  82%, 100% { transform: translateX(660px); }
}
@keyframes hook {
  0% { transform: translateY(300px); }
  15%, 35% { transform: translateY(120px); }
  48%, 52% { transform: translateY(288px); }
  65%, 82% { transform: translateY(120px); }
  100% { transform: translateY(300px); }
}
@keyframes load {
  0% { opacity: 0; }
  50% { opacity: 1; }
}
@keyframes truck {
  0%, 15% { transform: translateX(-1400px); }
  35%, 58% { transform: translateX(270px); }
  75%, 100% { transform: translateX(-1400px); }
}
@keyframes cargo {
  0% { opacity: 1; }
  50% { opacity: 0; }
}
@keyframes bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(3px); }
}
@keyframes puff {
  0% { transform: translate(0, 0) scale(0.7); opacity: 0.8; }
  100% { transform: translate(-20px, -16px) scale(1.4); opacity: 0; }
}
@keyframes waves {
  to { transform: translateX(-200px); }
}
@keyframes hammer {
  0%, 20% { transform: rotate(-65deg); }
  70% { transform: rotate(0); }
  100% { transform: rotate(-65deg); }
}
@keyframes bang {
  0%, 68% { opacity: 0; }
  72%, 86% { opacity: 1; }
  90%, 100% { opacity: 0; }
}
</style>
