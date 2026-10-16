<script setup>
// L'icona di un materiale del dungeon (id del catalogo, packages/shared/src/catalog.ts), da
// mettere dentro un <svg>: centrata sull'origine, grande circa 60 unità.
defineProps({ id: { type: String, required: true } })
</script>

<template>
  <g class="material" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Pelle di bug: una pelle verdognola con le cuciture -->
    <template v-if="id === 'bug_hide'">
      <path d="M -26 -18 Q -14 -30 0 -22 Q 14 -30 26 -18 Q 20 -2 28 14 Q 14 28 0 22 Q -14 28 -28 14 Q -20 -2 -26 -18 Z" fill="#9bbf5a" />
      <path d="M -12 -8 Q 0 -2 12 -8 M -14 8 Q 0 14 14 8" fill="none" stroke-width="3" stroke-dasharray="4 5" />
    </template>
    <!-- Zanna di bug: una zanna d'avorio ricurva -->
    <template v-else-if="id === 'bug_fang'">
      <path d="M -18 -26 Q 6 -28 16 -8 Q 24 10 10 30 Q 10 8 -2 -2 Q -14 -10 -18 -26 Z" fill="#fff3d6" />
      <path d="M -16 -24 Q -4 -18 2 -18" fill="none" stroke-width="3" />
    </template>
    <!-- Seta di ragnatela: un gomitolo di fili bianchi -->
    <template v-else-if="id === 'web_silk'">
      <circle r="24" fill="#eeeaff" />
      <path d="M -24 0 H 24 M 0 -24 V 24 M -17 -17 L 17 17 M 17 -17 L -17 17" fill="none" stroke-width="2.5" />
      <circle r="12" fill="none" stroke-width="2.5" />
      <path d="M 18 16 Q 30 20 28 32" fill="none" stroke-width="3" />
    </template>
    <!-- Cristallo di cache: tre punte azzurre -->
    <template v-else-if="id === 'cache_crystal'">
      <path d="M -20 24 L -26 0 L -16 -14 L -8 6 Z" fill="#9fe7ff" />
      <path d="M 18 24 L 26 2 L 18 -12 L 8 6 Z" fill="#9fe7ff" />
      <path d="M -10 26 L -12 -10 L 0 -30 L 12 -10 L 10 26 Z" fill="#4fc3f7" />
      <path d="M 0 -30 V 26" fill="none" stroke="#fff" stroke-width="3" opacity="0.7" />
    </template>
    <!-- Scaglia d'incidente: una scaglia rossa che scotta -->
    <template v-else-if="id === 'incident_scale'">
      <path d="M -6 -32 Q 2 -42 8 -32 Q 12 -40 16 -30" fill="none" stroke="#ff9a2e" stroke-width="4" />
      <path d="M 0 30 Q -26 14 -24 -10 Q -12 -22 0 -22 Q 12 -22 24 -10 Q 26 14 0 30 Z" fill="#ff5a4a" />
      <path d="M -12 -8 Q 0 2 12 -8 M -8 6 Q 0 14 8 6" fill="none" stroke="#ffd54a" stroke-width="3" />
    </template>
    <!-- Nucleo del kernel: una sfera viola con l'anello che gira -->
    <template v-else-if="id === 'kernel_core'">
      <circle r="18" fill="#b388ff" />
      <circle cx="-6" cy="-6" r="5" fill="#fff" stroke="none" opacity="0.7" />
      <ellipse rx="30" ry="10" fill="none" stroke="#ffd54a" stroke-width="4" transform="rotate(-20)" />
    </template>
  </g>
</template>
