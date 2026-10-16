import { clampToMuseum } from '@dev-city/shared/museum-floor'
import { useWalkingRoom } from './useWalkingRoom.js'

// Il museo multigiocatore: chi c'è passeggia tra i quadri e la bacheca dei trofei e chiacchiera,
// col fumetto sopra la testa, come in piazza. Per status vedi useGameRoom.
export function useMuseumRoom() {
  const { status, players, moveTo, chat } = useWalkingRoom('museum', { clamp: (x, y) => clampToMuseum({ x, y }) })
  return { status, players, moveTo, chat }
}
