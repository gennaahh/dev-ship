import { createAuthClient } from 'better-auth/vue'
import { emailOTPClient } from 'better-auth/client/plugins'
import { API_URL } from './config.js'

// Client di Better Auth: login con codice via email, sessione e token per le stanze.
// La sessione sta in un cookie dell'API, che il browser manda a ogni richiesta.
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [emailOTPClient()],
})

// Come si vede il giocatore: lo stesso nome che l'API mette nel token delle stanze.
export const displayName = (user) => user.name?.trim() || user.email.split('@')[0]

// Token di 15 minuti per entrare nelle stanze del game server.
// Restituisce null se non c'è una sessione, lancia un errore se l'API non risponde.
export async function getRoomToken() {
  const { data, error } = await authClient.$fetch('/token', { method: 'GET' })
  if (error?.status === 401) return null
  if (error) throw new Error(error.message ?? `Token non disponibile (${error.status})`)
  return data.token
}
