<script setup>
import { computed } from 'vue'
import { authClient } from '../auth.js'
import { useInventory } from '../composables/useInventory.js'
import KeyCap from './KeyCap.vue'

// In alto a destra, da loggati: l'incudine che apre il crafting (anche col tasto R, le ricette).
// La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
</script>

<template>
  <button v-if="user" class="crafting-button" title="Crafting (R)" aria-label="Apri il crafting (R)" @click="inventory.open.value = 'craft'">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M 2 11 H 21 V 14 H 15.5 V 16.5 L 18.5 20.5 H 6.5 L 9.5 16.5 V 14 Q 4.5 14 2 11 Z" />
      <path d="M 18 2.6 L 12 6.6" fill="none" stroke-width="5" />
      <path d="M 18 2.6 L 12 6.6" fill="none" stroke="#c98a4b" stroke-width="2" />
      <rect x="-2" y="-3.6" width="4" height="7.2" rx="1" transform="translate(11 7.6) rotate(-34)" fill="#b8c2d4" />
      <path d="M 4.5 7.5 L 3 6 M 6.5 5.5 L 6 3.5" fill="none" stroke-width="1.6" />
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
