<script setup>
import { computed } from 'vue'
import { gear } from '@dev-city/shared/catalog'
import { TOOL_LOOKS } from './tools.js'

// L'icona di un'arma, di un'armatura, di una canna o di un piccone del crafting (id del catalogo,
// WEAPONS, ARMORS, RODS e PICKAXES in packages/shared/src/catalog.ts), da mettere dentro un <svg>:
// centrata sull'origine, grande circa 64 unità. Armi, canne e picconi stanno in diagonale con
// l'impugnatura in basso a sinistra (nel dungeon le armi si ruotano per tenerle in mano), le
// armature sono un pettorale. Ognuna ha i colori dei suoi materiali e una pietra se ce l'ha nella
// ricetta (quelli di canne e picconi in tools.js, che servono anche al lago e in miniera).
const props = defineProps({ id: { type: String, required: true } })

const LOOKS = {
  stone_club: { head: '#a7a3b8', handle: '#a0673a' },
  copper_sword: { blade: '#f0a06a', edge: '#ffd0a8', guard: '#a0673a', handle: '#7a4a2a' },
  iron_sword: { blade: '#b8c2d4', edge: '#eef2f8', guard: '#6d7f92', handle: '#7a4a2a' },
  silver_blade: { blade: '#e8eef7', edge: '#ffffff', guard: '#b8c2d4', handle: '#4b4870', gem: '#f2eefc' },
  hotfix_hammer: { head: '#ffd54a', handle: '#7a4a2a', gem: '#9b6bf0' },
  diamond_debugger: { blade: '#c8f6ff', edge: '#ffffff', guard: '#ffd54a', handle: '#4b4870', gem: '#ff4a6a' },
  bug_vest: { body: '#9bbf5a', trim: '#7a9a3f', stitches: true },
  copper_mail: { body: '#f0a06a', trim: '#c97a45', rings: true },
  iron_plate: { body: '#b8c2d4', trim: '#8a96aa' },
  silver_armor: { body: '#e8eef7', trim: '#b8c2d4', gem: '#9b6bf0' },
  incident_armor: { body: '#ff6a52', trim: '#ffd54a', scales: true, gem: '#3fc97e' },
  uptime_armor: { body: '#c8f6ff', trim: '#ffd54a', gem: '#ffffff', shine: true },
}
const item = computed(() => gear(props.id))
const look = computed(() => LOOKS[props.id] ?? TOOL_LOOKS[props.id] ?? {})
const hammer = computed(() => props.id === 'hotfix_hammer')
const club = computed(() => props.id === 'stone_club')
</script>

<template>
  <g v-if="item" class="gear" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <template v-if="item.slot === 'weapon'">
      <g transform="rotate(45)">
        <!-- Clava: un bastone con un sasso in cima -->
        <template v-if="club">
          <rect x="-5" y="-6" width="10" height="38" rx="5" :fill="look.handle" />
          <path d="M -14 -6 L -16 -24 L -6 -34 L 8 -34 L 16 -22 L 14 -6 L 0 0 Z" :fill="look.head" />
          <path d="M -6 -24 L 4 -20 M -2 -12 L 6 -14" fill="none" stroke-width="2.5" />
        </template>
        <!-- Martello: testa d'oro con le strisce di ametista -->
        <template v-else-if="hammer">
          <rect x="-5" y="-14" width="10" height="46" rx="5" :fill="look.handle" />
          <rect x="-22" y="-34" width="44" height="22" rx="5" :fill="look.head" />
          <path d="M -12 -34 L -12 -12 M 12 -34 L 12 -12" fill="none" :stroke="look.gem" stroke-width="5" />
          <path d="M -22 -34 L 22 -34 L 22 -12 L -22 -12 Z" fill="none" />
          <path d="M -16 -29 L -16 -24" fill="none" stroke="#fff" stroke-width="3" opacity="0.7" />
        </template>
        <!-- Spade: lama, guardia e impugnatura -->
        <template v-else>
          <path d="M -7 -2 L -7 -30 L 0 -40 L 7 -30 L 7 -2 Z" :fill="look.blade" />
          <path d="M 0 -36 L 0 -4" fill="none" :stroke="look.edge" stroke-width="3" />
          <rect x="-16" y="-4" width="32" height="8" rx="4" :fill="look.guard" />
          <rect x="-4.5" y="4" width="9" height="20" rx="4" :fill="look.handle" />
          <circle cx="0" cy="27" r="5" :fill="look.guard" stroke-width="3" />
          <circle v-if="look.gem" cx="0" cy="0" r="4.5" :fill="look.gem" stroke-width="2.5" />
        </template>
      </g>
    </template>
    <!-- Canna: impugnatura, mulinello e lenza che pende dalla punta -->
    <template v-else-if="item.slot === 'rod'">
      <path d="M 25 -27 L 25 6 q 0 7 -6 5" fill="none" stroke-width="2" />
      <path d="M -26 28 L 25 -27" fill="none" stroke-width="9" />
      <path d="M -26 28 L 25 -27" fill="none" :stroke="look.pole" stroke-width="4.5" />
      <path d="M -27 29 L -15 16" fill="none" stroke-width="11" />
      <path d="M -27 29 L -15 16" fill="none" :stroke="look.grip" stroke-width="6" />
      <circle cx="-8" cy="20" r="8" :fill="look.reel" stroke-width="3.5" />
      <path d="M -8 20 L -1 25" fill="none" stroke-width="3" />
      <circle v-if="look.gem" cx="-8" cy="20" r="3" :fill="look.gem" stroke-width="2" />
    </template>
    <!-- Piccone: manico e testa a mezzaluna -->
    <template v-else-if="item.slot === 'pickaxe'">
      <g transform="rotate(45) translate(2 8) scale(0.85)">
        <path d="M 0 32 L 0 -28" fill="none" stroke-width="11" />
        <path d="M 0 32 L 0 -28" fill="none" :stroke="look.handle" stroke-width="6" />
        <path d="M -32 -16 Q 0 -52 32 -16 Q 0 -26 -32 -16 Z" :fill="look.head" />
        <circle v-if="look.gem" cx="0" cy="-29" r="4.5" :fill="look.gem" stroke-width="2.5" />
      </g>
    </template>
    <template v-else>
      <!-- Il pettorale: spalle, corpo e cintura -->
      <path d="M -14 -28 Q 0 -22 14 -28 L 28 -22 L 30 -4 L 22 -2 L 22 26 Q 0 32 -22 26 L -22 -2 L -30 -4 L -28 -22 Z" :fill="look.body" />
      <path d="M -14 -28 Q 0 -14 14 -28" fill="none" />
      <path d="M -22 14 Q 0 20 22 14" fill="none" :stroke="look.trim" stroke-width="5" />
      <path d="M -22 14 Q 0 20 22 14" fill="none" stroke-width="2" />
      <path d="M -28 -22 L -22 -2 M 28 -22 L 22 -2" fill="none" :stroke="look.trim" stroke-width="3" />
      <path v-if="look.stitches" d="M -10 -8 L -10 10 M 10 -8 L 10 10" fill="none" stroke-width="2.5" stroke-dasharray="3 4" />
      <g v-if="look.rings" fill="none" stroke-width="2" :stroke="look.trim">
        <circle v-for="(p, i) in [[-10, -6], [0, -6], [10, -6], [-5, 3], [5, 3], [-10, 10], [0, 10], [10, 10]]" :key="i" :cx="p[0]" :cy="p[1]" r="4" />
      </g>
      <g v-if="look.scales" fill="none" stroke-width="2.5" :stroke="look.trim">
        <path d="M -16 -6 q 5 6 10 0 q 5 6 10 0 q 5 6 10 0 M -11 4 q 5 6 10 0 q 5 6 10 0" />
      </g>
      <path v-if="!look.rings && !look.scales && !look.stitches" d="M 0 -18 L 0 12" fill="none" :stroke="look.trim" stroke-width="3" />
      <path v-if="look.gem" d="M 0 -12 L 7 -4 L 0 4 L -7 -4 Z" :fill="look.gem" stroke-width="2.5" />
      <path v-if="look.shine" d="M -16 -16 L -10 -20" fill="none" stroke="#fff" stroke-width="3" />
    </template>
  </g>
</template>
