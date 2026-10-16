<script setup>
// La bottiglia ripescata al lago, col ticket del dungeon arrotolato dentro, da mettere dentro un
// <svg>: centrata sull'origine, alta circa 100 unità, un po' inclinata.
</script>

<template>
  <g class="bottle" transform="rotate(-18)" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Il ticket arrotolato, col nastrino, visto attraverso il vetro -->
    <rect x="-13" y="-10" width="26" height="42" rx="5" fill="#ffd54a" />
    <path d="M -13 2 H 13 M -13 20 H 13" fill="none" stroke-width="2.5" opacity="0.5" />
    <path d="M -13 11 H 13" fill="none" stroke="#e0483a" stroke-width="5" />
    <!-- Il vetro -->
    <path d="M -24 -4 Q -24 -14 -14 -19 L -9 -23 V -38 H 9 V -23 L 14 -19 Q 24 -14 24 -4 V 38 Q 24 46 16 46 H -16 Q -24 46 -24 38 Z" fill="#8fe0c4" fill-opacity="0.45" />
    <path d="M -16 -6 V 34" fill="none" stroke="#fff" stroke-width="5" opacity="0.7" />
    <!-- Il tappo di sughero -->
    <rect x="-10" y="-50" width="20" height="14" rx="3" fill="#c98b4f" />
  </g>
</template>
