import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

import { client } from '@/api/client.gen'

export const useUserStore = defineStore(
  'user',
  () => {
    const name = ref('')
    const uid = ref('')
    const token = ref('')

    watch(token, () => {
      client.setConfig({ auth: token.value })
    })

    return { name, token, uid }
  },
  { persist: true }
)
