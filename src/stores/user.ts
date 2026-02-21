import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const uid = ref('')
  const token = ref('')

  return { name, token, uid }
})
