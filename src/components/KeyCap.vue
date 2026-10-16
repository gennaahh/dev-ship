<script setup>
// Il quadratino con la lettera della scorciatoia, nell'angolo in basso a destra di un pulsante
// (che deve avere position: relative). Sui dispositivi senza tastiera non compare.
defineProps({ letter: { type: String, required: true } })
</script>

<template>
  <span class="keycap" aria-hidden="true">{{ letter }}</span>
</template>

<style scoped>
.keycap {
  position: absolute;
  right: -7px;
  bottom: -9px;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  box-sizing: border-box;
  padding-bottom: 2px;
  border: 2px solid #2d2a4a;
  border-bottom-width: 4px;
  border-radius: 6px;
  background: #fff;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
}
@media (hover: none) {
  .keycap {
    display: none;
  }
}
</style>
