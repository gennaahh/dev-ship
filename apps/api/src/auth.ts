import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { emailOTP, jwt } from 'better-auth/plugins'
import { db } from './db/index.ts'
import * as schema from './db/schema.ts'
import { env, isAllowedOrigin } from './env.ts'
import { sendLoginCode } from './mail.ts'

// Chi si vede nelle stanze: il nome del profilo o, finché non c'è, la parte prima della @.
export const displayName = (user: { name?: string | null; email: string }) =>
  user.name?.trim() || user.email.split('@')[0]

// Login solo con codice via email (docs/adr/0001-stack-backend.md, "Login con codice via email").
export const auth = betterAuth({
  baseURL: env.API_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  // Le richieste arrivano dal frontend, che sta su un'altra origine.
  trustedOrigins: (request) => {
    const origin = request?.headers.get('origin')
    return isAllowedOrigin(origin) ? [origin] : []
  },
  // Attivo anche in sviluppo (di default lo è solo in produzione), per vederlo funzionare.
  // I contatori stanno in memoria: con più processi dell'API andranno su Redis.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      // Al massimo 3 codici al minuto per IP.
      '/email-otp/send-verification-otp': { window: 60, max: 3 },
      // Qualche errore di battitura è normale: contro chi tira a indovinare ci sono i
      // 5 tentativi per codice.
      '/sign-in/email-otp': { window: 60, max: 10 },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5,
      storeOTP: 'hashed',
      // Senza await, come consiglia Better Auth: la risposta non deve dire, coi suoi tempi,
      // se l'email è partita o no.
      sendVerificationOTP: async ({ email, otp }) => {
        sendLoginCode(email, otp).catch((e) => console.error('Invio del codice non riuscito:', e))
      },
    }),
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
