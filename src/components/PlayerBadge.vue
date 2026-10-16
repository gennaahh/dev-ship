<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { authClient, displayName } from '../auth.js'
import Avatar from '../city/Avatar.vue'
import { lookOf } from '../city/avatar.js'
import CoffeeCup from '../city/office/CoffeeCup.vue'
import { activeCoffee, leftText } from '../city/office/coffee.js'
import { useInventory } from '../composables/useInventory.js'
import KeyCap from './KeyCap.vue'
import Icon from './Icon.vue'

// In alto a destra, da loggati: il proprio personaggio, il nome e le monete d'oro, e la tazzina
// quando si ha un caffè in circolo (bevuto all'ufficio). Un clic (o il tasto C) apre la finestra
// del personaggio. La posizione la decide App.vue.
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)
const name = computed(() => (user.value ? displayName(user.value) : ''))
const inventory = useInventory()
const look = computed(() => lookOf(name.value, inventory.equipment.value))

// Il caffè finisce da solo: now lo fa sparire.
const now = ref(Date.now())
let tick = 0
onMounted(() => (tick = setInterval(() => (now.value = Date.now()), 30_000)))
onUnmounted(() => clearInterval(tick))
const cup = computed(() => activeCoffee(inventory.coffee.value, now.value))
</script>

<template>
  <button v-if="user" class="badge" title="Personaggio (C)" aria-label="Apri la finestra del personaggio (C)" @click="inventory.open.value = 'character'">
    <span class="face">
      <svg viewBox="-52 -138 104 104" aria-hidden="true">
        <Avatar :look="look" />
      </svg>
    </span>
    <span class="info">
      <span class="name">{{ name }}</span>
      <span class="gold"><Icon name="coin" /> {{ inventory.ready.value ? inventory.gold.value : '…' }}</span>
    </span>
    <span v-if="cup" :key="cup.id" class="cup" :title="`${cup.name}: ancora ${leftText(cup.left)}`">
      <svg viewBox="-30 -50 60 54" aria-hidden="true"><CoffeeCup :id="cup.id" :steam="false" /></svg>
    </span>
    <KeyCap letter="C" />
  </button>
</template>

<style scoped>
.badge {
  position: relative;
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
/* La tazzina del caffè in circolo, sull'angolo in alto a sinistra. */
.cup {
  position: absolute;
  top: -12px;
  left: -12px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
  background: #ffe2c8;
  animation: cup 0.4s cubic-bezier(0.2, 0.7, 0.3, 1.4);
}
.cup svg {
  width: 22px;
  height: 22px;
}
@keyframes cup {
  from {
    scale: 0.4;
  }
}
/* Sui telefoni basta il personaggio: nome e monete si vedono nelle finestre. */
@media (max-width: 720px) {
  .badge {
    padding: 0 4px;
  }
  .info {
    display: none;
  }
}
</style>
