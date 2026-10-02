import { schema, t, type SchemaType } from '@colyseus/schema'

// Il colore del personaggio non c'è: il client lo ricava dal nome, come per i passanti.
export const PlazaPlayer = schema({
  name: t.string(),
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
