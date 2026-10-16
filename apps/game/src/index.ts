import { defineRoom, defineServer } from '@colyseus/core'
import { BunWebSockets } from '@colyseus/bun-websockets'
import { RedisDriver } from '@colyseus/redis-driver'
import { RedisPresence } from '@colyseus/redis-presence'
import { ChatRoom } from './rooms/ChatRoom.ts'
import { FishingRoom } from './rooms/FishingRoom.ts'
import { MineRoom } from './rooms/MineRoom.ts'
import { OfficeRoom } from './rooms/OfficeRoom.ts'
import { PlazaRoom } from './rooms/PlazaRoom.ts'

const port = Number(process.env.PORT ?? 2567)
// Con REDIS_URL più processi condividono matchmaking e presenza; senza, tutto resta in memoria
// e basta un solo processo (va bene per lo sviluppo, anche senza Docker).
const redisUrl = process.env.REDIS_URL
// Indirizzo (host:porta) a cui i client raggiungono questo processo. Serve con più processi:
// la stanza può stare su un processo diverso da quello che ha risposto al matchmaking.
const publicAddress = process.env.PUBLIC_ADDRESS

const server = defineServer({
  transport: new BunWebSockets(),
  ...(redisUrl && { presence: new RedisPresence(redisUrl), driver: new RedisDriver(redisUrl) }),
  publicAddress,
  rooms: {
    plaza: defineRoom(PlazaRoom),
    fishing: defineRoom(FishingRoom),
    mine: defineRoom(MineRoom),
    office: defineRoom(OfficeRoom),
    // Una stanza per canale: chi chiede lo stesso canale finisce nella stessa stanza.
    chat: defineRoom(ChatRoom).filterBy(['channel']),
  },
  greet: false,
})

await server.listen(port)
console.log(`Game server in ascolto su ws://localhost:${port}${redisUrl ? ' (Redis)' : ''}`)
