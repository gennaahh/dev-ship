// Quando compaiono i mostri. Come in shipPosition.js, i tempi sono minuti da lunedì 00:00.
// I mostri si vedono solo nella vista del mare aperto: durante le scene ravvicinate restano nascosti.
import { random } from './weekRandom.js'

const MINUTES_PER_DAY = 24 * 60
const DURATION = 5

// Kraken: tutti i giorni dalle 11:11 alle 11:16.
export const KRAKEN_START = 11 * 60 + 11

export function isKrakenTime(m) {
  const inDay = m % MINUTES_PER_DAY
  return inDay >= KRAKEN_START && inDay < KRAKEN_START + DURATION
}

// Poseidone: mercoledì pomeriggio (14:00–18:00) spinge la nave che ha appena girato la boa.
const POSEIDON_START = 2 * MINUTES_PER_DAY + 14 * 60
const POSEIDON_END = 2 * MINUTES_PER_DAY + 18 * 60

export function isPoseidonTime(m) {
  return m >= POSEIDON_START && m < POSEIDON_END
}

// Pterodattilo: una sola volta a settimana, in un giorno feriale a caso, per 5 minuti.
// Il caso è legato alla settimana (vedi weekRandom.js). Esce solo in orario di navigazione
// fuori dalla pausa pranzo (9:00–13:00 e 14:00–18:00), quando la vista del mare è visibile.
const FLIGHT_WINDOWS = [
  [9 * 60, 13 * 60],
  [14 * 60, 18 * 60],
]

export function pterodactylStart(week) {
  const day = Math.floor(random(week * 2) * 5)
  const [[amFrom, amTo], [pmFrom, pmTo]] = FLIGHT_WINDOWS
  const amSlots = amTo - amFrom - DURATION
  const pmSlots = pmTo - pmFrom - DURATION
  const offset = Math.floor(random(week * 2 + 1) * (amSlots + pmSlots))
  const inDay = offset < amSlots ? amFrom + offset : pmFrom + offset - amSlots
  return day * MINUTES_PER_DAY + inDay
}

export function isPterodactylTime(m, week) {
  const start = pterodactylStart(week)
  return m >= start && m < start + DURATION
}

// Aereo con lo striscione: il venerdì, nei primi 5 minuti di ogni ora. Come gli altri si vede
// solo col mare aperto, quindi in pratica alle 9, 10, 11, 12, 14, 15, 16 e 17.
const FRIDAY = 4

export function isPlaneTime(m) {
  return Math.floor(m / MINUTES_PER_DAY) === FRIDAY && m % 60 < DURATION
}
