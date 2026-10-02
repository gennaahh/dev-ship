import { Hono } from 'hono'
import { cors } from 'hono/cors'

const port = Number(process.env.PORT ?? 3000)
// Per ora qualsiasi origine: il frontend gira su Vite in locale o da disco.
// Va ristretto al dominio del frontend prima del deploy.
const origin = process.env.CORS_ORIGIN ?? '*'

const app = new Hono()

app.use('*', cors({ origin }))

// Healthcheck: il frontend lo interroga per mostrare lo stato online/offline.
app.get('/health', (c) => c.json({ status: 'ok', uptime: Math.round(process.uptime()) }))

console.log(`API in ascolto su http://localhost:${port}`)

export default { port, fetch: app.fetch }
