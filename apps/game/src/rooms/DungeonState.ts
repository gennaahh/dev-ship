import { schema, t, type SchemaType } from '@colyseus/schema'

// Stato sincronizzato con i client. Da spostare in packages/shared quando il frontend
// avrà bisogno dei tipi: per ora il client lo decodifica senza conoscere le classi.
export const Player = schema({
  name: t.string(),
  color: t.string(),
  x: t.number(),
  y: t.number(),
}, 'Player')
export type Player = SchemaType<typeof Player>

export const DungeonState = schema({
  players: t.map(Player),
}, 'DungeonState')
export type DungeonState = SchemaType<typeof DungeonState>
