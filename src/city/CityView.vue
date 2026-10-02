<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import Billboard from './Billboard.vue'
import CityBackdrop from './CityBackdrop.vue'
import { PLACES } from './places.js'

const props = defineProps({
  // Edificio in cui ci si trova (null = in città).
  inside: { type: String, default: null },
})
const emit = defineEmits(['enter'])

// Il palco della città è disegnato a 1600 × 1000 e la "camera" lo scala e lo sposta
// per adattarlo alla finestra, per zoomare sul cartellone o sulla porta di un edificio.
const W = 1600
const H = 1000
// Cornice del cartellone (deve combaciare con la posizione in Billboard.vue).
const BOARD = { x: 490, y: 140, w: 620, h: 392 }

const vw = ref(innerWidth)
const vh = ref(innerHeight)
const onResize = () => {
  vw.value = innerWidth
  vh.value = innerHeight
}

// Su cosa punta la camera: null (tutta la città), 'billboard' o l'id di un edificio.
const focus = ref(props.inside)
const zoomed = computed(() => focus.value === 'billboard')

const camera = computed(() => {
  const base = Math.min(vw.value / W, vh.value / H)
  if (!focus.value) {
    return { s: base, tx: (vw.value - W * base) / 2, ty: (vh.value - H * base) / 2 }
  }
  let s, cx, cy
  if (zoomed.value) {
    // Il cartellone riempie quasi tutto lo schermo, ma restano in vista la cornice e un po' di città.
    s = Math.min((vw.value * 0.9) / BOARD.w, (vh.value * 0.84) / BOARD.h)
    cx = BOARD.x + BOARD.w / 2
    cy = BOARD.y + BOARD.h / 2
  } else {
    const p = PLACES.find((pl) => pl.id === focus.value)
    s = base * 3.5
    cx = p.door.x
    cy = p.door.y
  }
  return { s, tx: vw.value / 2 - cx * s, ty: vh.value / 2 - cy * s }
})
const stageStyle = computed(() => ({
  transform: `translate(${camera.value.tx}px, ${camera.value.ty}px) scale(${camera.value.s})`,
}))

let enterTimer
function visit(place) {
  if (focus.value === 'billboard') {
    focus.value = null
    return
  }
  if (focus.value) return
  // Prima la camera vola verso la porta, poi si entra.
  focus.value = place.id
  enterTimer = setTimeout(() => emit('enter', place.id), 850)
}

function zoomBoard() {
  if (!focus.value) focus.value = 'billboard'
}
function unzoom() {
  if (zoomed.value) focus.value = null
}

// Uscendo da un edificio la camera riparte dalla sua porta e torna sulla città.
watch(
  () => props.inside,
  (id) => {
    if (id) {
      focus.value = id
    } else {
      setTimeout(() => (focus.value = null), 350)
    }
  },
)

const onKey = (e) => {
  // defaultPrevented: Esc già usato da altri (es. per chiudere la finestra del login).
  if (e.key === 'Escape' && !e.defaultPrevented) unzoom()
}
onMounted(() => {
  addEventListener('resize', onResize)
  addEventListener('keydown', onKey)
})
onUnmounted(() => {
  removeEventListener('resize', onResize)
  removeEventListener('keydown', onKey)
  clearTimeout(enterTimer)
})

const boxStyle = (b) => ({ left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` })
</script>

<template>
  <div class="city" :class="{ 'board-zoomed': zoomed }" @click.self="unzoom">
    <div class="stage" :style="stageStyle" @click.self="unzoom">
      <CityBackdrop @click="unzoom" />

      <button
        v-for="p in PLACES"
        :key="p.id"
        class="place"
        :class="`place-${p.id}`"
        :style="boxStyle(p.box)"
        :aria-label="`Entra: ${p.name}`"
        :tabindex="zoomed ? -1 : 0"
        @click="visit(p)"
      >
        <component :is="p.building" class="building" />
        <span class="sign">{{ p.name }}</span>
      </button>

      <Billboard :zoomed="zoomed" @zoom="zoomBoard" />
    </div>

    <Transition name="fade">
      <button v-if="zoomed" class="close" @click="unzoom">✕ Torna in città</button>
    </Transition>
  </div>
</template>

<style scoped>
.city {
  position: fixed;
  inset: 0;
  overflow: hidden;
  font-family: 'Lilita One', 'Baloo 2', system-ui, sans-serif;
  /* Fuori dal palco il cielo e il prato continuano. */
  background: linear-gradient(#4fb3ea 0 50%, #8ed16f 50% 100%);
}
.stage {
  position: absolute;
  left: 0;
  top: 0;
  width: 1600px;
  height: 1000px;
  transform-origin: 0 0;
  transition: transform 1s cubic-bezier(0.65, 0, 0.3, 1);
}

.place {
  position: absolute;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.building {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  transform-origin: 50% 90%;
  transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1), filter 0.25s ease;
}
.place:hover .building,
.place:focus-visible .building {
  transform: scale(1.04) translateY(-4px);
  filter: drop-shadow(0 0 14px rgba(255, 245, 160, 0.95));
}
.place:focus-visible {
  outline: none;
}
.board-zoomed .place {
  cursor: zoom-out;
}
.board-zoomed .place:hover .building {
  transform: none;
  filter: none;
}

/* Cartello di legno col nome del luogo. */
.sign {
  position: absolute;
  left: 50%;
  bottom: -6px;
  translate: -50% 0;
  padding: 4px 16px 6px;
  border: 4px solid #2d2a4a;
  border-radius: 10px;
  background: #c98a4b;
  box-shadow: inset 0 -5px 0 #9c6332, 0 4px 0 #2d2a4a;
  color: #fff8e6;
  font-size: 24px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  text-shadow: 0 2px 0 #6d3f17;
  transition: transform 0.25s cubic-bezier(0.3, 1.6, 0.5, 1);
}
.place:hover .sign {
  transform: rotate(-3deg) scale(1.08);
}
.place-pesca .sign {
  bottom: auto;
  top: 24px;
  left: 82%;
}

.close {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  padding: 10px 16px 12px;
  border: 4px solid #2d2a4a;
  border-radius: 14px;
  background: #ffd54a;
  box-shadow: 0 4px 0 #2d2a4a;
  color: #2d2a4a;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}
.close:active {
  translate: 0 3px;
  box-shadow: 0 1px 0 #2d2a4a;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease 0.3s;
}
.fade-leave-active {
  transition-delay: 0s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
