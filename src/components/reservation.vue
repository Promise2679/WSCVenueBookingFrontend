<template>
  <v-container>
    <!-- 筛选标签 -->
    <v-tabs v-model="filterTab" color="primary" class="mb-4">
      <v-tab value="all">全部</v-tab>
      <v-tab value="pending">待审核</v-tab>
      <v-tab value="rejected">已驳回</v-tab>
      <v-tab value="approved">已通过</v-tab>
      <v-tab value="used">已使用</v-tab>
      <v-tab value="cancelled">已取消</v-tab>
    </v-tabs>

    <!-- 预约列表 -->
    <v-row>
      <v-col v-for="reservation in filteredReservations" :key="reservation.id" cols="12">
        <v-card class="fill-height" variant="outlined">
          <v-card-item>
            <v-card-title class="d-flex align-center">
              <span class="text-truncate">{{ reservation.activityName }}</span>
              <v-spacer />
              <v-chip :color="getStatusColor(reservation.status)" size="small" variant="flat">
                {{ getStatusText(reservation.status) }}
              </v-chip>
            </v-card-title>
            <v-card-subtitle>
              <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
              {{ reservation.classroom }}
            </v-card-subtitle>
          </v-card-item>

          <v-card-text class="pt-2">
            <div class="text-body-2 text-medium-emphasis description-text">
              {{ reservation.description }}
            </div>
          </v-card-text>

          <v-card-actions v-if="canCancel(reservation)">
            <v-spacer />
            <v-btn color="error" variant="outlined" size="small" @click="openCancelDialog(reservation)">
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

    <!-- 取消成功通知 -->
    <v-snackbar v-model="showSuccess" color="success" timeout="3000"> 取消预约成功 </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, ref } from 'vue'

import { deleteApiApplicationByApplicationId } from '@/api'
import { getApiUserApplicationQuery } from '@/api/@pinia/colada.gen'

interface Reservation {
  activityName: string
  classroom: string
  description: string
  id: number
  status: 'approved' | 'cancelled' | 'pending' | 'rejected' | 'used'
}

const filterTab = ref('all')
const cancelDialog = ref(false)
const showSuccess = ref(false)
const selectedReservation = ref<null | Reservation>(null)

const { data: queryData, refetch } = useQuery(getApiUserApplicationQuery({ body: {} }))

const reservations = computed<Reservation[]>(() => {
  if (!queryData.value?.data) return []
  const list = queryData.value.data[0] ?? []
  return list.map(item => ({
    activityName: item.activity_name,
    classroom: item.comments[0]?.text.split('\n')[0] ?? '',
    description: item.description,
    id: item.id,
    status: mapStatus(item.application_status)
  }))
})

function mapStatus(status: string): Reservation['status'] {
  const statusMap: Record<string, Reservation['status']> = {
    approved: 'approved',
    cancelled: 'cancelled',
    pending: 'pending',
    rejected: 'rejected',
    used: 'used'
  }
  return statusMap[status] ?? 'pending'
}

const filteredReservations = computed(() => {
  if (filterTab.value === 'all') return reservations.value

  const statusMap: Record<string, Reservation['status']> = {
    approved: 'approved',
    cancelled: 'cancelled',
    pending: 'pending',
    rejected: 'rejected',
    used: 'used'
  }
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
  showSuccess.value = true
  selectedReservation.value = null
}

function getStatusColor(status: Reservation['status']): string {
  const colors: Record<Reservation['status'], string> = {
    approved: 'success',
    cancelled: 'grey',
    pending: 'warning',
    rejected: 'error',
    used: 'info'
  }
  return colors[status]
}

function getStatusText(status: Reservation['status']): string {
  const texts: Record<Reservation['status'], string> = {
    approved: '已通过',
    cancelled: '已取消',
    pending: '待审核',
    rejected: '已驳回',
    used: '已使用'
  }
  return texts[status]
}

function openCancelDialog(reservation: Reservation) {
  selectedReservation.value = reservation
  cancelDialog.value = true
}
</script>
