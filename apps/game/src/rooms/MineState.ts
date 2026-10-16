import { schema, t, type SchemaType } from '@colyseus/schema'
import { PlazaPlayer } from './PlazaState.ts'

// Un filone occupato in miniera. Quelli liberi non ci sono.
export const MineSpot = schema({
  // Chi ci scava: il client lo confronta col proprio sessionId e ci mette il suo fumetto.
  sessionId: t.string(),
  name: t.string(),
  // 'digging' (si scava) o 'found' (si mostra l'ultima scoperta, poi si torna a scavare).
  phase: t.string(),
  // Da quando si scava, in ms (Date.now() del server).
  since: t.number(),
  // Pietre e scoperte da quando si è qui: a ogni pietra in più il client fa saltare un sasso.
  stones: t.number(),
  finds: t.number(),
  // L'id del catalogo dell'ultima scoperta, '' prima della prima.
  found: t.string(),
  // Il piccone in mano (id del catalogo, PICKAXES), '' = quello di sempre: accorcia l'attesa e
  // porta più scoperte rare, e tutti lo vedono.
  tool: t.string(),
}, 'MineSpot')
export type MineSpot = SchemaType<typeof MineSpot>

export const MineState = schema({
  // Chi c'è in miniera: si cammina e si chiacchiera come in piazza. Chi scava resta qui, fermo
  // davanti al filone, ed è anche in spots.
  players: t.map(PlazaPlayer),
  // Chiave: numero del filone, da "0" a "7".
  spots: t.map(MineSpot),
}, 'MineState')
export type MineState = SchemaType<typeof MineState>
