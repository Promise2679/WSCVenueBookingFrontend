<template>
  <RouterView />
  <v-snackbar-queue v-model="messages.queue" />
</template>

<script setup lang="ts">
import { useMessagesStore } from './stores/message'

const messages = useMessagesStore()
</script>
