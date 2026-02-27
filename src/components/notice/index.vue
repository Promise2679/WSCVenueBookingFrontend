<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <NoticeCard v-for="notice in notices" :key="notice.notification_id" :notice="notice" />
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
