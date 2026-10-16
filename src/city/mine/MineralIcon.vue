<script setup>
import { computed } from 'vue'

// L'icona di quello che si trova in miniera (id del catalogo, MINERALS in
// packages/shared/src/catalog.ts), da mettere dentro un <svg>: centrata sull'origine, grande
// circa 60 unità. La pietra è un sasso, i minerali un sasso con le venature del metallo (l'oro
// una pepita), le gemme tagliate, ognuna col suo colore.
const props = defineProps({ id: { type: String, required: true } })

// Le venature dei minerali grezzi: colore e riflesso.
const ORES = {
  copper_ore: { vein: '#e98a4a', shine: '#ffc08f' },
  iron_ore: { vein: '#b5734f', shine: '#d9a07c' },
  silver_ore: { vein: '#e8eef7', shine: '#ffffff' },
}
const ore = computed(() => ORES[props.id] ?? null)
</script>

<template>
  <g class="mineral" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <!-- Pietra: un sasso grigio con una crepa -->
    <template v-if="id === 'stone'">
      <path d="M -26 14 L -28 -6 L -14 -24 L 8 -26 L 26 -12 L 28 10 L 14 24 L -12 26 Z" fill="#a7a3b8" />
      <path d="M -14 -24 L -6 -10 L 8 -26 M -6 -10 L -10 6" fill="none" stroke-width="3" />
      <path d="M 10 -18 L 20 -10" fill="none" stroke="#fff" stroke-width="3" opacity="0.6" />
      <path d="M -12 26 L 14 24 L 28 10 L 24 4 Q 12 18 -8 18 Z" fill="#8a86a0" stroke="none" />
    </template>
    <!-- Minerali grezzi: il sasso con le venature del metallo -->
    <template v-else-if="ore">
      <path d="M -27 12 L -26 -10 L -10 -26 L 12 -24 L 27 -8 L 26 14 L 8 26 L -14 25 Z" fill="#8f8aa6" />
      <path d="M -26 -10 L -8 -4 L 12 -24 M -8 -4 L 4 12 L 26 14 M 4 12 L -14 25" fill="none" stroke-width="2.5" opacity="0.5" />
      <g :fill="ore.vein" stroke-width="3">
        <path d="M -18 -8 L -8 -14 L -4 -6 L -14 -2 Z" />
        <path d="M 6 -16 L 16 -14 L 14 -6 L 6 -8 Z" />
        <path d="M -4 6 L 8 2 L 14 12 L 2 16 Z" />
        <path d="M -20 12 L -12 10 L -12 18 Z" />
      </g>
      <g :fill="ore.shine" stroke="none">
        <circle cx="-12" cy="-10" r="2" />
        <circle cx="10" cy="-13" r="1.8" />
        <circle cx="5" cy="7" r="2" />
      </g>
    </template>
    <!-- Pepita d'oro: un grumo giallo lucente -->
    <template v-else-if="id === 'gold_nugget'">
      <path d="M -24 8 Q -30 -8 -16 -14 Q -12 -28 4 -24 Q 20 -28 24 -12 Q 32 2 22 14 Q 16 28 0 24 Q -18 28 -24 8 Z" fill="#ffd54a" />
      <path d="M -6 -6 Q 2 2 -2 10 M 10 -10 Q 14 -2 12 4" fill="none" stroke="#e0a82e" stroke-width="3" />
      <path d="M -14 -6 Q -12 -14 -4 -16" fill="none" stroke="#fff8d0" stroke-width="4" />
      <circle cx="14" cy="12" r="2.5" fill="#fff8d0" stroke="none" />
    </template>
    <!-- Quarzo: tre prismi chiari -->
    <template v-else-if="id === 'quartz'">
      <path d="M -24 24 L -26 0 L -18 -12 L -10 2 L -10 24 Z" fill="#f2eefc" />
      <path d="M 10 24 L 10 -2 L 18 -14 L 26 -2 L 24 24 Z" fill="#f2eefc" />
      <path d="M -10 26 L -10 -12 L 0 -30 L 10 -12 L 10 26 Z" fill="#ffffff" />
      <path d="M 0 -30 L 0 26 M -10 -12 L 10 -12" fill="none" stroke="#c9c2e6" stroke-width="2.5" />
      <path d="M -24 24 L 24 24" fill="none" />
    </template>
    <!-- Ametista: un grappolo di punte viola -->
    <template v-else-if="id === 'amethyst'">
      <path d="M -26 24 L -24 -2 L -16 -16 L -8 -2 L -10 24 Z" fill="#c59bff" />
      <path d="M 10 24 L 8 -6 L 18 -20 L 26 -4 L 24 24 Z" fill="#c59bff" />
      <path d="M -10 26 L -12 -10 L 0 -30 L 12 -10 L 10 26 Z" fill="#9b6bf0" />
      <path d="M 0 -30 L 0 26" fill="none" stroke="#e5d4ff" stroke-width="3" opacity="0.8" />
      <path d="M -18 -8 L -14 4" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.7" />
    </template>
    <!-- Smeraldo: taglio a gradini, verde -->
    <template v-else-if="id === 'emerald'">
      <path d="M -16 -26 L 16 -26 L 26 -14 L 26 14 L 16 26 L -16 26 L -26 14 L -26 -14 Z" fill="#3fc97e" />
      <path d="M -9 -14 L 9 -14 L 14 -8 L 14 8 L 9 14 L -9 14 L -14 8 L -14 -8 Z" fill="#7be6a8" stroke-width="3" />
      <path d="M -16 -26 L -9 -14 M 16 -26 L 9 -14 M 26 14 L 14 8 M -26 14 L -14 8 M 16 26 L 9 14 M -16 26 L -9 14" fill="none" stroke-width="2.5" />
      <path d="M -6 -9 L 4 -9" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" />
    </template>
    <!-- Rubino: ovale sfaccettato, rosso -->
    <template v-else-if="id === 'ruby'">
      <path d="M 0 -26 L 20 -16 L 26 4 L 14 22 L 0 28 L -14 22 L -26 4 L -20 -16 Z" fill="#ff4a6a" />
      <path d="M 0 -26 L 0 -8 L 20 -16 M 0 -8 L -20 -16 M 0 -8 L 14 8 L 26 4 M 0 -8 L -14 8 L -26 4 M -14 8 L 0 28 L 14 8 M -14 8 L 14 8" fill="none" stroke-width="2.5" />
      <path d="M -12 -14 L -4 -18" fill="none" stroke="#ffd3dc" stroke-width="3" />
    </template>
    <!-- Diamante: taglio a brillante, bianco-azzurro -->
    <template v-else-if="id === 'diamond'">
      <path d="M -16 -22 L 16 -22 L 30 -8 L 0 28 L -30 -8 Z" fill="#c8f6ff" />
      <path d="M -30 -8 L 30 -8 M -16 -22 L -8 -8 L 0 -22 L 8 -8 L 16 -22 M -8 -8 L 0 28 L 8 -8" fill="none" stroke-width="2.5" />
      <path d="M -16 -22 L -8 -8 L -30 -8 Z" fill="#ffffff" stroke-width="2.5" />
      <path d="M 26 -26 l 2 -6 l 2 6 l 6 2 l -6 2 l -2 6 l -2 -6 l -6 -2 Z" fill="#fff" stroke-width="2" />
    </template>
  </g>
</template>
