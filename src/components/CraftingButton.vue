<script setup>
import { computed } from 'vue'
import { authClient } from '../auth.js'
import { useInventory } from '../composables/useInventory.js'
import KeyCap from './KeyCap.vue'

// In alto a destra, da loggati: la pentola che apre il crafting (anche col tasto R, le ricette).
// La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
</script>

<template>
  <button v-if="user" class="crafting-button" title="Crafting (R)" aria-label="Apri il crafting (R)" @click="inventory.open.value = 'craft'">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M 8.5 6 q -1.2 -1.5 0 -3 M 15.5 6 q -1.2 -1.5 0 -3" fill="none" />
      <path d="M 4.5 11.5 H 19.5 V 17.5 a 3.5 3.5 0 0 1 -3.5 3.5 H 8 a 3.5 3.5 0 0 1 -3.5 -3.5 Z" />
      <path d="M 4.5 13.5 H 2 M 19.5 13.5 H 22" fill="none" />
      <rect x="3.5" y="8.5" width="17" height="3" rx="1.5" fill="#ffd54a" />
      <circle cx="12" cy="7.2" r="1.3" fill="#ffd54a" />
    </svg>
    <KeyCap letter="R" />
  </button>
</template>

<style scoped>
.crafting-button {
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
.crafting-button:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
svg {
  width: 30px;
  height: 30px;
  fill: #ff7a59;
  stroke: #2d2a4a;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
