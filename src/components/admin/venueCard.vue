<template>
  <v-list-item class="admin-room-item px-4">
    <template v-slot:prepend>
      <v-avatar :color="room.maintenance ? 'grey' : 'primary'" class="mr-3">
        <v-icon :icon="room.maintenance ? 'mdi-wrench' : 'mdi-home'" />
      </v-avatar>
    </template>

    <v-list-item-title class="admin-room-title d-flex align-center ga-2">
      <span class="font-weight-medium">{{ room.name }}</span>
      <v-chip v-if="room.maintenance" color="warning" size="small" variant="flat">维护中</v-chip>
    </v-list-item-title>

    <v-list-item-subtitle class="admin-room-subtitle">
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
      <div class="admin-room-actions d-flex align-center ga-2">
        <div class="d-flex ga-1">
          <template v-for="(day, dayIndex) in room.weekStats" :key="dayIndex">
            <v-tooltip :text="`${formatDayLabel(dayIndex)}: ${day.label}`">
              <template v-slot:activator="{ props }">
                <div
                  class="admin-heat-cell"
                  v-bind="props"
                  :style="{ backgroundColor: getOccupancyColor(day.value) }"
                />
              </template>
            </v-tooltip>
          </template>
        </div>

        <v-btn
          variant="tonal"
          color="primary"
          size="small"
          class="admin-room-btn admin-room-btn--approve"
          prepend-icon="mdi-check"
          :disabled="room.pendingCount === 0"
          @click="openApprovalDialog"
        >
          审批预约
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          class="admin-room-btn admin-room-btn--stats"
          prepend-icon="mdi-chart-line"
          @click="showStatsDialog = true"
        >
          统计数据
        </v-btn>
        <v-btn
          variant="text"
          color="error"
          size="small"
          class="admin-room-btn admin-room-btn--delete"
          prepend-icon="mdi-delete"
          @click="$emit('delete', room)"
        >
          删除
        </v-btn>
      </div>
    </template>
  </v-list-item>

  <!-- 统计数据弹窗 -->
  <v-dialog v-model="showStatsDialog" max-width="600">
    <v-card class="admin-room-dialog">
      <v-card-title class="admin-room-dialog-title d-flex align-center">
        <v-icon start icon="mdi-chart-line" />
        {{ room.name }} - 统计数据
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-card variant="tonal" color="success" class="admin-room-metric-card">
              <v-card-text class="text-center">
                <div class="text-h5 font-weight-bold">{{ room.approvedCount }}</div>
                <div class="text-caption">已通过预约</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="tonal" color="warning" class="admin-room-metric-card">
              <v-card-text class="text-center">
                <div class="text-h5 font-weight-bold">{{ room.pendingCount }}</div>
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
            <tr v-for="(day, index) in room.weekStats" :key="index">
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
        <v-btn variant="text" class="admin-room-btn" @click="showStatsDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 审批预约弹窗 -->
  <v-dialog v-model="showApprovalDialog" max-width="900" scrollable>
    <v-card v-if="currentApplication" class="admin-room-dialog">
      <v-card-title class="admin-room-dialog-title d-flex align-center">
        <v-icon start icon="mdi-clipboard-check" />
        {{ room.name }} - 预约审批
      </v-card-title>
      <v-card-text class="pa-0">
        <!-- 翻页控制 -->
        <div v-if="venueApplications.length > 0" class="admin-room-pagination d-flex align-center justify-center pa-3">
          <v-btn icon variant="text" :disabled="currentPage === 0" @click="currentPage--">
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <span class="mx-4"> {{ currentPage + 1 }} / {{ venueApplications.length }} </span>
          <v-btn icon variant="text" :disabled="currentPage === venueApplications.length - 1" @click="currentPage++">
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </div>

        <!-- 预约详情 -->
        <v-container fluid class="pa-4">
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
              <v-card variant="outlined" class="admin-room-note-card pa-2">
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
                  class="admin-room-note-card mb-2 pa-2"
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
                class="admin-room-input mr-4"
              />
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="error" variant="outlined" class="admin-room-btn" :loading="approving" @click="handleReject">
          <v-icon start>mdi-close</v-icon>
          拒绝
        </v-btn>
        <v-btn
          color="success"
          variant="flat"
          class="admin-room-btn admin-room-btn--approve"
          :loading="approving"
          @click="handleApproveApplication"
        >
          <v-icon start>mdi-check</v-icon>
          同意
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { getApiVenueByVenueIdApplication, putApiApplicationByApplicationId } from '@/api'
import { useMessagesStore } from '@/stores/message'

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

const props = defineProps<{ room: Room }>()
defineEmits<{ delete: [room: Room] }>()

// 统计数据弹窗
const showStatsDialog = ref(false)

// 审批相关状态
const showApprovalDialog = ref(false)
const venueApplications = ref<VenueApplication[]>([])
const currentPage = ref(0)
const approvalComment = ref('')
const approving = ref(false)

const message = useMessagesStore()

const currentApplication = ref<null | VenueApplication>(null)

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
  if (value > 50) return '#ef4444'

  // 0-50 线性变化：绿色 #22c55e 到 红色 #ef4444
  const ratio = value / 50
  const r = Math.round(34 + (239 - 34) * ratio)
  const g = Math.round(197 + (68 - 197) * ratio)
  const b = Math.round(94 + (68 - 94) * ratio)

  return `rgb(${r}, ${g}, ${b})`
}

async function handleApproveApplication() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'apv', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  if (error) {
    approving.value = false
    message.add({ color: 'error', text: '审批失败，请重试' })
    return
  }

  approving.value = false
  message.add({ color: 'success', text: '已同意该预约' })
  await refreshApplications()
}

async function handleReject() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'rej', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  if (error) {
    approving.value = false
    message.add({ color: 'error', text: '审批失败，请重试' })
    return
  }

  approving.value = false
  message.add({ color: 'error', text: '已拒绝该预约' })
  await refreshApplications()
}

async function openApprovalDialog() {
  venueApplications.value = []
  currentPage.value = 0
  approvalComment.value = ''
  showApprovalDialog.value = true
  await refreshApplications()
}

function openFile(fileToken: string): void {
  window.open(getFileUrl(fileToken), '_blank')
}

async function refreshApplications() {
  const { data, error } = await getApiVenueByVenueIdApplication({
    body: {},
    path: { venue_id: props.room.id.toString() }
  })

  if (error || !data?.data || data.data.length === 0) {
    venueApplications.value = []
    currentApplication.value = null
    return
  }

  const apps = data.data
  venueApplications.value = (apps as unknown as VenueApplication[]).filter(item => item.application_status === 'req')

  if (venueApplications.value.length === 0) {
    showApprovalDialog.value = false
    currentApplication.value = null
  } else {
    currentPage.value = Math.min(currentPage.value, venueApplications.value.length - 1)
    currentApplication.value = venueApplications.value[currentPage.value] ?? null
  }
}

// 翻页或弹窗打开时更新当前申请
watch([currentPage, showApprovalDialog], () => {
  if (showApprovalDialog.value && venueApplications.value.length > 0)
    currentApplication.value = venueApplications.value[currentPage.value] ?? null
})
</script>

<style scoped>
.admin-room-item {
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.02);
  transition:
    background-color 0.24s ease,
    box-shadow 0.24s ease;
}

.admin-room-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 8px 20px rgba(var(--v-theme-primary), 0.1);
}

.admin-room-title {
  color: #12314f;
}

.admin-room-subtitle {
  color: #4d6682;
}

.admin-room-actions {
  flex-wrap: wrap;
  justify-content: flex-end;
}

.admin-heat-cell {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.25);
}

.admin-room-btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.admin-room-btn:hover {
  transform: translateY(-1px);
}

.admin-room-btn--approve {
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.18);
}

.admin-room-btn--stats {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.admin-room-dialog {
  border: 1px solid rgb(var(--v-theme-primary) / 0.16);
  border-radius: 18px;
  box-shadow: 0 24px 48px rgb(var(--v-theme-primary) / 0.12);
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.admin-room-dialog-title {
  font-weight: 700;
  color: #0f2a45;
}

.admin-room-metric-card {
  border-radius: 14px;
}

.admin-room-pagination {
  background: linear-gradient(180deg, #f3f8ff 0%, #eef5ff 100%);
}

.admin-room-note-card {
  border-radius: 12px;
  border-color: rgb(var(--v-theme-primary) / 0.16) !important;
  background: #fcfeff;
}

.admin-room-input :deep(.v-field) {
  border-radius: 10px;
  border: 1px solid rgb(var(--v-theme-primary) / 0.16);
  background: #ffffff;
}

.admin-room-input :deep(.v-field.v-field--focused) {
  border-color: rgb(var(--v-theme-primary) / 0.45);
  box-shadow: 0 8px 20px rgb(var(--v-theme-primary) / 0.12);
}

@media (max-width: 960px) {
  .admin-room-actions {
    justify-content: flex-start;
    margin-top: 8px;
  }
}

@media (max-width: 600px) {
  .admin-room-btn {
    font-size: 12px;
    padding-inline: 10px;
  }
}
</style>
