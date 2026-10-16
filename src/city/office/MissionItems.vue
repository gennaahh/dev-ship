<script setup>
import ItemIcon from '../../components/ItemIcon.vue'
import { needName, source } from './office.js'

// Quello che chiede una missione, una casella per oggetto con l'icona e quanti: sulla bacheca
// (piccole) e nella finestra della missione. Con have, anche quanti se ne hanno, in rosso se
// non bastano.
defineProps({
  // [{ id, need, have? }]
  needs: { type: Array, required: true },
  small: { type: Boolean, default: false },
})
</script>

<template>
  <ul class="needs" :class="{ small }">
    <li
      v-for="n in needs"
      :key="n.id"
      class="need"
      :class="{ short: n.have !== undefined && n.have < n.need }"
      :title="`${needName(n.id)}: ${source(n.id)}`"
    >
      <ItemIcon :id="n.id" />
      <span v-if="!small" class="name">{{ needName(n.id) }}</span>
      <span class="counter">{{ n.have === undefined ? `× ${n.need}` : `${Math.min(n.have, n.need)}/${n.need}` }}</span>
    </li>
  </ul>
</template>

<style scoped>
.needs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.need {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 90px;
  padding: 4px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #fff;
}
.need svg {
  width: 100%;
  height: 44px;
}
.need.short {
  border-style: dashed;
  background: #ffe6e2;
}
.need.short svg {
  opacity: 0.55;
}
.name {
  max-width: 100%;
  overflow: hidden;
  font-size: 12px;
  line-height: 1.1;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.counter {
  padding: 0 6px 1px;
  border-radius: 7px;
  background: #9ccc65;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}
.need.short .counter {
  background: #ff7a59;
  color: #fff8e6;
}
/* Sulla bacheca: caselline in fila, senza nome (è nel suggerimento). */
.small {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.small .need {
  flex-direction: row;
  gap: 4px;
  min-height: 0;
  padding: 2px 6px 2px 2px;
  border-width: 3px;
  border-radius: 10px;
}
.small .need svg {
  width: 30px;
  height: 30px;
}
.small .counter {
  font-size: 14px;
}
</style>
