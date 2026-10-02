<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Pulsante in alto a destra per mettere e togliere lo schermo intero del browser.
// Dove il browser non lo permette (es. iPhone) non compare.
const supported = document.fullscreenEnabled
const active = ref(Boolean(document.fullscreenElement))

// Si esce anche con l'Esc del browser: lo stato si legge dall'evento, non dal clic.
const onChange = () => (active.value = Boolean(document.fullscreenElement))
onMounted(() => document.addEventListener('fullscreenchange', onChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', onChange))

function toggle() {
  const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()
  request.catch(() => {})
}
</script>

<template>
  <button
    v-if="supported"
    class="fullscreen"
    :aria-label="active ? 'Esci dallo schermo intero' : 'Schermo intero'"
    :title="active ? 'Esci dallo schermo intero' : 'Schermo intero'"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path v-if="active" d="M 9 3 V 9 H 3 M 15 3 V 9 H 21 M 9 21 V 15 H 3 M 15 21 V 15 H 21" />
      <path v-else d="M 3 9 V 3 H 9 M 21 9 V 3 H 15 M 3 15 V 21 H 9 M 21 15 V 21 H 15" />
    </svg>
  </button>
</template>

<style scoped>
.fullscreen {
  position: fixed;
  top: 16px;
  right: 16px;
  /* Come l'account e le spie: sopra la città e sopra gli interni (z-index 100). */
  z-index: 150;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #ffd54a;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  cursor: pointer;
}
.fullscreen:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
