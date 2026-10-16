import { Hono, type Context } from 'hono'
import { cors } from 'hono/cors'
import { csrf } from 'hono/csrf'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { auth } from './auth.ts'
import { env, isAllowedOrigin } from './env.ts'
import { fishingLeaderboard } from './fishing.ts'
import { buy, craft, equip, InventoryError, inventoryOf, runDungeon, sellFish, sellItems } from './inventory.ts'
import { leaderboard } from './leaderboard.ts'
import { mineBoard } from './mine.ts'
import { cancelMission, completeMission, drinkCoffee, missionOf, officeBoard, takeMission } from './office.ts'

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

// La classifica della città: i punti di tutti i giochi, della settimana e di sempre. Pubblica: la
// mostrano il cartellone e il timone della dev-ship.
app.get('/api/leaderboard', async (c) => c.json(await leaderboard()))
// Classifica della zona di pesca (oggi, settimana, sempre) e ultime catture: pubblica, la vede
// anche chi non è entrato.
app.get('/api/fishing/leaderboard', async (c) => c.json(await fishingLeaderboard()))
// Il cartellone della miniera: classifica delle scoperte (oggi, settimana, sempre) e le ultime.
app.get('/api/mine/leaderboard', async (c) => c.json(await mineBoard()))
// La bacheca delle missioni dell'ufficio: da fare, in corso e consegnate da poco.
app.get('/api/office/board', async (c) => c.json(await officeBoard()))

// Inventario, monete ed equipaggiamento: solo da loggati, ognuno il suo.
// csrf: i form di altri siti (che il browser manda col cookie) non passano, il fetch in JSON sì.
const SellInput = z.object({ ids: z.array(z.number().int().positive()).min(1).max(1000) })
// id del catalogo → quanti, per pietre, minerali e gemme.
const SellItemsInput = z.object({
  items: z.record(z.string().max(40), z.number().int().min(1).max(100_000)).refine((o) => Object.keys(o).length > 0 && Object.keys(o).length <= 20),
})
const BuyInput = z.object({ itemId: z.string().max(40) })
const EquipInput = z.object({ slot: z.enum(['hat', 'color', 'weapon', 'armor', 'rod', 'pickaxe']), itemId: z.string().max(40).nullable() })
const CraftInput = z.object({ recipeId: z.string().max(40) })
const TakeMissionInput = z.object({ id: z.number().int().positive() })
const CoffeeInput = z.object({ coffeeId: z.string().max(40) })

app.use('/api/inventory/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/shop/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/dungeon/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/office/mission/*', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
app.use('/api/office/coffee', csrf({ origin: (origin) => isAllowedOrigin(origin) }))
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
app.use('/api/office/mission', signedIn)
app.use('/api/office/mission/*', signedIn)
app.use('/api/office/coffee', signedIn)

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
app.post('/api/inventory/sell-items', async (c) => {
  const input = await body(c, SellItemsInput)
  return input ? c.json(await sellItems(c.get('userId'), input.items)) : invalid(c)
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

// La propria missione dell'ufficio: quella in corso (o null) e fino a quando non se ne può prendere
// un'altra dopo averne annullata una. Le azioni restituiscono anche la bacheca aggiornata.
app.get('/api/office/mission', async (c) => c.json(await missionOf(c.get('userId'))))
app.post('/api/office/mission/take', async (c) => {
  const input = await body(c, TakeMissionInput)
  return input ? c.json(await takeMission(c.get('userId'), input.id)) : invalid(c)
})
app.post('/api/office/mission/cancel', async (c) => c.json(await cancelMission(c.get('userId'))))
app.post('/api/office/mission/complete', async (c) => c.json(await completeMission(c.get('userId'))))
// Un caffè alla macchinetta dell'ufficio: la risposta è l'inventario, col caffè in circolo.
app.post('/api/office/coffee', async (c) => {
  const input = await body(c, CoffeeInput)
  return input ? c.json(await drinkCoffee(c.get('userId'), input.coffeeId)) : invalid(c)
})

console.log(`API in ascolto su http://localhost:${env.PORT}`)

export default { port: env.PORT, fetch: app.fetch }
