// Novità mostrate sul cartellone, dalla più recente. Va aggiornato a ogni modifica visibile:
// si aggiunge una voce in cima al giorno giusto (o un nuovo giorno in testa alla lista).
// tag: 'new' per le novità, 'fix' per le correzioni, 'docs' per documentazione e piani.
// backend: true per le novità che senza backend non si vedono: in modalità demo sono nascoste.
import { BACKEND_ENABLED } from '../config.js'

export const CHANGELOG = [
  {
    date: '2026-10-02',
    items: [
      { tag: 'new', text: 'Doppio clic sull\'etichetta Dev-ship del cartellone: la dev-ship a schermo intero (Esc per uscire).' },
      { tag: 'new', backend: true, text: 'Si entra con l\'email: arriva un codice di 6 cifre, niente password (in basso a sinistra, "Accedi").' },
      { tag: 'new', backend: true, text: 'Nel dungeon si gioca insieme solo da loggati, ognuno con il proprio nome.' },
      { tag: 'new', backend: true, text: 'Nel dungeon ci si vede muovere tra giocatori (prototipo multigiocatore, WASD o frecce).' },
      { tag: 'new', backend: true, text: 'In basso a sinistra le spie del backend: una per l\'API e una per il server di gioco.' },
      { tag: 'new', text: 'Il cartellone ha una terza schermata: questo changelog, scorrevole da vicino.' },
      { tag: 'docs', text: 'Piano del backend: ADR sullo stack e task board.' },
      { tag: 'new', text: 'La città: piazza con cartellone che alterna dev-ship e classifica (demo), zoom al clic.' },
      { tag: 'new', text: 'Attorno alla piazza miniera, dungeon, ufficio, museo e posto di pesca, ognuno con il suo interno.' },
    ],
  },
  {
    date: '2026-09-25',
    items: [
      { tag: 'fix', text: 'Il mare ora passa davanti al porto.' },
      { tag: 'new', text: 'Il venerdì, nei primi 5 minuti di ogni ora, passa l\'aereo "Dai che è venerdì!".' },
      { tag: 'new', text: 'Pterodattilo una volta a settimana e Poseidone il mercoledì pomeriggio.' },
      { tag: 'new', text: 'Meteo casuale ogni giorno: un\'ora di tempesta o di nebbia sul mare.' },
      { tag: 'new', text: 'Dopo le 18 l\'equipaggio riposa sul ponte sotto le stelle.' },
      { tag: 'new', text: 'Fuori orario la nave resta in porto: gru, container e riparazioni allo scafo.' },
      { tag: 'new', text: 'Squali, gabbiani e il Kraken delle 11:11; pausa pranzo dalle 13 alle 14.' },
      { tag: 'docs', text: 'Aggiunto il README.' },
      { tag: 'new', text: 'Prima versione della dev-ship: la settimana come viaggio dal porto alla boa e ritorno.' },
    ],
  },
]

// Le voci da mostrare: senza backend si tolgono quelle backend (e i giorni rimasti vuoti).
export const VISIBLE_CHANGELOG = CHANGELOG.map((day) => ({
  ...day,
  items: day.items.filter((item) => BACKEND_ENABLED || !item.backend),
})).filter((day) => day.items.length)
