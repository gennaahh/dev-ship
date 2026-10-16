import { computed, effectScope, ref, watch } from 'vue'
import { FISH } from '@dev-city/shared/catalog'
import { BOARD, generateMission } from '@dev-city/shared/office'
import { authClient } from '../auth.js'
import { API_URL, BACKEND_ENABLED } from '../config.js'
import { useInventory } from './useInventory.js'

// Le missioni dell'ufficio (regole in packages/shared/src/office.ts). Uno solo per tutta la pagina,
// come l'inventario: la bacheca dell'ufficio e la finestra della missione (tasto M) guardano gli
// stessi dati. board: la bacheca ({ open, doing, done }), di tutti; mission: la propria in corso
// (o null) e cooldownUntil fino a quando, dopo averne annullata una, non se ne può prendere
// un'altra. Senza backend la bacheca è inventata qui e non si prende niente.
let store = null
export function useOffice() {
  store ??= effectScope(true).run(createStore)
  return store
}

const demoBoard = () => ({
  open: BOARD.map((difficulty, slot) => ({ id: slot + 1, slot, ...generateMission(difficulty) })),
  doing: [{ name: 'Nostromo Deploy', title: 'Nuovo rack dei server', difficulty: 'medium' }],
  done: [
    { name: 'Vedetta Debug', title: 'Grigliata di fine sprint', difficulty: 'easy', reward: { gold: 20, items: {} } },
    { name: 'Marinaio Commit', title: 'Postmortem dell\'incidente', difficulty: 'hard', reward: { gold: 90, items: { dungeon_ticket: 1 } } },
  ],
})

function createStore() {
  const inventory = useInventory()
  const board = ref(BACKEND_ENABLED ? null : demoBoard())
  const boardFailed = ref(false)
  const mission = ref(null)
  const cooldownUntil = ref(null)
  const busy = ref(false)
  const error = ref('')
  const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
  const userId = computed(() => session.value?.data?.user?.id ?? null)

  async function call(path, body) {
    const res = await fetch(`${API_URL}/api/office/${path}`, {
      credentials: 'include',
      ...(body && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error ?? 'L\'API non risponde.')
    return json
  }
  // La propria situazione (e la bacheca, se c'è), se è ancora dello stesso giocatore.
  function apply(json, forUser) {
    if (json.board) board.value = json.board
    if (userId.value !== forUser) return
    mission.value = json.mission
    cooldownUntil.value = json.cooldownUntil
  }

  async function loadBoard() {
    if (!BACKEND_ENABLED) return
    try {
      board.value = await call('board')
      boardFailed.value = false
    } catch {
      boardFailed.value = true
    }
  }
  async function loadMission() {
    const forUser = userId.value
    if (!forUser) return
    try {
      apply(await call('mission'), forUser)
    } catch {
      // Resta quella di prima: si riprova alla prossima occasione.
    }
  }

  // Prendere, annullare e completare: una cosa alla volta, con l'errore da mostrare se va male.
  // Se va male (l'ha presa qualcun altro, mancano oggetti) si ricarica tutto, per vedere com'è ora.
  async function act(path, body = {}) {
    if (busy.value) return false
    busy.value = true
    error.value = ''
    const forUser = userId.value
    try {
      apply(await call(`mission/${path}`, body), forUser)
      if (path === 'complete') await inventory.refresh()
      return true
    } catch (e) {
      error.value = e instanceof TypeError ? 'L\'API non risponde: è accesa?' : e.message
      loadBoard()
      loadMission()
      return false
    } finally {
      busy.value = false
    }
  }

  watch(
    userId,
    () => {
      mission.value = null
      cooldownUntil.value = null
      error.value = ''
      loadMission()
    },
    { immediate: true },
  )
  watch(inventory.open, (v) => {
    error.value = ''
    if (v === 'mission') loadMission()
  })

  // Quanti se ne hanno di quello che chiede una missione: per 'fish' i pesci, qualsiasi.
  const have = (id) => (id === FISH ? inventory.fish.value.length : inventory.count(id))
  const needsOf = (m) => Object.entries(m.needs).map(([id, need]) => ({ id, need, have: have(id) }))
  const ready = computed(() => !!mission.value && needsOf(mission.value).every((n) => n.have >= n.need))

  return {
    board,
    boardFailed,
    mission,
    cooldownUntil,
    busy,
    error,
    loadBoard,
    loadMission,
    needsOf,
    // La missione in corso si può consegnare: c'è tutto nell'inventario.
    ready,
    take: (id) => act('take', { id }),
    cancel: () => act('cancel'),
    complete: () => act('complete'),
  }
}
