<template>
  <v-container>
    <!-- 筛选标签 -->
    <v-tabs v-model="filterTab" color="primary" class="mb-4">
      <v-tab value="all">全部</v-tab>
      <v-tab value="pending">待审核</v-tab>
      <v-tab value="rejected">已驳回</v-tab>
      <v-tab value="approved">已通过</v-tab>
    </v-tabs>

    <!-- 预约列表 -->
    <v-row>
      <v-col v-for="reservation in filteredReservations" :key="reservation.id" cols="12">
        <v-card class="reservation-card fill-height" variant="flat" rounded="xl" elevation="0">
          <div class="reservation-card__halo" />

          <v-card-item class="reservation-card__header">
            <v-card-title class="d-flex align-center reservation-card__title-wrap">
              <span class="text-truncate reservation-card__title">{{ reservation.activityName }}</span>
              <v-spacer />
              <v-chip
                :color="getStatusColor(reservation.status)"
                size="small"
                variant="flat"
                class="reservation-card__status"
              >
                {{ getStatusText(reservation.status) }}
              </v-chip>
            </v-card-title>
            <v-card-subtitle class="reservation-card__subtitle">
              <v-icon size="small" class="reservation-card__subtitle-icon">mdi-map-marker</v-icon>
              {{ reservation.classroom }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="reservation-card__meta">
            <div class="text-body-2 text-medium-emphasis reservation-card__description">
              {{ reservation.description }}
            </div>
          </v-card-text>

          <v-card-actions v-if="canCancel(reservation)" class="reservation-card__actions" density="compact">
            <v-spacer />
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              class="reservation-card__action-btn"
              @click="openCancelDialog(reservation)"
            >
              取消预约
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 无数据提示 -->
    <v-row v-if="filteredReservations.length === 0">
      <v-col cols="12" class="text-center py-8">
        <v-icon size="64" color="grey-lighten-1">mdi-calendar-blank</v-icon>
        <div class="text-h6 text-grey mt-2">暂无预约记录</div>
      </v-col>
    </v-row>

    <v-dialog v-model="cancelDialog" max-width="300">
      <v-card>
        <v-card-text>确定取消预约吗？</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelDialog = false">取消</v-btn>
          <v-btn variant="flat" @click="confirmCancel">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, ref } from 'vue'

import { deleteApiApplicationByApplicationId } from '@/api'
import { getApiUserApplicationQuery } from '@/api/@pinia/colada.gen'
import { useMessagesStore } from '@/stores/message'

interface Reservation {
  activityName: string
  classroom: string
  description: string
  id: number
  status: 'apv' | 'rej' | 'req'
}

const filterTab = ref('all')
const cancelDialog = ref(false)
const selectedReservation = ref<null | Reservation>(null)

const message = useMessagesStore()

const { data: queryData, refetch } = useQuery(getApiUserApplicationQuery({ body: {} }))

const reservations = computed<Reservation[]>(() => {
  if (!queryData.value?.data) return []
  const list = queryData.value.data
  return list.map(item => ({
    activityName: item.activity_name,
    classroom: item.comments[0]?.text.split('\n')[0] ?? '',
    description: item.description,
    id: item.id,
    status: mapStatus(item.application_status)
  }))
})

function mapStatus(status: string): Reservation['status'] {
  const statusMap: Record<string, Reservation['status']> = { apv: 'apv', rej: 'rej', req: 'req' }
  return statusMap[status] ?? 'req'
}

const filteredReservations = computed(() => {
  if (filterTab.value === 'all') return reservations.value

  const statusMap: Record<string, Reservation['status']> = { approved: 'apv', pending: 'req', rejected: 'rej' }
  return reservations.value.filter(r => r.status === statusMap[filterTab.value])
})

function canCancel(reservation: Reservation): boolean {
  return ['approved', 'pending'].includes(reservation.status)
}

async function confirmCancel() {
  if (!selectedReservation.value) return

  const { error } = await deleteApiApplicationByApplicationId({
    body: {},
    path: { application_id: selectedReservation.value.id.toString() }
  })

  if (error) return

  await refetch()
  cancelDialog.value = false
  message.add({ color: 'success', text: '取消预约成功' })
  selectedReservation.value = null
}

function getStatusColor(status: Reservation['status']): string {
  const colors: Record<Reservation['status'], string> = { apv: 'success', rej: 'error', req: 'warning' }
  return colors[status]
}

function getStatusText(status: Reservation['status']): string {
  const texts: Record<Reservation['status'], string> = { apv: '已通过', rej: '已驳回', req: '待审核' }
  return texts[status]
}

function openCancelDialog(reservation: Reservation) {
  selectedReservation.value = reservation
  cancelDialog.value = true
}
</script>

<style scoped>
.reservation-card {
  position: relative;
  overflow: hidden;
  --reservation-primary: #0081e4;
  --reservation-outline: rgb(var(--v-theme-primary) / 0.14);
  --reservation-text-primary: #0f2a45;
  --reservation-text-secondary: #4d6682;
  border: 1px solid var(--reservation-outline);
  background: #feffff;
  box-shadow:
    0 8px 16px rgb(0 0 0 / 0.1),
    0 4px 8px rgb(0 0 0 / 0.06),
    inset 0 1px 0 rgb(255 255 255 / 0.8) !important;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.reservation-card.v-card {
  background: #ffffff;
}

.reservation-card :deep(.v-card__underlay) {
  opacity: 0;
}

.reservation-card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--v-theme-primary) / 0.28);
  box-shadow:
    0 12px 24px rgb(0 0 0 / 0.15),
    0 8px 16px rgb(0 0 0 / 0.1),
    inset 0 1px 0 rgb(255 255 255 / 0.8);
}

.reservation-card__halo {
  pointer-events: none;
  position: absolute;
  inset: 0;
  opacity: 0;
}

.reservation-card__header,
.reservation-card__meta,
.reservation-card__actions {
  position: relative;
  z-index: 1;
}

.reservation-card__header {
  padding: 20px 20px 8px;
}

.reservation-card__title-wrap {
  gap: 10px;
}

.reservation-card__title {
  color: var(--reservation-text-primary);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.reservation-card__status {
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.reservation-card__subtitle {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--reservation-text-secondary);
  font-size: 14px;
}

.reservation-card__subtitle-icon {
  color: var(--reservation-primary);
}

.reservation-card__meta {
  padding: 0 20px 8px;
}

.reservation-card__description {
  color: var(--reservation-text-secondary);
  line-height: 1.65;
  min-height: 44px;
}

.reservation-card__actions {
  padding: 8px 20px 18px;
}

.reservation-card__action-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

@media (max-width: 600px) {
  .reservation-card__header {
    padding: 16px 16px 8px;
  }

  .reservation-card__meta {
    padding: 0 16px 6px;
  }

  .reservation-card__actions {
    padding: 8px 16px 14px;
  }

  .reservation-card__title {
    font-size: 19px;
  }

  .reservation-card__subtitle {
    font-size: 13px;
  }
}
</style>
