import { schema, t, type SchemaType } from '@colyseus/schema'
import { PlazaPlayer } from './PlazaState.ts'

// Una sedia occupata attorno al lago. Le sedie libere non ci sono.
export const FishingSeat = schema({
  // Chi ci è seduto: il client lo confronta col proprio sessionId e ci mette il suo fumetto.
  sessionId: t.string(),
  name: t.string(),
  // 'waiting' (lenza in acqua), 'bite' (ha abboccato), 'caught' o 'escaped' (com'è andata).
  phase: t.string(),
  // Da quando si è seduti, in ms (Date.now() del server).
  since: t.number(),
  // Peso dell'ultima cattura in kg, per l'animazione di 'caught'.
  weight: t.number(),
}, 'FishingSeat')
export type FishingSeat = SchemaType<typeof FishingSeat>

export const FishingState = schema({
  // Chi c'è attorno al lago: si cammina e si chiacchiera come in piazza. Chi è seduto resta
  // qui, fermo sulla sedia, ed è anche in seats.
  players: t.map(PlazaPlayer),
  // Chiave: numero della sedia, da "0" a "9".
  seats: t.map(FishingSeat),
}, 'FishingState')
export type FishingState = SchemaType<typeof FishingState>
