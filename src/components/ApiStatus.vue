<script setup>
import { computed } from 'vue'
import { useApiStatus } from '../composables/useApiStatus.js'

// Spia in basso a sinistra: dice se il frontend raggiunge l'healthcheck dell'API.
const { status } = useApiStatus()
const label = computed(() => ({ online: 'online', offline: 'offline', checking: 'in verifica…' })[status.value])
</script>

<template>
  <div class="api-status" :class="status" role="status" aria-live="polite">
    Stato: <span class="dot" aria-hidden="true" /> {{ label }}
  </div>
</template>

<style scoped>
.api-status {
  position: fixed;
  left: 16px;
  bottom: 16px;
  /* Sopra la città e sopra gli interni (z-index 100). */
  z-index: 150;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #fff8e6;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 15px;
  pointer-events: none;
}
.dot {
  width: 12px;
  height: 12px;
  border: 2px solid #2d2a4a;
  border-radius: 50%;
  background: #b9b4c9;
}
.online .dot {
  background: #3ddc5a;
  box-shadow: 0 0 8px #3ddc5a;
}
.offline .dot {
  background: #ff4a4a;
  box-shadow: 0 0 8px #ff4a4a;
}
</style>
