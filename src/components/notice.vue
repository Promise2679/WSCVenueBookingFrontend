<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card v-for="(notice, index) in notices" :key="index" class="mb-3" variant="outlined">
          <v-card-item>
            <v-card-title class="text-subtitle-1 font-weight-medium">
              {{ notice.name }}
            </v-card-title>
          </v-card-item>
          <v-card-text>
            <div :class="['text-body-2', notice.expanded ? '' : 'text-truncate']">
              {{ notice.content }}
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" size="small" @click="notice.expanded = !notice.expanded">
              {{ notice.expanded ? '收起' : '展开' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Notice {
  content: string
  expanded: boolean
  name: string
}

const notices = ref<Notice[]>([
  {
    content:
      '为了提供更好的服务，我们将于本周六凌晨2:00-4:00进行系统维护。维护期间部分功能可能暂时不可用，给您带来不便敬请谅解。为了提供更好的服务，我们将于本周六凌晨2:00-4:00进行系统维护。维护期间部分功能可能暂时不可用，给您带来不便敬请谅解。为了提供更好的服务，我们将于本周六凌晨2:00-4:00进行系统维护。维护期间部分功能可能暂时不可用，给您带来不便敬请谅解。为了提供更好的服务，我们将于本周六凌晨2:00-4:00进行系统维护。维护期间部分功能可能暂时不可用，给您带来不便敬请谅解。',
    expanded: false,
    name: '系统维护通知'
  }
])
</script>
