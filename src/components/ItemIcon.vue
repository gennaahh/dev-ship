<script setup>
import { DUNGEON_TICKET, FISH_SOUP, isHat } from '@dev-city/shared/catalog'
import Avatar from '../city/Avatar.vue'
import { DEFAULT_LOOK } from '../city/avatar.js'
import MaterialIcon from '../city/dungeon/MaterialIcon.vue'
import TicketBottle from '../city/dungeon/TicketBottle.vue'
import SoupBowl from './SoupBowl.vue'

// L'icona di un oggetto dell'inventario a quantità o di un cappello (id del catalogo), come
// <svg> intero: la misura la dà chi la usa. I pesci hanno Fish, col loro peso.
defineProps({ id: { type: String, required: true } })
</script>

<template>
  <svg v-if="id === FISH_SOUP" viewBox="-56 -56 112 104" aria-hidden="true"><SoupBowl :steam="false" /></svg>
  <svg v-else-if="id === DUNGEON_TICKET" viewBox="-50 -60 100 115" aria-hidden="true"><TicketBottle /></svg>
  <svg v-else-if="isHat(id)" viewBox="-55 -135 110 100" aria-hidden="true"><Avatar :look="{ color: DEFAULT_LOOK.color, hat: id }" /></svg>
  <svg v-else viewBox="-34 -34 68 68" aria-hidden="true"><MaterialIcon :id="id" /></svg>
</template>
