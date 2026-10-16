<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { authClient, displayName } from '../auth.js'
import Avatar from '../city/Avatar.vue'
import { lookOf } from '../city/avatar.js'
import { useInventory } from '../composables/useInventory.js'

// In alto a destra, da loggati: il proprio personaggio, il nome e le monete d'oro.
// Un clic (o il tasto I) apre l'inventario. La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const name = computed(() => (user.value ? displayName(user.value) : ''))
const inventory = useInventory()
const look = computed(() => lookOf(name.value, inventory.equipment.value))

// I apre e chiude l'inventario, tranne mentre si scrive o con un'altra finestra aperta (shop).
const TYPING = 'input, textarea, select, [contenteditable]'
function onKey(e) {
  if (e.key.toLowerCase() !== 'i' || e.ctrlKey || e.metaKey || e.altKey || e.repeat || e.isComposing) return
  if (e.target.closest?.(TYPING)) return
  if (!inventory.open.value && document.querySelector('dialog[open]')) return
  e.preventDefault()
  inventory.open.value = !inventory.open.value
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))
</script>

<template>
  <button v-if="user" class="badge" title="Inventario (I)" aria-label="Apri l'inventario (I)" @click="inventory.open.value = true">
    <span class="face">
      <svg viewBox="-52 -138 104 104" aria-hidden="true">
        <Avatar :look="look" />
      </svg>
    </span>
    <span class="info">
      <span class="name">{{ name }}</span>
      <span class="gold">🪙 {{ inventory.ready.value ? inventory.gold.value : '…' }}</span>
    </span>
    <svg class="bag" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M 8 8 V 6 a 4 4 0 0 1 8 0 V 8" fill="none" />
      <path d="M 4 8 H 20 L 19 20 a 2 2 0 0 1 -2 2 H 7 a 2 2 0 0 1 -2 -2 Z" />
      <path d="M 9 13 H 15" fill="none" />
    </svg>
  </button>
</template>

<style scoped>
.badge {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 52px;
  box-sizing: border-box;
  max-width: 280px;
  padding: 0 12px 0 4px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  text-align: left;
  cursor: pointer;
}
.badge:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.face {
  flex: none;
  width: 40px;
  height: 40px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: radial-gradient(circle at 50% 40%, #fff 0 30%, #ffe3ec 75%);
  overflow: hidden;
}
.face svg {
  width: 100%;
  height: 100%;
}
.info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.1;
}
.name {
  overflow: hidden;
  font-size: 16px;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.gold {
  color: #9c6332;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
.bag {
  flex: none;
  width: 26px;
  height: 26px;
  fill: #ffd54a;
  stroke: #2d2a4a;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
/* Sui telefoni basta il personaggio: monete e nome si vedono nell'inventario. */
@media (max-width: 720px) {
  .badge {
    padding: 0 4px;
  }
  .info,
  .bag {
    display: none;
  }
}
</style>
