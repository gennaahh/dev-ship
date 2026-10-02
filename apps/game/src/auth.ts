import { createRemoteJWKSet, jwtVerify } from 'jose'

// Il token per le stanze lo emette l'API (Better Auth, plugin jwt) e dura 15 minuti.
// Qui basta la chiave pubblica, presa dall'API e tenuta in cache: niente database né segreti.
const API_URL = process.env.API_URL ?? 'http://localhost:3000'
const jwks = createRemoteJWKSet(new URL('/api/auth/jwks', API_URL))

export type PlayerAuth = { userId: string; name: string }

export async function verifyRoomToken(token: string): Promise<PlayerAuth> {
  const { payload } = await jwtVerify(token, jwks, { issuer: API_URL, audience: 'dev-city-game' })
  if (!payload.sub || typeof payload.name !== 'string') throw new Error('Token senza giocatore')
  return { userId: payload.sub, name: payload.name }
}
