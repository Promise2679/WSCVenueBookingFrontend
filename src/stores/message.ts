import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Msg {
  color: 'error' | 'success'
  text: string
}

export const useMessagesStore = defineStore('message', () => {
  const queue = ref<Msg[]>([])

  function add(message: Msg) {
    queue.value.push(message)
  }

  return { add, queue }
})
