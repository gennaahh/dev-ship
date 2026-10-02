import { ref } from 'vue'

// Quanti messaggi tiene la finestra della chat.
const KEEP = 100

// Chat di una stanza del game server (ChatRoom o PlazaRoom): storico all'ingresso, messaggi
// nuovi, invio e "sta scrivendo". getRoom restituisce la stanza attuale (o null).
// attach va chiamata in onJoin, refresh in onReconnect: ripesca lo storico, così i messaggi
// arrivati durante la caduta non si perdono.
export function createChat(getRoom, { onMessage } = {}) {
  const messages = ref([])
  let typing = false

  function merge(list, sessionId) {
    const byId = new Map(messages.value.map((m) => [m.id, m]))
    for (const m of list) byId.set(m.id, { ...m, mine: m.from === sessionId })
    messages.value = [...byId.values()].sort((a, b) => a.at - b.at).slice(-KEEP)
  }

  function attach(room) {
    messages.value = []
    typing = false
    room.onMessage('history', (list) => merge(list, room.sessionId))
    room.onMessage('chat', (m) => {
      merge([m], room.sessionId)
      onMessage?.(m)
    })
    room.send('history')
  }

  const refresh = (room) => room.send('history')

  function send(text) {
    const room = getRoom()
    const clean = text.trim()
    if (!room || !clean) return
    room.send('chat', { text: clean })
    typing = false
  }

  // Solo per le stanze che lo gestiscono (la piazza): si manda solo quando cambia.
  function setTyping(value) {
    if (value === typing) return
    typing = value
    getRoom()?.send('typing', { typing: value })
  }

  return { messages, attach, refresh, send, setTyping }
}
