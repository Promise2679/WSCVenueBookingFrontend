import { defineStore } from 'pinia'
import { computed, ref, watchEffect } from 'vue'

import { client } from '@/api/client.gen'

export const useUserStore = defineStore(
  'user',
  () => {
    const name = ref('')
    const uid = ref('')
    const token = ref('')
    const map = ref('')

    const isAdmin = computed(() => map.value !== '1')
    watchEffect(() => client.setConfig({ auth: token.value }))

    function $reset() {
      name.value = ''
      uid.value = ''
      token.value = ''
      map.value = ''
    }

    return { $reset, isAdmin, map, name, token, uid }
  },
  { persist: true }
)
