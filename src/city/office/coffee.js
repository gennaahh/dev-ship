import { coffee } from '@dev-city/shared/coffee'

// I caffè per il frontend: cosa fa ognuno, in breve, e quanto manca alla fine di quello in circolo.
// I caffè, i prezzi e gli effetti sono in packages/shared/src/coffee.ts.

const percent = (v) => `${Math.round(v * 100)}%`

// Gli effetti di un caffè, una voce ciascuno: { icon (il nome per Icon), text, tone }.
export function coffeeEffects(c) {
  const list = []
  if (c.speed) list.push({ icon: 'timer', text: `−${percent(c.speed)} attesa al lago e in miniera`, tone: 'speed' })
  if (c.luck) list.push({ icon: 'clover', text: `+${percent(c.luck)} pesci speciali e scoperte rare`, tone: 'luck' })
  if (c.dungeon) list.push({ icon: 'swords', text: `+${c.dungeon.damage} danni a colpo e +${c.dungeon.hp} HP nella prossima run del dungeon`, tone: 'dungeon' })
  if (!list.length) list.push({ icon: 'cloud', text: 'Nessun effetto: solo il piacere della tazza', tone: 'none' })
  return list
}

export const durationText = (minutes) => (minutes % 60 ? `${minutes} min` : `${minutes / 60} ${minutes === 60 ? 'ora' : 'ore'}`)

// Il caffè in circolo ({ id, until } dall'inventario), col suo catalogo e i minuti che mancano;
// null se non c'è o è finito.
export function activeCoffee(active, now) {
  if (!active) return null
  const left = Math.ceil((Date.parse(active.until) - now) / 60_000)
  const c = coffee(active.id)
  return c && left > 0 ? { ...c, left } : null
}

export const leftText = (minutes) => (minutes >= 60 ? `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')} min` : `${minutes} min`)
