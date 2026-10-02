<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { colorFor } from '../city/avatar.js'

// Finestrina della chat: in città nell'angolo in alto a sinistra, dentro i luoghi in basso
// a sinistra (lì in alto c'è il pulsante per tornare in città). Si inizia a
// scrivere cliccandoci o premendo Invio; Invio manda, Esc smette di scrivere.
// Non sa da quale stanza arrivano i messaggi: glieli passa chi la usa (AreaChat, la piazza).
const props = defineProps({
  title: { type: String, required: true },
  // Lo status di useGameRoom.
  status: { type: String, required: true },
  messages: { type: Array, required: true },
  // In quale angolo a sinistra: 'top' o 'bottom'.
  corner: { type: String, default: 'bottom' },
  // Ripiegata per far posto a qualcos'altro (il cartellone zoomato): poi torna com'era.
  fold: { type: Boolean, default: false },
})
const emit = defineEmits(['send', 'typing'])

const MAX_LENGTH = 140 // come il game server

const online = computed(() => props.status === 'online')
const placeholder = computed(() => {
  if (props.status === 'login') return 'Accedi per chattare'
  if (props.status === 'connecting') return 'Connessione alla chat…'
  if (props.status === 'reconnecting') return 'Connessione persa, riprovo…'
  if (props.status === 'offline') return 'Chat non raggiungibile, riprovo…'
  return focused.value ? 'Scrivi un messaggio…' : 'Premi Invio per scrivere'
})

// Aperta o ripiegata sulla sola riga per scrivere: si ricorda per la prossima visita.
// Sugli schermi piccoli parte ripiegata, per non coprire la scena.
const FOLD_KEY = 'dev-city:chat-open'
const open = ref(readOpen())
function readOpen() {
  try {
    const saved = localStorage.getItem(FOLD_KEY)
    if (saved) return saved === '1'
  } catch {}
  return !matchMedia('(max-width: 720px)').matches
}
// Le ripiegature automatiche (prop fold) non si ricordano: si ricorda solo il pulsante.
let auto = false
watch(open, (v) => {
  if (auto) return
  try {
    localStorage.setItem(FOLD_KEY, v ? '1' : '0')
  } catch {}
})
let openBefore = open.value
watch(
  () => props.fold,
  async (fold) => {
    auto = true
    if (fold) {
      openBefore = open.value
      open.value = false
    } else {
      open.value = openBefore
    }
    await nextTick()
    auto = false
  },
)

const input = ref(null)
const log = ref(null)
const draft = ref('')
const focused = ref(false)

function startTyping() {
  if (!online.value) return
  input.value?.focus()
}
function submit() {
  if (!draft.value.trim()) return
  emit('send', draft.value)
  draft.value = ''
}
function stopTyping(e) {
  e.preventDefault() // l'Esc non fa anche uscire dal luogo
  input.value?.blur()
}

// "Sta scrivendo": c'è del testo e l'input ha il focus.
const typing = computed(() => focused.value && draft.value.trim().length > 0)
watch(typing, (v) => emit('typing', v))

// Si resta in fondo alla conversazione, a meno che non si stia rileggendo più su.
watch(
  () => props.messages.length,
  async () => {
    const el = log.value
    const atBottom = !el || el.scrollHeight - el.scrollTop - el.clientHeight < 40
    await nextTick()
    if (atBottom && log.value) log.value.scrollTop = log.value.scrollHeight
  },
)
watch(open, async (v) => {
  await nextTick()
  if (v && log.value) log.value.scrollTop = log.value.scrollHeight
})

// Invio da qualsiasi punto della pagina, tranne quando serve ad altro: un campo, un pulsante
// col focus o una finestra aperta (login, shop).
const BUSY = 'input, textarea, select, button, a, [role="button"], [contenteditable], dialog'
function onKey(e) {
  if (e.key !== 'Enter' || e.defaultPrevented || e.isComposing || e.repeat) return
  if (e.target.closest?.(BUSY) || document.querySelector('dialog[open]')) return
  if (!online.value) return
  e.preventDefault()
  startTyping()
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))

const time = (at) => new Date(at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
</script>

<template>
  <Teleport to="body">
    <section class="chat" :class="[corner, { folded: !open, focused }]" :aria-label="title" @click="startTyping">
      <header>
        <h2>{{ title }}</h2>
        <button
          class="fold"
          :aria-expanded="open"
          :aria-label="open ? 'Ripiega la chat' : 'Apri la chat'"
          @click.stop="open = !open"
        >
          {{ open ? '−' : '+' }}
        </button>
      </header>
      <ol v-if="open" ref="log" class="log" aria-live="polite">
        <li v-for="m in messages" :key="m.id" :class="{ mine: m.mine }" :title="time(m.at)">
          <span class="dot" :style="{ background: colorFor(m.name) }" />
          <b>{{ m.name }}</b>
          <span class="text">{{ m.text }}</span>
        </li>
        <li v-if="!messages.length" class="empty">
          {{ online ? 'Ancora nessun messaggio: rompi il ghiaccio!' : 'I messaggi compariranno qui.' }}
        </li>
      </ol>
      <form @submit.prevent="submit">
        <input
          ref="input"
          v-model="draft"
          :maxlength="MAX_LENGTH"
          :disabled="!online"
          :placeholder="placeholder"
          enterkeyhint="send"
          autocomplete="off"
          aria-label="Messaggio"
          @focus="focused = true"
          @blur="focused = false"
          @keydown.esc="stopTyping"
        />
        <button type="submit" class="send" :disabled="!online || !draft.trim()" aria-label="Invia" @click.stop>➤</button>
      </form>
    </section>
  </Teleport>
</template>

<style scoped>
.chat {
  position: fixed;
  left: 16px;
  bottom: 16px;
  /* Come l'account e le spie: sopra la città e sopra gli interni (z-index 100). */
  z-index: 150;
  display: flex;
  flex-direction: column;
  width: min(340px, calc(100vw - 32px));
  box-sizing: border-box;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: color-mix(in srgb, #fff8e6 92%, transparent);
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  cursor: text;
}
.chat.top {
  top: 16px;
  bottom: auto;
  /* Lascia posto al pulsante dello schermo intero, in alto a destra. */
  width: min(340px, calc(100vw - 94px));
}
.chat.focused {
  background: #fff8e6;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 6px 4px 12px;
  border-bottom: 3px solid #2d2a4a;
  border-radius: 10px 10px 0 0;
  background: #ffd54a;
}
h2 {
  margin: 0;
  font-size: 16px;
  font-weight: normal;
}
.fold {
  width: 26px;
  height: 26px;
  padding: 0 0 2px;
  border: 3px solid #2d2a4a;
  border-radius: 8px;
  background: #fff8e6;
  color: #2d2a4a;
  font: inherit;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.log {
  height: 168px;
  margin: 0;
  padding: 8px 12px 4px;
  overflow-y: auto;
  list-style: none;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.log li + li {
  margin-top: 4px;
}
.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 5px;
  border: 2px solid #2d2a4a;
  border-radius: 50%;
  vertical-align: -1px;
}
b {
  margin-right: 4px;
}
b::after {
  content: ':';
}
.mine b {
  color: #6b4bd8;
}
.empty {
  color: #8a84a8;
  font-style: italic;
}
form {
  display: flex;
  gap: 6px;
  padding: 6px;
}
.folded form {
  padding-top: 6px;
}
input {
  flex: 1;
  min-width: 0;
  padding: 6px 10px 7px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff;
  color: #2d2a4a;
  font: 14px system-ui, -apple-system, 'Segoe UI', sans-serif;
  outline: none;
}
input:focus {
  border-color: #6b4bd8;
}
input:disabled {
  background: #eee8d8;
  cursor: default;
}
.send {
  width: 38px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #ffd54a;
  color: #2d2a4a;
  font-size: 15px;
  cursor: pointer;
}
.send:disabled {
  opacity: 0.5;
  cursor: default;
}
/* Sui telefoni l'account e le spie stanno sotto, a tutta larghezza (vedi .hud in App.vue). */
@media (max-width: 720px) {
  .chat.bottom {
    bottom: 72px;
  }
}
</style>
