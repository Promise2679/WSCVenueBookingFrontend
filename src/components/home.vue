<template>
  <v-container class="pa-4">
    <div class="d-flex justify-end mb-4 ga-2">
      <v-btn prepend-icon="mdi-calendar-plus">预约场地</v-btn>
      <v-btn prepend-icon="mdi-cog">管理场地</v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          placeholder="请输入关键词..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        >
          <template v-slot:prepend>
            <v-btn icon="mdi-filter" variant="text" size="small" />
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="venue in venues" :key="venue.id" cols="12" sm="6" md="4">
        <v-card variant="outlined" class="h-100">
          <v-card-item>
            <v-card-title>{{ venue.name }}</v-card-title>
            <v-card-subtitle>
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              {{ venue.address }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-chip v-for="(status, index) in venue.statuses" :key="index" size="small" variant="tonal">
              {{ status }}
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn variant="text" color="primary">查看详情</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

interface Venue {
  address: string
  id: number
  name: string
  statuses: string[]
}

const venues = ref<Venue[]>([
  { address: '子良楼', id: 1, name: '篮球场A', statuses: ['10 人', '热门'] },
  { address: '东配楼', id: 2, name: '羽毛球场1号', statuses: ['20 人', '维护中'] },
  { address: '新教楼', id: 3, name: '乒乓球场', statuses: ['可预约'] }
])
</script>
