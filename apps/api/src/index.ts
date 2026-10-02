import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { auth } from './auth.ts'
import { env, isAllowedOrigin } from './env.ts'

const app = new Hono()

// Il frontend sta su un'altra origine e manda il cookie di sessione: CORS con credenziali,
// solo per le origini ammesse (vedi env.ts).
app.use(
  '*',
  cors({
    origin: (origin) => (isAllowedOrigin(origin) ? origin : null),
    credentials: true,
  }),
)

// Healthcheck: il frontend lo interroga per mostrare lo stato online/offline.
app.get('/health', (c) => c.json({ status: 'ok', uptime: Math.round(process.uptime()) }))

// Login, sessione, logout e token per le stanze: tutto gestito da Better Auth.
app.on(['GET', 'POST'], '/api/auth/*', (c) => auth.handler(c.req.raw))

console.log(`API in ascolto su http://localhost:${env.PORT}`)

export default { port: env.PORT, fetch: app.fetch }
