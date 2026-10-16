// Aspetto dei personaggi: il "look" è un oggetto semplice, { color, hat }, col colore del corpo
// (un valore CSS) e l'id del cappello. Colori e cappelli, coi prezzi, stanno nel catalogo
// condiviso con l'API (packages/shared/src/catalog.ts); cosa indossa ognuno lo salva l'API.
// Ogni nuovo pezzo (occhiali, accessori, ...) sarà un'altra chiave, null = niente.
import { COLORS, HATS } from '@dev-city/shared/catalog'

export { COLORS, HATS }

export const DEFAULT_LOOK = { color: COLORS[0].value, hat: null }

// Colore stabile per un nome: finché non ci si personalizza, ognuno ha sempre il suo.
export function colorFor(name) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0
  return COLORS[Math.abs(h) % COLORS.length].value
}

// Il look di un giocatore da quello che indossa ({ hat, color }: id del catalogo, null o '' =
// niente). Senza colore scelto ha quello del suo nome (o quello di base, senza nome).
export function lookOf(name, equipment = {}) {
  const color = COLORS.find((c) => c.id === equipment.color)?.value ?? (name ? colorFor(name) : DEFAULT_LOOK.color)
  return { color, hat: equipment.hat || null }
}
