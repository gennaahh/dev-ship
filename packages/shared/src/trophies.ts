// I trofei della bacheca del museo: per ora non ce n'è nessuno, arriveranno trofei fatti apposta
// (per un'impresa, un evento, una settimana memorabile). Ognuno ha il suo posto sulla bacheca,
// in ordine, con chi l'ha vinto e quando. La bacheca (src/city/museum/TrophyCase.vue) li mette
// sui ripiani da sinistra a destra, dall'alto in basso.
export type Trophy = {
  id: string
  name: string
  // Una riga su com'è stato vinto.
  blurb: string
  // Chi l'ha vinto (il nome com'era allora) e quando (YYYY-MM-DD).
  winner: string
  date: string
}

export const TROPHIES: Trophy[] = []
