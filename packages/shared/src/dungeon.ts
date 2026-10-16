import { armor, MATERIALS, weapon } from './catalog.ts'

// Il dungeon: una run automatica. Si entra con un ticket (si ripesca in una bottiglia al lago)
// e 100 HP (di più con l'armatura), e arrivano ondate di bug-mostri sempre più forti; il
// giocatore non fa niente, si guarda. L'arma e l'armatura indossate (dal crafting) contano. Quando scende a metà vita beve da solo una zuppa di pesce, finché ne ha. La run finisce
// quando gli HP finiscono o dopo l'ultima ondata. Monete e materiali raccolti restano comunque.
// La simulazione la fa l'API, tutta in una volta (il frontend la riguarda con la cronologia
// degli eventi): qui stanno solo le regole, funzioni pure col caso passato da fuori.

export const PLAYER_HP = 100
// Il giocatore colpisce il primo mostro in fila ogni ATTACK_MS, per 12-18 danni con la spada di
// legno di partenza, di più con un'arma.
const PLAYER_ATTACK_MS = 800
export const BASE_DAMAGE = [12, 18] as const
// La zuppa si beve da sola quando gli HP scendono a SOUP_BELOW o meno.
export const SOUP_BELOW = 50
export const SOUP_HEAL = 30
export const MAX_WAVES = 20
// Il boss arriva ogni BOSS_EVERY ondate, da solo.
const BOSS_EVERY = 5
// La pausa prima di ogni ondata, e tra la fine dell'ultimo mostro e il resoconto.
const WAVE_PAUSE_MS = 2000
// Ogni ondata i mostri hanno più vita, colpiscono più forte e lasciano più monete.
const HP_GROWTH = 1.05
const DAMAGE_GROWTH = 1.05
const GOLD_GROWTH = 0.35

export type MaterialId = (typeof MATERIALS)[number]['id']
type Drop = { id: MaterialId; chance: number }
export type MonsterKind = {
  id: string
  name: string
  hp: number
  damage: number
  attackMs: number
  // Dall'ondata in cui compare.
  from: number
  // Probabilità di lasciare monete, e quante (all'ondata 1).
  goldChance: number
  gold: readonly [number, number]
  drops: Drop[]
}

export const MONSTERS: MonsterKind[] = [
  {
    id: 'bug', name: 'Bug', hp: 25, damage: 3, attackMs: 1500, from: 1,
    goldChance: 0.7, gold: [1, 3],
    drops: [{ id: 'bug_hide', chance: 0.3 }, { id: 'bug_fang', chance: 0.25 }],
  },
  {
    id: 'glitch', name: 'Glitch', hp: 35, damage: 4, attackMs: 1400, from: 3,
    goldChance: 0.75, gold: [2, 4],
    drops: [{ id: 'web_silk', chance: 0.1 }, { id: 'bug_fang', chance: 0.3 }],
  },
  {
    id: 'leak', name: 'Memory leak', hp: 60, damage: 4, attackMs: 1800, from: 6,
    goldChance: 0.8, gold: [3, 5],
    drops: [{ id: 'bug_hide', chance: 0.3 }, { id: 'cache_crystal', chance: 0.08 }],
  },
  {
    id: 'race', name: 'Race condition', hp: 35, damage: 2, attackMs: 700, from: 8,
    goldChance: 0.8, gold: [3, 6],
    drops: [{ id: 'web_silk', chance: 0.14 }, { id: 'cache_crystal', chance: 0.1 }],
  },
]
export const BOSS: MonsterKind = {
  id: 'incident', name: 'Incidente in produzione', hp: 200, damage: 10, attackMs: 2000, from: BOSS_EVERY,
  goldChance: 1, gold: [15, 25],
  drops: [{ id: 'incident_scale', chance: 0.25 }, { id: 'kernel_core', chance: 0.15 }, { id: 'cache_crystal', chance: 0.5 }],
}
export const monsterKind = (id: string) => (id === BOSS.id ? BOSS : MONSTERS.find((m) => m.id === id))

// Cosa succede, in ordine di tempo (t in ms dall'ingresso). hp è sempre quella dopo l'evento.
// wave: arriva un'ondata, coi mostri in fila (id unici nella run).
// hit: il giocatore colpisce un mostro. hurt: un mostro colpisce il giocatore.
// die: un mostro è sconfitto, con quello che lascia. soup: il giocatore beve una zuppa.
// end: fine della run, cleared se ha superato tutte le ondate.
export type RunEvent =
  | { t: number; type: 'wave'; wave: number; monsters: { id: number; kind: string; hp: number }[] }
  | { t: number; type: 'hit'; id: number; damage: number; hp: number }
  | { t: number; type: 'hurt'; id: number; damage: number; hp: number }
  | { t: number; type: 'die'; id: number; gold: number; drops: MaterialId[] }
  | { t: number; type: 'soup'; hp: number; left: number }
  | { t: number; type: 'end'; cleared: boolean }

// Cosa indossa il giocatore nella run: id del catalogo, null = niente (spada di legno, senza armatura).
export type Loadout = { weapon?: string | null; armor?: string | null }
// Le statistiche che ne vengono: danni di ogni colpo, vita massima e quota dei danni che l'armatura ferma.
export function statsOf(loadout: Loadout = {}) {
  const a = armor(loadout.armor)
  return { damage: weapon(loadout.weapon)?.damage ?? BASE_DAMAGE, maxHp: PLAYER_HP + (a?.hp ?? 0), defense: a?.defense ?? 0 }
}

export type RunResult = {
  events: RunEvent[]
  // La vita con cui si parte (e il massimo a cui curano le zuppe).
  maxHp: number
  // L'ultima ondata raggiunta (superata, se cleared).
  wave: number
  cleared: boolean
  gold: number
  materials: Partial<Record<MaterialId, number>>
  soupsUsed: number
  durationMs: number
}

const between = (rand: () => number, [min, max]: readonly [number, number]) => min + Math.floor(rand() * (max - min + 1))

// Quali mostri, in fila: ogni BOSS_EVERY ondate il boss da solo, altrimenti uno in più ogni
// tre ondate (1, 1, 2, 2, -, 3, 3, ...), presi a caso tra quelli già comparsi.
function waveKinds(wave: number, rand: () => number) {
  if (wave % BOSS_EVERY === 0) return [BOSS]
  const pool = MONSTERS.filter((m) => m.from <= wave)
  return Array.from({ length: 1 + Math.floor(wave / 4) }, () => pool[Math.floor(rand() * pool.length)])
}

export function simulateRun(soups: number, loadout: Loadout = {}, rand: () => number = Math.random): RunResult {
  const { damage: playerDamage, maxHp, defense } = statsOf(loadout)
  const events: RunEvent[] = []
  const materials: RunResult['materials'] = {}
  let hp = maxHp
  let gold = 0
  let soupsLeft = soups
  let t = 0
  let nextId = 1
  let wave = 0
  let cleared = false

  fight: while (wave < MAX_WAVES) {
    wave++
    t += WAVE_PAUSE_MS
    const hpScale = HP_GROWTH ** (wave - 1)
    const damageScale = DAMAGE_GROWTH ** (wave - 1)
    const monsters = waveKinds(wave, rand).map((kind, i) => ({
      id: nextId++,
      kind,
      hp: Math.round(kind.hp * hpScale),
      // L'armatura ferma una parte di ogni colpo, ma almeno 1 passa sempre.
      damage: Math.max(1, Math.round(kind.damage * damageScale * (1 - defense))),
      // Non attaccano tutti nello stesso istante.
      nextAttack: t + kind.attackMs * (0.6 + 0.15 * i),
    }))
    events.push({ t, type: 'wave', wave, monsters: monsters.map((m) => ({ id: m.id, kind: m.kind.id, hp: m.hp })) })
    let nextSwing = t + PLAYER_ATTACK_MS / 2

    while (monsters.length) {
      // Il prossimo che si muove: il giocatore o il mostro più svelto. A pari tempo il giocatore.
      const attacker = monsters.reduce((a, m) => (m.nextAttack < a.nextAttack ? m : a))
      if (nextSwing <= attacker.nextAttack) {
        t = nextSwing
        nextSwing += PLAYER_ATTACK_MS
        const target = monsters[0]
        const damage = between(rand, playerDamage)
        target.hp = Math.max(0, target.hp - damage)
        events.push({ t, type: 'hit', id: target.id, damage, hp: target.hp })
        if (target.hp > 0) continue
        monsters.shift()
        const k = target.kind
        const coins = rand() < k.goldChance ? Math.round(between(rand, k.gold) * (1 + GOLD_GROWTH * (wave - 1))) : 0
        const drops = k.drops.filter((d) => rand() < d.chance).map((d) => d.id)
        gold += coins
        for (const d of drops) materials[d] = (materials[d] ?? 0) + 1
        events.push({ t, type: 'die', id: target.id, gold: coins, drops })
      } else {
        t = attacker.nextAttack
        attacker.nextAttack += attacker.kind.attackMs
        hp = Math.max(0, hp - attacker.damage)
        events.push({ t, type: 'hurt', id: attacker.id, damage: attacker.damage, hp })
        if (hp === 0) break fight
        if (hp <= SOUP_BELOW && soupsLeft > 0) {
          soupsLeft--
          hp = Math.min(maxHp, hp + SOUP_HEAL)
          events.push({ t, type: 'soup', hp, left: soupsLeft })
        }
      }
    }
    if (wave === MAX_WAVES) cleared = true
  }

  t += WAVE_PAUSE_MS / 2
  events.push({ t, type: 'end', cleared })
  return { events, maxHp, wave, cleared, gold, materials, soupsUsed: soups - soupsLeft, durationMs: t }
}
