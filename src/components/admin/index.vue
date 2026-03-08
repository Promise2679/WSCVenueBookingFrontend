<template>
  <v-container class="admin-container px-4 py-2">
    <v-row class="admin-toolbar mb-4">
      <v-col cols="12" md="12">
        <v-text-field
          v-model="search"
          placeholder="搜索场地名称..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="admin-search-field"
        />
      </v-col>
      <v-col cols="12" md="8" class="admin-action-group d-flex align-center ga-2">
        <v-btn prepend-icon="mdi-calendar-plus" to="/" class="admin-action-btn admin-action-btn--solid" variant="flat"
          >预约场地</v-btn
        >
        <v-btn
          prepend-icon="mdi-home-plus"
          class="admin-action-btn admin-action-btn--solid"
          variant="flat"
          @click="showCreateDialog = true"
          >创建场地</v-btn
        >
        <v-btn
          prepend-icon="mdi-account-group"
          to="/user-manage"
          class="admin-action-btn admin-action-btn--ghost"
          variant="outlined"
          >用户管理</v-btn
        >
        <v-btn
          prepend-icon="mdi-bulletin-board"
          to="/notice-manage"
          class="admin-action-btn admin-action-btn--ghost"
          variant="outlined"
          >公告管理</v-btn
        >
      </v-col>
      <v-col cols="12" md="6" class="d-flex align-center ga-2">
        <v-btn-toggle
          v-model="timeRange"
          mandatory
          variant="outlined"
          divided
          density="comfortable"
          class="admin-range-toggle"
        >
          <v-btn value="all" size="small" class="admin-range-btn">总览</v-btn>
          <v-btn value="7days" size="small" class="admin-range-btn">过去7天</v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>

    <!-- 预约总览 -->
    <v-card variant="outlined" class="admin-panel-card admin-overview-card mb-4">
      <v-card-title class="admin-panel-title d-flex align-center">
        <v-icon start icon="mdi-chart-bar" />
        预约总览
      </v-card-title>
      <v-card-text>
        <v-row class="admin-stats-row">
          <!-- 审批概览卡片 -->
          <v-col cols="6" sm="3">
            <v-card variant="tonal" color="primary" class="admin-stat-card admin-stat-card--primary h-100">
              <v-card-text class="admin-stat-card__content text-center py-4">
                <v-icon size="32" icon="mdi-calendar-multiple" class="mb-2" />
                <div class="text-h4 font-weight-bold">
                  {{ timeRange === 'all' ? overviewData.totalBookings : overviewData.past7DaysCount }}
                </div>
                <div class="text-body-2 text-medium-emphasis">总预约数</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card variant="tonal" color="success" class="admin-stat-card admin-stat-card--success h-100">
              <v-card-text class="admin-stat-card__content text-center py-4">
                <v-icon size="32" icon="mdi-check-circle" class="mb-2" />
                <div class="text-h4 font-weight-bold">
                  {{ timeRange === 'all' ? overviewData.approvedCount : overviewData.past7DaysApproved }}
                </div>
                <div class="text-body-2 text-medium-emphasis">已审批</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="6" sm="3">
            <v-card variant="tonal" color="error" class="admin-stat-card admin-stat-card--error h-100">
              <v-card-text class="admin-stat-card__content text-center py-4">
                <v-icon size="32" icon="mdi-close" class="mb-2" />
                <div class="text-h4 font-weight-bold">
                  {{ timeRange === 'all' ? overviewData.rejectedCount : overviewData.past7DaysRejected }}
                </div>
                <div class="text-body-2 text-medium-emphasis">已拒绝</div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col v-if="timeRange === 'all'" cols="6" sm="3">
            <v-card variant="tonal" color="warning" class="admin-stat-card admin-stat-card--warning h-100">
              <v-card-text class="admin-stat-card__content text-center py-4">
                <v-icon size="32" icon="mdi-clock-outline" class="mb-2" />
                <div class="text-h4 font-weight-bold">{{ overviewData.pendingCount }}</div>
                <div class="text-body-2 text-medium-emphasis">待审批</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 各房间预约情况 -->
    <v-card variant="outlined" class="admin-panel-card">
      <v-card-title class="admin-panel-title d-flex align-center">
        <v-icon start icon="mdi-format-list-bulleted" />
        各房间预约情况
      </v-card-title>
      <v-card-text>
        <v-list lines="two">
          <template v-for="(room, index) in filteredRooms" :key="room.id">
            <VenueCard :room="room" @delete="confirmDeleteVenue" />
            <v-divider v-if="index < filteredRooms.length - 1" />
          </template>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 创建场地弹窗 -->
    <v-dialog v-model="showCreateDialog" max-width="500" scrollable>
      <v-card class="admin-dialog-card">
        <v-card-title class="admin-dialog-title d-flex align-center">
          <v-icon start icon="mdi-home-plus" />
          创建场地
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="createForm.name"
              label="场地名称"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || '必填']"
              class="admin-dialog-field"
            />

            <v-select
              v-model="createForm.building_id"
              :items="buildings"
              item-title="building_name"
              item-value="building_id"
              label="所在楼区"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || '必填']"
              class="admin-dialog-field"
            />

            <v-text-field
              v-model.number="createForm.capacity"
              label="容纳人数"
              type="number"
              variant="outlined"
              density="comfortable"
              required
              :rules="[v => !!v || '必填']"
              class="admin-dialog-field"
            />

            <v-text-field
              v-model.number="createForm.type_id"
              label="场地类型ID"
              type="number"
              variant="outlined"
              density="comfortable"
              hint="1=运动场地, 2=会议室, 3=教室"
              class="admin-dialog-field"
            />

            <v-textarea
              v-model="createForm.description"
              label="场地描述"
              variant="outlined"
              density="comfortable"
              rows="3"
              class="admin-dialog-field"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="admin-dialog-btn" @click="showCreateDialog = false">取消</v-btn>
          <v-btn
            color="primary"
            class="admin-dialog-btn admin-dialog-btn--solid"
            :loading="creating"
            @click="handleCreateVenue"
            >创建</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 删除场地确认弹窗 -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card class="admin-dialog-card">
        <v-card-title class="admin-dialog-title d-flex align-center">
          <v-icon start icon="mdi-delete-alert" color="error" />
          确认删除
        </v-card-title>
        <v-card-text> 确定要删除场地「{{ venueToDelete?.name }}」吗？此操作不可恢复。 </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" class="admin-dialog-btn" @click="showDeleteDialog = false">取消</v-btn>
          <v-btn
            color="error"
            class="admin-dialog-btn admin-dialog-btn--danger"
            :loading="deleting"
            @click="handleDeleteVenue"
            >删除</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, ref } from 'vue'

import { deleteApiVenueByVenueId, putApiVenue } from '@/api'
import { getApiVenueLocationsQuery, getApiVenueQuery, getApiVenueStatsQuery } from '@/api/@pinia/colada.gen'
import { useMessagesStore } from '@/stores/message'

import VenueCard from './venueCard.vue'

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
const timeRange = ref('all')

// 创建场地相关
const showCreateDialog = ref(false)
const creating = ref(false)

const { data: locationsData } = useQuery(getApiVenueLocationsQuery({}))
const buildings = computed(() => locationsData.value?.data.buildings ?? [])

const createForm = ref({
  building_id: 0 as number | undefined,
  capacity: 0 as number | undefined,
  cover_image_token: '',
  description: '',
  images_token: [] as string[],
  name: '',
  type_id: 1
})

// 删除场地相关
const showDeleteDialog = ref(false)
const deleting = ref(false)
const venueToDelete = ref<null | Room>(null)

const message = useMessagesStore()

// 获取统计数据
const { data: statsData } = useQuery(getApiVenueStatsQuery({}))

const overviewData = computed(() => {
  if (!statsData.value?.data)
    return {
      approvedCount: 0,
      past7DaysApproved: 0,
      past7DaysCount: 0,
      past7DaysRejected: 0,
      pendingCount: 0,
      rejectedCount: 0,
      totalBookings: 0
    }

  const { all, last_seven_days } = statsData.value.data
  return {
    approvedCount: all.approved,
    past7DaysApproved: last_seven_days.approved,
    past7DaysCount: last_seven_days.applications,
    past7DaysRejected: last_seven_days.rejected,
    pendingCount: all.pending,
    rejectedCount: all.rejected,
    totalBookings: all.applications
  }
})

// 获取可修改权限的场地列表
const { data: venuesData } = useQuery(getApiVenueQuery({ body: {}, query: { a: true, p: 'A' } }))

const rooms = computed<Room[]>(() => {
  if (!venuesData.value?.data) return []
  return (
    venuesData.value.data as Array<{
      building_id: number
      name: string
      pending_applications: number
      permission: string[]
      processed_applications: number
      type_id: number
      venue_id: number
    }>
  ).map(venue => ({
    approvedCount: venue.processed_applications,
    id: venue.venue_id,
    maintenance: false,
    name: venue.name,
    pendingCount: venue.pending_applications,
    weekStats: [
      { bookings: Math.floor(Math.random() * 10) + 2, label: '周一', value: 1 },
      { bookings: Math.floor(Math.random() * 10) + 2, label: '周二', value: 2 },
      { bookings: Math.floor(Math.random() * 10) + 2, label: '周三', value: 3 },
      { bookings: Math.floor(Math.random() * 10) + 2, label: '周四', value: 4 },
      { bookings: Math.floor(Math.random() * 10) + 2, label: '周五', value: 5 },
      { bookings: Math.floor(Math.random() * 8) + 1, label: '周六', value: 6 },
      { bookings: Math.floor(Math.random() * 8) + 1, label: '周日', value: 0 }
    ]
  }))
})

const filteredRooms = computed(() => {
  if (!search.value) return rooms.value
  return rooms.value.filter(room => room.name.toLowerCase().includes(search.value.toLowerCase()))
})

// 删除场地
function confirmDeleteVenue(room: Room) {
  venueToDelete.value = room
  showDeleteDialog.value = true
}

// 创建场地
async function handleCreateVenue() {
  if (!createForm.value.name || !createForm.value.building_id || !createForm.value.capacity) {
    message.add({ color: 'error', text: '请填写必填字段' })
    return
  }

  creating.value = true
  const { error } = await putApiVenue({
    body: {
      building_id: createForm.value.building_id,
      capacity: createForm.value.capacity,
      cover_image_token: createForm.value.cover_image_token,
      description: createForm.value.description,
      images_token: createForm.value.images_token,
      name: createForm.value.name,
      type_id: createForm.value.type_id
    }
  })

  creating.value = false

  if (error) {
    message.add({ color: 'error', text: '创建失败，请重试' })
    return
  }

  message.add({ color: 'success', text: '创建成功' })
  showCreateDialog.value = false
  // 重置表单
  createForm.value = {
    building_id: undefined,
    capacity: undefined,
    cover_image_token: '',
    description: '',
    images_token: [],
    name: '',
    type_id: 1
  }
}

async function handleDeleteVenue() {
  if (!venueToDelete.value) return

  deleting.value = true
  const { error } = await deleteApiVenueByVenueId({ path: { venue_id: venueToDelete.value.id.toString() } })

  deleting.value = false

  if (error) {
    message.add({ color: 'error', text: '删除失败，请重试' })
    return
  }

  message.add({ color: 'success', text: '删除成功' })
  showDeleteDialog.value = false
  venueToDelete.value = null
}
</script>

<style scoped>
.admin-container {
  --admin-primary: #0081e4;
  --admin-surface: #ffffff;
  --admin-surface-light: #f8fbff;
  --admin-outline: rgb(var(--v-theme-primary) / 0.14);
  --admin-text-primary: #0f2a45;
  --admin-text-secondary: #4d6682;
  min-height: 100vh;
  background: #fafbff;
  padding: 1.5rem !important;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.admin-toolbar {
  row-gap: 10px;
}

.admin-search-field :deep(.v-field) {
  border-radius: 8px;
  border: 1px solid var(--admin-outline);
  background: var(--admin-surface);
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.08);
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.admin-search-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.24);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.12);
}

.admin-search-field :deep(.v-field.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.16);
}

.admin-action-group {
  flex-wrap: wrap;
}

.admin-action-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease,
    color 0.24s ease;
}

.admin-action-btn--solid {
  color: #fff;
  background: var(--admin-primary);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.admin-action-btn--solid:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.25);
}

.admin-action-btn--ghost {
  color: var(--admin-primary);
  border-color: rgba(var(--v-theme-primary), 0.3);
  background: var(--admin-surface);
}

.admin-action-btn--ghost:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.4);
}

.admin-range-toggle {
  border-radius: 12px;
  border: 1px solid var(--admin-outline);
  background: var(--admin-surface);
  overflow: hidden;
}

.admin-range-btn {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.admin-range-toggle :deep(.v-btn--active) {
  background: rgba(var(--v-theme-primary), 0.16);
  color: var(--admin-primary);
}

.admin-panel-card {
  border-radius: 20px;
  border: 1px solid var(--admin-outline);
  background: linear-gradient(160deg, var(--admin-surface) 0%, var(--admin-surface-light) 100%);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.12);
}

.admin-panel-title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--admin-text-primary);
}

.admin-stat-card {
  border-radius: 16px;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease;
}

.admin-stats-row {
  margin-inline: -8px;
}

.admin-stats-row > .v-col {
  padding: 2px;
}

.admin-stat-card__content {
  padding: 12px 10px !important;
}

.admin-stat-card__content :deep(.v-icon) {
  margin-bottom: 6px !important;
}

.admin-stat-card__content :deep(.text-h4) {
  font-size: 1.55rem !important;
  line-height: 1.15;
}

.admin-stat-card__content :deep(.text-body-2) {
  font-size: 0.8rem !important;
}

.admin-dialog-card {
  border-radius: 20px;
  border: 1px solid var(--admin-outline);
  box-shadow: 0 24px 48px rgb(var(--v-theme-primary) / 0.12);
}

.admin-dialog-title {
  font-weight: 700;
  color: var(--admin-text-primary);
}

.admin-dialog-field :deep(.v-field) {
  border-radius: 12px;
  border: 1px solid var(--admin-outline);
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.admin-dialog-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.admin-dialog-field :deep(.v-field.v-field--focused) {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 8px 20px rgba(var(--v-theme-primary), 0.1);
}

.admin-dialog-btn {
  border-radius: 10px;
  font-weight: 600;
}

.admin-dialog-btn--solid {
  box-shadow: 0 8px 16px rgba(var(--v-theme-primary), 0.2);
}

.admin-dialog-btn--danger {
  box-shadow: 0 8px 16px rgba(220, 38, 38, 0.2);
}

@media (max-width: 600px) {
  .admin-container {
    padding: 12px !important;
  }

  .admin-action-group {
    gap: 8px !important;
  }

  .admin-action-btn {
    font-size: 13px;
    padding-inline: 10px;
    border-radius: 8px;
  }

  .admin-panel-card {
    border-radius: 12px;
  }

  .admin-panel-title {
    font-size: 18px;
  }
}
</style>
