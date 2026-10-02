<script setup>
import { createChat } from '../composables/chat.js'
import { useGameRoom } from '../composables/useGameRoom.js'
import ChatWindow from './ChatWindow.vue'

// Chat di un canale della ChatRoom: la città (globale) o un luogo. Per cambiare canale si
// rimonta il componente (con :key), così si esce da una stanza e si entra nell'altra.
const props = defineProps({
  channel: { type: String, required: true },
  title: { type: String, required: true },
  corner: { type: String, default: 'bottom' },
  fold: { type: Boolean, default: false },
})

const chat = createChat(() => game.room.value)
const game = useGameRoom('chat', { channel: props.channel }, { onJoin: chat.attach, onReconnect: chat.refresh })
const { status } = game
const { messages } = chat
</script>

<template>
  <ChatWindow :title="title" :corner="corner" :fold="fold" :status="status" :messages="messages" @send="chat.send" />
</template>
