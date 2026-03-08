<template>
  <RouterView />
  <v-snackbar-queue v-model="messages.queue" />
</template>

<script setup lang="ts">
import { client } from './api/client.gen'
import router from './router'
import { useMessagesStore } from './stores/message'
import { useUserStore } from './stores/user'

const messages = useMessagesStore()

client.interceptors.error.use(async res => {
  messages.add({ color: 'error', text: res.msg })

  if (res.code === 200402 || res.code === 200401) {
    useUserStore().$reset()
    await router.push('/login')
  }
})
</script>
