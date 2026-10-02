<script setup>
// Coordinate della piazza: quelle del palco meno l'angolo del riquadro (440, 664).
// Le bandierine partono dai lampioni (che stanno nello sfondo) e finiscono sulle gambe
// del cartellone, che è disegnato sopra e ne copre il capo.
const FLAG_COLORS = ['#ff7aa8', '#ffd54a', '#6cc6f5', '#8ed16f']
const garlands = [
  { from: [35, -50], via: [95, -12], to: [156, -40] },
  { from: [564, -40], via: [625, -12], to: [685, -50] },
].map(({ from, via, to }) => {
  const at = (t) =>
    [0, 1].map((k) => (1 - t) ** 2 * from[k] + 2 * (1 - t) * t * via[k] + t ** 2 * to[k])
  return {
    rope: `M ${from} Q ${via} ${to}`,
    flags: [0.14, 0.3, 0.46, 0.62, 0.78].map((t) => at(t)),
  }
})
const balloons = [
  { x: 128, y: -10, fill: '#6cc6f5' },
  { x: 146, y: -14, fill: '#ffd54a' },
  { x: 138, y: 6, fill: '#8ed16f' },
]
const pigeons = [
  { x: 232, y: 64, flip: false, delay: 0 },
  { x: 262, y: 76, flip: true, delay: -1.1 },
  { x: 452, y: 70, flip: true, delay: -0.5 },
]
</script>

<template>
  <!-- La piazza sotto al cartellone vista dalla città: il selciato è nello sfondo,
       qui ci sono la fontana, il chiosco dello shop, l'arredo e l'alone che si accende passandoci sopra. -->
  <svg viewBox="0 0 720 172" aria-hidden="true">
    <ellipse class="halo" cx="360" cy="86" rx="354" ry="82" />

    <!-- Bandierine -->
    <g v-for="(g, i) in garlands" :key="i" stroke="#2d2a4a" stroke-linejoin="round">
      <path :d="g.rope" fill="none" stroke-width="2.5" />
      <path
        v-for="([x, y], j) in g.flags"
        :key="j"
        :d="`M ${x - 6} ${y} L ${x + 6} ${y} L ${x} ${y + 13} Z`"
        :fill="FLAG_COLORS[(i + j) % FLAG_COLORS.length]"
        stroke-width="2.5"
      />
    </g>

    <g stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round">
      <!-- Palloncini legati al chiosco -->
      <g class="balloons">
        <path v-for="(b, i) in balloons" :key="i" :d="`M 122 46 Q ${b.x - 4} ${b.y + 26} ${b.x} ${b.y + 11}`" fill="none" stroke-width="2" />
        <g v-for="(b, i) in balloons" :key="i">
          <ellipse :cx="b.x" :cy="b.y" rx="9" ry="11" :fill="b.fill" stroke-width="3" />
          <ellipse :cx="b.x - 3" :cy="b.y - 4" rx="2.5" ry="3.5" fill="#fff" stroke="none" opacity="0.7" />
        </g>
      </g>

      <!-- Chiosco dello shop -->
      <ellipse cx="92" cy="106" rx="40" ry="6" fill="#2d2a4a" stroke="none" opacity="0.15" />
      <rect x="64" y="50" width="56" height="32" fill="#fff3dc" />
      <rect x="61" y="46" width="6" height="58" fill="#c98a4b" stroke-width="3" />
      <rect x="117" y="46" width="6" height="58" fill="#c98a4b" stroke-width="3" />
      <rect x="54" y="36" width="76" height="14" fill="#fff8e6" />
      <rect v-for="i in 4" :key="i" :x="54 + (i - 1) * 19" y="36" width="9.5" height="14" fill="#ff7aa8" stroke="none" />
      <path d="M 54 50 a 9.5 6 0 0 0 19 0 a 9.5 6 0 0 0 19 0 a 9.5 6 0 0 0 19 0 a 9.5 6 0 0 0 19 0" fill="#ff7aa8" />
      <rect x="54" y="36" width="76" height="14" fill="none" />
      <rect x="58" y="80" width="68" height="26" rx="3" fill="#c98a4b" />
      <rect x="54" y="76" width="76" height="8" rx="3" fill="#e0a965" stroke-width="3" />
      <rect x="68" y="12" width="48" height="20" rx="6" fill="#fff8e6" stroke-width="3" />
      <text x="92" y="27.5" text-anchor="middle" class="label" fill="#e0457b" stroke="none">SHOP</text>

      <!-- Fontana: due vasche, lo zampillo ricade nella coppa e poi trabocca in quella grande -->
      <ellipse cx="360" cy="92" rx="78" ry="9" fill="#2d2a4a" stroke="none" opacity="0.15" />
      <path d="M 290 70 L 290 84 A 70 12 0 0 0 430 84 L 430 70 Z" fill="#b9b2a4" />
      <ellipse cx="360" cy="70" rx="70" ry="12" fill="#d6d0c4" />
      <ellipse cx="360" cy="71" rx="59" ry="7.5" fill="#6cc6f5" stroke-width="3" />
      <ellipse v-for="i in 2" :key="i" class="ripple" :style="{ animationDelay: `${(i - 1) * -1.2}s` }" :cx="i === 1 ? 318 : 402" cy="71" rx="9" ry="2.5" fill="none" stroke="#fff" stroke-width="2" />
      <rect x="352" y="40" width="16" height="32" fill="#b9b2a4" stroke-width="3" />
      <path d="M 328 40 Q 360 62 392 40 Z" fill="#b9b2a4" stroke-width="3" />
      <ellipse cx="360" cy="40" rx="32" ry="6" fill="#d6d0c4" stroke-width="3" />
      <ellipse cx="360" cy="40.5" rx="25" ry="3.5" fill="#6cc6f5" stroke="none" />
      <rect x="355" y="26" width="10" height="14" rx="3" fill="#b9b2a4" stroke-width="3" />
      <g class="water" fill="none" stroke-linecap="round">
        <path d="M 360 26 L 360 2 M 360 2 Q 346 0 340 36 M 360 2 Q 374 0 380 36 M 330 42 Q 320 50 318 68 M 390 42 Q 400 50 402 68" stroke="#2d2a4a" stroke-width="7" />
        <path d="M 360 26 L 360 2 M 360 2 Q 346 0 340 36 M 360 2 Q 374 0 380 36 M 330 42 Q 320 50 318 68 M 390 42 Q 400 50 402 68" stroke="#bfe9ff" stroke-width="3.5" />
        <path class="flow" d="M 360 26 L 360 2 M 360 2 Q 346 0 340 36 M 360 2 Q 374 0 380 36 M 330 42 Q 320 50 318 68 M 390 42 Q 400 50 402 68" stroke="#fff" stroke-width="2" />
      </g>

      <!-- Panchina -->
      <ellipse cx="620" cy="98" rx="36" ry="5" fill="#2d2a4a" stroke="none" opacity="0.15" />
      <rect x="594" y="52" width="6" height="30" fill="#4b4870" stroke-width="3" />
      <rect x="640" y="52" width="6" height="30" fill="#4b4870" stroke-width="3" />
      <rect x="588" y="56" width="64" height="8" rx="2" fill="#e0a965" stroke-width="3" />
      <rect x="588" y="66" width="64" height="8" rx="2" fill="#e0a965" stroke-width="3" />
      <rect x="596" y="82" width="6" height="14" fill="#4b4870" stroke-width="3" />
      <rect x="638" y="82" width="6" height="14" fill="#4b4870" stroke-width="3" />
      <rect x="584" y="76" width="72" height="9" rx="2" fill="#c98a4b" stroke-width="3" />

      <!-- Fioriera -->
      <ellipse cx="670" cy="114" rx="20" ry="4" fill="#2d2a4a" stroke="none" opacity="0.15" />
      <circle cx="661" cy="84" r="8" fill="#4fae55" stroke-width="3" />
      <circle cx="679" cy="84" r="8" fill="#4fae55" stroke-width="3" />
      <circle cx="670" cy="78" r="9" fill="#4fae55" stroke-width="3" />
      <circle cx="660" cy="81" r="3.5" fill="#ff7aa8" stroke-width="2" />
      <circle cx="672" cy="73" r="3.5" fill="#ffd54a" stroke-width="2" />
      <circle cx="681" cy="82" r="3.5" fill="#fff8e6" stroke-width="2" />
      <path d="M 654 94 L 686 94 L 682 113 L 658 113 Z" fill="#c98a4b" />
      <rect x="651" y="89" width="38" height="7" rx="3" fill="#e0a965" stroke-width="3" />

      <!-- Piccioni che beccano le briciole -->
      <g v-for="(p, i) in pigeons" :key="i" :transform="`translate(${p.x} ${p.y})${p.flip ? ' scale(-1 1)' : ''}`">
        <circle v-for="c in 3" :key="c" :cx="10 + c * 4" :cy="7 + (c % 2) * 2" r="1.2" fill="#c98a4b" stroke="none" />
        <ellipse cx="0" cy="8" rx="9" ry="2" fill="#2d2a4a" stroke="none" opacity="0.15" />
        <g class="pigeon" :style="{ animationDelay: `${p.delay}s` }">
          <path d="M -8 -1 L -14 -5 L -13 2 Z" fill="#8f89b0" stroke-width="2.5" />
          <ellipse cx="-1" cy="0" rx="9" ry="6.5" fill="#b9b2cc" stroke-width="2.5" />
          <path d="M -6 -1 q 5 4 10 0" fill="none" stroke="#8f89b0" stroke-width="2" />
          <circle cx="7" cy="-6" r="4.5" fill="#8f89b0" stroke-width="2.5" />
          <path d="M 11 -7 L 15 -5.5 L 11 -4 Z" fill="#ffb300" stroke-width="1.5" />
          <circle cx="8" cy="-7" r="1" fill="#2d2a4a" stroke="none" />
          <path d="M -2 6 v 2 M 2 6 v 2" stroke="#ff7aa8" stroke-width="2" stroke-linecap="round" />
        </g>
      </g>
    </g>
  </svg>
</template>

<style scoped>
/* Si accende passandoci sopra: la regola sta in CityView, che conosce il pulsante. */
.halo {
  fill: rgba(255, 243, 168, 0.18);
  stroke: #fff3a8;
  stroke-width: 8;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.label {
  font-size: 14px;
}
.balloons {
  transform-box: view-box;
  transform-origin: 122px 46px;
  animation: sway 4s ease-in-out infinite alternate;
}
@keyframes sway {
  from { transform: rotate(-4deg); }
  to { transform: rotate(5deg); }
}
/* L'acqua scorre: trattini bianchi che scendono lungo gli zampilli. */
.flow {
  stroke-dasharray: 3 9;
  animation: flow 0.6s linear infinite;
}
@keyframes flow {
  to { stroke-dashoffset: -12; }
}
/* Cerchi nell'acqua dove ricadono gli zampilli. */
.ripple {
  transform-box: fill-box;
  transform-origin: center;
  animation: ripple 2.4s ease-out infinite;
}
@keyframes ripple {
  from { transform: scale(0.4); opacity: 1; }
  to { transform: scale(1.4); opacity: 0; }
}
/* Il piccione si china in avanti a beccare, poi rialza la testa. */
.pigeon {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: peck 2.4s ease-in-out infinite;
}
@keyframes peck {
  0%, 70%, 100% { transform: rotate(0); }
  78%, 88% { transform: rotate(24deg); }
  83% { transform: rotate(16deg); }
}
</style>
