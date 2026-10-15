import { useWalkingRoom } from './useWalkingRoom.js'

// Stesse misure della PlazaRoom (apps/game/src/movement.ts).
const WALK = { minX: 40, maxX: 1560, minY: 500, maxY: 860 }
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// La piazza multigiocatore: chi c'è passeggia (si cammina cliccando dove andare),
// chiacchiera in chat e ha il fumetto sopra la testa. Per status vedi useGameRoom.
export function usePlazaRoom() {
  const { status, players, moveTo, chat } = useWalkingRoom('plaza', {
    clamp: (x, y) => ({ x: clamp(x, WALK.minX, WALK.maxX), y: clamp(y, WALK.minY, WALK.maxY) }),
  })
  return { status, players, moveTo, chat }
}
