// Il museo per il frontend: date dell'albo dei capitani e i quadri della demo.

// "5 ottobre" (con l'anno se non è quello di adesso) per il lunedì di una settimana (YYYY-MM-DD).
export function weekLabel(weekStart, now = new Date()) {
  const d = new Date(`${weekStart}T12:00:00`)
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', ...(sameYear ? {} : { year: 'numeric' }) })
}

// Senza backend l'albo è quello della squadra della demo, con le ultime tre settimane.
const crew = (a, b, c) => [
  { rank: 1, ...a },
  { rank: 2, ...b },
  { rank: 3, ...c },
]
const P = {
  merge: { name: 'Capitan Merge', look: { color: 'corallo', hat: 'captain' } },
  refactor: { name: 'Mozzo Refactor', look: { color: 'azzurro', hat: 'propeller' } },
  deploy: { name: 'Nostromo Deploy', look: { color: 'menta', hat: 'cap' } },
  debug: { name: 'Vedetta Debug', look: { color: 'notte', hat: 'headphones' } },
  hotfix: { name: 'Cuoca Hotfix', look: { color: 'lilla', hat: 'chef' } },
}
export function demoCaptains(now = new Date()) {
  const monday = new Date(now)
  monday.setHours(12, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  const weekAgo = (n) => {
    const d = new Date(monday)
    d.setDate(d.getDate() - 7 * n)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  return {
    demo: true,
    weeks: [
      { weekStart: weekAgo(1), wins: 2, podium: crew({ ...P.merge, points: 3846 }, { ...P.refactor, points: 3318 }, { ...P.deploy, points: 2940 }) },
      { weekStart: weekAgo(2), wins: 1, podium: crew({ ...P.debug, points: 3120 }, { ...P.merge, points: 2990 }, { ...P.hotfix, points: 2410 }) },
      { weekStart: weekAgo(3), wins: 1, podium: crew({ ...P.merge, points: 2875 }, { ...P.deploy, points: 2730 }, { ...P.refactor, points: 2200 }) },
    ],
  }
}
