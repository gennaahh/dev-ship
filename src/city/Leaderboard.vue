<script setup>
// Classifica dimostrativa: i dati sono finti, servono solo a mostrare come apparirà sul cartellone.
const PLAYERS = [
  { name: 'Capitan Merge', color: '#ff7a59', gems: 42, bugs: 17, fish: 8, points: 1280 },
  { name: 'Mozzo Refactor', color: '#4fc3f7', gems: 35, bugs: 21, fish: 3, points: 1145 },
  { name: 'Nostromo Deploy', color: '#9ccc65', gems: 30, bugs: 12, fish: 11, points: 990 },
  { name: 'Vedetta Debug', color: '#ffca28', gems: 18, bugs: 25, fish: 2, points: 870 },
  { name: 'Cuoca Hotfix', color: '#ba68c8', gems: 22, bugs: 9, fish: 14, points: 760 },
  { name: 'Timoniere Review', color: '#4db6ac', gems: 15, bugs: 11, fish: 6, points: 640 },
  { name: 'Marinaio Commit', color: '#f06292', gems: 12, bugs: 6, fish: 9, points: 515 },
]
const podium = [PLAYERS[1], PLAYERS[0], PLAYERS[2]]
const podiumRank = [2, 1, 3]
const initials = (name) => name.split(' ').map((w) => w[0]).join('')
</script>

<template>
  <div class="board">
    <header>
      <h2>🏆 Classifica della settimana</h2>
      <span class="demo">DEMO</span>
    </header>

    <div class="body">
      <div class="podium">
        <div v-for="(p, i) in podium" :key="p.name" class="step" :class="`rank-${podiumRank[i]}`">
          <div class="avatar" :style="{ background: p.color }">
            <span v-if="podiumRank[i] === 1" class="crown">👑</span>
            {{ initials(p.name) }}
          </div>
          <div class="pname">{{ p.name }}</div>
          <div class="block">
            <span class="num">{{ podiumRank[i] }}</span>
            <span class="pts">{{ p.points }} pt</span>
          </div>
        </div>
      </div>

      <ol class="list">
        <li class="list-head">
          <span />
          <span />
          <span>⛏️</span>
          <span>🐞</span>
          <span>🐟</span>
          <span>Punti</span>
        </li>
        <li v-for="(p, i) in PLAYERS" :key="p.name" class="row" :style="{ animationDelay: `${i * 0.08}s` }">
          <span class="rank">{{ i + 1 }}</span>
          <span class="who">
            <span class="dot" :style="{ background: p.color }">{{ initials(p.name) }}</span>
            {{ p.name }}
          </span>
          <span>{{ p.gems }}</span>
          <span>{{ p.bugs }}</span>
          <span>{{ p.fish }}</span>
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
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
  border: 6px solid #fff8e6;
  border-radius: 50%;
  color: #2d2a4a;
  font-size: 36px;
}
.rank-1 .avatar {
  width: 120px;
  height: 120px;
  font-size: 44px;
}
.crown {
  position: absolute;
  top: -50px;
  font-size: 48px;
  animation: bob 1.6s ease-in-out infinite;
}
@keyframes bob {
  50% { translate: 0 -8px; rotate: -6deg; }
}
.pname {
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
  grid-template-columns: 48px 1fr 70px 70px 70px 110px;
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
  text-align: left;
}
.dot {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #2d2a4a;
  font-size: 18px;
}
.points {
  color: #ffd54a;
}
</style>
