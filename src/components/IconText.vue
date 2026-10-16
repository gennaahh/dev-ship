<script setup>
import Icon from './Icon.vue'

// Una riga di statistiche con le icone: [{ icon, text }], separate da " · ". Per le righe che si
// costruiscono nel codice (attrezzi, armi, effetti dei caffè), dove prima c'erano le emoji.
defineProps({
  parts: { type: Array, required: true },
})
</script>

<template>
  <span class="icon-text">
    <template v-for="(p, i) in parts" :key="i">
      <template v-if="i"> · </template>
      <span class="part"><Icon v-if="p.icon" :name="p.icon" /> {{ p.text }}</span>
    </template>
  </span>
</template>

<style scoped>
.part {
  white-space: nowrap;
}
</style>
