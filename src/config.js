// Indirizzi dei servizi del backend. In locale girano sulle porte di default,
// in produzione si impostano VITE_API_URL e VITE_GAME_URL al build.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
export const GAME_URL = import.meta.env.VITE_GAME_URL ?? 'ws://localhost:2567'
