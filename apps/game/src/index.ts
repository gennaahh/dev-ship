import { defineRoom, defineServer } from '@colyseus/core'
import { BunWebSockets } from '@colyseus/bun-websockets'
import { DungeonRoom } from './rooms/DungeonRoom.ts'

const port = Number(process.env.PORT ?? 2567)

const server = defineServer({
  transport: new BunWebSockets(),
  rooms: {
    dungeon: defineRoom(DungeonRoom),
  },
  greet: false,
})

await server.listen(port)
console.log(`Game server in ascolto su ws://localhost:${port}`)
