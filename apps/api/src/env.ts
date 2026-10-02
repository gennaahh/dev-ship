import { z } from 'zod'

// Configurazione dell'API, validata all'avvio: se manca qualcosa il processo si ferma subito
// con un errore chiaro. I default valgono per lo sviluppo locale (docker-compose.yml).
const isProduction = process.env.NODE_ENV === 'production'
// Obbligatoria in produzione, con un default solo in sviluppo.
const devOnly = (schema: z.ZodString, fallback: string) =>
  isProduction ? schema : schema.default(fallback)

const Env = z.object({
  PORT: z.coerce.number().default(3000),
  // Indirizzo pubblico dell'API: emittente dei token e base delle rotte di Better Auth.
  API_URL: z.url().default('http://localhost:3000'),
  // Origini del frontend ammesse, separate da virgola. Senza, in sviluppo vale qualsiasi
  // pagina servita sulla porta di Vite (localhost o IP della rete locale con dev:lan).
  WEB_ORIGINS: z.string().optional(),
  DATABASE_URL: devOnly(z.string(), 'postgres://devcity:devcity@localhost:5432/devcity'),
  // Chiave per firmare i cookie di sessione e cifrare le chiavi dei token.
  BETTER_AUTH_SECRET: devOnly(z.string().min(32), 'sviluppo-locale-non-usare-in-produzione-0000'),
  SMTP_URL: devOnly(z.string(), 'smtp://localhost:1025'),
  MAIL_FROM: z.string().default('Dev City <noreply@devcity.local>'),
})

const parsed = Env.safeParse(process.env)
if (!parsed.success) {
  console.error('Configurazione dell\'API non valida:\n' + z.prettifyError(parsed.error))
  process.exit(1)
}
export const env = parsed.data

const webOrigins = env.WEB_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean)
const VITE_ORIGIN = /^http:\/\/[^/]+:5173$/

export function isAllowedOrigin(origin: string | undefined | null): origin is string {
  if (!origin) return false
  return webOrigins ? webOrigins.includes(origin) : !isProduction && VITE_ORIGIN.test(origin)
}
