import { clampToBox, walkToward } from './movement.ts'

// La miniera vista di fronte: in fondo la parete di roccia, coi filoni da scavare alla sua base,
// e davanti il pavimento della galleria su cui si cammina. Funzioni pure, nelle coordinate della
// scena (1600 × 900). Stesse misure di src/city/mine/cave.js.

type Point = { x: number; y: number }

export const SPOTS = 8
const WALK = { minX: 40, maxX: 1560, minY: 520, maxY: 870 }
const SPEED = 230

// Dove si sta per scavare: in fila davanti alla parete, col filone alla propria destra.
export const SPOT_SPOTS: Point[] = Array.from({ length: SPOTS }, (_, i) => ({ x: 200 + i * 172, y: 540 }))

export const clampToCave = (p: Point) => clampToBox(p, WALK)
export const walkCave = (pos: Point, target: Point, dtMs: number) => walkToward(pos, target, dtMs, SPEED)

// Si arriva dalla galleria in basso.
export function caveEntrance() {
  const x = 750 + Math.random() * 100
  return { from: { x, y: 920 }, to: { x, y: 800 } }
}

// Alzandosi si fa un passo indietro, lontano dalla parete.
export const stepBack = (spot: Point): Point => clampToCave({ x: spot.x, y: spot.y + 70 })
