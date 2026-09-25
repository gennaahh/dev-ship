// Caso deterministico legato alla settimana: stessi risultati ricaricando la pagina
// o muovendo lo slider, risultati diversi la settimana dopo.

// Numero del giorno (dal 1970) del lunedì della settimana di `date`, in ora locale.
export function weekId(date) {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7))
  return Math.round(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()) / 86400000)
}

// mulberry32: piccolo generatore pseudo-casuale con seme, restituisce un numero in [0, 1).
export function random(seed) {
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
