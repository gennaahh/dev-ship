// La macchinetta del caffè dell'ufficio: si paga in monete e dà un piccolo aiuto per un po'.
// Un caffè alla volta: berne un altro prende il posto di quello di prima. Lo compra l'API
// (apps/api/src/office.ts) e lo salva in player_coffee; lo leggono il game server, per i tempi e
// la fortuna al lago e in miniera (si somma a canna e piccone, dalla prossima attesa), e l'API
// per il dungeon. Il bilanciamento: bun packages/shared/scripts/coffee-balance.ts
//
// speed: quanto si accorcia l'attesa al lago e in miniera (0.1: il 10% in meno); luck: quanto
// diventano più probabili pesci speciali e scoperte rare (0.3: il 30% in più); dungeon: per la
// prossima run, i danni in più a ogni colpo e i punti vita in più (numeri fissi, non percentuali:
// si capiscono subito e aiutano anche chi non ha armi). Un caffè per il dungeon vale una run sola:
// entrando si beve tutto.
//
// I prezzi: chi pesca e scava insieme (due schede) va più o meno in pari, chi fa una cosa sola ci
// perde un po'. Così il caffè è una scelta, non un guadagno fisso da tenere sempre acceso, e toglie
// monete dal gioco. Il ginseng non va mai in perdita, in media: rende di più a chi ha armi buone.
export type Coffee = {
  id: string
  name: string
  // Una riga di presentazione, per il menu della macchinetta.
  blurb: string
  price: number
  minutes: number
  speed: number
  luck: number
  dungeon?: { damage: number; hp: number }
  // Il colore del caffè nella tazza, per le icone.
  color: string
  // Tazzina, tazza grande o bicchiere.
  cup: 'small' | 'big' | 'glass'
}

export const COFFEES: Coffee[] = [
  { id: 'espresso', name: 'Espresso', blurb: 'Il classico: corto, caldo e subito al lavoro.', price: 6, minutes: 60, speed: 0.1, luck: 0, color: '#5a3a22', cup: 'small' },
  { id: 'americano', name: 'Caffè americano', blurb: 'Lungo lungo: dura tutta la giornata, ma è più leggero.', price: 12, minutes: 240, speed: 0.05, luck: 0, color: '#7a4a2a', cup: 'big' },
  { id: 'cappuccino', name: 'Cappuccino', blurb: 'Col cuore nella schiuma: porta fortuna.', price: 6, minutes: 60, speed: 0, luck: 0.4, color: '#d9b48a', cup: 'big' },
  { id: 'marocchino', name: 'Marocchino', blurb: 'Espresso, cacao e schiuma: un po\' di tutto.', price: 12, minutes: 60, speed: 0.1, luck: 0.4, color: '#8a5a3a', cup: 'glass' },
  { id: 'ginseng', name: 'Caffè al ginseng', blurb: 'Per affrontare i bug: vale per la prossima run nel dungeon.', price: 20, minutes: 120, speed: 0, luck: 0, dungeon: { damage: 3, hp: 20 }, color: '#c9935a', cup: 'small' },
  { id: 'decaf', name: 'Decaffeinato', blurb: 'Non fa niente, ma col caffè in mano si chiacchiera meglio.', price: 1, minutes: 30, speed: 0, luck: 0, color: '#6b4a3a', cup: 'small' },
]
export const coffee = (id: string | null | undefined) => COFFEES.find((c) => c.id === id) ?? null
