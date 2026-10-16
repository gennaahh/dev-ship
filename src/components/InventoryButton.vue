<script setup>
import { computed } from 'vue'
import { authClient } from '../auth.js'
import { useInventory } from '../composables/useInventory.js'
import KeyCap from './KeyCap.vue'

// In alto a destra, da loggati: lo zainetto che apre l'inventario (anche col tasto I).
// La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
</script>

<template>
  <button v-if="user" class="inventory-button" title="Inventario (I)" aria-label="Apri l'inventario (I)" @click="inventory.open.value = 'bag'">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M 9 6 V 4.5 a 3 3 0 0 1 6 0 V 6" fill="none" />
      <rect x="4.5" y="6" width="15" height="16" rx="4.5" />
      <path d="M 4.8 11 Q 12 14.5 19.2 11" fill="none" />
      <rect x="8.5" y="15" width="7" height="4.5" rx="1.5" fill="#ffd54a" />
      <path d="M 12 12.6 V 15" fill="none" />
    </svg>
    <KeyCap letter="I" />
  </button>
</template>

<style scoped>
.inventory-button {
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
}
.inventory-button:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
svg {
  width: 30px;
  height: 30px;
  fill: #ff9a4a;
  stroke: #2d2a4a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
