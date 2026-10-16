<script setup>
import { TROPHIES } from '@dev-city/shared/trophies'
import { weekLabel } from './museum.js'

// La bacheca dei trofei vista da vicino, sopra la scena del museo: i trofei della città
// (packages/shared/src/trophies.ts), con chi li ha vinti e quando. Per ora è vuota: arriveranno
// trofei fatti apposta. close: ci si allontana (anche con Esc o un clic fuori).
const emit = defineEmits(['close'])
</script>

<template>
  <section class="shelf" aria-labelledby="shelf-title" @click.stop>
    <header>
      <button class="close" aria-label="Allontanati dalla bacheca" @click="emit('close')">← Torna alla sala</button>
      <h2 id="shelf-title">Bacheca dei trofei</h2>
    </header>
    <ul v-if="TROPHIES.length" class="trophies">
      <li v-for="t in TROPHIES" :key="t.id" class="trophy">
        <span class="cup" aria-hidden="true">🏆</span>
        <h3>{{ t.name }}</h3>
        <p>{{ t.blurb }}</p>
        <small>{{ t.winner }} · {{ weekLabel(t.date) }}</small>
      </li>
    </ul>
    <div v-else class="empty">
      <div class="stands" aria-hidden="true">
        <span v-for="i in 3" :key="i" class="stand" />
      </div>
      <p>La bacheca aspetta i suoi primi trofei: arriveranno per le imprese della città.</p>
    </div>
  </section>
</template>

<style scoped>
.shelf {
  position: absolute;
  top: 84px;
  left: 50%;
  translate: -50% 0;
  width: min(640px, calc(100% - 32px));
  max-height: calc(100% - 200px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 16px 20px 22px;
  border: 10px solid #8a5432;
  outline: 4px solid #2d2a4a;
  border-radius: 16px;
  background: linear-gradient(#e6f3fa, #d9eef8);
  box-shadow: 0 8px 0 #2d2a4a;
  color: #2d2a4a;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  margin-bottom: 12px;
}
h2 {
  margin: 0;
  font-size: 30px;
  font-weight: normal;
  color: #8a5432;
}
button {
  font: inherit;
  cursor: pointer;
}
.close {
  padding: 2px 12px 4px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 15px;
}
.close:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.empty {
  text-align: center;
}
.stands {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 26px 0 0;
  border-bottom: 10px solid #c98a4b;
}
.stand {
  width: 60px;
  height: 26px;
  border: 4px solid #2d2a4a;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: #b3541e;
}
.empty p {
  margin: 16px 0 0;
  color: #4b5f78;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 15px;
}
.trophies {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.trophy {
  padding: 10px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fffaf0;
  text-align: center;
}
.cup {
  font-size: 40px;
}
.trophy h3 {
  margin: 4px 0;
  font-size: 18px;
  font-weight: normal;
}
.trophy p,
.trophy small {
  margin: 0;
  color: #6b5a40;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 13px;
}
@media (max-width: 720px) {
  .shelf {
    top: 160px;
  }
}
</style>
