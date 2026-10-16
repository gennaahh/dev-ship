import { ref } from 'vue'
import { clampToLakeside } from '../city/fishing/lake.js'
import { useWalkingRoom } from './useWalkingRoom.js'

// La zona di pesca multigiocatore: si cammina e si chiacchiera come in piazza (useWalkingRoom),
// e in più ci sono le sedie occupate attorno al lago, con la fase di ognuno (waiting, bite,
// caught, escaped). onCatch({ seat, name, weight, points, big, bottle, mine }) a ogni cattura,
// onSeatTaken() quando si arriva a una sedia che nel frattempo ha preso qualcun altro.
export function useFishingRoom({ onCatch, onSeatTaken } = {}) {
  // Una voce per sedia occupata: { seat, id (sessionId), name, phase, since, weight, bottle, me }.
  const seats = ref([])

  const walk = useWalkingRoom('fishing', {
    clamp: (x, y) => clampToLakeside({ x, y }),
    onJoin(r) {
      r.onStateChange((state) => {
        const list = []
        state.seats?.forEach((s, key) => {
          list.push({ seat: Number(key), id: s.sessionId, name: s.name, phase: s.phase, since: s.since, weight: s.weight, bottle: s.bottle, me: s.sessionId === r.sessionId })
        })
        seats.value = list
      })
      r.onMessage('catch', (c) => onCatch?.({ ...c, mine: c.from === r.sessionId }))
      r.onMessage('seatTaken', () => onSeatTaken?.())
    },
    onLeave: () => (seats.value = []),
  })

  // Si cammina fino alla sedia e ci si siede all'arrivo, se è ancora libera.
  const sit = (seat) => walk.room.value?.send('sit', { seat })
  // Alzandosi si fa un passo indietro.
  const stand = () => walk.room.value?.send('stand')

  return { status: walk.status, players: walk.players, moveTo: walk.moveTo, chat: walk.chat, seats, sit, stand }
}
