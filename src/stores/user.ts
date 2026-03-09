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
    const permissionMapValue = computed(() => Number(map.value) || 0)

    const canManageVenue = computed(() => permissionMapValue.value >= 2 ** 1)
    const canManageUser = computed(() => permissionMapValue.value >= 2 ** 7)
    const canManageNotice = computed(() => permissionMapValue.value >= 2 ** 8)
    const showAdminControls = computed(() => canManageVenue.value || canManageUser.value || canManageNotice.value)

    watchEffect(() => client.setConfig({ auth: token.value }))

    function $reset() {
      name.value = ''
      uid.value = ''
      token.value = ''
      map.value = ''
    }

    return { $reset, canManageNotice, canManageUser, canManageVenue, map, name, showAdminControls, token, uid }
  },
  { persist: true }
)
