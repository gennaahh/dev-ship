// Novità mostrate sul cartellone, dalla più recente. Va aggiornato a ogni modifica visibile:
// si aggiunge una voce in cima al giorno giusto (o un nuovo giorno in testa alla lista).
// tag: 'new' per le novità, 'fix' per le correzioni, 'docs' per documentazione e piani.
// backend: true per le novità che senza backend non si vedono: in modalità demo sono nascoste.
import { BACKEND_ENABLED } from '../config.js'

export const CHANGELOG = [
  {
    date: '2026-10-16',
    items: [
      { tag: 'new', text: 'Le barre di scorrimento sono disegnate come il resto della città, coi colori di dove stanno: arancioni nell\'inventario, viola nel personaggio, gialle in chat e sul cartellone, chiare sul sughero della bacheca e così via. Anche su Safari e Firefox.' },
      { tag: 'fix', text: 'Niente più emoji: monete, cuori, spade, scudi, medaglie, frecce e tutti gli altri simboli sono icone disegnate apposta, uguali su ogni browser e sistema.' },
      { tag: 'new', text: 'Il cartellino BOZZA sui pannelli dei luoghi non c\'è più: ormai sono tutti aperti.' },
      { tag: 'new', backend: true, text: 'Il museo è aperto! Ci si cammina e si chiacchiera come in piazza. Sulla parete c\'è l\'albo dei capitani: ogni lunedì il podio della settimana prima diventa un quadro, col primo al timone della dev-ship e gli altri due ai lati, vestiti com\'erano quella settimana. Gli ultimi tre sono appesi con la targhetta; un clic e ci si avvicina per vederli tutti. Le stelle sulla cornice sono le vittorie del capitano.' },
      { tag: 'new', backend: true, text: 'Al museo c\'è anche la bacheca dei trofei: per ora è vuota, aspetta i trofei per le imprese della città.' },
      { tag: 'new', text: 'Il museo nuovo si vede anche nella demo, con l\'albo della squadra finta.' },
      { tag: 'new', backend: true, text: 'La classifica del cartellone è vera! Somma i punti di tutti i giochi della settimana (da lunedì): la pesca 10 punti per chilo, la miniera 5 per ogni moneta di quello che si stacca (anche le pietre), il dungeon 10 per ondata superata e 40 per ogni boss, le missioni dell\'ufficio 2 per moneta del premio. Un\'ora al lago o in miniera vale più o meno uguale. I punti fatti finora con pesci, scoperte e missioni ci sono già.' },
      { tag: 'new', backend: true, text: 'Sul podio del cartellone ci sono i personaggi col loro look, e nella lista i punti gioco per gioco.' },
      { tag: 'new', backend: true, text: 'I primi tre della settimana sono al timone della dev-ship: mentre la nave naviga, ogni minuto si zooma sul ponte per 15 secondi, col primo alla ruota e gli altri due ai lati.' },
      { tag: 'new', text: 'Al timone della dev-ship c\'è chi è in testa alla classifica (nella demo la squadra finta).' },
      { tag: 'new', backend: true, text: 'L\'ufficio è rifatto: si entra, si cammina e si chiacchiera come in piazza, e in mezzo c\'è il tavolo delle riunioni con 8 posti. Clic su una sedia libera per sedersi, uno a testa. La bacheca delle missioni ora è appesa in fondo a sinistra: un clic e ci si avvicina per leggerla.' },
      { tag: 'new', backend: true, text: 'In fondo a destra, su un tavolino, la macchinetta del caffè, con 6 caffè: espresso (6 monete, 1 ora, −10% di attesa al lago e in miniera), americano (12, 4 ore, −5%), cappuccino (6, 1 ora, +40% pesci speciali e scoperte rare), marocchino (12, 1 ora, tutti e due), ginseng (20, per la prossima run nel dungeon: +3 danni a colpo e +20 HP, e il menu fa vedere cosa cambia con la propria arma) e deca (1 moneta, non fa niente ma fa compagnia). Un caffè alla volta, e si somma a canne e picconi.' },
      { tag: 'new', backend: true, text: 'Chi ha un caffè in circolo ha la tazzina sul proprio personaggio in alto a destra e, seduto al tavolo dell\'ufficio, la tazza fumante davanti.' },
      { tag: 'new', text: 'L\'ufficio nuovo si vede anche nella demo, con la squadra al tavolo e il caffè.' },
      { tag: 'new', backend: true, text: 'L\'ufficio è aperto! Sulla bacheca ci sono sempre 4 missioni (due facili, una media e una difficile), col premio già scritto sul foglietto: chi chiede pesci, chi zuppe, minerali, gemme o materiali del dungeon. Appena qualcuno ne prende una ne esce un\'altra, e la bacheca mostra anche chi ci sta lavorando e le ultime fatte. Il premio rende più che vendere, e le difficili una volta su due danno anche un ticket del dungeon.' },
      { tag: 'new', backend: true, text: 'Una missione alla volta: si guarda dalla cartellina in alto a destra (o col tasto M), che si spunta quando nell\'inventario c\'è tutto. Da lì "Completa" consegna e riscuote il premio; "Annulla" la butta, ma per un\'ora non se ne prendono altre.' },
      { tag: 'new', text: 'In ufficio la kanban è diventata la bacheca delle missioni: senza login si guarda soltanto.' },
      { tag: 'new', backend: true, text: 'Canne da pesca e picconi! Nel crafting ci sono due banchi nuovi, con 6 canne (dalla canna di rame a quella del git fetch) e 6 picconi (da quello di pietra a quello del git bisect). Si prendono in mano dalla finestra del personaggio (tasto C): al lago e in miniera si aspetta di meno e le cose rare arrivano più spesso, pesci speciali e scoperte preziose. E tutti vedono che canna o che piccone hai.' },
      { tag: 'new', backend: true, text: 'Il pulsante del crafting in alto a destra ora è un\'incudine col martello, non più la pentola: non si cucina soltanto.' },
      { tag: 'new', backend: true, text: 'La miniera è aperta! Come al lago: si cammina fino a uno degli 8 filoni ai piedi della parete e ci si mette a scavare, uno per filone. Ogni 4-6 minuti si stacca una pietra, ogni 15-25 si trova qualcosa nella roccia: rame, ferro, argento, una pepita d\'oro o una gemma (quarzo, ametista, smeraldo, rubino e, rarissimo, il diamante). Dalla pepita in su si festeggia a tutto schermo, e il cartellone sulla parete fa la classifica dei minatori.' },
      { tag: 'new', backend: true, text: 'Quello che si trova in miniera si vende dall\'inventario (la pietra 1 moneta, il diamante 60) o va nel crafting. Rende più o meno come la pesca: un po\' di più in monete, ma i ticket del dungeon si ripescano solo al lago.' },
      { tag: 'new', backend: true, text: 'Il crafting è rifatto: tre banchi (cucina, armi e armature), e ogni ricetta mostra cosa hai, cosa ti manca e dove si trova. Alla forgia si fanno 6 armi, dalla clava di pietra al debugger di diamante, e 6 armature, dal giubbotto di pelle di bug all\'armatura dell\'uptime, coi metalli e le gemme della miniera e i materiali del dungeon.' },
      { tag: 'new', backend: true, text: 'Armi e armature si indossano dalla finestra del personaggio (tasto C) e contano nel dungeon: l\'arma fa più danni della spada di legno, l\'armatura dà più vita e para una parte dei colpi. Più ondate, più monete e materiali. Si possono anche scambiare.' },
      { tag: 'new', backend: true, text: 'Scambi tra giocatori! In piazza e al lago, tasto destro su un altro giocatore (sul telefono tieni premuto) e "Richiedi scambio". Se accetta, ognuno mette nella sua metà monete, pesci, zuppe, ticket, materiali e cappelli, e poi la doppia conferma: tutti e due "Pronto", poi tutti e due "Conferma scambio". Se uno cambia l\'offerta, le conferme ripartono da capo.' },
      { tag: 'new', backend: true, text: 'Il dungeon è aperto! Si entra con un ticket e 100 HP, e arrivano ondate di bug sempre più forti, con un boss ogni 5 ondate. Va tutto da solo: si guarda la run e basta. I mostri lasciano monete e materiali per le armi e le armature che arriveranno (pelli, zanne, seta, cristalli e due rari dal boss), e si tengono anche quando si perde.' },
      { tag: 'new', backend: true, text: 'Al lago, una volta su 15, insieme al pesce sale una bottiglia: dentro c\'è il ticket per il dungeon. Ticket e materiali stanno nell\'inventario.' },
      { tag: 'new', backend: true, text: 'Crafting! In alto a destra, di fianco allo zainetto, c\'è la pentola (o il tasto R): con 3 pesci si cucina una zuppa di pesce. Il cuoco usa i pesci più leggeri, così quelli grossi e gli speciali restano da vendere. Nel dungeon la zuppa si beve da sola sotto i 50 HP e ne ridà 30: più zuppe, più ondate e più bottino, e rende più che vendere i pesci.' },
      { tag: 'new', text: 'Nel dungeon senza login si può guardare una run di prova, con 3 zuppe e senza premi.' },
      { tag: 'new', backend: true, text: 'I colori del personaggio ora sono tutti gratis: niente più nello shop, si scelgono quando si vuole dalla finestra del personaggio (tasto C). Allo shop restano i cappelli.' },
      { tag: 'new', backend: true, text: 'Personaggio e inventario ora sono due finestre. Il proprio personaggio in alto a destra (o il tasto C) apre la finestra del personaggio, con cosa si indossa e il guardaroba di cappelli e colori; lo zainetto di fianco (o il tasto I) apre l\'inventario, con le monete e i pesci da vendere.' },
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
