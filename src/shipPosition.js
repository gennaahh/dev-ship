// Tutti i tempi sono minuti dall'inizio della settimana (lunedì 00:00, ora locale).
const MINUTES_PER_DAY = 24 * 60
const at = (day, hours, minutes = 0) => day * MINUTES_PER_DAY + hours * 60 + minutes

export const WEEK = 7 * MINUTES_PER_DAY
export const START = at(0, 9)       // lunedì 09:00   → in porto, parte
export const TURN = at(2, 13, 30)   // mercoledì 13:30 → alla boa
export const END = at(4, 18)        // venerdì 18:00  → di nuovo in porto

export const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

export function minutesSinceMonday(date) {
  const day = (date.getDay() + 6) % 7 // lunedì = 0 … domenica = 6
  return at(day, date.getHours(), date.getMinutes()) + date.getSeconds() / 60
}

export function formatWeekMinute(m, withSeconds = false) {
  const day = Math.floor(m / MINUTES_PER_DAY)
  const inDay = m - day * MINUTES_PER_DAY
  const pad = (n) => String(Math.floor(n)).padStart(2, '0')
  const time = `${pad(inDay / 60)}:${pad(inDay % 60)}`
  return `${DAYS[day]} ${time}${withSeconds ? ':' + pad((inDay * 60) % 60) : ''}`
}

// progress: 0 = in porto, 1 = alla boa.
// direction: 'right' (andata), 'left' (ritorno), 'docked' (fuori orario: ferma in porto).
export function shipPosition(m) {
  if (m <= START || m >= END) return { progress: 0, direction: 'docked' }
  if (m <= TURN) return { progress: (m - START) / (TURN - START), direction: 'right' }
  return { progress: 1 - (m - TURN) / (END - TURN), direction: 'left' }
}

// Pausa pranzo, tutti i giorni: dalle 13:00 alle 14:00 si pranza a bordo.
export const LUNCH_START = 13 * 60
export const LUNCH_END = 14 * 60

export function isLunchTime(m) {
  const inDay = m % MINUTES_PER_DAY
  return inDay >= LUNCH_START && inDay < LUNCH_END
}

// Riposo: fuori dall'orario di lavoro (dalle 18:00 alle 09:00 del giorno dopo) l'equipaggio dorme.
// Quando la nave è in porto vale invece la scena del porto (vedi App.vue).
export const REST_START = 18 * 60
export const REST_END = 9 * 60

export function isRestTime(m) {
  const inDay = m % MINUTES_PER_DAY
  return inDay >= REST_START || inDay < REST_END
}
