import { onUnmounted, reactive } from 'vue'
import { PLAYER_HP, SOUP_HEAL } from '@dev-city/shared/dungeon'

// Dove stanno le cose sulla scena del dungeon (viewBox 1200 × 640): il giocatore a sinistra,
// i mostri in fila a destra, il primo davanti a lui.
export const STAGE = { width: 1200, height: 640, floor: 560, playerX: 300, firstX: 640, gap: 125 }
export const monsterX = (index) => STAGE.firstX + index * STAGE.gap

// Quanto restano sulla scena i numeri che salgono e i mostri sconfitti, in ms.
const FLOAT_MS = 1200
const DEAD_MS = 600

// Riguarda una run già simulata dall'API (o in locale per la demo), col suo orologio: a ogni
// frame applica gli eventi arrivati (packages/shared/src/dungeon.ts, RunEvent). Nello stato
// c'è tutto quello che serve a disegnarla; swing, hurt e drink contano i colpi dati, presi e
// le zuppe bevute, per far ripartire le animazioni (si usano come :key).
export function useRunPlayback() {
  const state = reactive(fresh(0))
  let events = []
  let raf = 0
  let last = 0
  let floatId = 0

  function fresh(soups) {
    return { playing: false, done: false, cleared: false, t: 0, wave: 0, hp: PLAYER_HP, soups, gold: 0, materials: {}, monsters: [], floats: [], swing: 0, hurt: 0, drink: 0 }
  }

  // Le zuppe all'ingresso: la run dice solo quante ne restano dopo ogni sorso.
  function start(run, soups) {
    cancelAnimationFrame(raf)
    Object.assign(state, fresh(soups), { playing: true })
    events = run.events
    last = performance.now()
    raf = requestAnimationFrame(frame)
  }

  function frame(now) {
    state.t += Math.min(100, now - last)
    last = now
    advance(true)
    state.floats = state.floats.filter((f) => state.t - f.born < FLOAT_MS)
    state.monsters = state.monsters.filter((m) => !m.dead || state.t - m.diedAt < DEAD_MS)
    if (state.done) state.playing = false
    else raf = requestAnimationFrame(frame)
  }

  // Salta alla fine: stessi eventi, senza numeri volanti.
  function skip() {
    cancelAnimationFrame(raf)
    state.t = Infinity
    advance(false)
    state.floats = []
    state.monsters = []
    state.playing = false
  }

  function advance(show) {
    while (events.length && events[0].t <= state.t) apply(events.shift(), show)
  }

  function float(x, y, text, tone, show, icon) {
    if (show) state.floats.push({ id: ++floatId, x, y, text, tone, icon, born: state.t })
  }

  function apply(e, show) {
    const alive = state.monsters.filter((m) => !m.dead)
    const at = (id) => monsterX(alive.findIndex((m) => m.id === id))
    const m = alive.find((x) => x.id === e.id)
    switch (e.type) {
      case 'wave':
        state.wave = e.wave
        state.monsters = e.monsters.map((x) => ({ ...x, max: x.hp, dead: false, diedAt: 0, x: 0, flash: 0, attack: 0 }))
        break
      case 'hit':
        state.swing++
        if (!m) break
        m.hp = e.hp
        m.flash++
        float(at(e.id), STAGE.floor - 150, `-${e.damage}`, 'hit', show)
        break
      case 'hurt':
        state.hp = e.hp
        state.hurt++
        if (m) m.attack++
        float(STAGE.playerX, STAGE.floor - 150, `-${e.damage}`, 'hurt', show)
        break
      case 'die': {
        if (!m) break
        const x = at(e.id)
        m.dead = true
        m.diedAt = state.t
        m.x = x
        state.gold += e.gold
        if (e.gold) float(x, STAGE.floor - 190, `+${e.gold}`, 'gold', show)
        e.drops.forEach((id, i) => {
          state.materials[id] = (state.materials[id] ?? 0) + 1
          float(x + (i - (e.drops.length - 1) / 2) * 60, STAGE.floor - 250, '', 'drop', show, id)
        })
        break
      }
      case 'soup':
        state.hp = e.hp
        state.soups = e.left
        state.drink++
        float(STAGE.playerX, STAGE.floor - 200, `+${SOUP_HEAL}`, 'heal', show, 'soup')
        break
      case 'end':
        state.done = true
        state.cleared = e.cleared
        break
    }
  }

  onUnmounted(() => cancelAnimationFrame(raf))
  return { state, start, skip }
}
