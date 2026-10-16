// La miniera vista di fronte: misure della scena (1600 × 900), come ci si cammina e i filoni
// da scavare. Le stesse del game server (apps/game/src/cave.ts); le regole di cosa si trova e
// quanto spesso stanno in packages/shared/src/mine.ts e nel catalogo (MINERALS).

export const SPOTS = 8
const WALK = { minX: 40, maxX: 1560, minY: 520, maxY: 870 }
export const SPEED = 230 // unità al secondo

// Dove si sta per scavare: in fila davanti alla parete, col filone alla propria destra (vein,
// alla base della parete), così si guarda sempre a destra.
export const SPOT_SPOTS = Array.from({ length: SPOTS }, (_, i) => {
  const x = 200 + i * 172
  return { spot: i, x, y: 540, vein: { x: x + 62, y: 470 } }
})

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Il punto raggiungibile più vicino: sul pavimento della galleria.
export const clampToCave = (p) => ({ x: clamp(p.x, WALK.minX, WALK.maxX), y: clamp(p.y, WALK.minY, WALK.maxY) })

// Un passo di dt secondi verso la meta, in linea retta.
export function walkCave(pos, target, dt) {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy)
  const d = SPEED * dt
  return dist <= d ? { x: target.x, y: target.y } : { x: pos.x + (dx / dist) * d, y: pos.y + (dy / dist) * d }
}
