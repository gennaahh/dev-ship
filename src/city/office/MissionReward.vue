<script setup>
import { itemName } from '@dev-city/shared/catalog'
import ItemIcon from '../../components/ItemIcon.vue'
import Icon from '../../components/Icon.vue'

// Il premio di una missione: le monete e, se ci sono, gli oggetti (il ticket del dungeon).
defineProps({
  // { gold, items: { id: quanti } }
  reward: { type: Object, required: true },
})
</script>

<template>
  <span class="reward">
    <span class="gold" :title="`${reward.gold} monete d'oro`"><Icon name="coin" /> {{ reward.gold }}</span>
    <span v-for="(n, id) in reward.items" :key="id" class="item" :title="`${itemName(id)} × ${n}`">
      <ItemIcon :id="id" />
      <template v-if="n > 1">× {{ n }}</template>
    </span>
  </span>
</template>

<style scoped>
.reward {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}
.gold,
.item {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 10px 3px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.item {
  padding: 0 6px;
  background: #fff;
}
.item svg {
  width: 26px;
  height: 26px;
}
</style>
