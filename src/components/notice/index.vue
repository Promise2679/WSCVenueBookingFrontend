<template>
  <v-container class="notice-container pa-4">
    <div class="notice-page-head mb-6">
      <div class="notice-page-title">系统公告</div>
      <div class="notice-page-subtitle">由管理员发布的系统通知或申请单批复结果</div>
    </div>

    <v-row>
      <v-col cols="12" class="notice-list-col">
        <NoticeCard v-for="notice in notices" :key="notice.notification_id" :notice="notice" class="notice-list-item" />

        <v-card v-if="!notices.length" class="notice-empty-state" variant="flat" rounded="xl" elevation="0">
          <v-icon icon="mdi-bell-off-outline" size="28" class="mb-2" />
          <div class="notice-empty-title">暂无公告</div>
          <div class="notice-empty-subtitle">新公告发布后会在这里显示</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed } from 'vue'

import { getApiNotificationQuery } from '@/api/@pinia/colada.gen'

import NoticeCard from './noticeCard.vue'

const { data } = useQuery(getApiNotificationQuery())

const notices = computed(() => data.value?.data ?? [])
</script>

<style scoped>
.notice-container {
  --notice-primary: #0081e4;
  --notice-surface: #ffffff;
  --notice-surface-light: #f8fbff;
  --notice-outline: rgb(var(--v-theme-primary) / 0.14);
  --notice-text-primary: #0f2a45;
  --notice-text-secondary: #4d6682;
  min-height: 100vh;
  background: #fafbff;
  padding: 1.5rem !important;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.notice-page-head {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.notice-page-title {
  font-size: 36px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--notice-text-primary);
}

.notice-page-subtitle {
  font-size: 14px;
  color: var(--notice-text-secondary);
  letter-spacing: 0.02em;
}

.notice-list-col {
  display: grid;
  gap: 14px;
}

.notice-list-item {
  animation: riseIn 0.24s ease;
}

.notice-empty-state {
  border: 1px dashed var(--notice-outline);
  background: linear-gradient(160deg, var(--notice-surface) 0%, var(--notice-surface-light) 100%);
  padding: 28px 20px;
  text-align: center;
  color: var(--notice-text-secondary);
}

.notice-empty-title {
  font-weight: 700;
  color: var(--notice-text-primary);
}

.notice-empty-subtitle {
  margin-top: 4px;
  font-size: 14px;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .notice-container {
    padding: 12px !important;
  }

  .notice-page-title {
    font-size: 24px;
  }
}
</style>
