import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint } from 'better-auth/api'
import { setSessionCookie } from 'better-auth/cookies'
import { z } from 'zod'

// Login di sviluppo: si entra scrivendo un nome, senza GitHub. Lo stesso nome è sempre lo
// stesso giocatore (email <nome>@dev.local), con il suo inventario; nomi diversi in finestre
// diverse sono giocatori diversi, per provare il multigiocatore. auth.ts lo aggiunge solo fuori
// dalla produzione, e il controllo qui sotto lo spegne comunque.
const slug = (name: string) =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'dev'

export const devLogin = () =>
  ({
    id: 'dev-login',
    endpoints: {
      signInDev: createAuthEndpoint(
        '/sign-in/dev',
        { method: 'POST', body: z.object({ name: z.string().trim().min(1).max(30) }) },
        async (ctx) => {
          if (process.env.NODE_ENV === 'production') throw new APIError('NOT_FOUND')
          const { name } = ctx.body
          const email = `${slug(name)}@dev.local`
          const users = ctx.context.internalAdapter
          const user =
            (await users.findUserByEmail(email))?.user ??
            (await users.createUser({ email, name, emailVerified: true }, { method: 'dev' }))
          const session = await users.createSession(user.id)
          await setSessionCookie(ctx, { session, user })
          return ctx.json({ user: { id: user.id, name: user.name } })
        },
      ),
    },
  }) satisfies BetterAuthPlugin
