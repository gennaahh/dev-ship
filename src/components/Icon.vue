<script setup>
import { computed } from 'vue'

// Le icone della città, disegnate qui in SVG al posto delle emoji (che ogni sistema disegna a
// modo suo, e alcuni male). Tutte nello stesso stile: contorno scuro e colori pieni, in un
// quadrato 24 × 24. Quelle dell'interfaccia (spunta, croce, frecce, invio, pausa, salta, persona)
// prendono il colore del testo (currentColor).
// Nell'HTML si mettono in riga col testo, alte poco più di una lettera. Dentro un <svg> si
// passano x, y e size (in coordinate di quell'<svg>): diventa un <svg> annidato.
// La misura sta nello stile dell'elemento, così le regole di chi la contiene (es. ".card svg
// { width: 100% }", pensate per le illustrazioni) non la ingrandiscono. ink è il colore del
// contorno: sugli sfondi scuri (cartellone, tabelloni) va chiaro, se no il contorno sparisce.
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: '1.2em' },
  x: { type: Number, default: undefined },
  y: { type: Number, default: undefined },
  ink: { type: String, default: '#2d2a4a' },
})
const dim = computed(() => (typeof props.size === 'number' ? `${props.size}px` : props.size))
</script>

<template>
  <svg class="icon" :x="x" :y="y" :width="size" :height="size" :style="{ width: dim, height: dim }" viewBox="0 0 24 24" aria-hidden="true" stroke-linejoin="round" stroke-linecap="round">
    <!-- Moneta d'oro -->
    <template v-if="name === 'coin'">
      <circle cx="12" cy="12" r="9" fill="#ffd54a" :stroke="ink" stroke-width="2" />
      <circle cx="12" cy="12" r="5.4" fill="none" stroke="#e0a82e" stroke-width="2" />
      <path d="M 7.8 8.6 Q 9.4 6.6 12 6.3" fill="none" stroke="#fff8e6" stroke-width="1.6" />
    </template>
    <!-- Interfaccia, nel colore del testo -->
    <path v-else-if="name === 'check'" d="M 5 12.5 L 10 17 L 19 7" fill="none" stroke="currentColor" stroke-width="3.2" />
    <path v-else-if="name === 'close'" d="M 6.5 6.5 L 17.5 17.5 M 17.5 6.5 L 6.5 17.5" fill="none" stroke="currentColor" stroke-width="3.2" />
    <path v-else-if="name === 'arrow-left'" d="M 19 12 H 6 M 11 6.5 L 5.5 12 L 11 17.5" fill="none" stroke="currentColor" stroke-width="3" />
    <path v-else-if="name === 'arrow-right'" d="M 5 12 H 18 M 13 6.5 L 18.5 12 L 13 17.5" fill="none" stroke="currentColor" stroke-width="3" />
    <path v-else-if="name === 'up-down'" d="M 12 3.5 V 20.5 M 7.5 8 L 12 3.5 L 16.5 8 M 7.5 16 L 12 20.5 L 16.5 16" fill="none" stroke="currentColor" stroke-width="2.6" />
    <path v-else-if="name === 'send'" d="M 4 4 L 21 12 L 4 20 L 7.5 12 Z" fill="currentColor" stroke="currentColor" stroke-width="1.6" />
    <g v-else-if="name === 'pause'" fill="currentColor">
      <rect x="6" y="5" width="4.2" height="14" rx="1.5" />
      <rect x="13.8" y="5" width="4.2" height="14" rx="1.5" />
    </g>
    <g v-else-if="name === 'skip'" fill="currentColor" stroke="currentColor" stroke-width="1.2">
      <path d="M 3.5 5.5 L 11 12 L 3.5 18.5 Z M 10.5 5.5 L 18 12 L 10.5 18.5 Z" />
      <rect x="18.2" y="5.5" width="2.6" height="13" rx="1" />
    </g>
    <g v-else-if="name === 'user'" fill="currentColor">
      <circle cx="12" cy="8" r="4.2" />
      <path d="M 4 21 Q 4 13.2 12 13.2 Q 20 13.2 20 21 Z" />
    </g>
    <!-- Dungeon: danni, vita, difesa e il bug -->
    <g v-else-if="name === 'swords'" :stroke="ink" stroke-width="1.6">
      <path d="M 6.5 3.5 L 3.5 3.5 L 3.5 6.5 L 14.6 17.6 L 17.6 14.6 Z" fill="#dfe6ee" />
      <path d="M 19.2 13.2 L 13.2 19.2" fill="none" stroke="#a0673a" stroke-width="2.6" />
      <path d="M 17.4 17.4 L 20.5 20.5" fill="none" stroke="#7a4a2a" stroke-width="3" />
      <path d="M 17.5 3.5 L 20.5 3.5 L 20.5 6.5 L 9.4 17.6 L 6.4 14.6 Z" fill="#eef2f6" />
      <path d="M 4.8 13.2 L 10.8 19.2" fill="none" stroke="#a0673a" stroke-width="2.6" />
      <path d="M 6.6 17.4 L 3.5 20.5" fill="none" stroke="#7a4a2a" stroke-width="3" />
    </g>
    <template v-else-if="name === 'heart'">
      <path d="M 12 20.5 C 4 15 2.5 11 3.5 7.8 C 4.6 4.6 9 3.8 12 7.5 C 15 3.8 19.4 4.6 20.5 7.8 C 21.5 11 20 15 12 20.5 Z" fill="#ff5a6e" :stroke="ink" stroke-width="2" />
      <ellipse cx="7.6" cy="8.6" rx="1.6" ry="1.1" fill="#fff" opacity="0.7" transform="rotate(-30 7.6 8.6)" />
    </template>
    <template v-else-if="name === 'shield'">
      <path d="M 12 2.8 L 20 5.8 V 11.5 C 20 16.5 16.5 19.8 12 21.4 C 7.5 19.8 4 16.5 4 11.5 V 5.8 Z" fill="#4fc3f7" :stroke="ink" stroke-width="2" />
      <path d="M 12 3.8 L 19 6.4 V 11.5 C 19 15.8 16.2 18.8 12 20.3 Z" fill="#9fdcf7" />
      <path d="M 12 3.4 V 20.8" fill="none" :stroke="ink" stroke-width="1.4" />
    </template>
    <g v-else-if="name === 'bug'" :stroke="ink" stroke-width="1.6">
      <path d="M 10.4 4.6 Q 9 2.2 7.2 2.4 M 13.6 4.6 Q 15 2.2 16.8 2.4" fill="none" />
      <circle cx="12" cy="7" r="3.4" fill="#2d2a4a" />
      <circle cx="12" cy="13.8" r="7.4" fill="#ff5a6e" stroke-width="2" />
      <path d="M 12 7.4 V 21" fill="none" />
      <g fill="#2d2a4a" stroke="none">
        <circle cx="8.6" cy="12.2" r="1.4" />
        <circle cx="15.4" cy="12.2" r="1.4" />
        <circle cx="9" cy="16.6" r="1.1" />
        <circle cx="15" cy="16.6" r="1.1" />
      </g>
    </g>
    <!-- Lago e miniera -->
    <template v-else-if="name === 'fish'">
      <path d="M 17.5 12 L 22 7.5 L 22 16.5 Z" fill="#2b9fd6" :stroke="ink" stroke-width="1.8" />
      <path d="M 2.5 12 C 5.5 6.5 14 6 18 12 C 14 18 5.5 17.5 2.5 12 Z" fill="#4fc3f7" :stroke="ink" stroke-width="2" />
      <path d="M 9 9 Q 11 12 9 15" fill="none" stroke="#2b9fd6" stroke-width="1.4" />
      <circle cx="6.6" cy="11" r="1.3" fill="#2d2a4a" />
    </template>
    <g v-else-if="name === 'rod'" :stroke="ink">
      <path d="M 17 3 Q 21 8 19.6 14" fill="none" stroke-width="1.2" />
      <path d="M 4 21 L 17 3" fill="none" stroke-width="4" />
      <path d="M 4 21 L 17 3" fill="none" stroke="#c98a4b" stroke-width="2" />
      <circle cx="7.4" cy="16.6" r="2.4" fill="#4b4870" stroke-width="1.5" />
      <path d="M 17.4 16.2 A 2.2 2.2 0 0 1 21.8 16.2 Z" fill="#fff" stroke-width="1.4" />
      <path d="M 17.4 16.2 A 2.2 2.2 0 0 0 21.8 16.2 Z" fill="#ff5a6e" stroke-width="1.4" />
    </g>
    <g v-else-if="name === 'pickaxe'" :stroke="ink">
      <path d="M 12 6.5 L 12 21.5" fill="none" stroke-width="5" />
      <path d="M 12 6.5 L 12 21.5" fill="none" stroke="#c98a4b" stroke-width="2.6" />
      <path d="M 3 9.5 Q 12 1.2 21 9.5 L 18.8 11 Q 12 5.4 5.2 11 Z" fill="#c9d3dc" stroke-width="2" />
    </g>
    <template v-else-if="name === 'gem'">
      <path d="M 6 4 H 18 L 22 9 L 12 21 L 2 9 Z" fill="#59e3ff" :stroke="ink" stroke-width="2" />
      <path d="M 2.5 9 H 21.5 M 9 4 L 7.5 9 L 12 20.5 L 16.5 9 L 15 4" fill="none" :stroke="ink" stroke-width="1.3" />
      <path d="M 7.6 5.6 L 6.4 7.6" fill="none" stroke="#fff" stroke-width="1.5" />
    </template>
    <template v-else-if="name === 'rock'">
      <path d="M 2.5 19 L 4.8 10.5 L 10 6 L 16.2 7 L 21 12.2 L 21.5 19 Z" fill="#a7a3b8" :stroke="ink" stroke-width="2" />
      <path d="M 6.8 11.4 L 10 8.6" fill="none" stroke="#d6d2e2" stroke-width="2" />
      <path d="M 13.4 10.6 L 14.8 14.6 L 13.8 17" fill="none" stroke="#8f8aa6" stroke-width="1.5" />
    </template>
    <template v-else-if="name === 'bottle'">
      <path d="M 10.3 5.5 H 13.7 V 8 C 17 9 17.5 11 17.5 13 V 19.5 C 17.5 20.8 16.5 21.5 15.3 21.5 H 8.7 C 7.5 21.5 6.5 20.8 6.5 19.5 V 13 C 6.5 11 7 9 10.3 8 Z" fill="#bff0d8" :stroke="ink" stroke-width="2" />
      <rect x="9.6" y="2.4" width="4.8" height="3.4" rx="1" fill="#a0673a" :stroke="ink" stroke-width="1.5" />
      <rect x="9" y="12.6" width="6" height="5.4" rx="1" fill="#ffd54a" :stroke="ink" stroke-width="1.2" transform="rotate(-8 12 15.3)" />
    </template>
    <!-- Ufficio -->
    <template v-else-if="name === 'coffee'">
      <path d="M 8.4 7.4 Q 7.4 5.8 8.4 4.2 M 12.4 7.4 Q 11.4 5.8 12.4 4.2" fill="none" stroke="#8e93aa" stroke-width="1.6" />
      <path d="M 16.4 11.6 H 18 C 20.6 11.6 20.6 16 18 16 H 16.2" fill="none" :stroke="ink" stroke-width="2" />
      <path d="M 4.5 10 H 16.5 V 14 C 16.5 18 13.5 20 10.5 20 C 7.5 20 4.5 18 4.5 14 Z" fill="#fff" :stroke="ink" stroke-width="2" />
      <ellipse cx="10.5" cy="10.4" rx="5.2" ry="1.3" fill="#7a4a2a" />
      <path d="M 3 21.5 H 18" fill="none" :stroke="ink" stroke-width="2" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M 10.2 13.4 L 4 20.5" fill="none" stroke="#8e93aa" stroke-width="2.2" />
      <path d="M 13.6 3.2 L 20.8 10.4 L 18.4 11.6 L 15.6 15.4 L 16.2 17.6 L 6.4 7.8 L 8.6 8.4 L 12.4 5.6 Z" fill="#e8453c" :stroke="ink" stroke-width="2" />
      <path d="M 14.2 5.8 L 17.6 9.2" fill="none" stroke="#ff9a8f" stroke-width="1.6" />
    </template>
    <template v-else-if="name === 'cloud'">
      <path d="M 6.5 18 C 3 18 2.5 13.5 5.5 12.5 C 5.5 8.5 10.5 7 12.5 10 C 14 6.5 20 7.5 19 12 C 22 12.5 22 18 18 18 Z" fill="#fff" :stroke="ink" stroke-width="2" />
    </template>
    <template v-else-if="name === 'timer'">
      <path d="M 18 7.4 L 19.6 5.8" fill="none" :stroke="ink" stroke-width="2.2" />
      <circle cx="12" cy="13.6" r="7.6" fill="#fff8e6" :stroke="ink" stroke-width="2" />
      <rect x="9.8" y="2.4" width="4.4" height="2.8" rx="1" fill="#ff7a59" :stroke="ink" stroke-width="1.5" />
      <path d="M 12 13.6 L 12 9.4 M 12 13.6 L 15 15.4" fill="none" :stroke="ink" stroke-width="2" />
    </template>
    <g v-else-if="name === 'clover'" :stroke="ink">
      <path d="M 12 12 Q 13.2 17.6 16.6 21.4" fill="none" stroke-width="3" />
      <path d="M 12 12 Q 13.2 17.6 16.6 21.4" fill="none" stroke="#4fae55" stroke-width="1.4" />
      <g fill="#5cc062" stroke-width="1.8">
        <circle cx="8.6" cy="8.6" r="3.8" />
        <circle cx="15.4" cy="8.6" r="3.8" />
        <circle cx="8.6" cy="15" r="3.8" />
        <circle cx="15.4" cy="15" r="3.8" />
      </g>
      <circle cx="12" cy="11.8" r="1.4" fill="#4fae55" stroke="none" />
    </g>
    <g v-else-if="name === 'trade'" :stroke="ink" stroke-width="1.8">
      <path d="M 3 5.5 H 13 V 2.5 L 20 7.5 L 13 12.5 V 9.5 H 3 Z" fill="#9ccc65" />
      <path d="M 21 14.5 H 11 V 11.5 L 4 16.5 L 11 21.5 V 18.5 H 21 Z" fill="#ff9a4a" />
    </g>
    <g v-else-if="name === 'backpack'" :stroke="ink" stroke-width="2">
      <path d="M 9 6 V 4.5 A 3 3 0 0 1 15 4.5 V 6" fill="none" />
      <rect x="4.5" y="6" width="15" height="16" rx="4.5" fill="#ff9a4a" />
      <path d="M 4.8 11 Q 12 14.5 19.2 11" fill="none" />
      <rect x="8.5" y="15" width="7" height="4.5" rx="1.5" fill="#ffd54a" />
    </g>
    <g v-else-if="name === 'hat'" :stroke="ink" stroke-width="2">
      <ellipse cx="12" cy="17" rx="9.5" ry="3" fill="#3b3756" />
      <path d="M 7 16.4 V 5.5 Q 7 4 8.5 4 H 15.5 Q 17 4 17 5.5 V 16.4 Q 12 17.6 7 16.4 Z" fill="#4b4870" />
      <path d="M 7.4 12.2 H 16.6" fill="none" stroke="#ff5a6e" stroke-width="2.6" />
    </g>
    <template v-else-if="name === 'ticket'">
      <path d="M 3 7 H 21 V 10 C 19.5 10 19.5 14 21 14 V 17 H 3 V 14 C 4.5 14 4.5 10 3 10 Z" fill="#ffd54a" :stroke="ink" stroke-width="2" />
      <path d="M 15.4 7.6 V 16.4" fill="none" stroke="#b3541e" stroke-width="1.4" stroke-dasharray="1.6 1.6" />
      <path d="M 6.6 10.6 H 12 M 6.6 13.4 H 10.6" fill="none" stroke="#b3541e" stroke-width="1.6" />
    </template>
    <!-- Museo, classifica e changelog -->
    <template v-else-if="name === 'trophy'">
      <path d="M 7 5.6 H 4.4 C 4.4 9 5.6 10.6 7.6 11.2 M 17 5.6 H 19.6 C 19.6 9 18.4 10.6 16.4 11.2" fill="none" :stroke="ink" stroke-width="2" />
      <path d="M 7 3.4 H 17 V 9 C 17 12.5 14.8 14.6 12 14.6 C 9.2 14.6 7 12.5 7 9 Z" fill="#ffd54a" :stroke="ink" stroke-width="2" />
      <rect x="10.7" y="14.4" width="2.6" height="3.4" fill="#e0a82e" :stroke="ink" stroke-width="1.5" />
      <rect x="7.4" y="17.6" width="9.2" height="3.8" rx="1" fill="#b3541e" :stroke="ink" stroke-width="2" />
      <path d="M 9.4 5.6 V 9" fill="none" stroke="#fff8e6" stroke-width="1.6" />
    </template>
    <template v-else-if="name === 'crown'">
      <path d="M 3 18 L 2.5 7 L 8 11.5 L 12 4 L 16 11.5 L 21.5 7 L 21 18 Z" fill="#ffd54a" :stroke="ink" stroke-width="2" />
      <rect x="3" y="15.6" width="18" height="4" rx="1" fill="#e0a82e" :stroke="ink" stroke-width="2" />
      <circle cx="12" cy="12.6" r="1.7" fill="#ff4a6e" :stroke="ink" stroke-width="1.2" />
      <circle cx="7" cy="13.6" r="1.2" fill="#4fc3f7" :stroke="ink" stroke-width="1" />
      <circle cx="17" cy="13.6" r="1.2" fill="#4fc3f7" :stroke="ink" stroke-width="1" />
    </template>
    <path
      v-else-if="name === 'star'"
      d="M 12 2.8 L 14.7 8.6 L 21 9.3 L 16.3 13.6 L 17.6 19.9 L 12 16.7 L 6.4 19.9 L 7.7 13.6 L 3 9.3 L 9.3 8.6 Z"
      fill="#ffd54a"
      :stroke="ink"
      stroke-width="2"
    />
    <g v-else-if="name.startsWith('medal-')" :stroke="ink">
      <path d="M 5.5 2.5 H 9.8 L 12.6 9 H 8.4 Z" fill="#4f7bd0" stroke-width="1.5" />
      <path d="M 18.5 2.5 H 14.2 L 11.4 9 H 15.6 Z" fill="#ff5a6e" stroke-width="1.5" />
      <circle cx="12" cy="15" r="6.6" :fill="{ 'medal-1': '#ffd54a', 'medal-2': '#d6dde9', 'medal-3': '#d9925a' }[name]" stroke-width="2" />
      <circle cx="12" cy="15" r="4.2" fill="none" :stroke="{ 'medal-1': '#e0a82e', 'medal-2': '#a7b1c4', 'medal-3': '#b3703a' }[name]" stroke-width="1.5" />
      <text x="12" y="17.8" text-anchor="middle" class="digit" stroke="none" fill="#2d2a4a">{{ name.slice(6) }}</text>
    </g>
    <template v-else-if="name === 'frame'">
      <rect x="2.5" y="4" width="19" height="16" rx="1.5" fill="#e8a31a" :stroke="ink" stroke-width="2" />
      <rect x="5" y="6.5" width="14" height="11" fill="#bfe3f6" :stroke="ink" stroke-width="1.4" />
      <path d="M 5.6 17 L 9.6 12 L 12.4 14.8 L 15 12.4 L 18.4 17 Z" fill="#74c264" />
      <circle cx="15.6" cy="9.2" r="1.4" fill="#ffd54a" />
    </template>
    <template v-else-if="name === 'scroll'">
      <rect x="5" y="4.5" width="14" height="15" fill="#fff8e6" :stroke="ink" stroke-width="2" />
      <path d="M 8 9 H 16 M 8 12 H 16 M 8 15 H 13.4" fill="none" stroke="#c9b48a" stroke-width="1.6" />
      <rect x="3" y="2.5" width="18" height="4" rx="2" fill="#e8c48a" :stroke="ink" stroke-width="2" />
      <rect x="3" y="17.5" width="18" height="4" rx="2" fill="#e8c48a" :stroke="ink" stroke-width="2" />
    </template>
    <template v-else-if="name === 'sad'">
      <circle cx="12" cy="12" r="9" fill="#ffd54a" :stroke="ink" stroke-width="2" />
      <ellipse cx="8.8" cy="10" rx="1.3" ry="1.6" fill="#2d2a4a" />
      <ellipse cx="15.2" cy="10" rx="1.3" ry="1.6" fill="#2d2a4a" />
      <path d="M 8 17 Q 12 13.6 16 17" fill="none" :stroke="ink" stroke-width="1.8" />
      <path d="M 16.6 12.2 Q 15.2 14.6 16.6 15.4 Q 18 14.6 16.6 12.2 Z" fill="#4fc3f7" :stroke="ink" stroke-width="0.8" />
    </template>
  </svg>
</template>

<style scoped>
.icon {
  flex: none;
  overflow: visible;
  vertical-align: -0.22em;
}
.digit {
  font: 800 7.5px system-ui, -apple-system, 'Segoe UI', sans-serif;
}
</style>
