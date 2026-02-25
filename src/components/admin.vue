<template>
  <v-container class="pa-4">
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field
          v-model="search"
          placeholder="搜索场地名称..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center ga-2">
        <v-btn prepend-icon="mdi-calendar-plus" to="/">预约场地</v-btn>
        <v-btn prepend-icon="mdi-cog">管理场地</v-btn>
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center ga-2">
        <v-btn-toggle v-model="timeRange" mandatory variant="outlined" divided density="comfortable">
          <v-btn value="7days" size="small">未来7天</v-btn>
          <v-btn value="custom" size="small">自定义</v-btn>
        </v-btn-toggle>
        <v-menu
          v-if="timeRange === 'custom'"
          v-model="showDatePicker"
          :close-on-content-click="false"
          location="bottom end"
        >
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" variant="outlined" size="small">
              <v-icon start icon="mdi-calendar" />
              {{ formatDate(customStartDate) }} - {{ formatDate(customEndDate) }}
            </v-btn>
          </template>
          <v-card min-width="300">
            <v-card-text>
              <v-row dense>
                <v-col cols="6">
                  <v-text-field
                    v-model="customStartDate"
                    label="开始日期"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="customEndDate"
                    label="结束日期"
                    type="date"
                    variant="outlined"
                    density="compact"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn variant="text" size="small" @click="showDatePicker = false">取消</v-btn>
              <v-btn color="primary" size="small" @click="showDatePicker = false">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </v-col>
    </v-row>

    <!-- 预约总览 -->
    <v-card variant="outlined" class="mb-4">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-chart-bar" />
        预约总览
      </v-card-title>
      <v-card-text>
        <v-row>
          <!-- 审批概览卡片 -->
          <v-col cols="12" sm="6" lg="3">
            <v-card variant="tonal" color="success" class="h-100">
              <v-card-text class="text-center py-4">
                <v-icon size="32" icon="mdi-check-circle" class="mb-2" />
                <div class="text-h4 font-weight-bold">{{ overviewData.approvedCount }}</div>
                <div class="text-body-2 text-medium-emphasis">已审批</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" lg="3">
            <v-card variant="tonal" color="warning" class="h-100">
              <v-card-text class="text-center py-4">
                <v-icon size="32" icon="mdi-clock-outline" class="mb-2" />
                <div class="text-h4 font-weight-bold">{{ overviewData.pendingCount }}</div>
                <div class="text-body-2 text-medium-emphasis">待审批</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" lg="3">
            <v-card variant="tonal" color="info" class="h-100">
              <v-card-text class="text-center py-4">
                <v-icon size="32" icon="mdi-speedometer" class="mb-2" />
                <div class="text-h4 font-weight-bold">
                  {{ overviewData.avgReviewSpeed }}<span class="text-h6">h</span>
                </div>
                <div class="text-body-2 text-medium-emphasis">平均审核速度</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" lg="3">
            <v-card variant="tonal" color="primary" class="h-100">
              <v-card-text class="text-center py-4">
                <v-icon size="32" icon="mdi-calendar-multiple" class="mb-2" />
                <div class="text-h4 font-weight-bold">{{ overviewData.totalBookings }}</div>
                <div class="text-body-2 text-medium-emphasis">总预约数</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <v-row>
          <!-- 过去7天审批 -->
          <v-col cols="12" md="4">
            <div class="text-subtitle-1 font-weight-medium mb-3">过去7天审批</div>
            <div class="d-flex flex-wrap ga-4">
              <div class="d-flex align-center ga-3">
                <v-avatar color="success" size="36">
                  <v-icon icon="mdi-check" />
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ overviewData.past7DaysApproved }}</div>
                  <div class="text-caption text-medium-emphasis">已通过</div>
                </div>
              </div>
              <div class="d-flex align-center ga-3">
                <v-avatar color="error" size="36">
                  <v-icon icon="mdi-close" />
                </v-avatar>
                <div>
                  <div class="text-h5 font-weight-bold">{{ overviewData.past7DaysRejected }}</div>
                  <div class="text-caption text-medium-emphasis">已拒绝</div>
                </div>
              </div>
            </div>
          </v-col>

          <!-- 时间段统计 -->
          <v-col cols="12" md="8">
            <div class="text-subtitle-1 font-weight-medium mb-3">{{ timeRangeLabel }}预约统计</div>
            <v-row>
              <v-col cols="4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" size="40" variant="tonal">
                    <v-icon icon="mdi-calendar-check" />
                  </v-avatar>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ periodStats.bookingCount }}</div>
                    <div class="text-caption text-medium-emphasis">预约数</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="secondary" size="40" variant="tonal">
                    <v-icon icon="mdi-home-variant" />
                  </v-avatar>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ periodStats.venueCount }}</div>
                    <div class="text-caption text-medium-emphasis">场地数</div>
                  </div>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="warning" size="40" variant="tonal">
                    <v-icon icon="mdi-chart-donut" />
                  </v-avatar>
                  <div>
                    <div class="text-h5 font-weight-bold">{{ periodStats.occupancyRate }}%</div>
                    <div class="text-caption text-medium-emphasis">占用率</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 各房间预约情况 -->
    <v-card variant="outlined">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-format-list-bulleted" />
        各房间预约情况
      </v-card-title>
      <v-card-text>
        <v-list lines="two">
          <template v-for="(room, index) in filteredRooms" :key="room.id">
            <v-list-item class="px-0">
              <template v-slot:prepend>
                <v-avatar :color="room.maintenance ? 'grey' : 'primary'" class="mr-3">
                  <v-icon :icon="room.maintenance ? 'mdi-wrench' : 'mdi-home'" />
                </v-avatar>
              </template>

              <v-list-item-title class="d-flex align-center ga-2">
                <span class="font-weight-medium">{{ room.name }}</span>
                <v-chip v-if="room.maintenance" color="warning" size="small" variant="flat">维护中</v-chip>
              </v-list-item-title>

              <v-list-item-subtitle>
                <span class="mr-4">
                  <v-icon size="small" icon="mdi-clock-outline" class="mr-1" />
                  待审批: {{ room.pendingCount }}
                </span>
                <span>
                  <v-icon size="small" icon="mdi-check-circle-outline" class="mr-1" />
                  已通过: {{ room.approvedCount }}
                </span>
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex align-center ga-2">
                  <!-- 近七天占用情况 -->
                  <div class="d-flex ga-1">
                    <template v-for="(day, dayIndex) in room.weekStats" :key="dayIndex">
                      <v-tooltip :text="`${formatDayLabel(dayIndex)}: ${day.label}`">
                        <template v-slot:activator="{ props }">
                          <div
                            v-bind="props"
                            :style="{
                              width: '16px',
                              height: '16px',
                              borderRadius: '2px',
                              backgroundColor: getOccupancyColor(day.value)
                            }"
                          />
                        </template>
                      </v-tooltip>
                    </template>
                  </div>

                  <v-btn
                    variant="tonal"
                    color="primary"
                    size="small"
                    prepend-icon="mdi-check"
                    :disabled="room.pendingCount === 0"
                    @click="handleApprove(room)"
                  >
                    审批预约
                  </v-btn>
                  <v-btn variant="outlined" size="small" prepend-icon="mdi-chart-line" @click="handleViewStats(room)">
                    统计数据
                  </v-btn>
                </div>
              </template>
            </v-list-item>
            <v-divider v-if="index < filteredRooms.length - 1" />
          </template>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 统计数据弹窗 -->
    <v-dialog v-model="showStatsDialog" max-width="600">
      <v-card v-if="selectedRoom">
        <v-card-title class="d-flex align-center">
          <v-icon start icon="mdi-chart-line" />
          {{ selectedRoom.name }} - 统计数据
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="6">
              <v-card variant="tonal" color="success">
                <v-card-text class="text-center">
                  <div class="text-h5 font-weight-bold">{{ selectedRoom.approvedCount }}</div>
                  <div class="text-caption">已通过预约</div>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="6">
              <v-card variant="tonal" color="warning">
                <v-card-text class="text-center">
                  <div class="text-h5 font-weight-bold">{{ selectedRoom.pendingCount }}</div>
                  <div class="text-caption">待审批预约</div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="text-subtitle-2 mb-2">近7天占用趋势</div>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">日期</th>
                <th class="text-left">预约数</th>
                <th class="text-left">占用率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(day, index) in selectedRoom.weekStats" :key="index">
                <td>{{ formatDayLabel(index) }}</td>
                <td>{{ day.bookings }}</td>
                <td>
                  <v-chip :color="getOccupancyColor(day.value)" size="small"> {{ day.value }}% </v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showStatsDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Room {
  approvedCount: number
  id: number
  maintenance: boolean
  name: string
  pendingCount: number
  weekStats: WeekStat[]
}

interface WeekStat {
  bookings: number
  label: string
  value: number
}

const search = ref('')
const timeRange = ref('7days')
const showDatePicker = ref(false)
const customStartDate = ref('2026-02-25')
const customEndDate = ref('2026-03-04')
const showStatsDialog = ref(false)
const selectedRoom = ref<Room>()

const timeRangeLabel = computed(() => {
  switch (timeRange.value) {
    case '30days':
      return '未来30天'
    case '7days':
      return '未来7天'
    default:
      return '自定义时间段'
  }
})

const overviewData = ref({
  approvedCount: 156,
  avgReviewSpeed: 2.5,
  past7DaysApproved: 28,
  past7DaysRejected: 5,
  pendingCount: 12,
  totalBookings: 168
})

const periodStats = ref({ bookingCount: 45, occupancyRate: 67, venueCount: 8 })

const rooms = ref<Room[]>([
  {
    approvedCount: 15,
    id: 1,
    maintenance: false,
    name: '篮球场A',
    pendingCount: 3,
    weekStats: [
      { bookings: 8, label: '高占用', value: 85 },
      { bookings: 6, label: '中占用', value: 60 },
      { bookings: 9, label: '高占用', value: 90 },
      { bookings: 4, label: '低占用', value: 45 },
      { bookings: 7, label: '中占用', value: 75 },
      { bookings: 3, label: '低占用', value: 30 },
      { bookings: 5, label: '中占用', value: 50 }
    ]
  },
  {
    approvedCount: 8,
    id: 2,
    maintenance: true,
    name: '羽毛球场1号',
    pendingCount: 0,
    weekStats: [
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 },
      { bookings: 0, label: '维护中', value: 0 }
    ]
  },
  {
    approvedCount: 22,
    id: 3,
    maintenance: false,
    name: '乒乓球场',
    pendingCount: 2,
    weekStats: [
      { bookings: 4, label: '低占用', value: 40 },
      { bookings: 7, label: '中占用', value: 70 },
      { bookings: 5, label: '中占用', value: 55 },
      { bookings: 8, label: '高占用', value: 80 },
      { bookings: 3, label: '低占用', value: 35 },
      { bookings: 6, label: '中占用', value: 65 },
      { bookings: 4, label: '低占用', value: 45 }
    ]
  },
  {
    approvedCount: 31,
    id: 4,
    maintenance: false,
    name: '多功能厅',
    pendingCount: 5,
    weekStats: [
      { bookings: 10, label: '高占用', value: 95 },
      { bookings: 11, label: '高占用', value: 100 },
      { bookings: 9, label: '高占用', value: 85 },
      { bookings: 7, label: '中占用', value: 70 },
      { bookings: 9, label: '高占用', value: 90 },
      { bookings: 5, label: '中占用', value: 50 },
      { bookings: 8, label: '中占用', value: 75 }
    ]
  },
  {
    approvedCount: 45,
    id: 5,
    maintenance: false,
    name: '会议室201',
    pendingCount: 1,
    weekStats: [
      { bookings: 6, label: '中占用', value: 60 },
      { bookings: 4, label: '低占用', value: 45 },
      { bookings: 8, label: '高占用', value: 80 },
      { bookings: 5, label: '中占用', value: 55 },
      { bookings: 7, label: '中占用', value: 70 },
      { bookings: 2, label: '低占用', value: 25 },
      { bookings: 4, label: '低占用', value: 40 }
    ]
  }
])

const filteredRooms = computed(() => {
  if (!search.value) return rooms.value
  return rooms.value.filter(room => room.name.toLowerCase().includes(search.value.toLowerCase()))
})

function formatDate(date: string): string {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatDayLabel(index: number): string {
  const date = new Date()
  date.setDate(date.getDate() + index)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function getOccupancyColor(value: number): string {
  if (value >= 70) return '#ef4444'
  if (value >= 40) return '#eab308'
  return '#22c55e'
}

function handleApprove(room: Room) {
  console.info('审批预约:', room.name)
}

function handleViewStats(room: Room) {
  selectedRoom.value = room
  showStatsDialog.value = true
}
</script>
