<template>
  <v-card class="mb-3" variant="outlined">
    <v-card-item>
      <v-card-title class="text-subtitle-1 font-weight-medium">
        {{ notice.title }}
      </v-card-title>
      <v-card-subtitle>{{ notice.release_time }}</v-card-subtitle>
    </v-card-item>
    <v-card-text>
      <div :class="['text-body-2', expanded ? '' : 'text-truncate']">
        {{ notice.content }}
      </div>
    </v-card-text>
    <v-card-actions>
      <v-btn variant="text" size="small" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { GetApiNotificationResponse } from '@/api/types.gen'

defineProps<{ notice: GetApiNotificationResponse['data'][number] }>()

const expanded = ref(false)
</script>
