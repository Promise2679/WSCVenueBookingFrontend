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

    <!-- 审批预约弹窗 -->
    <v-dialog v-model="showApprovalDialog" max-width="900" scrollable>
      <v-card v-if="selectedVenue">
        <v-card-title class="d-flex align-center">
          <v-icon start icon="mdi-clipboard-check" />
          {{ selectedVenue.name }} - 预约审批
        </v-card-title>
        <v-card-text class="pa-0">
          <!-- 翻页控制 -->
          <div v-if="venueApplications.length > 0" class="d-flex align-center justify-center pa-3 bg-grey-lighten-4">
            <v-btn icon variant="text" :disabled="currentPage === 0" @click="currentPage--">
              <v-icon>mdi-chevron-left</v-icon>
            </v-btn>
            <span class="mx-4"> {{ currentPage + 1 }} / {{ venueApplications.length }} </span>
            <v-btn icon variant="text" :disabled="currentPage === venueApplications.length - 1" @click="currentPage++">
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>

          <!-- 预���详情 -->
          <v-container v-if="currentApplication" fluid class="pa-4">
            <v-row>
              <!-- 左侧：基本信息 -->
              <v-col cols="12" md="6">
                <div class="text-subtitle-2 mb-2">基本信息</div>
                <v-table density="compact">
                  <tbody>
                    <tr>
                      <td class="font-weight-medium text-grey" width="100">活动名称</td>
                      <td>{{ currentApplication.activity_name }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-medium text-grey">举办方</td>
                      <td>{{ currentApplication.activity_organizer }}</td>
                    </tr>
                    <tr>
                      <td class="font-weight-medium text-grey">预估人数</td>
                      <td>{{ currentApplication.estimated_participants }}人</td>
                    </tr>
                    <tr>
                      <td class="font-weight-medium text-grey">申请类型</td>
                      <td>
                        <v-chip size="x-small" color="primary" variant="outlined">
                          {{ currentApplication.application_type }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <div class="text-subtitle-2 mb-2 mt-4">使用时间</div>
                <v-chip
                  v-for="(time, idx) in currentApplication.time_request"
                  :key="idx"
                  class="ma-1"
                  color="info"
                  variant="tonal"
                  size="small"
                >
                  {{ formatTimeRange(time.begin, time.end) }}
                </v-chip>

                <div class="text-subtitle-2 mb-2 mt-4">活动说明</div>
                <v-card variant="outlined" class="pa-2">
                  <div class="text-body-2">{{ currentApplication.description || '无' }}</div>
                </v-card>
              </v-col>

              <!-- 右侧：附件和评论 -->
              <v-col cols="12" md="6">
                <!-- 附件 -->
                <div v-if="currentApplication.attachments?.length" class="mb-4">
                  <div class="text-subtitle-2 mb-2">附件</div>
                  <v-list density="compact" class="pa-0">
                    <v-list-item
                      v-for="(file, idx) in currentApplication.attachments"
                      :key="idx"
                      :href="getFileUrl(file.file_token)"
                      target="_blank"
                      class="px-0 min-h-0"
                    >
                      <template v-slot:prepend>
                        <v-icon :icon="getFileIcon(file.file_type)" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">{{ file.file_name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>

                <!-- 评论/备注 -->
                <div v-if="currentApplication.comments?.length">
                  <div class="text-subtitle-2 mb-2">备注信息</div>
                  <v-card
                    v-for="(comment, idx) in currentApplication.comments"
                    :key="idx"
                    variant="outlined"
                    class="mb-2 pa-2"
                  >
                    <div class="text-body-2">{{ comment.text }}</div>
                    <div v-if="comment.attachments?.length" class="mt-2">
                      <v-chip
                        v-for="(file, fIdx) in comment.attachments"
                        :key="fIdx"
                        size="x-small"
                        class="mr-1"
                        @click="openFile(file.file_token)"
                      >
                        <v-icon start size="x-small">mdi-paperclip</v-icon>
                        {{ file.file_name }}
                      </v-chip>
                    </div>
                  </v-card>
                </div>
                <v-text-field
                  v-model="approvalComment"
                  label="审批意见（可选）"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mr-4"
                />
              </v-col>
            </v-row>
          </v-container>

          <!-- 无数据提示 -->
          <div v-else class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
            <div class="text-h6 text-grey mt-2">暂无预约记录</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="error" variant="outlined" :loading="approving" @click="handleReject">
            <v-icon start>mdi-close</v-icon>
            拒绝
          </v-btn>
          <v-btn color="success" variant="flat" :loading="approving" @click="handleApproveApplication">
            <v-icon start>mdi-check</v-icon>
            同意
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 审批结果提示 -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { getApiVenueByVenueIdApplication, putApiApplicationByApplicationId } from '@/api'

interface Room {
  approvedCount: number
  id: number
  maintenance: boolean
  name: string
  pendingCount: number
  weekStats: WeekStat[]
}

interface VenueApplication {
  activity_coordinator: boolean | null | number | Record<string, unknown> | string | unknown[]
  activity_name: string
  activity_organizer: string
  application_status: string
  application_type: string
  attachments: Array<{ file_name: string; file_token: string; file_type: string; index: number }>
  comments: Array<{
    attachments: Array<{ file_name: string; file_token: string; file_type: string; index: number }>
    id: number
    text: string
  }>
  description: string
  estimated_participants: number
  id: number
  time_request: Array<{ begin: string; end: string }>
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
const showApprovalDialog = ref(false)
const selectedRoom = ref<Room>()
const selectedVenue = ref<null | Room>(null)
const venueApplications = ref<VenueApplication[]>([])
const currentPage = ref(0)
const approvalComment = ref('')
const approving = ref(false)
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

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

const currentApplication = computed<null | VenueApplication>(() => {
  if (venueApplications.value.length === 0) return null
  return venueApplications.value[currentPage.value] ?? null
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

function formatTimeRange(begin: string, end: string): string {
  const start = new Date(begin)
  const finish = new Date(end)
  const startStr = `${start.getMonth() + 1}/${start.getDate()} ${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`
  const endStr = `${finish.getHours().toString().padStart(2, '0')}:${finish.getMinutes().toString().padStart(2, '0')}`
  return `${startStr}-${endStr}`
}

function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return 'mdi-image'
  if (fileType.startsWith('video/')) return 'mdi-video'
  if (fileType === 'application/pdf') return 'mdi-file-pdf-box'
  return 'mdi-file-document'
}

function getFileUrl(fileToken: string): string {
  return `/api/file/${fileToken}`
}

function getOccupancyColor(value: number): string {
  if (value >= 70) return '#ef4444'
  if (value >= 40) return '#eab308'
  return '#22c55e'
}

async function handleApprove(room: Room) {
  selectedVenue.value = room
  selectedRoom.value = room
  venueApplications.value = []
  currentPage.value = 0
  approvalComment.value = ''
  showApprovalDialog.value = true

  // 获取该场地的所有预约
  const { data, error } = await getApiVenueByVenueIdApplication({ body: {}, path: { venue_id: room.id.toString() } })

  if (error || !data?.data) {
    venueApplications.value = []
    return
  }

  // API 返回的是嵌套数组结构
  const apps = data.data[0] ?? []
  venueApplications.value = apps as VenueApplication[]
}

async function handleApproveApplication() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'apv', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  if (error) {
    snackbarText.value = '审批失败，请重试'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    approving.value = false
    return
  }

  // 更新本地状态
  currentApplication.value.application_status = 'approved'
  snackbarText.value = '已同意该预约'
  snackbarColor.value = 'success'
  showSnackbar.value = true
  approving.value = false
}

async function handleReject() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'rej', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  if (error) {
    snackbarText.value = '审批失败，请重试'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    approving.value = false
    return
  }

  // 更新本地状态
  currentApplication.value.application_status = 'rejected'
  snackbarText.value = '已拒绝该预约'
  snackbarColor.value = 'error'
  showSnackbar.value = true
  approving.value = false
}

function handleViewStats(room: Room) {
  selectedRoom.value = room
  showStatsDialog.value = true
}

function openFile(fileToken: string): void {
  window.open(getFileUrl(fileToken), '_blank')
}

// 重置翻页当预约列表变化时
watch(venueApplications, () => {
  currentPage.value = 0
})
</script>
