// Il museo visto di fronte: in fondo la parete con l'albo dei capitani a sinistra e la bacheca
// dei trofei a destra, e davanti il pavimento a scacchi su cui si cammina. Funzioni pure, nelle
// coordinate della scena (1600 × 900): le usano il game server (apps/game/src/rooms/MuseumRoom.ts)
// e il frontend (src/city/interiors/MuseumInterior.vue).

type Point = { x: number; y: number }

// Davanti alla parete, oltre i cordoni dei quadri.
export const WALK = { minX: 40, maxX: 1560, minY: 560, maxY: 870 }
export const SPEED = 230 // unità al secondo
// Come in ufficio: la sala si vede da un po' lontano.
export const SCALE = 0.85

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

// Il punto raggiungibile più vicino, sul pavimento.
export const clampToMuseum = (p: Point): Point => ({ x: clamp(p.x, WALK.minX, WALK.maxX), y: clamp(p.y, WALK.minY, WALK.maxY) })

// Un passo di dtMs verso la meta, in linea retta: nel museo non c'è niente in mezzo.
export function walkMuseum(pos: Point, target: Point, dtMs: number): Point {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy)
  const d = (SPEED * dtMs) / 1000
  return dist <= d ? { x: target.x, y: target.y } : { x: pos.x + (dx / dist) * d, y: pos.y + (dy / dist) * d }
}

// Si arriva dalla porta in basso.
export function museumEntrance() {
  const x = 760 + Math.random() * 80
  return { from: { x, y: 920 }, to: { x, y: 800 } }
}
