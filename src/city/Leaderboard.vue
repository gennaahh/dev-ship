<script setup>
import { computed } from 'vue'
import { GAMES } from '@dev-city/shared/score'
import { useLeaderboard } from '../composables/useLeaderboard.js'
import Avatar from './Avatar.vue'
import { lookOf } from './avatar.js'

// La classifica della città sul cartellone: i punti di tutti i giochi della settimana (da
// lunedì), sommati. Sul podio i primi tre col loro look, sotto i primi sette coi punti gioco per
// gioco. Sono anche quelli che la dev-ship mostra al timone. Senza backend è quella della demo.
const { board, failed } = useLeaderboard()
const ROWS = 7
const players = computed(() => (board.value?.week ?? []).slice(0, ROWS).map((p) => ({ ...p, look: lookOf(p.name, p.look) })))
// Il podio: secondo, primo, terzo.
const podium = computed(() => [1, 0, 2].map((i) => players.value[i] && { ...players.value[i], rank: i + 1 }).filter(Boolean))
const message = computed(() => {
  if (players.value.length) return ''
  if (failed.value) return 'Classifica non raggiungibile'
  if (!board.value) return 'Caricamento…'
  return 'Ancora nessun punto questa settimana: il timone è libero!'
})
</script>

<template>
  <div class="board">
    <header>
      <h2>🏆 Classifica della settimana</h2>
      <span v-if="board?.demo" class="demo">DEMO</span>
      <span v-else class="sub">tutti i giochi · da lunedì</span>
    </header>

    <p v-if="message" class="empty">{{ message }}</p>
    <div v-else class="body">
      <div class="podium">
        <div v-for="p in podium" :key="p.name" class="step" :class="`rank-${p.rank}`">
          <div class="avatar">
            <span v-if="p.rank === 1" class="crown">👑</span>
            <svg viewBox="-62 -140 124 150" aria-hidden="true"><Avatar :look="p.look" /></svg>
          </div>
          <div class="pname">{{ p.name }}</div>
          <div class="block">
            <span class="num">{{ p.rank }}</span>
            <span class="pts">{{ p.points }} pt</span>
          </div>
        </div>
      </div>

      <ol class="list">
        <li class="list-head">
          <span />
          <span />
          <span v-for="g in GAMES" :key="g.id" :title="g.name">{{ g.icon }}</span>
          <span>Punti</span>
        </li>
        <li v-for="(p, i) in players" :key="p.name" class="row" :style="{ animationDelay: `${i * 0.08}s` }">
          <span class="rank">{{ i + 1 }}</span>
          <span class="who">
            <span class="dot"><svg viewBox="-44 -112 88 88" aria-hidden="true"><Avatar :look="p.look" /></svg></span>
            {{ p.name }}
          </span>
          <span v-for="g in GAMES" :key="g.id" class="game" :class="{ zero: !p.games[g.id] }">{{ p.games[g.id] }}</span>
          <span class="points">{{ p.points }}</span>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  padding: 36px 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: #fff8e6;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  background:
    radial-gradient(circle at 20% 10%, rgba(255, 255, 255, 0.12) 0 2px, transparent 3px) 0 0 / 80px 80px,
    radial-gradient(circle at 70% 60%, rgba(255, 255, 255, 0.1) 0 2px, transparent 3px) 0 0 / 110px 110px,
    linear-gradient(#2b2a5c, #1b1a3d);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
h2 {
  margin: 0;
  font-size: 52px;
  font-weight: normal;
  color: #ffd54a;
  text-shadow: 0 5px 0 #b3541e;
}
.demo {
  padding: 6px 18px;
  border: 5px solid #ff7a59;
  border-radius: 10px;
  color: #ff7a59;
  font-size: 30px;
  rotate: 8deg;
}
.body {
  flex: 1;
  display: grid;
  grid-template-columns: 470px 1fr;
  gap: 40px;
  min-height: 0;
}

.podium {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}
.step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.avatar {
  position: relative;
  width: 104px;
  height: 104px;
  display: grid;
  place-items: end center;
  overflow: visible;
}
.avatar svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
.rank-1 .avatar {
  width: 128px;
  height: 128px;
}
.crown {
  position: absolute;
  z-index: 1;
  top: -54px;
  font-size: 48px;
  animation: bob 1.6s ease-in-out infinite;
}
@keyframes bob {
  50% { translate: 0 -8px; rotate: -6deg; }
}
.pname {
  position: relative;
  margin-top: 8px;
  font-size: 22px;
  text-align: center;
  line-height: 1.1;
}
.block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 12px;
  border: 5px solid #fff8e6;
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  box-sizing: border-box;
}
.num {
  font-size: 64px;
  line-height: 1;
}
.pts {
  font-size: 22px;
  opacity: 0.85;
}
.rank-1 .block { height: 240px; background: #e8a31a; }
.rank-2 .block { height: 180px; background: #8e9bb5; }
.rank-3 .block { height: 130px; background: #b8703a; }

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.list-head,
.row {
  display: grid;
  grid-template-columns: 44px 1fr 70px 70px 70px 70px 100px;
  align-items: center;
  text-align: center;
}
.list-head {
  font-size: 26px;
  opacity: 0.8;
}
.list-head span:last-child {
  font-size: 22px;
}
.row {
  height: 58px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 26px;
}
.row:nth-child(2) {
  background: rgba(255, 213, 74, 0.22);
}
.rank {
  color: #ffd54a;
}
.who {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-align: left;
}
.dot {
  flex: none;
  width: 44px;
  height: 44px;
  overflow: hidden;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.16);
}
.dot svg {
  width: 100%;
  height: 100%;
}
.game {
  font-size: 22px;
}
.game.zero {
  opacity: 0.35;
}
.sub {
  font-size: 26px;
  opacity: 0.7;
}
.empty {
  flex: 1;
  display: grid;
  place-items: center;
  margin: 0;
  font-size: 38px;
  opacity: 0.85;
  text-align: center;
}
.points {
  color: #ffd54a;
}
</style>
