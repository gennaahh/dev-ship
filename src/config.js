// Indirizzi dei servizi del backend. Di default stanno sullo stesso host da cui si apre la
// pagina: localhost in locale, l'IP del PC quando la si apre da un altro PC della rete
// (bun run dev:lan). Aperta da disco non c'è host e si usa localhost.
// In produzione si impostano VITE_API_URL e VITE_GAME_URL al build.
const host = location.hostname || 'localhost'

export const API_URL = import.meta.env.VITE_API_URL ?? `http://${host}:3000`
export const GAME_URL = import.meta.env.VITE_GAME_URL ?? `ws://${host}:2567`
