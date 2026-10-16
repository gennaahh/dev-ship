import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { auth } from './auth.ts'
import { env, isAllowedOrigin } from './env.ts'
import { fishingLeaderboard } from './fishing.ts'
import { buy, craft, equip, InventoryError, inventoryOf, runDungeon, sellFish } from './inventory.ts'

const app = new Hono<{ Variables: { userId: string } }>()

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

// Classifica della zona di pesca (oggi, settimana, sempre) e ultime catture: pubblica, la vede
// anche chi non è entrato.
app.get('/api/fishing/leaderboard', async (c) => c.json(await fishingLeaderboard()))

// Inventario, monete ed equipaggiamento: solo da loggati, ognuno il suo.
// csrf: i form di altri siti (che il browser manda col cookie) non passano, il fetch in JSON sì.
const SellInput = z.object({ ids: z.array(z.number().int().positive()).min(1).max(1000) })
const BuyInput = z.object({ itemId: z.string().max(40) })
const EquipInput = z.object({ slot: z.enum(['hat', 'color']), itemId: z.string().max(40).nullable() })
const CraftInput = z.object({ recipeId: z.string().max(40) })

app.use('/api/inventory/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/shop/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/dungeon/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
const signedIn = async (c: Context, next: () => Promise<void>) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Serve il login.' }, 401)
  c.set('userId', session.user.id)
  await next()
}
app.use('/api/inventory', signedIn)
app.use('/api/inventory/*', signedIn)
app.use('/api/shop/*', signedIn)
app.use('/api/dungeon/*', signedIn)

// Il corpo della richiesta, validato: se non va bene risponde 400 e restituisce null.
async function body<T>(c: Context, schema: z.ZodType<T>) {
  const parsed = schema.safeParse(await c.req.json().catch(() => null))
  return parsed.success ? parsed.data : null
}
app.onError((e, c) => {
  if (e instanceof InventoryError) return c.json({ error: e.message }, e.status)
  if (e instanceof HTTPException) return e.getResponse()
  console.error(e)
  return c.json({ error: 'Qualcosa è andato storto.' }, 500)
})
const invalid = (c: Context) => c.json({ error: 'Richiesta non valida.' }, 400)

app.get('/api/inventory', async (c) => c.json(await inventoryOf(c.get('userId'))))
app.post('/api/inventory/sell', async (c) => {
  const input = await body(c, SellInput)
  return input ? c.json(await sellFish(c.get('userId'), input.ids)) : invalid(c)
})
app.post('/api/inventory/equip', async (c) => {
  const input = await body(c, EquipInput)
  return input ? c.json(await equip(c.get('userId'), input.slot, input.itemId)) : invalid(c)
})
app.post('/api/inventory/craft', async (c) => {
  const input = await body(c, CraftInput)
  return input ? c.json(await craft(c.get('userId'), input.recipeId)) : invalid(c)
})
app.post('/api/shop/buy', async (c) => {
  const input = await body(c, BuyInput)
  return input ? c.json(await buy(c.get('userId'), input.itemId)) : invalid(c)
})

// Una run nel dungeon con un ticket: la risposta ha la run da guardare e l'inventario già aggiornato.
app.post('/api/dungeon/run', async (c) => c.json(await runDungeon(c.get('userId'))))

console.log(`API in ascolto su http://localhost:${env.PORT}`)

export default { port: env.PORT, fetch: app.fetch }
