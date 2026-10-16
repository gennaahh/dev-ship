<script setup>
import { DUNGEON_TICKET, FISH, FISH_SOUP, gear, isHat, mineral } from '@dev-city/shared/catalog'
import Avatar from '../city/Avatar.vue'
import { DEFAULT_LOOK } from '../city/avatar.js'
import MaterialIcon from '../city/dungeon/MaterialIcon.vue'
import TicketBottle from '../city/dungeon/TicketBottle.vue'
import Fish from '../city/fishing/Fish.vue'
import GearIcon from '../city/mine/GearIcon.vue'
import MineralIcon from '../city/mine/MineralIcon.vue'
import SoupBowl from './SoupBowl.vue'

// L'icona di un oggetto dell'inventario a quantità (zuppe, ticket, materiali del dungeon, minerali
// della miniera, armi e armature) o di un cappello (id del catalogo), come
// <svg> intero: la misura la dà chi la usa. I pesci veri hanno Fish, col loro peso; qui 'fish' è
// un pesce qualsiasi (quelli chiesti dalle missioni dell'ufficio).
defineProps({ id: { type: String, required: true } })
</script>

<template>
  <svg v-if="id === FISH" viewBox="-68 -50 136 100" aria-hidden="true"><Fish :kg="2" :wiggle="false" /></svg>
  <svg v-else-if="id === FISH_SOUP" viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl :steam="false" /></svg>
  <svg v-else-if="id === DUNGEON_TICKET" viewBox="-50 -60 100 115" aria-hidden="true"><TicketBottle /></svg>
  <svg v-else-if="isHat(id)" viewBox="-55 -135 110 100" aria-hidden="true"><Avatar :look="{ color: DEFAULT_LOOK.color, hat: id }" /></svg>
  <svg v-else-if="mineral(id)" viewBox="-34 -34 68 68" aria-hidden="true"><MineralIcon :id="id" /></svg>
  <svg v-else-if="gear(id)" viewBox="-36 -36 72 72" aria-hidden="true"><GearIcon :id="id" /></svg>
  <svg v-else viewBox="-34 -34 68 68" aria-hidden="true"><MaterialIcon :id="id" /></svg>
</template>
