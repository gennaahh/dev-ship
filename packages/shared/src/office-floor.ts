// L'ufficio visto di fronte: in fondo la parete, con la bacheca delle missioni a sinistra e il
// tavolino della macchinetta del caffè a destra, e davanti il pavimento su cui si cammina, col
// tavolo delle riunioni in mezzo. Funzioni pure, nelle coordinate della scena (1600 × 900): le
// usano il game server (apps/game/src/rooms/OfficeRoom.ts) e il frontend
// (src/city/interiors/OfficeInterior.vue).

type Point = { x: number; y: number }
type Box = { minX: number; maxX: number; minY: number; maxY: number }

export const WALK: Box = { minX: 40, maxX: 1560, minY: 500, maxY: 870 }
// Il tavolo con le sedie attorno: lì non si cammina, si gira attorno. Ci si sta solo seduti.
export const TABLE: Box = { minX: 500, maxX: 1100, minY: 600, maxY: 750 }
export const SPEED = 230 // unità al secondo
// I personaggi sono un po' più piccoli che in piazza: l'ufficio si vede da più lontano.
export const SCALE = 0.85

// Otto posti, quattro per lato lungo. Quelli dietro (back) guardano verso chi guarda, col tavolo
// davanti; quelli davanti (front) si vedono di spalle. x, y: dove si sta seduti (i piedi);
// approach: dove si arriva camminando, appena fuori dal tavolo, e dove si torna alzandosi.
export const SEATS = 8
const SEAT_X = [605, 735, 865, 995]
export const SEAT_SPOTS = [
  ...SEAT_X.map((x, i) => ({ seat: i, side: 'back' as const, x, y: 598, approach: { x, y: 578 } })),
  ...SEAT_X.map((x, i) => ({ seat: i + 4, side: 'front' as const, x, y: 738, approach: { x, y: 768 } })),
]

// Davanti al tavolino della macchinetta del caffè, in fondo a destra.
export const COFFEE_SPOT: Point = { x: 1350, y: 520 }

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const inside = (p: Point, b: Box) => p.x > b.minX && p.x < b.maxX && p.y > b.minY && p.y < b.maxY

// Il punto raggiungibile più vicino: sul pavimento e fuori dal tavolo (sul bordo più vicino).
export function clampToOffice(p: Point): Point {
  const q = { x: clamp(p.x, WALK.minX, WALK.maxX), y: clamp(p.y, WALK.minY, WALK.maxY) }
  if (!inside(q, TABLE)) return q
  const sides = [
    { d: q.x - TABLE.minX, p: { x: TABLE.minX, y: q.y } },
    { d: TABLE.maxX - q.x, p: { x: TABLE.maxX, y: q.y } },
    { d: q.y - TABLE.minY, p: { x: q.x, y: TABLE.minY } },
    { d: TABLE.maxY - q.y, p: { x: q.x, y: TABLE.maxY } },
  ]
  return sides.reduce((a, b) => (b.d < a.d ? b : a)).p
}

// Se il tratto da a a b passa dentro il tavolo (sfiorarne il bordo va bene).
function crossesTable(a: Point, b: Point) {
  let t0 = 0
  let t1 = 1
  const dx = b.x - a.x
  const dy = b.y - a.y
  // Liang-Barsky: si taglia il tratto sui quattro lati e si vede se ne resta un pezzo.
  for (const [p, q] of [
    [-dx, a.x - TABLE.minX],
    [dx, TABLE.maxX - a.x],
    [-dy, a.y - TABLE.minY],
    [dy, TABLE.maxY - a.y],
  ]) {
    if (p === 0) {
      if (q <= 0) return false
      continue
    }
    const r = q / p
    if (p < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    if (t0 >= t1) return false
  }
  return t1 - t0 > 1e-6
}

// Gli spigoli del tavolo, appena fuori: da lì si gira attorno.
const M = 4
const CORNERS: Point[] = [
  { x: TABLE.minX - M, y: TABLE.minY - M },
  { x: TABLE.maxX + M, y: TABLE.minY - M },
  { x: TABLE.maxX + M, y: TABLE.maxY + M },
  { x: TABLE.minX - M, y: TABLE.maxY + M },
]

// Un passo di dtMs verso la meta. Se la strada dritta passa sul tavolo si gira attorno dagli
// spigoli, per la via più corta (si ricalcola a ogni passo: sono sei punti in tutto).
export function walkOffice(pos: Point, target: Point, dtMs: number): Point {
  const goal = crossesTable(pos, target) ? nextStop(pos, target) : target
  const dx = goal.x - pos.x
  const dy = goal.y - pos.y
  const dist = Math.hypot(dx, dy)
  const d = (SPEED * dtMs) / 1000
  return dist <= d ? { x: goal.x, y: goal.y } : { x: pos.x + (dx / dist) * d, y: pos.y + (dy / dist) * d }
}

// Il primo spigolo della via più corta da pos a target senza passare sul tavolo (Dijkstra tra
// pos, i quattro spigoli e target).
function nextStop(pos: Point, target: Point): Point {
  const nodes = [pos, ...CORNERS, target]
  const dist = nodes.map((_, i) => (i === 0 ? 0 : Infinity))
  const prev = nodes.map(() => -1)
  const done = nodes.map(() => false)
  for (;;) {
    let u = -1
    for (let i = 0; i < nodes.length; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i
    if (u < 0 || dist[u] === Infinity) break
    done[u] = true
    for (let v = 0; v < nodes.length; v++) {
      const step = Math.hypot(nodes[v].x - nodes[u].x, nodes[v].y - nodes[u].y)
      // Lo spigolo su cui si è già non è una tappa: si resterebbe fermi.
      if (done[v] || (u === 0 && step < 0.5) || crossesTable(nodes[u], nodes[v])) continue
      const d = dist[u] + step
      if (d < dist[v]) {
        dist[v] = d
        prev[v] = u
      }
    }
  }
  let v = nodes.length - 1
  if (prev[v] < 0) return target
  while (prev[v] !== 0) v = prev[v]
  return nodes[v]
}

// Si arriva dalla porta in basso.
export function officeEntrance() {
  const x = 760 + Math.random() * 80
  return { from: { x, y: 920 }, to: { x, y: 820 } }
}
