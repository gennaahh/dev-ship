import { Client } from '@colyseus/sdk'
import { computed, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { authClient, getRoomToken } from '../auth.js'
import { GAME_URL } from '../config.js'

// Ogni quanto riprovare a entrare se il game server non risponde.
const RETRY_MS = 5_000

// Entra in una stanza del game server finché il componente è montato, solo da loggati
// (con il token emesso dall'API), e ci rientra dopo login, logout o cadute del server.
// status: 'connecting', 'login' (serve il login), 'online', 'reconnecting' (connessione persa,
// il server tiene il posto) oppure 'offline' (game server o API irraggiungibili: si riprova
// finché non tornano su).
// onJoin(room) si chiama appena entrati, prima di qualsiasi messaggio: è il posto per
// registrare gli onMessage. onReconnect(room) dopo una caduta recuperata, onLeave() all'uscita.
export function useGameRoom(name, options = {}, hooks = {}) {
  const status = ref('connecting')
  const room = shallowRef(null)

  const session = authClient.useSession()
  const userId = computed(() => (session.value.isPending ? undefined : (session.value.data?.user?.id ?? null)))

  // Se vogliamo stare nella stanza: da loggati, finché il componente è montato.
  let wanted = false
  let joining = false
  let retry = 0

  // Chiudere o ricaricare la pagina è un'uscita voluta: senza leave() il server la prende
  // per una caduta e tiene il posto (e il personaggio fermo) per i secondi della riconnessione.
  const onPageHide = () => room.value?.leave()

  async function connect() {
    clearTimeout(retry)
    if (!wanted || room.value || joining) return
    joining = true
    let joined
    try {
      const token = await getRoomToken()
      if (!token) {
        status.value = 'login'
        return
      }
      const client = new Client(GAME_URL)
      client.auth.token = token
      joined = await client.joinOrCreate(name, options)
    } catch {
      status.value = 'offline'
      retry = setTimeout(connect, RETRY_MS)
      return
    } finally {
      joining = false
    }
    // Nel frattempo si è usciti dal luogo o dall'account.
    if (!wanted) return joined.leave()

    room.value = joined
    status.value = 'online'
    joined.onDrop(() => (status.value = 'reconnecting'))
    joined.onReconnect(() => {
      status.value = 'online'
      hooks.onReconnect?.(joined)
    })
    // Fuori dalla stanza (server spento, riconnessione fallita): si torna a riprovare.
    joined.onLeave(() => {
      if (room.value !== joined) return // già lasciata da disconnect()
      room.value = null
      hooks.onLeave?.()
      if (!wanted) return
      status.value = 'offline'
      retry = setTimeout(connect, RETRY_MS)
    })
    hooks.onJoin?.(joined)
  }

  // La stanza si lascia subito, senza aspettare la conferma del server: cambiando account
  // si può già entrare con quello nuovo.
  function disconnect() {
    wanted = false
    clearTimeout(retry)
    const left = room.value
    if (!left) return
    room.value = null
    hooks.onLeave?.()
    left.leave()
  }

  // Login e logout (anche da un'altra parte della pagina) fanno entrare e uscire dalla stanza.
  watch(userId, (id, prev) => {
    if (id === undefined) return // sessione ancora in caricamento
    if (prev) disconnect() // cambio di account o logout
    if (id) {
      wanted = true
      status.value = 'connecting'
      connect()
    } else {
      status.value = 'login'
    }
  })

  onMounted(() => {
    addEventListener('pagehide', onPageHide)
    if (userId.value !== undefined) {
      wanted = Boolean(userId.value)
      status.value = wanted ? 'connecting' : 'login'
      connect()
    }
  })

  onUnmounted(() => {
    disconnect()
    removeEventListener('pagehide', onPageHide)
  })

  return { status, room }
}
