<template>
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
          @click="openApprovalDialog"
        >
          审批预约
        </v-btn>
        <v-btn variant="outlined" size="small" prepend-icon="mdi-chart-line" @click="showStatsDialog = true">
          统计数据
        </v-btn>
        <v-btn variant="text" color="error" size="small" prepend-icon="mdi-delete" @click="$emit('delete', room)">
          删除
        </v-btn>
      </div>
    </template>
  </v-list-item>

  <!-- 统计数据弹窗 -->
  <v-dialog v-model="showStatsDialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-chart-line" />
        {{ room.name }} - 统计数据
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6">
            <v-card variant="tonal" color="success">
              <v-card-text class="text-center">
                <div class="text-h5 font-weight-bold">{{ room.approvedCount }}</div>
                <div class="text-caption">已通过预约</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card variant="tonal" color="warning">
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
        <v-btn variant="text" @click="showStatsDialog = false">关闭</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- 审批预约弹窗 -->
  <v-dialog v-model="showApprovalDialog" max-width="900" scrollable>
    <v-card v-if="currentApplication">
      <v-card-title class="d-flex align-center">
        <v-icon start icon="mdi-clipboard-check" />
        {{ room.name }} - 预约审批
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
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

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
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

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
  if (value >= 70) return '#ef4444'
  if (value >= 40) return '#eab308'
  return '#22c55e'
}

async function handleApproveApplication() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'apv', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  approving.value = false

  if (error) {
    snackbarText.value = '审批失败，请重试'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  currentApplication.value.application_status = 'approved'
  snackbarText.value = '已同意该预约'
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

async function handleReject() {
  if (!currentApplication.value) return

  approving.value = true
  const { error } = await putApiApplicationByApplicationId({
    body: { comment: { attachments: [], text: approvalComment.value }, decision: 'rej', known_conflicts: [] },
    path: { application_id: currentApplication.value.id.toString() }
  })

  approving.value = false

  if (error) {
    snackbarText.value = '审批失败，请重试'
    snackbarColor.value = 'error'
    showSnackbar.value = true
    return
  }

  currentApplication.value.application_status = 'rejected'
  snackbarText.value = '已拒绝该预约'
  snackbarColor.value = 'error'
  showSnackbar.value = true
}

async function openApprovalDialog() {
  venueApplications.value = []
  currentPage.value = 0
  approvalComment.value = ''
  showApprovalDialog.value = true

  const { data, error } = await getApiVenueByVenueIdApplication({
    body: {},
    path: { venue_id: props.room.id.toString() }
  })

  if (error || !data?.data) {
    venueApplications.value = []
    return
  }

  const apps = data.data[0] ?? []
  venueApplications.value = apps as VenueApplication[]
}

function openFile(fileToken: string): void {
  window.open(getFileUrl(fileToken), '_blank')
}

// 翻页或弹窗打开时更新当前申请
watch([currentPage, showApprovalDialog], () => {
  if (showApprovalDialog.value && venueApplications.value.length > 0)
    currentApplication.value = venueApplications.value[currentPage.value] ?? null
})
</script>
