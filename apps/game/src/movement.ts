// Movimento dei giocatori: funzioni pure, separate dalla Room, così si possono testare
// e un domani riusare nel client per la predizione.

export type Input = { up: boolean; down: boolean; left: boolean; right: boolean }

export const IDLE: Input = { up: false, down: false, left: false, right: false }

// Pavimento del dungeon, nelle coordinate della scena (1600 × 900). A destra si ferma
// prima del cartello col nome del luogo, che altrimenti coprirebbe i giocatori.
export const FLOOR = { minX: 60, maxX: 1080, minY: 600, maxY: 860 }

const SPEED = 320 // px al secondo

export function step(pos: { x: number; y: number }, input: Input, dtMs: number) {
  let dx = Number(input.right) - Number(input.left)
  let dy = Number(input.down) - Number(input.up)
  // In diagonale non si va più veloci.
  if (dx && dy) {
    dx *= Math.SQRT1_2
    dy *= Math.SQRT1_2
  }
  const d = (SPEED * dtMs) / 1000
  return {
    x: clamp(pos.x + dx * d, FLOOR.minX, FLOOR.maxX),
    y: clamp(pos.y + dy * d, FLOOR.minY, FLOOR.maxY),
  }
}

export function spawnPoint() {
  return {
    x: FLOOR.minX + 100 + Math.random() * (FLOOR.maxX - FLOOR.minX - 200),
    y: (FLOOR.minY + FLOOR.maxY) / 2,
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
