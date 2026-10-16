<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { CANCEL_COOLDOWN_MS, DIFFICULTY_NAMES } from '@dev-city/shared/office'
import MissionItems from '../city/office/MissionItems.vue'
import MissionReward from '../city/office/MissionReward.vue'
import { minutesLeft, needName, NOTE_COLORS, source } from '../city/office/office.js'
import { useOffice } from '../composables/useOffice.js'

// La propria missione dell'ufficio: cosa chiede (quanti se ne hanno su quanti ne servono), il
// premio e i pulsanti per consegnarla o annullarla. Annullare chiede conferma, perché poi per
// un'ora non se ne prendono altre. Si apre dalla cartellina in alto a destra, dalla bacheca o
// col tasto M; senza missione dice dove prenderne una.
const emit = defineEmits(['close'])

const office = useOffice()
const { mission, busy, error } = office

const COOLDOWN_MIN = CANCEL_COOLDOWN_MS / 60_000
const now = ref(Date.now())
let tick = 0
// Appena annullata la missione l'attesa parte da adesso, non dall'ultimo scatto di now.
watch(office.cooldownUntil, () => (now.value = Date.now()))
const cooldown = computed(() => minutesLeft(office.cooldownUntil.value, now.value))

const needs = computed(() => (mission.value ? office.needsOf(mission.value) : []))
const missingText = computed(() =>
  needs.value
    .filter((n) => n.have < n.need)
    .map((n) => `${n.need - n.have} × ${needName(n.id)} (${source(n.id)})`)
    .join(', '),
)

// Dopo la consegna resta il premio riscosso, finché non si chiude.
const confirming = ref(false)
const done = ref(null)
async function complete() {
  const m = mission.value
  if (await office.complete()) done.value = m
}
async function cancel() {
  if (await office.cancel()) confirming.value = false
}
// La finestra è modale: finché è aperta non si cambia luogo.
const inOffice = location.hash === '#/ufficio'
function goToOffice() {
  location.hash = '#/ufficio'
  emit('close')
}

const dialog = ref(null)
onMounted(() => {
  dialog.value.showModal()
  tick = setInterval(() => (now.value = Date.now()), 15_000)
})
onUnmounted(() => clearInterval(tick))
// Esc chiude la finestra e basta: preventDefault dice all'interno di non usarlo per uscire.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  emit('close')
}
</script>

<template>
  <dialog ref="dialog" class="mission" aria-labelledby="mission-title" @keydown="onKeydown" @click.self="emit('close')" @close="emit('close')">
    <header>
      <h2 id="mission-title">{{ done ? 'Missione completata!' : 'La tua missione' }}</h2>
      <kbd title="Si apre e chiude anche col tasto M">M</kbd>
      <button class="x" aria-label="Chiudi la finestra della missione" @click="emit('close')">✕</button>
    </header>

    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <!-- Appena consegnata: il premio -->
    <template v-if="done">
      <div class="note" :style="{ '--note': NOTE_COLORS[done.difficulty] }">
        <small class="requester">{{ done.requester }} ringrazia</small>
        <h3>{{ done.title }}</h3>
        <p class="label">Hai riscosso</p>
        <MissionReward class="big" :reward="done.reward" />
      </div>
      <div class="actions">
        <button v-if="!inOffice" class="go" @click="goToOffice">Prendine un'altra in ufficio</button>
        <button class="ok" @click="emit('close')">Ok</button>
      </div>
    </template>

    <template v-else-if="mission">
      <div class="note" :style="{ '--note': NOTE_COLORS[mission.difficulty] }">
        <div class="title">
          <span class="difficulty" :class="mission.difficulty">{{ DIFFICULTY_NAMES[mission.difficulty] }}</span>
          <small class="requester">{{ mission.requester }}</small>
        </div>
        <h3>{{ mission.title }}</h3>
        <p class="label">Da consegnare</p>
        <MissionItems :needs="needs" />
        <p class="label">Premio</p>
        <MissionReward class="big" :reward="mission.reward" />
      </div>

      <p v-if="!office.ready.value" class="missing">Mancano: {{ missingText }}.</p>
      <p v-else class="hint">Nell'inventario c'è tutto: consegnando, quello che serve sparisce dall'inventario e arriva il premio.</p>

      <div v-if="confirming" class="confirm" role="alertdialog" aria-labelledby="confirm-text">
        <p id="confirm-text">Annullando la missione, per {{ COOLDOWN_MIN }} minuti non potrai prenderne un'altra. La missione non torna sulla bacheca.</p>
        <div class="actions">
          <button class="keep" @click="confirming = false">Tienila</button>
          <button class="drop" :disabled="busy" @click="cancel">Sì, annulla</button>
        </div>
      </div>
      <div v-else class="actions">
        <button class="complete" :disabled="busy || !office.ready.value" @click="complete">Completa · riscatta il premio</button>
        <button class="cancel" :disabled="busy" @click="confirming = true">Annulla missione</button>
      </div>
    </template>

    <template v-else>
      <p v-if="cooldown" class="empty">Hai annullato una missione: potrai prenderne un'altra tra <strong>{{ cooldown }} min</strong>.</p>
      <p v-else class="empty">Nessuna missione in corso. Si prendono dalla bacheca dell'ufficio, una alla volta.</p>
      <div class="actions">
        <button v-if="!inOffice" class="go" @click="goToOffice">Vai in ufficio</button>
        <button class="ok" @click="emit('close')">Ok</button>
      </div>
    </template>
  </dialog>
</template>

<style scoped>
.mission {
  width: min(520px, calc(100% - 32px));
  max-height: calc(100% - 32px);
  box-sizing: border-box;
  padding: 18px 22px 22px;
  border: 5px solid #2d2a4a;
  border-radius: 20px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.mission::backdrop {
  background: rgba(45, 42, 74, 0.55);
}
header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
h2 {
  margin: 0;
  font-size: 30px;
  font-weight: normal;
  color: #2f4d85;
  text-shadow: 0 3px 0 #2d2a4a33;
}
kbd {
  padding: 1px 7px 3px;
  border: 2px solid #2d2a4a;
  border-bottom-width: 4px;
  border-radius: 7px;
  background: #fff;
  font: inherit;
  font-size: 14px;
  opacity: 0.7;
}
button {
  font: inherit;
  cursor: pointer;
}
.x {
  margin-left: auto;
  width: 40px;
  height: 40px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 18px;
}
.error {
  margin: -4px 0 12px;
  color: #c0262d;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
}
/* Il foglietto della bacheca, più grande. */
.note {
  padding: 14px 16px 16px;
  border: 4px solid #2d2a4a;
  border-radius: 6px 6px 16px 6px;
  background: var(--note);
}
.title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.difficulty {
  padding: 0 8px 2px;
  border-radius: 8px;
  background: #2d2a4a;
  color: #fff8e6;
  font-size: 13px;
}
.difficulty.hard {
  background: #c0262d;
}
.requester {
  color: #5a5680;
  font-size: 15px;
}
h3 {
  margin: 4px 0 6px;
  font-size: 24px;
  font-weight: normal;
}
.label {
  margin: 10px 0 6px;
  font-size: 15px;
}
.big {
  font-size: 18px;
}
.missing,
.hint,
.empty,
.confirm p {
  margin: 12px 0 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
}
.missing {
  color: #c0262d;
}
.hint {
  color: #3b8f2a;
}
.empty {
  margin: 0;
  font-size: 16px;
}
.confirm {
  margin-top: 14px;
  padding: 10px 14px 14px;
  border: 4px dashed #c0262d;
  border-radius: 14px;
  background: #ffe6e2;
}
.confirm p {
  margin: 0;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
}
.actions button {
  padding: 6px 18px 8px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 18px;
}
.actions button:active:not(:disabled) {
  translate: 0 3px;
  box-shadow: none;
}
.actions button:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
.complete,
.ok {
  background: #9ccc65;
}
.go,
.keep {
  background: #b9a4f5;
}
.cancel {
  margin-left: auto;
  background: #fff;
  font-size: 16px !important;
}
.drop {
  background: #ff7a59;
}
@media (max-width: 720px) {
  kbd {
    display: none;
  }
  .cancel {
    margin-left: 0;
  }
}
</style>
