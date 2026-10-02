<script setup>
import { API_URL, GAME_URL } from '../config.js'
import { useHealthCheck } from '../composables/useHealthCheck.js'

// Spie in basso a sinistra: dicono se il frontend raggiunge l'API e il game server.
const services = [
  {
    name: 'API',
    ...useHealthCheck(`${API_URL}/health`, async (res) => res.ok && (await res.json()).status === 'ok'),
  },
  {
    name: 'Gioco',
    // Colyseus espone /__healthcheck sulla stessa porta dei WebSocket.
    ...useHealthCheck(`${GAME_URL.replace(/^ws/, 'http')}/__healthcheck`),
  },
]
const LABELS = { online: 'online', offline: 'offline', checking: 'in verifica…' }
</script>

<template>
  <div class="service-status" role="status" aria-live="polite">
    Stato:
    <span v-for="s in services" :key="s.name" class="service" :class="s.status.value">
      {{ s.name }} <span class="dot" aria-hidden="true" /> {{ LABELS[s.status.value] }}
    </span>
  </div>
</template>

<style scoped>
.service-status {
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
.service {
  display: flex;
  align-items: center;
  gap: 6px;
}
.service + .service::before {
  content: '·';
  margin-right: 2px;
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
