# ADR 0001: Stack del backend

- **Stato:** accettato (con decisioni aperte, vedi sotto)
- **Data:** 2026-10-02
- **Board:** `tasks/backend.tsk.json`, card "Decidere lo stack del backend"

## Contesto

Dev City oggi è solo frontend: una SPA Vue 3 costruita con Vite e Bun, pubblicata su Netlify come un unico `index.html`. I dati che mostra, come la classifica della settimana, sono finti.

Il gioco deve diventare multigiocatore. Servono:

- giocatori e account;
- inventario e oggetti;
- valuta e acquisti;
- gilde, party e amici;
- partite e storico delle partite;
- achievement e classifiche;
- permessi e dati di amministrazione;
- report e analytics;
- lobby in tempo reale;
- chat globale e di area (un canale per ogni luogo della città);
- dungeon da giocare in gruppo, in tempo reale.

Il backend deve essere in JavaScript/TypeScript, lo stesso linguaggio del frontend.

### Cosa conta nella scelta

1. **Dati economici corretti.** Valuta, acquisti e bottino richiedono transazioni ACID e un registro dei movimenti che non si possa alterare.
2. **Server autoritativo per i dungeon.** Più giocatori condividono lo stato di una run, quindi il server simula e il client invia solo input.
3. **Stanze realtime di più tipi**: party, lobby, dungeon e canali di chat, con riconnessione e spostamento del gruppo da una stanza all'altra.
4. **Tipi condivisi** tra frontend, API e server di gioco.
5. **Poca infrastruttura.** È un progetto di un team piccolo: pochi servizi, tutti avviabili in locale con un solo comando.
6. **Continuità con lo strumento attuale.** Bun è già in uso.

## Opzioni considerate

### A: Bun + Hono + PostgreSQL + Redis, WebSocket nativi di Bun

- **Pro:** stack minimo e veloce, coerente con il frontend. Hono è tipizzato e genera la documentazione OpenAPI.
- **Contro:** stanze, matchmaking, sincronizzazione dello stato, riconnessione e scalabilità su più processi andrebbero scritti da zero. Per i dungeon cooperativi è la parte più difficile, ed è proprio quella che mancherebbe.

### B: Node 22 + NestJS + Prisma + Socket.IO

- **Pro:** struttura imposta (moduli, dependency injection, guard), utile con un team che cresce. Socket.IO ha già stanze e riconnessione.
- **Contro:** pesante e verboso per le dimensioni del progetto. Socket.IO offre stanze di messaggi ma non stato sincronizzato né simulazione: per i dungeon il problema resta lo stesso dell'opzione A.

### C: A + Colyseus per le stanze realtime

- **Pro:** Colyseus è un framework open source (MIT) per server di gioco multigiocatore e offre già quello che serve ai dungeon:
  - stanze autoritative con ciclo di simulazione (`setSimulationInterval`);
  - stato sincronizzato a differenze con `@colyseus/schema`;
  - matchmaking e posti riservati (`matchMaker.reserveSeatFor`), per spostare un gruppo dalla lobby al dungeon;
  - `LobbyRoom` integrata per elencare le stanze aperte;
  - `allowReconnection` per chi perde la connessione per poco;
  - scalabilità su più processi con `@colyseus/redis-presence` e `@colyseus/redis-driver`;
  - SDK client `colyseus.js`, monitor, playground e strumento di test di carico.

  L'API resta leggera come nell'opzione A.
- **Contro:** due servizi invece di uno. È una dipendenza da un framework specifico. Colyseus nasce per Node, e su Bun va verificato (verificato nel prototipo, vedi "Decisioni prese durante il prototipo").

### D: Nakama (o Supabase)

- **Pro:** Nakama copre quasi tutta la lista già pronta: account, amici, gruppi, party, chat, classifiche, wallet, storage e matchmaker. Si estende con moduli TypeScript.
- **Contro:**
  - il server è in Go e il modello dati è il suo: inventario, economia e dungeon andrebbero adattati alle sue astrazioni;
  - il runtime TypeScript non è Node, quindi niente librerie npm arbitrarie;
  - la piattaforma da gestire è più pesante.

  Supabase copre bene account, database e realtime semplice, ma non i dungeon: la logica di gioco va scritta comunque.

## Decisione

Scegliamo l'**opzione C**. Ci sono due servizi TypeScript nello stesso monorepo, che condividono PostgreSQL, Redis e il codice di dominio.

```
                   ┌──────────────────────────┐
                   │  apps/web (Vue, Netlify) │
                   └────────┬────────┬────────┘
              HTTPS / REST  │        │  WebSocket (colyseus.js)
                            ▼        ▼
      ┌─────────────────────────┐  ┌─────────────────────────────────┐
      │ apps/api (Hono)         │  │ apps/game (Colyseus)            │
      │ account, inventario,    │  │ PartyRoom, LobbyRoom,           │
      │ valuta, gilde, storico, │  │ DungeonRoom, ChatRoom           │
      │ classifiche, admin      │  │                                 │
      └──────┬──────────┬───────┘  └──────┬──────────────────┬───────┘
             │          │                 │                  │
             │   packages/domain (servizi di dominio, Drizzle)
             │          │                 │                  │
             ▼          ▼                 ▼                  ▼
      ┌──────────────────────┐    ┌──────────────────────────────────┐
      │ PostgreSQL           │    │ Redis                            │
      │ dati persistenti     │    │ presenza, party, classifiche,    │
      │                      │    │ rate limit, storico chat,        │
      │                      │    │ driver e presence di Colyseus    │
      └──────────────────────┘    └──────────────────────────────────┘
```

### Componenti

| Ambito | Scelta |
| --- | --- |
| Linguaggio | TypeScript ovunque |
| Monorepo | Workspace di Bun: `apps/web`, `apps/api`, `apps/game`, `packages/shared`, `packages/domain` |
| API HTTP | Hono, con OpenAPI generata da `@hono/zod-openapi` |
| Server realtime | Colyseus, con stato in `@colyseus/schema` |
| Runtime del game server | Bun, con `@colyseus/bun-websockets` |
| Database | PostgreSQL |
| ORM e migrazioni | Drizzle |
| Stato effimero e pub/sub | Redis (o Valkey) |
| Validazione e tipi condivisi | Zod, in `packages/shared` |
| Autenticazione | Better Auth: login con codice via email (`emailOTP`), token per le stanze (`jwt`) |
| Client realtime | `colyseus.js`, incapsulato in un composable Vue |

### Chi fa cosa

- **`apps/api`** è l'unico punto d'accesso HTTP. Gestisce login e sessioni, e tutte le letture e scritture fatte dalle schermate (profilo, inventario, negozio, gilde, storico, classifiche, admin, report).
- **`apps/game`** gestisce tutto ciò che vive in una connessione aperta:
  - party (`PartyRoom`);
  - lobby (`LobbyRoom` integrata più una stanza di attesa nostra);
  - dungeon (`DungeonRoom`);
  - canali di chat (`ChatRoom` con `filterBy` sul canale: globale, area, gilda, party).

  Lobby e dungeon usano anche i messaggi interni della propria stanza.
- **`packages/domain`** contiene i servizi che toccano il database: inventario, ledger della valuta, partite, eventi. Li usano sia l'API sia il game server. Alla fine di una run, quindi, il game server salva risultato e ricompense **direttamente in una transazione PostgreSQL**, senza passare via HTTP dall'API. Le regole (saldo mai negativo, idempotenza, audit) sono scritte una volta sola.
- **`packages/shared`** contiene i tipi e gli schemi usati anche dal frontend: schemi Zod delle API e dei messaggi, classi di stato Colyseus, generatore pseudo-casuale con seme (oggi `src/weekRandom.js`).

### Regole che derivano dalla decisione

- **Autenticazione delle stanze.** L'API emette un token di breve durata, che il client passa entrando in una stanza. `onAuth` del game server lo verifica e carica ruolo e permessi. Un ban chiude anche le connessioni aperte.
- **Server autoritativo.** Nei dungeon il client invia solo input, che il server valida. Posizioni, danni e bottino li calcola il server. Ogni messaggio dal client passa da uno schema Zod e da un limite di frequenza.
- **Sequenza tipica:** party → lobby → dungeon. La lobby crea la `DungeonRoom` con `matchMaker` e sposta i membri con i posti riservati. La `DungeonRoom` apre il record in `matches` all'avvio e lo chiude in `onDispose`.
- **Generazione con seme.** Il dungeon si genera da un seme salvato nella partita: server e client costruiscono la stessa mappa senza trasferirla, e una run si può riprodurre per il debug.
- **Classifiche.** Durante la settimana stanno in sorted set Redis. Il lunedì alle 09:00, quando la nave parte, una fotografia va in PostgreSQL e la classifica si azzera.
- **Analytics.** Le operazioni di dominio emettono eventi in una tabella append-only, da cui partono gli aggregati per i report.

### Organizzazione del codice

Tutto vive in un solo repository (monorepo), gestito con i workspace di Bun:

```
apps/
  web/       frontend Vue (l'attuale src/)
  api/       API Hono
  game/      server di gioco Colyseus
packages/
  shared/    schemi Zod, classi di stato Colyseus, generatore con seme
  domain/    servizi di dominio e schema Drizzle
docs/adr/
tasks/
```

Repository separati sono stati scartati, per quattro motivi:

- **`shared` e `domain` sono usati da più app.** In repository separati andrebbero pubblicati come pacchetti npm privati e aggiornati in ogni consumatore: ogni modifica al protocollo diventerebbe più PR e un rilascio.
- **Lo stato Colyseus deve combaciare tra client e server.** Se il client decodifica con una versione dello schema diversa da quella del server, la sincronizzazione si rompe. Nel monorepo lo garantiscono il compilatore e la CI.
- **Le funzionalità attraversano tutti i livelli.** Un nuovo oggetto nel dungeon tocca migrazione, `domain`, `DungeonRoom` e interfaccia: è una sola PR, revisionata e annullabile in blocco.
- **Il team è piccolo.** Una sola CI, un solo `docker-compose`, un solo comando per avviare tutto in locale.

Ogni app resta deployabile da sola:

- **`apps/web`** va su Netlify, con cartella base `apps/web` e un comando ignore che salta il build se non sono cambiati né `apps/web` né `packages/shared`.
- **`apps/api` e `apps/game`** hanno ciascuna il proprio Dockerfile e il proprio deploy.
- **La CI** usa filtri per percorso. Se i tempi crescono si valuta Turborepo, per lanciare build e test solo dei pacchetti toccati.

Il repository oggi si chiama `dev-ship`, ma contiene tutta la città. Il nome va deciso prima di spostare il codice in `apps/` (vedi le decisioni aperte).

## Conseguenze

### Positive

- Lobby e dungeon in gruppo si costruiscono su primitive già pronte e collaudate (stanze, stato sincronizzato, posti riservati, riconnessione), invece di scriverle a mano.
- Un solo linguaggio e un solo insieme di tipi, dal database al client.
- I due servizi scalano separatamente: l'API senza stato, il game server per processi coordinati da Redis.
- La logica economica sta in un solo pacchetto, quindi non può divergere tra API e game server.
- Con il monorepo, una modifica al protocollo o al modello dati arriva insieme a frontend, API e game server, verificata da un'unica CI.

### Negative

- Due servizi da deployare e monitorare invece di uno.
- Colyseus impone il suo modello (stanze, schema, matchmaker): la logica di gioco è legata al framework. Per limitare il problema, la logica di combattimento e di generazione va in funzioni pure, separate dalle classi `Room`.
- Ogni processo Colyseus deve essere raggiungibile dal client al proprio indirizzo pubblico (`publicAddress`). Questo restringe la scelta dell'hosting e rende più delicati i deploy, perché bisogna chiudere con calma le run in corso.
- Il frontend non sarà più un solo file statico che funziona da disco. La modalità demo senza backend va mantenuta di proposito.
- Con il monorepo, deploy e CI vanno configurati per percorso, perché non ogni modifica ricostruisca tutto. Chi ha accesso al repository vede tutto il codice.

## Decisioni aperte

Si prendono durante il prototipo e si registrano in ADR successivi, o aggiornando questo.

| Tema | Opzioni | Come decidere |
| --- | --- | --- |
| Dungeon in tempo reale o a turni | Azione in tempo reale (20–30 tick al secondo, interpolazione e predizione nel client) oppure turni (eventi discreti, niente predizione) | Dal design del gameplay. Cambia carico, complessità del client e hosting. |
| Invio delle email in produzione | Resend, Postmark, Amazon SES | Insieme all'hosting: consegna, costi, dominio mittente. In sviluppo le email finiscono in Mailpit. |
| Job in background | pg-boss (solo PostgreSQL) oppure BullMQ (Redis) | Preferenza per pg-boss se basta, per non legare i job a Redis. |
| Hosting | Fly.io, Railway, Render. Database: Neon, Supabase, Fly Postgres. Redis: Upstash, Fly, Railway | WebSocket persistenti, indirizzo per singolo processo, costi. Netlify resta per il frontend. |
| Nome del repository | Tenere `dev-ship` o rinominarlo (per esempio `dev-city`) | Da decidere prima del passaggio ad `apps/`. Dopo il cambio di nome il sito su Netlify va ricollegato. |

## Decisioni prese durante il prototipo

### Runtime del game server: Bun (2026-10-02)

Era aperta la scelta tra Bun con `@colyseus/bun-websockets` e Node 22 LTS. Il criterio era un prototipo con due giocatori, riconnessione e driver Redis. Con Colyseus 0.18 su Bun 1.4 sono passate tutte le prove:

- due giocatori nella stessa `DungeonRoom` si vedono muovere, con il server che calcola le posizioni a 20 tick al secondo;
- un client che cade (processo ucciso) resta nello stato per 15 secondi e rientra con la stessa sessione;
- con `@colyseus/redis-presence` e `@colyseus/redis-driver`, due processi condividono il matchmaking: client entrati da processi diversi finiscono nella stessa stanza, le stanze nuove si distribuiscono sui processi e la riconnessione funziona passando dall'altro processo;
- se il processo che ospita una stanza muore all'improvviso, dopo circa 4 secondi si entra dall'altro processo, dove nasce la nuova stanza.

Il game server quindi gira su Bun come l'API. Si torna a Node se un aggiornamento di Bun o di Colyseus rompe una di queste prove.

### Niente decoratori per lo stato (2026-10-02)

Tra i contro c'era che `@colyseus/schema` usa i decoratori, da abilitare in TypeScript anche nel frontend. Dalla versione 5 di `@colyseus/schema` (Colyseus 0.18) lo stato si definisce con `schema()` e i costruttori `t.*`, senza decoratori né configurazione del compilatore, con lo stesso formato sul filo. Il prototipo usa questa forma, e il frontend decodifica lo stato senza conoscerne le classi.

### Login con codice via email (2026-10-02)

Si entra solo con l'email: si inserisce l'indirizzo, arriva un codice e lo si digita. Non ci sono password né login con servizi esterni (GitHub, Google).

- **Perché:** non conserviamo password (niente hash da proteggere, niente recupero, niente password riusate), può giocare anche chi non ha un account GitHub, e un codice da digitare funziona da qualsiasi indirizzo, anche dagli altri PC della rete locale, mentre l'OAuth richiede URL di callback registrati.
- **Codice invece di link magico:** si legge sul telefono e si digita sul PC, e non viene consumato dai filtri antispam che aprono i link.
- **È un solo fattore:** chi controlla la casella email entra. Per un gioco è adeguato.
- **Regole:** codice di 6 cifre, valido 10 minuti, usabile una volta, salvato come hash; pochi tentativi per codice e limiti alle richieste per email e per IP; la risposta non rivela se un indirizzo è registrato.
- **Dopo il login** non cambia niente: sessione sull'API e token breve per entrare nelle stanze Colyseus.

Un login con GitHub o altri servizi si può aggiungere più avanti come opzione, senza cambiare il resto.

### Libreria di autenticazione: Better Auth (2026-10-02)

Era aperta la scelta tra Better Auth e sessioni e codici scritti da noi. Better Auth copre il flusso deciso sopra con due plugin:

- `emailOTP`: codice di 6 cifre, scadenza, numero di tentativi, codice salvato come hash e rate limit per IP sono opzioni;
- `jwt`: dopo il login l'API emette su `/api/auth/token` un JWT di 15 minuti con l'id e il nome del giocatore, e pubblica le chiavi su `/api/auth/jwks`. Il game server lo verifica in `onAuth` con le sole chiavi pubbliche (libreria `jose`), senza database né segreti condivisi.

Sessioni, scadenze, logout e protezione dalle richieste di altre origini sono già pronti. Le tabelle (`user`, `session`, `account`, `verification`, `jwks`) le genera Better Auth come schema Drizzle. Il prototipo ha verificato login, codice sbagliato, codice riusato, limite di tentativi e di richieste, e l'ingresso nella stanza: senza token, con un token inventato o con il nome modificato si viene rifiutati.

In sviluppo frontend e API stanno sullo stesso host (localhost o l'IP della rete locale), quindi il cookie di sessione è dello stesso sito. In produzione, con il frontend su Netlify, l'API va messa su un sottodominio dello stesso dominio del frontend, perché i browser bloccano sempre di più i cookie tra siti diversi; altrimenti si passa al plugin `bearer`, con il token di sessione nel client.

## Quando rivedere questa decisione

- Se il prototipo mostra che Colyseus non regge il tipo di gameplay scelto.
- Se servono funzioni da piattaforma (matchmaking per bravura, tornei, cross-play) che Nakama darebbe già pronte.
- Se il carico dell'analytics su PostgreSQL diventa un problema: si valuta un database analitico separato (es. ClickHouse), senza cambiare il resto.
- Se nascono team con tempi di rilascio diversi, o una parte deve diventare open source o restare riservata: si valuta di staccare quell'app dal monorepo.
