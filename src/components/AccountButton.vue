<script setup>
import { computed, ref } from 'vue'
import { authClient, displayName } from '../auth.js'

// In basso a sinistra, sopra le spie: "Accedi con GitHub" manda a GitHub e torna qui;
// da loggati mostra il nome e "Esci".
const session = authClient.useSession()
const user = computed(() => session.value.data?.user ?? null)

const busy = ref(false)
const error = ref('')

async function signIn() {
  busy.value = true
  error.value = ''
  try {
    const res = await authClient.signIn.social({ provider: 'github', callbackURL: location.href })
    if (res?.error) throw res.error
  } catch (e) {
    error.value = e?.status ? 'Qualcosa è andato storto, riprova.' : 'L\'API non risponde: è accesa?'
    busy.value = false
  }
}

const signOut = () => authClient.signOut()
</script>

<template>
  <div class="account">
    <template v-if="user">
      <span class="who">👤 {{ displayName(user) }}</span>
      <button class="link" @click="signOut">Esci</button>
    </template>
    <template v-else>
      <button class="login" :disabled="session.isPending || busy" @click="signIn">Accedi con GitHub</button>
      <span v-if="error" class="error" role="alert">{{ error }}</span>
    </template>
  </div>
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
.login {
  padding: 8px 16px 10px;
  border: 3px solid #2d2a4a;
  border-radius: 12px;
  background: #ffd54a;
  box-shadow: 0 3px 0 #2d2a4a;
  color: #2d2a4a;
}
.login:active {
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
.error {
  color: #c0262d;
  font-size: 14px;
  font-weight: 600;
}
</style>
