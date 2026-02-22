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
              <v-icon size="small" class="mr-1" icon="mdi-map-marker" />
              {{ venue.room }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text>
            <v-chip v-for="(status, index) in venue.statuses" :key="index" size="small" variant="tonal">
              {{ status }}
            </v-chip>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-dialog width="600">
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps" variant="text" color="primary" @click="selectedVenue = venue">
                  查看详情
                </v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <v-card>
                  <v-card-title class="d-flex align-center pa-4">
                    <span class="text-h6">场地详情</span>
                    <v-spacer />
                    <v-btn icon="mdi-close" variant="text" size="small" @click="isActive.value = false" />
                  </v-card-title>

                  <v-divider />

                  <v-card-text class="pa-4">
                    <v-img
                      :src="selectedVenue?.image_url || 'https://placehold.co/600x200?text=场地图片'"
                      height="200"
                      cover
                      class="rounded mb-4"
                    />

                    <div class="d-flex align-center mb-2">
                      <div class="text-h5">{{ selectedVenue?.name }}</div>
                      <v-spacer />
                      <v-btn color="primary" variant="flat">
                        <v-icon start icon="mdi-calendar-plus" />
                        立即预约
                      </v-btn>
                    </div>

                    <v-chip :color="colors[selectedVenue?.availability ?? ''] ?? 'gray'" size="small" class="mb-4">
                      {{ selectedVenue?.availability }}
                    </v-chip>

                    <v-row dense>
                      <v-col v-for="item in venueDetails" :key="item.label" cols="4">
                        <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
                        <div class="d-flex align-center ga-1">
                          <v-icon size="small" :icon="item.icon" />
                          <span>{{ selectedVenue?.[item.value] }}</span>
                        </div>
                      </v-col>
                    </v-row>

                    <v-divider class="my-4" />

                    <div class="text-subtitle-2 mb-2">可用设备</div>
                    <div class="d-flex flex-wrap ga-1">
                      <v-chip
                        v-for="equip in selectedVenue?.available_equipments"
                        :key="equip"
                        size="small"
                        variant="outlined"
                      >
                        {{ equip }}
                      </v-chip>
                    </div>

                    <v-divider class="my-4" />

                    <div class="text-subtitle-2 mb-2">已预约时间表</div>
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th class="text-left">日期</th>
                          <th class="text-left">时间段</th>
                          <th class="text-left">预约人</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="booking in selectedVenue?.timemap" :key="booking.user">
                          <td>{{ booking.date }}</td>
                          <td>{{ booking.time }}</td>
                          <td>{{ booking.user }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card-text>
                </v-card>
              </template>
            </v-dialog>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { venueDetails } from '@/constants/venueDetails'

const search = ref('')

// 感觉接口文档信息不完整所以暂时使用自定义接口
interface Venue {
  availability: string
  available_equipments: string[]
  capacity: number
  id: number
  image_url?: string
  name: string
  room: string
  statuses: string[]
  timemap: Array<{ date: string; time: string; user: string }>
  type: string
}

const selectedVenue = ref<Venue>()
const colors = { 可预约: 'success', 维护中: 'warning' } as Record<string, string>

const venues = ref<Venue[]>([
  {
    availability: '可预约',
    available_equipments: ['篮球架', '椅子', '空调'],
    capacity: 30,
    id: 1,
    name: '篮球场A',
    room: '子良楼',
    statuses: ['10 人', '热门'],
    timemap: [
      { date: '2026-02-23', time: '09:00-10:00', user: '张三' },
      { date: '2026-02-23', time: '14:00-16:00', user: '李四' }
    ],
    type: '运动场地'
  },
  {
    availability: '维护中',
    available_equipments: ['羽毛球网', '椅子'],
    capacity: 10,
    id: 2,
    name: '羽毛球场1号',
    room: '东配楼',
    statuses: ['20 人', '维护中'],
    timemap: [{ date: '2026-02-24', time: '10:00-12:00', user: '王五' }],
    type: '运动场地'
  },
  {
    availability: '可预约',
    available_equipments: ['乒乓球桌', '椅子'],
    capacity: 8,
    id: 3,
    name: '乒乓球场',
    room: '新教楼',
    statuses: ['可预约'],
    timemap: [],
    type: '运动场地'
  }
])
</script>
