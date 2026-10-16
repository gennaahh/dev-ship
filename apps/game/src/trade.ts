import { validate, type Client, type Delayed, type Room } from '@colyseus/core'
import { isHat, isTradable, itemName } from '@dev-city/shared/catalog'
import { z } from 'zod'
import type { PlayerAuth } from './auth.ts'
import { sql } from './db.ts'

// Gli scambi tra giocatori, nelle stanze in cui ci si vede (piazza, zona di pesca e miniera).
// Col tasto destro su qualcuno gli si chiede uno scambio; se accetta, ognuno mette nella sua
// metà della finestra monete, pesci e oggetti. Poi la doppia conferma: tutti e due "Pronto"
// (le offerte si bloccano), poi tutti e due "Conferma scambio". Ogni cambio di offerta toglie
// le conferme di entrambi. Lo scambio vero e proprio è una transazione sola, qui, che ricontrolla
// tutto: nel frattempo uno può aver venduto, cucinato o speso.

type TradeClient = Client<{ auth: PlayerAuth }>

// Quanto resta in attesa una richiesta, e ogni quanto se ne può mandare una.
const REQUEST_MS = 30_000
const REQUEST_EVERY_MS = 3_000
// Dopo ogni cambio di offerta, quanto aspettare prima di poter dire "Pronto": niente cambi
// furbi all'ultimo secondo.
const READY_DELAY_MS = 3_000

export const OfferInput = z.object({
  gold: z.number().int().min(0).max(1_000_000),
  fish: z.array(z.number().int().positive()).max(200),
  // id del catalogo → quanti (i cappelli 1).
  items: z.record(z.string().max(40), z.number().int().min(1).max(100_000)),
})
type OfferInput = z.infer<typeof OfferInput>
// L'offerta come la vedono tutti e due: i pesci col loro peso.
type Offer = { gold: number; fish: { id: number; weightKg: number }[]; items: Record<string, number> }

type Side = { sessionId: string; userId: string; name: string; offer: Offer; ready: boolean; confirmed: boolean }
// offer: si sceglie (e si dice "Pronto"); confirm: offerte bloccate, si conferma.
type Trade = { sides: [Side, Side]; stage: 'offer' | 'confirm'; changedAt: number; busy: boolean }

// Un errore da far vedere a chi scambia.
class TradeError extends Error {}

const emptyOffer = (): Offer => ({ gold: 0, fish: [], items: {} })
const isEmpty = (o: Offer) => !o.gold && !o.fish.length && !Object.keys(o.items).length

export class TradeDesk {
  private requests = new Map<number, { from: string; to: string; timer: Delayed }>()
  // Lo scambio di ogni sessionId: i due lati puntano allo stesso.
  private trades = new Map<string, Trade>()
  private lastRequest = new Map<string, number>()
  private nextRequest = 1

  // onTraded(userIds): lo scambio è fatto, per rileggere i look (un cappello indossato può
  // essere passato di mano).
  constructor(
    private room: Room<any>,
    private onTraded: (userIds: string[]) => void,
  ) {}

  messages = {
    tradeRequest: validate(z.object({ to: z.string().max(64) }), (c: TradeClient, { to }) => this.request(c, to)),
    tradeAnswer: validate(z.object({ id: z.number().int(), accept: z.boolean() }), (c: TradeClient, a) => this.answer(c, a.id, a.accept)),
    tradeOffer: validate(OfferInput, (c: TradeClient, offer) => this.offer(c, offer)),
    tradeReady: validate(z.object({ ready: z.boolean() }), (c: TradeClient, { ready }) => this.ready(c, ready)),
    tradeConfirm: (c: TradeClient) => this.confirm(c),
    // Mentre lo scambio si sta facendo non si annulla più.
    tradeCancel: (c: TradeClient) => {
      if (!this.trades.get(c.sessionId)?.busy) this.cancel(c.sessionId, `${c.auth!.name} ha annullato lo scambio.`)
    },
  }

  // Chi esce (o perde la connessione) chiude il suo scambio e le sue richieste.
  leave(sessionId: string) {
    // Il client può essere già uscito dalla stanza: il nome si prende dallo scambio.
    const name = this.trades.get(sessionId)?.sides.find((s) => s.sessionId === sessionId)?.name ?? 'L\'altro giocatore'
    this.cancel(sessionId, `${name} se n'è andato: scambio annullato.`)
    for (const [id, r] of this.requests) {
      if (r.from !== sessionId && r.to !== sessionId) continue
      r.timer.clear()
      this.requests.delete(id)
      this.client(r.to)?.send('tradeRequestGone', { id })
    }
    this.lastRequest.delete(sessionId)
  }

  private client(sessionId: string) {
    return this.room.clients.getById(sessionId) as TradeClient | undefined
  }

  private say(c: TradeClient | undefined, kind: 'tradeNotice' | 'tradeError', text: string) {
    c?.send(kind, { text })
  }

  // Uno scambio alla volta per giocatore, anche con più schede aperte.
  private trading(userId: string) {
    for (const t of this.trades.values()) if (t.sides.some((s) => s.userId === userId)) return true
    return false
  }

  private request(c: TradeClient, to: string) {
    const target = this.client(to)
    if (!target || to === c.sessionId) return this.say(c, 'tradeError', 'Non è più qui.')
    if (target.auth!.userId === c.auth!.userId) return this.say(c, 'tradeError', 'Sei tu, da un\'altra scheda.')
    const now = Date.now()
    if (now - (this.lastRequest.get(c.sessionId) ?? 0) < REQUEST_EVERY_MS) return this.say(c, 'tradeError', 'Aspetta qualche secondo prima di chiedere di nuovo.')
    if (this.trading(c.auth!.userId)) return this.say(c, 'tradeError', 'Hai già uno scambio aperto.')
    if (this.trading(target.auth!.userId)) return this.say(c, 'tradeError', `${target.auth!.name} sta già facendo uno scambio.`)
    if ([...this.requests.values()].some((r) => r.from === c.sessionId && r.to === to)) return
    this.lastRequest.set(c.sessionId, now)
    const id = this.nextRequest++
    const timer = this.room.clock.setTimeout(() => {
      this.requests.delete(id)
      this.client(to)?.send('tradeRequestGone', { id })
      this.say(this.client(c.sessionId), 'tradeNotice', `${target.auth!.name} non ha risposto.`)
    }, REQUEST_MS)
    this.requests.set(id, { from: c.sessionId, to, timer })
    target.send('tradeRequest', { id, from: c.sessionId, name: c.auth!.name, expiresIn: REQUEST_MS })
    this.say(c, 'tradeNotice', `Richiesta di scambio mandata a ${target.auth!.name}…`)
  }

  private answer(c: TradeClient, id: number, accept: boolean) {
    const r = this.requests.get(id)
    if (!r || r.to !== c.sessionId) return
    r.timer.clear()
    this.requests.delete(id)
    const from = this.client(r.from)
    if (!from) return accept && this.say(c, 'tradeError', 'Se n\'è andato.')
    if (!accept) return this.say(from, 'tradeNotice', `${c.auth!.name} non vuole scambiare.`)
    if (this.trading(c.auth!.userId) || this.trading(from.auth!.userId)) return this.say(c, 'tradeError', 'Uno dei due sta già facendo uno scambio.')
    const side = (x: TradeClient): Side => ({ sessionId: x.sessionId, userId: x.auth!.userId, name: x.auth!.name, offer: emptyOffer(), ready: false, confirmed: false })
    const trade: Trade = { sides: [side(from), side(c)], stage: 'offer', changedAt: Date.now(), busy: false }
    this.trades.set(from.sessionId, trade)
    this.trades.set(c.sessionId, trade)
    this.push(trade)
  }

  private async offer(c: TradeClient, input: OfferInput) {
    const t = this.trades.get(c.sessionId)
    if (!t || t.busy) return
    let offer: Offer
    try {
      offer = await this.check(c.auth!.userId, input)
    } catch (e) {
      if (!(e instanceof TradeError)) console.error('Offerta non controllata:', e)
      this.say(c, 'tradeError', e instanceof TradeError ? e.message : 'Non riesco a controllare l\'offerta.')
      return this.push(t)
    }
    // Nel frattempo lo scambio può essere finito.
    if (this.trades.get(c.sessionId) !== t || t.busy) return
    t.sides.find((s) => s.sessionId === c.sessionId)!.offer = offer
    this.unlock(t)
    this.push(t)
  }

  // Un'offerta cambiata toglie le conferme di tutti e due e fa ripartire l'attesa per "Pronto".
  private unlock(t: Trade) {
    t.stage = 'offer'
    t.changedAt = Date.now()
    for (const s of t.sides) s.ready = s.confirmed = false
  }

  // Che l'offerta ci sia davvero, adesso: monete, pesci e oggetti.
  private async check(userId: string, input: OfferInput): Promise<Offer> {
    const items = Object.entries(input.items)
    for (const [id, n] of items) {
      if (!isTradable(id)) throw new TradeError(`${itemName(id)} non si può scambiare.`)
      if (isHat(id) && n !== 1) throw new TradeError('I cappelli si hanno una volta sola.')
    }
    if (input.gold) {
      const [{ gold }] = await sql`select coalesce(sum(amount), 0)::int as gold from gold_ledger where user_id = ${userId}`
      if (gold < input.gold) throw new TradeError(`Hai solo ${gold} monete.`)
    }
    const ids = [...new Set(input.fish)]
    const fish = ids.length
      ? await sql`select id, weight_g from player_item where user_id = ${userId} and item_id = 'fish' and id in ${sql(ids)} order by weight_g desc`
      : []
    if (fish.length !== ids.length) throw new TradeError('Alcuni pesci non ci sono più.')
    if (items.length) {
      const rows = await sql`select item_id, quantity from player_item where user_id = ${userId} and item_id in ${sql(items.map(([id]) => id))}`
      const have = new Map<string, number>(rows.map((r: { item_id: string; quantity: number }) => [r.item_id, r.quantity]))
      for (const [id, n] of items) if ((have.get(id) ?? 0) < n) throw new TradeError(`Non hai ${n} × ${itemName(id)}.`)
    }
    return {
      gold: input.gold,
      fish: fish.map((f: { id: number; weight_g: number }) => ({ id: f.id, weightKg: f.weight_g / 1000 })),
      items: Object.fromEntries(items),
    }
  }

  // Prima conferma: "Pronto". Quando lo sono tutti e due le offerte si bloccano.
  // Tornare indietro (ready false) riapre le offerte per tutti e due.
  private ready(c: TradeClient, ready: boolean) {
    const t = this.trades.get(c.sessionId)
    if (!t || t.busy) return
    const side = t.sides.find((s) => s.sessionId === c.sessionId)!
    if (!ready) {
      if (t.stage === 'confirm') this.unlock(t)
      side.ready = false
      return this.push(t)
    }
    if (Date.now() - t.changedAt < READY_DELAY_MS) {
      this.say(c, 'tradeError', 'Aspetta un attimo: l\'offerta è appena cambiata.')
      return this.push(t)
    }
    if (t.sides.every((s) => isEmpty(s.offer))) {
      this.say(c, 'tradeError', 'Lo scambio è vuoto: metti qualcosa nella tua offerta.')
      return this.push(t)
    }
    side.ready = true
    if (t.sides.every((s) => s.ready)) t.stage = 'confirm'
    this.push(t)
  }

  // Seconda conferma: quando hanno confermato tutti e due, lo scambio si fa.
  private async confirm(c: TradeClient) {
    const t = this.trades.get(c.sessionId)
    if (!t || t.busy || t.stage !== 'confirm') return
    t.sides.find((s) => s.sessionId === c.sessionId)!.confirmed = true
    if (!t.sides.every((s) => s.confirmed)) return this.push(t)
    t.busy = true
    this.push(t)
    try {
      await this.transfer(t)
    } catch (e) {
      if (!(e instanceof TradeError)) console.error('Scambio non riuscito:', e)
      t.busy = false
      this.unlock(t)
      for (const s of t.sides) this.say(this.client(s.sessionId), 'tradeError', e instanceof TradeError ? e.message : 'Lo scambio non è riuscito: riprova.')
      return this.push(t)
    }
    const [a, b] = t.sides
    this.trades.delete(a.sessionId)
    this.trades.delete(b.sessionId)
    for (const [me, other] of [[a, b], [b, a]]) {
      this.client(me.sessionId)?.send('tradeDone', { with: other.name, gave: me.offer, got: other.offer })
    }
    // Inventari cambiati: lo si dice a tutte le schede dei due giocatori.
    for (const client of this.room.clients as Iterable<TradeClient>) {
      if (client.auth && (client.auth.userId === a.userId || client.auth.userId === b.userId)) client.send('inventory')
    }
    this.onTraded([a.userId, b.userId])
  }

  // Tutto in una transazione, con i due giocatori bloccati (sempre nello stesso ordine, così
  // due scambi incrociati non si aspettano a vicenda): o passa tutto o niente.
  private async transfer(t: Trade) {
    const [a, b] = t.sides
    await sql.begin(async (tx) => {
      await tx`select id from "user" where id in ${tx([a.userId, b.userId])} order by id for update`
      for (const [from, to] of [[a, b], [b, a]]) {
        const o = from.offer
        if (o.gold) {
          const [{ gold }] = await tx`select coalesce(sum(amount), 0)::int as gold from gold_ledger where user_id = ${from.userId}`
          if (gold < o.gold) throw new TradeError(`${from.name} non ha più ${o.gold} monete.`)
          await tx`insert into gold_ledger (user_id, amount, reason, item_id) values (${from.userId}, ${-o.gold}, 'trade', 'gold'), (${to.userId}, ${o.gold}, 'trade', 'gold')`
        }
        if (o.fish.length) {
          const ids = o.fish.map((f) => f.id)
          const moved = await tx`update player_item set user_id = ${to.userId} where user_id = ${from.userId} and item_id = 'fish' and id in ${tx(ids)} returning id`
          if (moved.length !== ids.length) throw new TradeError(`Alcuni pesci di ${from.name} non ci sono più.`)
        }
        for (const [itemId, n] of Object.entries(o.items)) {
          if (isHat(itemId)) {
            const [has] = await tx`select id from player_item where user_id = ${to.userId} and item_id = ${itemId}`
            if (has) throw new TradeError(`${to.name} ha già: ${itemName(itemId)}.`)
            const moved = await tx`update player_item set user_id = ${to.userId} where user_id = ${from.userId} and item_id = ${itemId} returning id`
            if (!moved.length) throw new TradeError(`${from.name} non ha più: ${itemName(itemId)}.`)
            // Se lo indossava, se lo toglie.
            await tx`update player_equipment set hat = null where user_id = ${from.userId} and hat = ${itemId}`
          } else {
            const [left] = await tx`update player_item set quantity = quantity - ${n} where user_id = ${from.userId} and item_id = ${itemId} and quantity >= ${n} returning quantity`
            if (!left) throw new TradeError(`${from.name} non ha più ${n} × ${itemName(itemId)}.`)
            if (left.quantity === 0) {
              await tx`delete from player_item where user_id = ${from.userId} and item_id = ${itemId}`
              // L'ultima arma, armatura, canna o piccone che aveva addosso: se la toglie.
              await tx`update player_equipment set weapon = nullif(weapon, ${itemId}), armor = nullif(armor, ${itemId}),
                rod = nullif(rod, ${itemId}), pickaxe = nullif(pickaxe, ${itemId}) where user_id = ${from.userId}`
            }
            await tx`insert into player_item (user_id, item_id, quantity) values (${to.userId}, ${itemId}, ${n})
              on conflict (user_id, item_id) where item_id <> 'fish' do update set quantity = player_item.quantity + ${n}`
          }
        }
      }
    })
  }

  // Chiude lo scambio di sessionId: l'altro riceve il motivo, lui chiude e basta.
  private cancel(sessionId: string, text: string) {
    const t = this.trades.get(sessionId)
    if (!t) return
    for (const s of t.sides) {
      this.trades.delete(s.sessionId)
      this.client(s.sessionId)?.send('tradeEnded', { text: s.sessionId === sessionId ? null : text })
    }
  }

  // A ognuno lo scambio dal suo punto di vista: me e them.
  private push(t: Trade) {
    const readyIn = Math.max(0, t.changedAt + READY_DELAY_MS - Date.now())
    for (const me of t.sides) {
      const them = t.sides.find((s) => s !== me)!
      const view = (s: Side) => ({ name: s.name, offer: s.offer, ready: s.ready, confirmed: s.confirmed })
      this.client(me.sessionId)?.send('trade', { stage: t.stage, busy: t.busy, readyIn, me: view(me), them: view(them) })
    }
  }
}
