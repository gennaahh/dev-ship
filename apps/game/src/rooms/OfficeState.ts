import { schema, t, type SchemaType } from '@colyseus/schema'
import { PlazaPlayer } from './PlazaState.ts'

// Un posto occupato al tavolo dell'ufficio. Quelli liberi non ci sono.
export const OfficeSeat = schema({
  // Chi ci è seduto: il client lo confronta col proprio sessionId e ci mette il suo fumetto.
  sessionId: t.string(),
  name: t.string(),
  // Il caffè che ha in circolo (packages/shared/src/coffee.ts), '' = niente, e fino a quando (ms,
  // Date.now() del server): sul tavolo, davanti a lui, c'è la tazza finché non finisce.
  coffee: t.string(),
  coffeeUntil: t.number(),
}, 'OfficeSeat')
export type OfficeSeat = SchemaType<typeof OfficeSeat>

export const OfficeState = schema({
  // Chi c'è in ufficio: si cammina e si chiacchiera come in piazza. Chi è seduto resta qui, al
  // suo posto, ed è anche in seats.
  players: t.map(PlazaPlayer),
  // Chiave: numero del posto, da "0" a "7" (packages/shared/src/office-floor.ts).
  seats: t.map(OfficeSeat),
}, 'OfficeState')
export type OfficeState = SchemaType<typeof OfficeState>
