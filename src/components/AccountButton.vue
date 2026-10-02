<script setup>
import { computed, nextTick, ref } from 'vue'
import { authClient, displayName } from '../auth.js'

// In basso a sinistra, sopra le spie: "Accedi" apre la finestra del login con codice via
// email; da loggati mostra il nome e "Esci".
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)

const dialog = ref(null)
const step = ref('email') // 'email' → 'code'
const email = ref('')
const code = ref('')
const busy = ref(false)
const error = ref('')
const codeInput = ref(null)

// In sviluppo le email finiscono in Mailpit, sulla stessa macchina dell'API.
const mailpitUrl = import.meta.env.DEV ? `http://${location.hostname || 'localhost'}:8025` : null

const ERRORS = {
  INVALID_OTP: 'Codice sbagliato, riprova.',
  OTP_EXPIRED: 'Il codice è scaduto: chiedine uno nuovo.',
  TOO_MANY_ATTEMPTS: 'Troppi tentativi con questo codice: chiedine uno nuovo.',
}
function explain(e) {
  if (e?.status === 429) return 'Troppe richieste: aspetta un minuto e riprova.'
  return ERRORS[e?.code] ?? (e?.status ? 'Qualcosa è andato storto, riprova.' : 'L\'API non risponde: è accesa?')
}

function open() {
  step.value = 'email'
  code.value = ''
  error.value = ''
  dialog.value.showModal()
}
function close() {
  dialog.value.close()
}
// Esc chiude la finestra e basta: preventDefault dice a città e interni di non usarlo.
function onKeydown(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  close()
}

async function run(action) {
  busy.value = true
  error.value = ''
  try {
    const res = await action()
    if (res?.error) throw res.error
    return true
  } catch (e) {
    error.value = explain(e)
    return false
  } finally {
    busy.value = false
  }
}

async function sendCode() {
  const ok = await run(() => authClient.emailOtp.sendVerificationOtp({ email: email.value.trim(), type: 'sign-in' }))
  if (!ok) return
  step.value = 'code'
  code.value = ''
  await nextTick()
  codeInput.value?.focus()
}

async function signIn() {
  const ok = await run(() => authClient.signIn.emailOtp({ email: email.value.trim(), otp: code.value.trim() }))
  if (ok) close()
}

const signOut = () => authClient.signOut()
</script>

<template>
  <div class="account">
    <template v-if="user">
      <span class="who">👤 {{ displayName(user) }}</span>
      <button class="link" @click="signOut">Esci</button>
    </template>
    <button v-else class="login" :disabled="session.isPending" @click="open">Accedi</button>
  </div>

  <dialog ref="dialog" class="login-dialog" @keydown="onKeydown" @click.self="close">
    <form v-if="step === 'email'" @submit.prevent="sendCode">
      <h2>Entra in Dev City</h2>
      <p>Scrivi la tua email: ti mandiamo un codice di 6 cifre. Niente password.</p>
      <input
        v-model="email"
        type="email"
        required
        autocomplete="email"
        placeholder="nome@esempio.it"
        aria-label="Email"
        autofocus
      />
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="actions">
        <button type="button" class="link" @click="close">Annulla</button>
        <button type="submit" class="primary" :disabled="busy">Mandami il codice</button>
      </div>
    </form>

    <form v-else @submit.prevent="signIn">
      <h2>Controlla la posta</h2>
      <p>Abbiamo mandato un codice a <strong>{{ email }}</strong>. Vale 10 minuti.</p>
      <p v-if="mailpitUrl" class="hint">
        In sviluppo le email arrivano su <a :href="mailpitUrl" target="_blank" rel="noopener">Mailpit</a>.
      </p>
      <input
        ref="codeInput"
        v-model="code"
        required
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]{6}"
        maxlength="6"
        placeholder="000000"
        aria-label="Codice"
        class="code"
      />
      <p v-if="error" class="error" role="alert">{{ error }}</p>
      <div class="actions">
        <button type="button" class="link" @click="step = 'email'">Cambia email</button>
        <button type="button" class="link" :disabled="busy" @click="sendCode">Nuovo codice</button>
        <button type="submit" class="primary" :disabled="busy">Entra</button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
/* La posizione la decide App.vue, che la mette di fianco allo stato dei servizi. */
.account {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px 8px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #fff8e6;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 15px;
}
.account:has(.login) {
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
}
button {
  font: inherit;
  cursor: pointer;
}
button:disabled {
  cursor: default;
  opacity: 0.6;
}
.login,
.primary {
  padding: 8px 16px 10px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
}
.login:active,
.primary:active {
  translate: 0 2px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.link {
  padding: 0;
  border: 0;
  background: none;
  color: #6b4bd8;
  text-decoration: underline;
}

.login-dialog {
  width: min(420px, calc(100% - 32px));
  box-sizing: border-box;
  padding: 22px 24px 20px;
  border: 5px solid #2d2a4a;
  border-radius: 18px;
  background: #fff8e6;
  box-shadow: 0 6px 0 #2d2a4a;
  color: #2d2a4a;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.login-dialog::backdrop {
  background: rgba(45, 42, 74, 0.55);
}
h2 {
  margin: 0 0 6px;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 28px;
  font-weight: normal;
}
p {
  margin: 0 0 12px;
  line-height: 1.4;
}
.hint {
  font-size: 14px;
  opacity: 0.8;
}
input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 3px solid #2d2a4a;
  border-radius: 10px;
  background: #fff;
  color: #2d2a4a;
  font: inherit;
  font-size: 17px;
}
input:focus-visible {
  outline: 3px solid #ffd54a;
  outline-offset: 1px;
}
.code {
  font-family: ui-monospace, monospace;
  font-size: 26px;
  letter-spacing: 8px;
  text-align: center;
}
.error {
  margin: 10px 0 0;
  color: #c0262d;
  font-weight: 600;
}
.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 16px;
}
.actions .primary {
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  font-size: 17px;
}
</style>
