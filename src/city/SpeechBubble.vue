<script setup>
import { computed } from 'vue'

// Fumetto da mettere sopra un personaggio (stessa origine, tra i piedi). Va disegnato dopo
// tutto il resto della scena, così nessun oggetto lo copre.
const props = defineProps({
  text: { type: String, default: '' },
  // Sta scrivendo: al posto del testo, tre puntini che saltellano.
  typing: { type: Boolean, default: false },
  // Col cappello la testa è più alta.
  hat: { type: Boolean, default: false },
})

// Righe di al massimo LINE caratteri, spezzate tra le parole; oltre MAX_LINES si taglia.
const LINE = 26
const MAX_LINES = 3
const LINE_HEIGHT = 22

const lines = computed(() => {
  const out = []
  let line = ''
  for (const word of props.text.split(' ')) {
    // Le parole più lunghe di una riga si spezzano a forza.
    for (let w = word; w; w = w.slice(LINE)) {
      const piece = w.slice(0, LINE)
      if (line && line.length + 1 + piece.length > LINE) {
        out.push(line)
        line = piece
      } else {
        line = line ? `${line} ${piece}` : piece
      }
    }
  }
  if (line) out.push(line)
  if (out.length > MAX_LINES) {
    out.length = MAX_LINES
    out[MAX_LINES - 1] = `${out[MAX_LINES - 1].slice(0, LINE - 1)}…`
  }
  return out
})
// Larghezza stimata dal numero di caratteri della riga più lunga.
const w = computed(() => (props.typing ? 36 : Math.max(60, Math.max(...lines.value.map((l) => l.length)) * 9 + 28)))
// Altezza del riquadro, sopra la punta.
const h = computed(() => (props.typing ? 34 : 18 + lines.value.length * LINE_HEIGHT))
const path = computed(() => {
  const W = w.value
  const v = h.value - 24
  return `M ${-W / 2} ${-h.value} h ${W} a 12 12 0 0 1 12 12 v ${v} a 12 12 0 0 1 -12 12 h ${-W / 2 + 10} l -10 12 l -10 -12 h ${-W / 2 + 10} a 12 12 0 0 1 -12 -12 v ${-v} a 12 12 0 0 1 12 -12 Z`
})
</script>

<template>
  <g :transform="`translate(0 ${hat ? -134 : -116})`">
    <g :key="typing ? 'typing' : text" class="bubble">
      <path :d="path" fill="#fff" stroke="#2d2a4a" stroke-width="4" stroke-linejoin="round" />
      <g v-if="typing" class="dots">
        <circle v-for="i in 3" :key="i" :cx="(i - 2) * 14" cy="-17" r="5" fill="#2d2a4a" :style="{ animationDelay: `${(i - 1) * 0.15}s` }" />
      </g>
      <text v-for="(l, i) in lines" v-else :key="i" :y="-h + 25 + i * LINE_HEIGHT" text-anchor="middle">{{ l }}</text>
    </g>
  </g>
</template>

<style scoped>
text {
  fill: #2d2a4a;
  stroke: none;
  font-size: 18px;
  white-space: pre;
}
.bubble {
  transform-origin: 0 0;
  animation: pop 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes pop {
  from { opacity: 0; transform: scale(0.6); }
}
.dots circle {
  transform-box: fill-box;
  transform-origin: center;
  animation: hop 0.9s ease-in-out infinite;
}
@keyframes hop {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.45; }
  30% { transform: translateY(-6px); opacity: 1; }
}
</style>
