import { effectScope, ref, shallowRef } from 'vue'
import { useInventory } from './useInventory.js'

// Gli scambi tra giocatori (apps/game/src/trade.ts): uno solo per tutta la pagina, come
// l'inventario. La stanza in cui si cammina (piazza o zona di pesca) ci si aggancia con
// attach() appena entrati; la finestra dello scambio, gli inviti e il menu del tasto destro
// stanno in App.vue e leggono da qui.
// menu: il menu del tasto destro aperto su un giocatore, { x, y, id, name }.
// invites: le richieste arrivate, { id, name, until }. trade: lo scambio in corso, come lo
// manda il server ({ stage, busy, readyIn, me, them }), o null. done: com'è finito l'ultimo,
// { with, gave, got }. notice: un avviso breve, { text, error }.
let store = null
export function useTrade() {
  store ??= effectScope(true).run(createStore)
  return store
}

const NOTICE_MS = 4000

function createStore() {
  const room = shallowRef(null)
  const menu = ref(null)
  const invites = ref([])
  const trade = ref(null)
  const done = ref(null)
  const notice = ref(null)
  const inventory = useInventory()
  let noticeTimer = 0

  function say(text, error = false) {
    notice.value = { text, error }
    clearTimeout(noticeTimer)
    noticeTimer = setTimeout(() => (notice.value = null), NOTICE_MS)
  }

  function attach(r) {
    room.value = r
    r.onMessage('tradeRequest', ({ id, name, expiresIn }) => {
      invites.value = [...invites.value, { id, name, until: Date.now() + expiresIn }]
    })
    r.onMessage('tradeRequestGone', ({ id }) => (invites.value = invites.value.filter((i) => i.id !== id)))
    r.onMessage('tradeNotice', ({ text }) => say(text))
    r.onMessage('tradeError', ({ text }) => say(text, true))
    r.onMessage('trade', (t) => {
      // Si apre lo scambio: le altre finestre del giocatore si chiudono.
      if (!trade.value) inventory.open.value = null
      trade.value = t
      done.value = null
    })
    r.onMessage('tradeEnded', ({ text }) => {
      trade.value = null
      if (text) say(text)
    })
    r.onMessage('tradeDone', (result) => {
      trade.value = null
      done.value = result
    })
    // Il proprio inventario è cambiato sul server: una cattura, una bottiglia, uno scambio.
    r.onMessage('inventory', () => inventory.refresh())
  }

  // Usciti dalla stanza lo scambio è finito (il server lo annulla).
  function detach() {
    room.value = null
    menu.value = null
    invites.value = []
    trade.value = null
  }

  // Persa la connessione il server ha annullato scambio e richieste: lo si dice al ritorno.
  function dropped() {
    if (trade.value) say('Connessione persa: lo scambio è stato annullato.', true)
    menu.value = null
    invites.value = []
    trade.value = null
  }

  const send = (type, payload) => room.value?.send(type, payload)

  return {
    room,
    menu,
    invites,
    trade,
    done,
    notice,
    attach,
    detach,
    dropped,
    // Tasto destro su un giocatore della stanza (p: { id, name, me }).
    openMenu(e, p) {
      if (!room.value || p.me) return
      e.preventDefault()
      menu.value = { x: e.clientX, y: e.clientY, id: p.id, name: p.name }
    },
    request(id) {
      menu.value = null
      send('tradeRequest', { to: id })
    },
    answer(id, accept) {
      invites.value = invites.value.filter((i) => i.id !== id)
      send('tradeAnswer', { id, accept })
    },
    offer: (offer) => send('tradeOffer', offer),
    ready: (ready) => send('tradeReady', { ready }),
    confirm: () => send('tradeConfirm'),
    cancel() {
      send('tradeCancel')
      trade.value = null
    },
  }
}
