import { walkToward } from './movement.ts'

// La zona di pesca vista dall'alto: il lago in mezzo al prato, dieci sedie attorno e tutto
// intorno lo spazio per camminare. Funzioni pure, nelle coordinate della scena (1600 × 900).
// Stesse misure di src/city/fishing/lake.js.

type Point = { x: number; y: number }

export const LAKE = { cx: 860, cy: 560, rx: 290, ry: 125 }
export const SEATS = 10
const WALK = { minX: 40, maxX: 1560, minY: 300, maxY: 870 }
// Davanti al cartellone, in alto a sinistra, non si passa.
const BOARD = { maxX: 470, maxY: 355 }
// Nel lago non si entra: si gira attorno a questo ellisse, appena più largo dell'acqua.
const SHORE = { rx: LAKE.rx + 16, ry: LAKE.ry + 12 }
// I personaggi sono piccoli (la scena è vista da lontano): si cammina più piano che in piazza.
const SPEED = 190

// Le sedie, in cerchio attorno al lago.
export const SEAT_SPOTS: Point[] = Array.from({ length: SEATS }, (_, i) => {
  const a = ((18 + i * 36) * Math.PI) / 180
  return { x: Math.round(LAKE.cx + 352 * Math.cos(a)), y: Math.round(LAKE.cy + 168 * Math.sin(a)) }
})

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
// Quanto si è "dentro" l'ellisse della riva: meno di 1 vuol dire in acqua.
const depth = (p: Point) => ((p.x - LAKE.cx) / SHORE.rx) ** 2 + ((p.y - LAKE.cy) / SHORE.ry) ** 2
const angleOf = (p: Point) => Math.atan2((p.y - LAKE.cy) / SHORE.ry, (p.x - LAKE.cx) / SHORE.rx)
const onShore = (a: number) => ({ x: LAKE.cx + SHORE.rx * Math.cos(a), y: LAKE.cy + SHORE.ry * Math.sin(a) })

// Il punto raggiungibile più vicino: dentro il prato, fuori dall'acqua e dal cartellone.
export function clampToLakeside(p: Point): Point {
  let x = clamp(p.x, WALK.minX, WALK.maxX)
  let y = clamp(p.y, WALK.minY, WALK.maxY)
  if (x < BOARD.maxX && y < BOARD.maxY) y = BOARD.maxY
  if (depth({ x, y }) < 1) return onShore(angleOf({ x, y }))
  return { x, y }
}

// Un passo verso la meta. Se il passo finirebbe in acqua si gira attorno al lago lungo la
// riva, dalla parte più corta, finché la strada dritta non è di nuovo libera.
export function walkLakeside(pos: Point, target: Point, dtMs: number): Point {
  const next = walkToward(pos, target, dtMs, SPEED)
  if (depth(next) >= 1) return next
  const a = angleOf(pos)
  let diff = angleOf(target) - a
  if (diff > Math.PI) diff -= 2 * Math.PI
  if (diff < -Math.PI) diff += 2 * Math.PI
  // Quanto si avanza sulla riva per ogni radiante, lì dove si è.
  const r = Math.hypot(SHORE.rx * Math.sin(a), SHORE.ry * Math.cos(a))
  const step = (SPEED * dtMs) / 1000 / r
  return onShore(a + Math.sign(diff) * Math.min(Math.abs(diff), step))
}

// Si arriva dal sentiero in basso.
export function lakeEntrance() {
  const x = LAKE.cx - 50 + Math.random() * 100
  return { from: { x, y: 920 }, to: { x, y: 800 } }
}

// Alzandosi si fa un passo indietro, lontano dal lago.
export function stepBack(seat: Point): Point {
  const dx = seat.x - LAKE.cx
  const dy = seat.y - LAKE.cy
  const len = Math.hypot(dx, dy)
  return clampToLakeside({ x: seat.x + (dx / len) * 34, y: seat.y + (dy / len) * 22 })
}
