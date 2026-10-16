import { schema, t, type SchemaType } from '@colyseus/schema'

export const PlazaPlayer = schema({
  name: t.string(),
  // Cosa indossa (id del catalogo, '' = niente): lo legge il server dal database (db.ts).
  // Senza colore il client lo ricava dal nome, come per i passanti.
  hat: t.string(),
  color: t.string(),
  x: t.number(),
  y: t.number(),
  // Sta scrivendo in chat: sopra la testa compaiono i puntini.
  typing: t.boolean(),
}, 'PlazaPlayer')
export type PlazaPlayer = SchemaType<typeof PlazaPlayer>

export const PlazaState = schema({
  players: t.map(PlazaPlayer),
}, 'PlazaState')
export type PlazaState = SchemaType<typeof PlazaState>
