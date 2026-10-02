<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import DevShip from './DevShip.vue'

// La dev-ship da sola, a tutta pagina e senza il resto dell'interfaccia (né città, né spie,
// né slider): si apre con un doppio clic sull'etichetta Dev-ship del cartellone.
// Chiede anche lo schermo intero del browser; dove non c'è (es. iPhone) resta a tutta pagina.
// Si esce con Esc o con un altro doppio clic.
const emit = defineEmits(['close'])
const root = ref(null)

// Esc in ascolto prima degli altri (capture): chiude questa vista e basta, senza che la città
// lo usi anche per uscire dallo zoom del cartellone.
function onKey(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
// Dallo schermo intero del browser si esce anche col suo Esc, che alla pagina non arriva.
function onFullscreenChange() {
  if (!document.fullscreenElement) emit('close')
}

onMounted(() => {
  addEventListener('keydown', onKey, true)
  root.value.requestFullscreen?.().then(
    () => document.addEventListener('fullscreenchange', onFullscreenChange),
    () => {},
  )
})
onUnmounted(() => {
  removeEventListener('keydown', onKey, true)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
})
</script>

<template>
  <div ref="root" class="devship-fullscreen" @dblclick="emit('close')">
    <DevShip :controls="false" />
  </div>
</template>

<style scoped>
.devship-fullscreen {
  position: fixed;
  inset: 0;
  /* Sopra tutto: città, interni (100), spie e account (150). */
  z-index: 1000;
  background: #0e3a63;
}
</style>
