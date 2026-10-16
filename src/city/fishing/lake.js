// La zona di pesca vista dall'alto: misure della scena (1600 × 900), come ci si cammina,
// specie dei pesci e dati dimostrativi. Lago, sedie e camminata sono le stesse del game
// server (apps/game/src/lake.ts), le regole della pesca quelle di apps/game/src/fishing.ts.

// La scena è vista da lontano: personaggi e sedie sono disegnati più piccoli che in piazza.
export const SCALE = 0.62
export const LAKE = { cx: 860, cy: 560, rx: 290, ry: 125 }
// La spiaggetta attorno al lago, su cui stanno le sedie.
export const SHORE = { rx: 410, ry: 212 }
export const SEATS = 10
export const BIG_KG = 5
const POINTS_PER_KG = 10

const WALK = { minX: 40, maxX: 1560, minY: 300, maxY: 870 }
// Davanti al cartellone, in alto a sinistra, non si passa.
const BOARD = { maxX: 470, maxY: 355 }
// Nel lago non si entra: si gira attorno a questo ellisse, appena più largo dell'acqua.
const EDGE = { rx: LAKE.rx + 16, ry: LAKE.ry + 12 }
export const SPEED = 190 // unità al secondo

// Dieci sedie in cerchio attorno al lago, ognuna col suo galleggiante in acqua davanti.
// Si guarda verso il lago; quelle in asse (sopra e sotto) guardano a destra.
export const SEAT_SPOTS = Array.from({ length: SEATS }, (_, i) => {
  const a = ((18 + i * 36) * Math.PI) / 180
  const x = Math.round(LAKE.cx + 352 * Math.cos(a))
  const y = Math.round(LAKE.cy + 168 * Math.sin(a))
  return {
    seat: i,
    x,
    y,
    dir: x > LAKE.cx + 10 ? -1 : 1,
    bobber: { x: Math.round(LAKE.cx + 205 * Math.cos(a)), y: Math.round(LAKE.cy + 82 * Math.sin(a)) },
  }
})

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
// Quanto si è "dentro" l'ellisse della riva: meno di 1 vuol dire in acqua.
const depth = (p) => ((p.x - LAKE.cx) / EDGE.rx) ** 2 + ((p.y - LAKE.cy) / EDGE.ry) ** 2
const angleOf = (p) => Math.atan2((p.y - LAKE.cy) / EDGE.ry, (p.x - LAKE.cx) / EDGE.rx)
const onEdge = (a) => ({ x: LAKE.cx + EDGE.rx * Math.cos(a), y: LAKE.cy + EDGE.ry * Math.sin(a) })

// Il punto raggiungibile più vicino: dentro il prato, fuori dall'acqua e dal cartellone.
export function clampToLakeside(p) {
  const x = clamp(p.x, WALK.minX, WALK.maxX)
  let y = clamp(p.y, WALK.minY, WALK.maxY)
  if (x < BOARD.maxX && y < BOARD.maxY) y = BOARD.maxY
  if (depth({ x, y }) < 1) return onEdge(angleOf({ x, y }))
  return { x, y }
}

// Un passo di dt secondi verso la meta, girando attorno al lago dalla parte più corta
// quando la strada dritta passerebbe in acqua.
export function walkLakeside(pos, target, dt) {
  const dx = target.x - pos.x
  const dy = target.y - pos.y
  const dist = Math.hypot(dx, dy)
  const d = SPEED * dt
  const next = dist <= d ? { x: target.x, y: target.y } : { x: pos.x + (dx / dist) * d, y: pos.y + (dy / dist) * d }
  if (depth(next) >= 1) return next
  const a = angleOf(pos)
  let diff = angleOf(target) - a
  if (diff > Math.PI) diff -= 2 * Math.PI
  if (diff < -Math.PI) diff += 2 * Math.PI
  const r = Math.hypot(EDGE.rx * Math.sin(a), EDGE.ry * Math.cos(a))
  return onEdge(a + Math.sign(diff) * Math.min(Math.abs(diff), d / r))
}

// Che pesce è, dal peso: più è grosso, più è raro.
const SPECIES = [
  { upTo: 2, name: 'Persico', a: 'un', color: '#9ccc65', stripes: true },
  { upTo: 3.5, name: 'Trota', a: 'una', color: '#f4a6b8', spots: true },
  { upTo: 5, name: 'Carpa', a: 'una', color: '#f0b04a' },
  { upTo: 10, name: 'Luccio', a: 'un', color: '#6fa86a', spots: true },
  { upTo: 15, name: 'Siluro', a: 'un', color: '#7d7f9e', whiskers: true },
  { upTo: Infinity, name: 'Storione leggendario', a: 'uno', color: '#8fd3ff', legendary: true },
]
export const speciesFor = (kg) => SPECIES.find((s) => kg < s.upTo)
export const pointsFor = (kg) => Math.round(kg * POINTS_PER_KG)
export const formatKg = (kg) => `${kg.toFixed(1).replace('.', ',')} kg`

// Come sul server: 3 volte su 4 resta all'amo, 1 su 10 è un pesce da 5 kg o più.
export function rollCatch() {
  if (Math.random() >= 0.75) return null
  const kg = Math.random() < 0.1 ? 5 + Math.random() * 15 : 1 + Math.random() * 3.9
  return Math.round(kg * 10) / 10
}

// Come sul server: una volta su 15 col pesce sale una bottiglia col ticket del dungeon.
export const BOTTLE_CHANCE = 1 / 15

// Classifica dimostrativa, per il sito senza backend: l'equipaggio della classifica della città.
const row = (name, fish, biggestKg, points) => ({ name, fish, biggestKg, points })
const ago = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()
export const DEMO_LEADERBOARD = {
  day: [row('Cuoca Hotfix', 3, 6.2, 118), row('Nostromo Deploy', 2, 3.1, 52), row('Capitan Merge', 1, 2.4, 24)],
  week: [
    row('Cuoca Hotfix', 14, 12.8, 642),
    row('Nostromo Deploy', 11, 7.5, 461),
    row('Marinaio Commit', 9, 4.6, 287),
    row('Capitan Merge', 8, 3.9, 230),
    row('Timoniere Review', 6, 5.4, 205),
  ],
  all: [
    row('Nostromo Deploy', 61, 18.3, 2875),
    row('Cuoca Hotfix', 54, 12.8, 2510),
    row('Marinaio Commit', 40, 9.1, 1704),
    row('Capitan Merge', 33, 6.6, 1290),
    row('Vedetta Debug', 21, 4.8, 815),
  ],
  recent: [
    { name: 'Capitan Merge', weightKg: 2.4, caughtAt: ago(4) },
    { name: 'Cuoca Hotfix', weightKg: 6.2, caughtAt: ago(23) },
    { name: 'Nostromo Deploy', weightKg: 1.7, caughtAt: ago(41) },
    { name: 'Cuoca Hotfix', weightKg: 3.3, caughtAt: ago(75) },
    { name: 'Nostromo Deploy', weightKg: 1.4, caughtAt: ago(130) },
  ],
}
