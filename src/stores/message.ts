import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Msg {
  color: 'error' | 'success'
  text: string
  timeout?: number
}

export const useMessagesStore = defineStore('message', () => {
  const queue = ref<Msg[]>([])

  function add(message: Msg) {
    if (!message.timeout) message = { ...message, timeout: 2000 }
    queue.value.push({ ...message })
  }

  return { add, queue }
})
