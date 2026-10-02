<script setup>
import { ref, watch } from 'vue'
import { VISIBLE_CHANGELOG } from './changelog.js'

const props = defineProps({
  active: { type: Boolean, default: false },
})

// Ogni volta che la schermata ricompare si riparte dalla cima: lo scorrimento non si conserva.
const scroller = ref(null)
watch(
  () => props.active,
  (active) => {
    if (active && scroller.value) scroller.value.scrollTop = 0
  },
)

const TAGS = {
  new: 'Novità',
  fix: 'Fix',
  docs: 'Docs',
}
const formatDate = (iso) =>
  new Date(`${iso}T12:00`).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="board">
    <header>
      <h2>📜 Changelog</h2>
      <span class="hint">da vicino si scorre ↕</span>
    </header>

    <div ref="scroller" class="scroller">
      <section v-for="day in VISIBLE_CHANGELOG" :key="day.date" class="day">
        <h3>{{ formatDate(day.date) }}</h3>
        <ul>
          <li v-for="(item, i) in day.items" :key="i" class="item">
            <span class="tag" :class="item.tag">{{ TAGS[item.tag] }}</span>
            <span class="text">{{ item.text }}</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.board {
  position: absolute;
  inset: 0;
  box-sizing: border-box;
  padding: 36px 48px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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
.hint {
  font-size: 24px;
  opacity: 0.6;
}

.scroller {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 20px;
  scrollbar-width: auto;
  scrollbar-color: #ffd54a rgba(255, 255, 255, 0.08);
}
.day + .day {
  margin-top: 28px;
}
h3 {
  margin: 0 0 12px;
  font-size: 30px;
  font-weight: normal;
  color: #ffd54a;
  text-transform: capitalize;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 58px;
  padding: 8px 18px;
  box-sizing: border-box;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 26px;
  line-height: 1.2;
}
.tag {
  flex: none;
  width: 110px;
  padding: 4px 0;
  border-radius: 10px;
  color: #2d2a4a;
  font-size: 20px;
  text-align: center;
}
.tag.new { background: #9ccc65; }
.tag.fix { background: #ff7a59; }
.tag.docs { background: #4fc3f7; }
</style>
