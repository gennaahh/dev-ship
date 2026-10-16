import { computed, effectScope, ref, watch } from 'vue'
import { DUNGEON_TICKET, FISH, FISH_SOUP, MATERIALS } from '@dev-city/shared/catalog'
import { authClient } from '../auth.js'
import { API_URL, BACKEND_ENABLED } from '../config.js'
import { speciesFor } from '../city/fishing/lake.js'

// Inventario, monete d'oro ed equipaggiamento del giocatore, dall'API. È uno solo per tutta
// la pagina (la finestra dell'inventario, lo shop, il proprio personaggio nei luoghi):
// si ricarica da solo al login e si svuota al logout. Senza backend resta vuoto.
// ready: c'è un inventario (loggati e caricato). open: la finestra aperta, 'bag' (l'inventario,
// tasto I), 'character' (personaggio ed equipaggiamento, tasto C), 'craft' (il crafting, tasto R)
// o null.
let store = null
export function useInventory() {
  store ??= effectScope(true).run(createStore)
  return store
}

const NO_EQUIPMENT = { hat: null, color: null }

function createStore() {
  const data = ref(null)
  const error = ref('')
  const busy = ref(false)
  const open = ref(null)
  const session = BACKEND_ENABLED ? authClient.useSession() : ref({ data: null })
  const userId = computed(() => session.value?.data?.user?.id ?? null)

  // Ogni risposta è l'inventario intero, già aggiornato. Una risposta arrivata dopo un cambio
  // di account si butta.
  async function call(path, body) {
    const forUser = userId.value
    const res = await fetch(`${API_URL}/api/${path}`, {
      credentials: 'include',
      ...(body && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(json.error ?? 'L\'API non risponde.')
    if (userId.value === forUser) data.value = json
  }

  // Una run nel dungeon: l'API la gioca tutta e restituisce la run da guardare e l'inventario
  // già aggiornato. L'inventario si tiene da parte, da mettere con apply() a fine run: monete e
  // materiali non si vedono prima di averli visti cadere. null se va male (l'errore è in error).
  async function runDungeon() {
    if (busy.value) return null
    busy.value = true
    error.value = ''
    const forUser = userId.value
    try {
      const res = await fetch(`${API_URL}/api/dungeon/run`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: '{}' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json.error ?? 'L\'API non risponde.')
      return { run: json.run, apply: () => userId.value === forUser && (data.value = json.inventory) }
    } catch (e) {
      error.value = e instanceof TypeError ? 'L\'API non risponde: è accesa?' : e.message
      return null
    } finally {
      busy.value = false
    }
  }

  async function refresh() {
    if (!userId.value) return
    try {
      await call('inventory')
    } catch {
      // Resta quello di prima: si riprova alla prossima occasione (apertura, cattura).
    }
  }

  // Vendite, acquisti, ricette e cambi di look: uno alla volta, con l'errore da mostrare se va male.
  async function act(path, body) {
    if (busy.value) return false
    busy.value = true
    error.value = ''
    try {
      await call(path, body)
      return true
    } catch (e) {
      error.value = e instanceof TypeError ? 'L\'API non risponde: è accesa?' : e.message
      return false
    } finally {
      busy.value = false
    }
  }

  watch(
    userId,
    (id) => {
      data.value = null
      error.value = ''
      if (!id) open.value = null
      refresh()
    },
    { immediate: true },
  )
  watch(open, (v) => {
    error.value = ''
    if (v) refresh()
  })

  const items = computed(() => data.value?.items ?? [])
  // I pesci, dal più recente, con la specie che si vede al lago.
  const fish = computed(() => items.value.filter((i) => i.itemId === FISH).map((f) => ({ ...f, species: speciesFor(f.weightKg) })))
  const owned = computed(() => new Set(items.value.map((i) => i.itemId)))
  // Zuppe, ticket e materiali sono una riga ciascuno, con la quantità.
  const count = (itemId) => items.value.find((i) => i.itemId === itemId)?.quantity ?? 0
  const soups = computed(() => count(FISH_SOUP))
  const tickets = computed(() => count(DUNGEON_TICKET))
  // Tutti i materiali, nell'ordine del catalogo, anche quelli a zero.
  const materials = computed(() => MATERIALS.map((m) => ({ ...m, quantity: count(m.id) })))

  return {
    ready: computed(() => data.value !== null),
    gold: computed(() => data.value?.gold ?? 0),
    equipment: computed(() => data.value?.equipment ?? NO_EQUIPMENT),
    fish,
    soups,
    tickets,
    materials,
    // Cappelli e colori: si hanno se comprati, o se sono gratis.
    owns: (item) => item.price === 0 || owned.value.has(item.id),
    busy,
    error,
    open,
    refresh,
    sell: (ids) => act('inventory/sell', { ids }),
    buy: (itemId) => act('shop/buy', { itemId }),
    equip: (slot, itemId) => act('inventory/equip', { slot, itemId }),
    craft: (recipeId) => act('inventory/craft', { recipeId }),
    runDungeon,
  }
}
