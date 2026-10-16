// Novità mostrate sul cartellone, dalla più recente. Va aggiornato a ogni modifica visibile:
// si aggiunge una voce in cima al giorno giusto (o un nuovo giorno in testa alla lista).
// tag: 'new' per le novità, 'fix' per le correzioni, 'docs' per documentazione e piani.
// backend: true per le novità che senza backend non si vedono: in modalità demo sono nascoste.
import { BACKEND_ENABLED } from '../config.js'

export const CHANGELOG = [
  {
    date: '2026-10-16',
    items: [
      { tag: 'new', text: 'Tre cappelli nuovi nello shop della piazza, col cartellino NOVITÀ: il cappellino arcobaleno con l\'elica che gira, il berretto da capitano e il cappello da mago.' },
      { tag: 'new', backend: true, text: 'Al lago, da seduti, un clic sul prato o su un\'altra sedia chiede prima conferma: "Annulla" resta a pescare, "Alzati" lascia la sedia. Niente più pesche interrotte per sbaglio.' },
    ],
  },
  {
    date: '2026-10-15',
    items: [
      { tag: 'new', backend: true, text: 'Inventario! In alto a destra c\'è il proprio personaggio con nome e monete d\'oro: un clic (o il tasto I) apre l\'inventario, coi pesci presi, i cappelli, i colori e cosa si indossa.' },
      { tag: 'new', backend: true, text: 'I pesci presi finiscono nell\'inventario, ognuno col suo peso (anche quelli presi finora), e si vendono: 1 moneta d\'oro per chilo, il triplo per i pesci speciali da 5 kg in su. In classifica restano.' },
      { tag: 'new', backend: true, text: 'Allo shop della piazza si compra davvero: colori e cappelli si pagano con le monete e si indossano subito. Tutti li vedono, in piazza e al lago.' },
      { tag: 'new', backend: true, text: 'Si entra con GitHub: un clic su "Accedi con GitHub" e si torna in città già dentro. Niente più codici via email.' },
    ],
  },
  {
    date: '2026-10-07',
    items: [
      { tag: 'new', backend: true, text: 'Primo gioco: la pesca! Nella zona di pesca si cammina fino a una delle 10 sedie attorno al lago, ci si siede e si aspetta: dopo 10-20 minuti abbocca, e 3 volte su 4 il pesce resta all\'amo. 10 punti per chilo.' },
      { tag: 'new', backend: true, text: 'I pesci da 5 kg in su (uno su dieci) si festeggiano a tutto schermo, e li vedono tutti quelli al lago.' },
      { tag: 'new', backend: true, text: 'Attorno al lago ci si vede passeggiare e si chiacchiera come in piazza, coi fumetti sopra la testa (anche da seduti).' },
      { tag: 'new', text: 'La zona di pesca è nuova, vista dall\'alto: un lago con spiaggetta, anatre, ninfee e falò in mezzo a un grande prato, e un cartellone che alterna la classifica di oggi, della settimana e di sempre con gli ultimi pesci presi.' },
    ],
  },
  {
    date: '2026-10-02',
    items: [
      { tag: 'new', text: 'Il pannello dentro i luoghi resta aperto 2 secondi all\'ingresso, poi si rimpicciolisce sul nome: si riapre passandoci sopra col mouse (o col +).' },
      { tag: 'new', text: 'In alto a destra il pulsante per mettere e togliere lo schermo intero.' },
      { tag: 'new', backend: true, text: 'Chat: si scrive cliccandoci o premendo Invio. In città è quella di tutti (in alto a sinistra), dentro ogni luogo ha la sua (in basso a sinistra). Col cartellone zoomato si ripiega da sola.' },
      { tag: 'new', backend: true, text: 'In piazza si vedono gli altri giocatori: chi scrive ha i puntini sopra la testa, poi compare il fumetto col messaggio.' },
      { tag: 'new', text: 'La piazza vista dalla città è più viva: fontana, bandierine, palloncini allo shop, panchina, fioriera e piccioni.' },
      { tag: 'new', text: 'La piazza sotto al cartellone si visita: vista dall\'alto come in Club Penguin, si cammina cliccando dove andare.' },
      { tag: 'new', text: 'In piazza c\'è lo shop: si provano colori e cappelli sul proprio personaggio (comprare arriverà con le monete).' },
      { tag: 'new', text: 'Personaggi nuovi, più carini: occhioni, guance rosa, camminata a papera e cappelli.' },
      { tag: 'new', text: 'Il pannello dentro gli edifici si ripiega con il pulsante −.' },
      { tag: 'new', text: 'Doppio clic sull\'etichetta Dev-ship del cartellone: la dev-ship a schermo intero (Esc per uscire).' },
      { tag: 'new', backend: true, text: 'Si entra con l\'email: arriva un codice di 6 cifre, niente password (in basso al centro, "Accedi").' },
      { tag: 'new', backend: true, text: 'Nel dungeon si gioca insieme solo da loggati, ognuno con il proprio nome.' },
      { tag: 'new', backend: true, text: 'Nel dungeon ci si vede muovere tra giocatori (prototipo multigiocatore, WASD o frecce).' },
      { tag: 'new', backend: true, text: 'In basso al centro, di fianco all\'accesso, le spie del backend: una per l\'API e una per il server di gioco.' },
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
