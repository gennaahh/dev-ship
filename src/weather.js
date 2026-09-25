// Maltempo: ogni giorno c'è un'ora, scelta a caso, di tempesta oppure di nebbia.
// Il caso è legato alla settimana (vedi weekRandom.js). Si sceglie tra le ore intere in cui
// si vede il mare aperto (9–13 e 14–18), come per lo pterodattilo.
import { random } from './weekRandom.js'

const MINUTES_PER_DAY = 24 * 60
const HOURS = [9, 10, 11, 12, 14, 15, 16, 17]
const KINDS = ['storm', 'fog']

// Un seme per ogni giorno, sparpagliato con una moltiplicazione (costante di Knuth) così
// giorni consecutivi non danno semi vicini e restano separati da quelli dello pterodattilo.
export function weatherOfDay(week, day) {
  const seed = Math.imul(week * 7 + day, 0x9e3779b1)
  return {
    hour: HOURS[Math.floor(random(seed) * HOURS.length)],
    kind: KINDS[Math.floor(random(seed ^ 0x5bd1e995) * KINDS.length)],
  }
}

// 'storm', 'fog' oppure null (bel tempo).
export function weatherAt(m, week) {
  const day = Math.floor(m / MINUTES_PER_DAY)
  const { hour, kind } = weatherOfDay(week, day)
  const inDay = m - day * MINUTES_PER_DAY
  return inDay >= hour * 60 && inDay < (hour + 1) * 60 ? kind : null
}
