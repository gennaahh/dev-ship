<script setup>
import { computed } from 'vue'
import { authClient } from '../auth.js'
import { useInventory } from '../composables/useInventory.js'
import { useOffice } from '../composables/useOffice.js'
import KeyCap from './KeyCap.vue'
import Icon from './Icon.vue'

// In alto a destra, da loggati e con una missione dell'ufficio in corso: la cartellina che apre
// la finestra della missione (anche col tasto M). Il segno di spunta dice che nell'inventario c'è
// già tutto da consegnare. La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
const office = useOffice()
</script>

<template>
  <button
    v-if="user && office.mission.value"
    class="mission-button"
    :title="office.ready.value ? 'Missione pronta da consegnare (M)' : 'Missione in corso (M)'"
    :aria-label="office.ready.value ? 'Apri la missione: pronta da consegnare (M)' : 'Apri la missione in corso (M)'"
    @click="inventory.open.value = 'mission'"
  >
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="19" rx="2.5" />
      <rect x="8" y="1.5" width="8" height="4" rx="1.5" fill="#b8c2d4" />
      <path d="M 7.5 10 H 16.5 M 7.5 14 H 16.5 M 7.5 18 H 13" fill="none" stroke-width="1.8" />
    </svg>
    <span v-if="office.ready.value" class="ready" aria-hidden="true"><Icon name="check" /></span>
    <KeyCap letter="M" />
  </button>
</template>

<style scoped>
.mission-button {
  position: relative;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  padding: 0;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  cursor: pointer;
  animation: arrive 0.4s cubic-bezier(0.2, 0.7, 0.3, 1.4);
}
@keyframes arrive {
  from {
    scale: 0.6;
    opacity: 0;
  }
}
.mission-button:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
svg {
  width: 30px;
  height: 30px;
  fill: #ffe082;
  stroke: #2d2a4a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.ready {
  position: absolute;
  top: -9px;
  right: -9px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
  background: #9ccc65;
  color: #2d2a4a;
  font-family: system-ui, sans-serif;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}
</style>
