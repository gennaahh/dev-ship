// Aspetto dei personaggi: il "look" è un oggetto semplice, pronto per la personalizzazione
// (salvarlo sull'account, comprarne i pezzi allo shop). Per ora: colore del corpo e cappello.
// Ogni nuovo pezzo (occhiali, accessori, ...) sarà un'altra chiave, null = niente.

export const COLORS = [
  { id: 'azzurro', name: 'Azzurro', value: '#4fc3f7', price: 0 },
  { id: 'corallo', name: 'Corallo', value: '#ff7a59', price: 50 },
  { id: 'menta', name: 'Menta', value: '#9ccc65', price: 50 },
  { id: 'sole', name: 'Sole', value: '#ffca28', price: 50 },
  { id: 'lilla', name: 'Lilla', value: '#ba68c8', price: 50 },
  { id: 'rosa', name: 'Rosa', value: '#f06292', price: 50 },
  { id: 'acqua', name: 'Acquamarina', value: '#4db6ac', price: 50 },
  { id: 'notte', name: 'Notte', value: '#5c6bc0', price: 80 },
]

export const HATS = [
  { id: 'beanie', name: 'Cuffia col pon pon', price: 80 },
  { id: 'cap', name: 'Cappellino', price: 100 },
  { id: 'chef', name: 'Cappello da cuoco', price: 120 },
  { id: 'headphones', name: 'Cuffie da focus', price: 150 },
  { id: 'pirate', name: 'Tricorno da pirata', price: 250 },
  { id: 'crown', name: 'Corona', price: 500 },
]

export const DEFAULT_LOOK = { color: COLORS[0].value, hat: null }

// Colore stabile per un nome: finché non ci si personalizza, ognuno ha sempre il suo.
export function colorFor(name) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0
  return COLORS[Math.abs(h) % COLORS.length].value
}
