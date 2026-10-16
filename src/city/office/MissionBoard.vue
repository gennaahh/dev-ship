<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { DIFFICULTY_NAMES } from '@dev-city/shared/office'
import { authClient } from '../../auth.js'
import { useInventory } from '../../composables/useInventory.js'
import { useOffice } from '../../composables/useOffice.js'
import { BACKEND_ENABLED } from '../../config.js'
import MissionItems from './MissionItems.vue'
import MissionReward from './MissionReward.vue'
import { minutesLeft, NOTE_COLORS } from './office.js'
import Icon from '../../components/Icon.vue'

// La bacheca delle missioni vista da vicino, sopra la scena dell'ufficio (che ci ha zoomato
// sopra): i foglietti da fare col premio e il pulsante per prenderli, chi ci sta lavorando e le
// ultime consegnate. close: ci si allontana (anche con Esc o un clic fuori, lo gestisce l'ufficio).
const emit = defineEmits(['close'])

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
const office = useOffice()
const { board, boardFailed, mission, busy, error } = office

// now fa scorrere l'attesa dopo un annullamento.
const now = ref(Date.now())
let tick = 0
onMounted(() => (tick = setInterval(() => (now.value = Date.now()), 15_000)))
onUnmounted(() => clearInterval(tick))

// Appena annullata una missione l'attesa parte da adesso, non dall'ultimo scatto di now.
watch(office.cooldownUntil, () => (now.value = Date.now()))
const cooldown = computed(() => minutesLeft(office.cooldownUntil.value, now.value))
const signedIn = computed(() => BACKEND_ENABLED && !!user.value && inventory.ready.value)
const canTake = computed(() => signedIn.value && !mission.value && !cooldown.value)

// Sopra i foglietti: cosa si può fare adesso.
const status = computed(() => {
  if (!BACKEND_ENABLED) return { text: 'Demo: con il backend le missioni si prendono davvero.' }
  if (!user.value) return { text: 'Accedi (in basso al centro) per prendere una missione.' }
  if (mission.value) {
    return office.ready.value
      ? { text: `«${mission.value.title}»: hai tutto, consegnala!`, tone: 'ready', open: true }
      : { text: `La tua missione: «${mission.value.title}».`, tone: 'mine', open: true }
  }
  if (cooldown.value) return { text: `Hai annullato una missione: potrai prenderne un'altra tra ${cooldown.value} min.`, tone: 'wait' }
  return { text: 'Scegli una missione: se ne fa una alla volta.' }
})
const takeHint = computed(() => {
  if (!signedIn.value) return 'Serve il login'
  if (mission.value) return 'Hai già una missione in corso'
  if (cooldown.value) return `Tra ${cooldown.value} min`
  return 'Prendi questa missione'
})

// Quello che chiede una missione: da loggati anche quanti se ne hanno.
const needsOf = (m) => (signedIn.value ? office.needsOf(m) : Object.entries(m.needs).map(([id, need]) => ({ id, need })))
const TILT = [-2, 1.5, -1, 2]

async function take(m) {
  if (await office.take(m.id)) inventory.open.value = 'mission'
}
const openMission = () => (inventory.open.value = 'mission')
</script>

<template>
  <section class="board" aria-labelledby="board-title" @click.stop>
    <header>
      <button class="close" aria-label="Allontanati dalla bacheca" @click="emit('close')"><Icon name="arrow-left" /> Torna alla stanza</button>
      <h2 id="board-title">Bacheca delle missioni</h2>
      <p class="status" :class="status.tone" aria-live="polite">
        {{ status.text }}
        <button v-if="status.open" class="open" @click="openMission">Apri <kbd>M</kbd></button>
      </p>
    </header>
    <p v-if="error" class="error" role="alert">{{ error }}</p>

    <div class="columns">
      <div class="todo">
        <h3>Da fare</h3>
        <p v-if="!board" class="empty">{{ boardFailed ? 'Bacheca non raggiungibile' : 'Caricamento…' }}</p>
        <ul v-else class="notes">
          <li
            v-for="m in board.open"
            :key="m.id"
            class="note"
            :style="{ '--note': NOTE_COLORS[m.difficulty], '--tilt': `${TILT[m.slot % TILT.length]}deg` }"
          >
            <span class="pin" aria-hidden="true" />
            <span class="difficulty" :class="m.difficulty">{{ DIFFICULTY_NAMES[m.difficulty] }}</span>
            <small class="requester">{{ m.requester }}</small>
            <h4>{{ m.title }}</h4>
            <MissionItems :needs="needsOf(m)" small />
            <div class="foot">
              <MissionReward :reward="m.reward" />
              <button class="take" :disabled="!canTake || busy" :title="takeHint" @click="take(m)">Prendi</button>
            </div>
          </li>
        </ul>
      </div>

      <div class="side">
        <h3>In corso</h3>
        <ul v-if="board?.doing.length" class="list">
          <li v-for="(d, i) in board.doing" :key="`doing-${i}`">
            <strong>{{ d.name }}</strong>
            <span>{{ d.title }}</span>
          </li>
        </ul>
        <p v-else class="empty">Nessuno al lavoro</p>
        <h3>Fatte</h3>
        <ul v-if="board?.done.length" class="list">
          <li v-for="(d, i) in board.done" :key="`done-${i}`">
            <strong>{{ d.name }}</strong>
            <span>{{ d.title }} · <Icon name="coin" /> {{ d.reward.gold }}</span>
          </li>
        </ul>
        <p v-else class="empty">Ancora nessuna</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* La bacheca: sughero in una cornice di legno, al centro sotto al pulsante per tornare. */
.board {
  /* Le barre di scorrimento (App.vue) chiare sul sughero. */
  --scroll-thumb: #fff8e6;
  --scroll-track: rgba(45, 42, 74, 0.25);
  position: absolute;
  top: 84px;
  left: 50%;
  translate: -50% 0;
  width: min(1000px, calc(100% - 32px));
  max-height: calc(100% - 200px);
  overflow-y: auto;
  box-sizing: border-box;
  padding: 14px 18px 18px;
  border: 10px solid #a0673a;
  outline: 4px solid #2d2a4a;
  border-radius: 16px;
  background: radial-gradient(circle at 20% 30%, #d9a46c 0 2px, transparent 3px) 0 0 / 22px 22px, #c98f5a;
  box-shadow: 0 8px 0 #2d2a4a;
  color: #2d2a4a;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  margin-bottom: 10px;
}
h2 {
  margin: 0;
  font-size: 28px;
  font-weight: normal;
  color: #fff8e6;
  text-shadow: 0 3px 0 #2d2a4a;
}
.status {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 3px 12px 5px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff8e6;
  font-size: 16px;
}
.status.mine {
  background: #e6defc;
}
.status.ready {
  background: #c5ef9a;
}
.status.wait {
  background: #ffd8cc;
}
button {
  font: inherit;
  cursor: pointer;
}
.open {
  padding: 0 10px 2px;
  border: 3px solid #2d2a4a;
  border-radius: 9px;
  background: #b9a4f5;
  color: #2d2a4a;
  font-size: 15px;
}
kbd {
  font: inherit;
  font-size: 12px;
  opacity: 0.7;
}
.error {
  margin: 0 0 10px;
  padding: 4px 12px;
  border-radius: 10px;
  background: #fff8e6;
  color: #c0262d;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  font-weight: 600;
}
.columns {
  display: grid;
  grid-template-columns: 1fr 230px;
  gap: 16px;
}
h3 {
  margin: 0 0 8px;
  color: #fff8e6;
  font-size: 18px;
  font-weight: normal;
  letter-spacing: 1px;
  text-transform: uppercase;
  text-shadow: 0 2px 0 #2d2a4a;
}
.empty {
  margin: 0 0 12px;
  color: #fff8e6;
  font-size: 15px;
  opacity: 0.85;
}
.notes {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 0;
  padding: 6px 4px 4px;
  list-style: none;
}
/* Un foglietto appeso con la puntina; uno nuovo arriva con un piccolo salto. */
.note {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 14px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 6px 6px 14px 6px;
  background: var(--note);
  box-shadow: 0 4px 0 #2d2a4a55;
  rotate: var(--tilt);
  animation: pin 0.45s cubic-bezier(0.2, 0.7, 0.3, 1.4);
}
@keyframes pin {
  from {
    opacity: 0;
    scale: 0.85;
    translate: 0 -14px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .note {
    animation: none;
  }
}
.pin {
  position: absolute;
  top: -10px;
  left: 50%;
  width: 16px;
  height: 16px;
  margin-left: -8px;
  border: 3px solid #2d2a4a;
  border-radius: 50%;
  background: #e8453c;
}
.difficulty {
  align-self: flex-start;
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
  font-size: 14px;
}
h4 {
  margin: -4px 0 2px;
  font-size: 20px;
  font-weight: normal;
  line-height: 1.1;
}
.foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  padding-top: 8px;
  border-top: 3px dashed #2d2a4a44;
}
.take {
  padding: 3px 16px 5px;
  border: 4px solid #2d2a4a;
  border-radius: 12px;
  background: #9ccc65;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-size: 17px;
}
.take:active:not(:disabled) {
  translate: 0 3px;
  box-shadow: none;
}
.take:disabled {
  background: #e6e2d6;
  color: #6b6890;
  cursor: not-allowed;
}
.side {
  min-width: 0;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 14px;
  padding: 0;
  list-style: none;
}
.list li {
  display: flex;
  flex-direction: column;
  padding: 4px 10px 6px;
  border: 3px solid #2d2a4a;
  border-radius: 8px;
  background: #fff8e6;
  font-size: 15px;
  line-height: 1.15;
}
.list strong {
  overflow: hidden;
  font-weight: normal;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.list span {
  color: #6b6890;
  font-size: 13px;
}
@media (max-width: 860px) {
  .columns {
    grid-template-columns: 1fr;
  }
}
/* Sui telefoni sotto al pulsante per tornare e al pannello del luogo (InteriorLayout). */
@media (max-width: 720px) {
  /* In basso c'è la chat, alta circa 360 px con le spie: la bacheca finisce sopra e scorre. */
  .board {
    top: 160px;
    max-height: max(240px, calc(100% - 160px - 380px));
    padding: 10px 12px 14px;
  }
  .notes {
    grid-template-columns: 1fr;
  }
  h2 {
    font-size: 24px;
  }
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
</style>
