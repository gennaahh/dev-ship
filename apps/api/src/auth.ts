import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { jwt } from 'better-auth/plugins'
import { db } from './db/index.ts'
import * as schema from './db/schema.ts'
import { env, isAllowedOrigin } from './env.ts'

// Chi si vede nelle stanze: il nome del profilo o, finché non c'è, la parte prima della @.
export const displayName = (user: { name?: string | null; email: string }) =>
  user.name?.trim() || user.email.split('@')[0]

// Login solo con GitHub (docs/adr/0001-stack-backend.md, "Login con GitHub").
export const auth = betterAuth({
  baseURL: env.API_URL,
  secret: env.BETTER_AUTH_SECRET,
  // In produzione il frontend fa da proxy all'API: stessa origine, cookie di prima parte.
  ...(process.env.NODE_ENV === 'production' && {
    advanced: {
      // Dietro il proxy di Railway l'IP del client arriva in X-Forwarded-For: senza, il rate
      // limit userebbe un solo contatore per tutti.
      ipAddress: { ipAddressHeaders: ['x-forwarded-for'] },
    },
  }),
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // Le richieste arrivano dal frontend, che sta su un'altra origine.
  trustedOrigins: (request) => {
    const origin = request?.headers.get('origin')
    return isAllowedOrigin(origin) ? [origin] : []
  },
  socialProviders: {
    github: { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_CLIENT_SECRET },
  },
  // Attivo anche in sviluppo (di default lo è solo in produzione), per vederlo funzionare.
  // I contatori stanno in memoria: con più processi dell'API andranno su Redis.
  rateLimit: { enabled: true, window: 60, max: 100 },
  plugins: [
    // Token breve per entrare nelle stanze del game server, che lo verifica con le chiavi
    // pubbliche esposte su /api/auth/jwks.
    jwt({
      jwt: {
        issuer: env.API_URL,
        audience: 'dev-city-game',
        expirationTime: '15m',
        definePayload: ({ user }) => ({ name: displayName(user) }),
      },
    }),
  ],
})
