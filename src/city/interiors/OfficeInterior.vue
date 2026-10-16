<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { BOARD, CANCEL_COOLDOWN_MS, DIFFICULTY_NAMES } from '@dev-city/shared/office'
import { authClient } from '../../auth.js'
import { useInventory } from '../../composables/useInventory.js'
import { useOffice } from '../../composables/useOffice.js'
import { BACKEND_ENABLED } from '../../config.js'
import MissionItems from '../office/MissionItems.vue'
import MissionReward from '../office/MissionReward.vue'
import { minutesLeft, NOTE_COLORS } from '../office/office.js'
import InteriorLayout from './InteriorLayout.vue'

defineProps({ place: { type: Object, required: true } })
defineEmits(['leave'])

const plans = [
  `Sulla bacheca ci sono sempre ${BOARD.length} missioni: appena qualcuno ne prende una, ne esce un'altra.`,
  'Ognuna chiede pesci, zuppe, minerali o materiali del dungeon, e il premio è scritto sul foglietto: rende più che vendere.',
  'Una missione alla volta: si consegna dalla finestra della missione (tasto M), quando nell\'inventario c\'è tutto.',
  `Si può annullare, ma poi per ${CANCEL_COOLDOWN_MS / 60_000} minuti non se ne prendono altre.`,
  'Le difficili, una volta su due, danno anche un ticket del dungeon.',
]

const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
const user = computed(() => session.value.data?.user ?? null)
const inventory = useInventory()
const office = useOffice()
const { board, boardFailed, mission, busy, error } = office

// Mentre si è in ufficio la bacheca si ricarica da sola: le missioni prese dagli altri spariscono
// e al loro posto ne escono di nuove. now fa scorrere l'attesa dopo un annullamento.
const REFRESH_MS = 10_000
const now = ref(Date.now())
let refresh = 0
let tick = 0
onMounted(() => {
  office.loadBoard()
  office.loadMission()
  refresh = setInterval(office.loadBoard, REFRESH_MS)
  tick = setInterval(() => (now.value = Date.now()), 15_000)
})
onUnmounted(() => {
  clearInterval(refresh)
  clearInterval(tick)
})

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
  <InteriorLayout :place="place" :plans="plans" tint="#2f4d85" @leave="$emit('leave')">
    <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="1600" height="900" fill="#dfe8f5" />
      <rect y="620" width="1600" height="280" fill="#b0bfd6" />
      <g stroke="#2d2a4a" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">
        <path d="M -10 620 L 1610 620" fill="none" />
        <!-- Finestra sulla città -->
        <rect x="1060" y="120" width="420" height="300" rx="10" fill="#8ecdf0" />
        <path d="M 1060 340 Q 1160 300 1270 340 T 1480 330 L 1480 420 L 1060 420 Z" fill="#74c264" stroke-width="5" />
        <path d="M 1270 120 L 1270 420 M 1060 270 L 1480 270" fill="none" stroke-width="10" />
        <!-- Orologio -->
        <circle cx="900" cy="170" r="60" fill="#fff8e6" />
        <path d="M 900 170 L 900 128" fill="none" class="hand" />
        <path d="M 900 170 L 930 170" fill="none" />
        <!-- Scrivanie -->
        <g v-for="x in [180, 640]" :key="x">
          <rect :x="x" y="580" width="360" height="30" rx="6" fill="#c07d45" />
          <rect :x="x + 20" y="610" width="20" height="160" fill="#a0673a" />
          <rect :x="x + 320" y="610" width="20" height="160" fill="#a0673a" />
          <rect :x="x + 100" y="430" width="180" height="120" rx="10" fill="#4b4870" />
          <rect :x="x + 112" y="442" width="156" height="96" rx="4" fill="#2d3a5c" />
          <path :d="`M ${x + 126} 466 h 60 M ${x + 126} 488 h 90 M ${x + 140} 510 h 50`" fill="none" stroke="#7dff8a" stroke-width="5" class="code" />
          <rect :x="x + 170" y="550" width="40" height="30" fill="#4b4870" />
        </g>
        <!-- Macchinetta del caffè -->
        <rect x="1180" y="440" width="140" height="300" rx="12" fill="#ff7a59" />
        <rect x="1200" y="470" width="100" height="70" rx="6" fill="#2d2a4a" />
        <text x="1250" y="515" text-anchor="middle" class="cup" fill="#ffd54a" stroke="none">☕</text>
        <rect x="1215" y="600" width="70" height="80" rx="6" fill="#2d2a4a" />
        <path d="M 1236 660 L 1238 640 L 1262 640 L 1264 660 Z" fill="#fff8e6" stroke-width="4" />
        <!-- Pianta -->
        <path d="M 1440 780 L 1450 700 L 1530 700 L 1540 780 Z" fill="#c07d45" />
        <circle cx="1470" cy="660" r="44" fill="#4fae55" />
        <circle cx="1520" cy="640" r="36" fill="#4fae55" />
      </g>
    </svg>

    <!-- La bacheca: i foglietti da fare, chi ci sta lavorando e le ultime consegnate. -->
    <section class="board" aria-labelledby="board-title">
      <header>
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
              <span>{{ d.title }} · 🪙 {{ d.reward.gold }}</span>
            </li>
          </ul>
          <p v-else class="empty">Ancora nessuna</p>
        </div>
      </div>
    </section>
  </InteriorLayout>
</template>

<style scoped>
.cup {
  font: 28px 'Lilita One', 'Baloo 2', system-ui, sans-serif;
}
.hand {
  transform-origin: 900px 170px;
  animation: tick 60s steps(60) infinite;
}
@keyframes tick {
  to { transform: rotate(360deg); }
}
.code {
  stroke-dasharray: 100;
  animation: type 2.5s steps(10) infinite;
}
@keyframes type {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

/* La bacheca: sughero in una cornice di legno, al centro sotto al pulsante per tornare. */
.board {
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
</style>
