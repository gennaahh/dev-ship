<script setup>
// Finestre accese e spente: qualcuno lavora fino a tardi.
const lit = new Set(['0-1', '1-3', '2-0', '2-2', '3-1', '4-3', '1-0', '4-0'])
</script>

<template>
  <svg viewBox="0 0 340 330" aria-hidden="true">
    <g stroke="#2d2a4a" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
      <!-- Antenna -->
      <path d="M 230 40 L 230 0" fill="none" stroke-width="4" />
      <circle class="beacon" cx="230" cy="-2" r="7" fill="#ff4a4a" />
      <!-- Edificio -->
      <rect x="60" y="40" width="220" height="285" rx="6" fill="#5b8bd9" />
      <rect x="60" y="40" width="40" height="285" fill="#4a76c0" stroke="none" />
      <rect x="50" y="30" width="240" height="22" rx="4" fill="#3d5fa0" />
      <rect x="90" y="12" width="50" height="22" rx="3" fill="#9aa6b8" />
      <!-- Finestre -->
      <g v-for="r in 5" :key="r">
        <rect
          v-for="c in 4"
          :key="c"
          :x="80 + (c - 1) * 48"
          :y="66 + (r - 1) * 42"
          width="36"
          height="28"
          rx="4"
          :fill="lit.has(`${r - 1}-${c - 1}`) ? '#fff3a8' : '#a9d8ff'"
          stroke-width="4"
        />
      </g>
      <!-- Ingresso -->
      <rect x="130" y="272" width="80" height="53" fill="#2d2a4a" />
      <rect x="136" y="278" width="32" height="47" fill="#a9d8ff" stroke-width="3" />
      <rect x="172" y="278" width="32" height="47" fill="#a9d8ff" stroke-width="3" />
      <path d="M 116 266 L 224 266 L 216 254 L 124 254 Z" fill="#ff7a59" />
      <!-- Pianta e caffè -->
      <path d="M 30 325 L 34 296 L 56 296 L 60 325 Z" fill="#c07d45" />
      <circle cx="38" cy="278" r="16" fill="#4fae55" />
      <circle cx="54" cy="284" r="13" fill="#4fae55" />
      <g class="steam" fill="none" stroke="#fff" stroke-width="4">
        <path d="M 300 270 q 6 -10 0 -20 q -6 -10 0 -20" />
        <path d="M 314 274 q 6 -10 0 -20 q -6 -10 0 -20" />
      </g>
      <path d="M 290 325 L 292 284 L 324 284 L 326 325 Z" fill="#fff8e6" />
      <path d="M 324 296 q 14 0 12 12 q -2 10 -12 8" fill="none" />
    </g>
  </svg>
</template>

<style scoped>
.beacon {
  animation: beacon 1.4s steps(1) infinite;
}
@keyframes beacon {
  50% { fill: #7a2a2a; }
}
.steam {
  animation: steam 2s ease-in-out infinite;
}
@keyframes steam {
  from { opacity: 0; transform: translateY(8px); }
  50% { opacity: 1; }
  to { opacity: 0; transform: translateY(-10px); }
}
</style>
