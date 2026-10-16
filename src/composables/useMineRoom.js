import { ref } from 'vue'
import { clampToCave } from '../city/mine/cave.js'
import { useWalkingRoom } from './useWalkingRoom.js'

// La miniera multigiocatore: si cammina e si chiacchiera come in piazza (useWalkingRoom), e in
// più ci sono i filoni occupati, con chi ci scava e com'è messo (digging, found).
// onFind({ spot, name, item, big, mine }) a ogni scoperta (minerale o gemma), onSpotTaken() quando
// si arriva a un filone che nel frattempo ha preso qualcun altro.
export function useMineRoom({ onFind, onSpotTaken } = {}) {
  // Una voce per filone occupato: { spot, id (sessionId), name, phase, since, stones, finds, found, me }.
  const spots = ref([])

  const walk = useWalkingRoom('mine', {
    clamp: (x, y) => clampToCave({ x, y }),
    onJoin(r) {
      r.onStateChange((state) => {
        const list = []
        state.spots?.forEach((s, key) => {
          list.push({ spot: Number(key), id: s.sessionId, name: s.name, phase: s.phase, since: s.since, stones: s.stones, finds: s.finds, found: s.found, tool: s.tool, me: s.sessionId === r.sessionId })
        })
        spots.value = list
      })
      r.onMessage('find', (f) => onFind?.({ ...f, mine: f.from === r.sessionId }))
      r.onMessage('spotTaken', () => onSpotTaken?.())
    },
    onLeave: () => (spots.value = []),
  })

  // Si cammina fino al filone e si comincia a scavare all'arrivo, se è ancora libero.
  const dig = (spot) => walk.room.value?.send('dig', { spot })
  // Smettendo si fa un passo indietro.
  const stand = () => walk.room.value?.send('stand')

  return { status: walk.status, players: walk.players, moveTo: walk.moveTo, chat: walk.chat, spots, dig, stand }
}
