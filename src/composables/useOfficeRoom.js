import { ref } from 'vue'
import { clampToOffice } from '@dev-city/shared/office-floor'
import { useWalkingRoom } from './useWalkingRoom.js'

// L'ufficio multigiocatore: si cammina e si chiacchiera come in piazza (useWalkingRoom), e in più
// ci sono i posti occupati al tavolo, con chi ci è seduto e il caffè che ha davanti.
// onSeatTaken() quando si arriva a un posto che nel frattempo ha preso qualcun altro.
export function useOfficeRoom({ onSeatTaken } = {}) {
  // Una voce per posto occupato: { seat, id (sessionId), name, coffee, coffeeUntil, me }.
  const seats = ref([])

  const walk = useWalkingRoom('office', {
    clamp: (x, y) => clampToOffice({ x, y }),
    onJoin(r) {
      r.onStateChange((state) => {
        const list = []
        state.seats?.forEach((s, key) => {
          list.push({ seat: Number(key), id: s.sessionId, name: s.name, coffee: s.coffee, coffeeUntil: s.coffeeUntil, me: s.sessionId === r.sessionId })
        })
        seats.value = list
      })
      r.onMessage('seatTaken', () => onSeatTaken?.())
    },
    onLeave: () => (seats.value = []),
  })

  // Si cammina fino al posto e ci si siede all'arrivo, se è ancora libero.
  const sit = (seat) => walk.room.value?.send('sit', { seat })
  // Alzandosi si torna sul bordo del tavolo.
  const stand = () => walk.room.value?.send('stand')

  return { status: walk.status, players: walk.players, moveTo: walk.moveTo, chat: walk.chat, seats, sit, stand }
}
