// Indirizzi dei servizi del backend. Di default stanno sullo stesso host da cui si apre la
// pagina: localhost in locale, l'IP del PC quando la si apre da un altro PC della rete
// (bun run dev:lan). Aperta da disco non c'è host e si usa localhost.
// In produzione si impostano VITE_API_URL e VITE_GAME_URL al build.
const host = location.hostname || 'localhost'

// Modalità demo: il build di produzione senza VITE_API_URL e VITE_GAME_URL (oggi il sito
// su Netlify, o il file aperto da disco) non ha backend. Niente spie, login né multigiocatore:
// la città resta quella statica. In sviluppo il backend è sempre attivo.
export const BACKEND_ENABLED =
  import.meta.env.DEV || Boolean(import.meta.env.VITE_API_URL && import.meta.env.VITE_GAME_URL)

export const API_URL = import.meta.env.VITE_API_URL ?? `http://${host}:3000`
export const GAME_URL = import.meta.env.VITE_GAME_URL ?? `ws://${host}:2567`
