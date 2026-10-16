<script setup>
import { onUnmounted, ref } from 'vue'
import { useTrade } from '../composables/useTrade.js'

// In alto al centro: le richieste di scambio arrivate (Accetta / Rifiuta, finché non scadono)
// e gli avvisi degli scambi (richiesta mandata, rifiutata, annullata, errori).
const trade = useTrade()

// Per la barretta del tempo che resta.
const now = ref(Date.now())
const clock = setInterval(() => (now.value = Date.now()), 250)
onUnmounted(() => clearInterval(clock))
const REQUEST_MS = 30_000
const left = (invite) => Math.max(0, (invite.until - now.value) / REQUEST_MS)
</script>

<template>
  <div class="trade-toasts" aria-live="polite">
    <div v-for="i in trade.invites.value" :key="i.id" class="toast invite" role="alertdialog" :aria-label="`${i.name} vuole fare uno scambio`">
      <p><strong>{{ i.name }}</strong> vuole fare uno scambio con te</p>
      <div class="actions">
        <button class="yes" @click="trade.answer(i.id, true)">Accetta</button>
        <button class="no" @click="trade.answer(i.id, false)">Rifiuta</button>
      </div>
      <span class="time" :style="{ transform: `scaleX(${left(i)})` }" />
    </div>
    <div v-if="trade.notice.value" :key="trade.notice.value.text" class="toast" :class="{ error: trade.notice.value.error }" :role="trade.notice.value.error ? 'alert' : 'status'">
      {{ trade.notice.value.text }}
    </div>
  </div>
</template>

<style scoped>
.trade-toasts {
  position: fixed;
  top: 84px;
  left: 50%;
  z-index: 250;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: min(420px, calc(100% - 32px));
  translate: -50% 0;
  pointer-events: none;
}
.toast {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  max-width: 100%;
  padding: 8px 14px 10px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #fff8e6;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 16px;
  text-align: center;
  pointer-events: auto;
  animation: drop 0.25s ease-out;
}
.toast.error {
  background: #ffb4a6;
}
.invite {
  width: 100%;
  background: #ffe9b0;
}
.invite p {
  margin: 0 0 8px;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}
button {
  padding: 4px 16px 6px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  box-shadow: 0 2px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  cursor: pointer;
}
.yes {
  background: #9ccc65;
}
.no {
  background: #fff;
}
.time {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 4px;
  background: #e0782f;
  transform-origin: left;
  transition: transform 0.25s linear;
}
@keyframes drop {
  from {
    opacity: 0;
    translate: 0 -10px;
  }
}
</style>
