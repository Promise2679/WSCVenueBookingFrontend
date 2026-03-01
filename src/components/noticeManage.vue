<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col cols="12" class="d-flex align-center flex-wrap ga-2">
        <v-card-title class="text-h5 pa-0 mr-2">公告管理</v-card-title>
        <v-btn prepend-icon="mdi-calendar-clock" to="/"> 预约场地 </v-btn>
        <v-btn prepend-icon="mdi-domain" to="/admin"> 管理场地 </v-btn>
        <v-btn prepend-icon="mdi-account-group" to="/user-manage"> 用户管理 </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2">
      <v-card-title class="d-flex align-center flex-wrap ga-2 pb-0">
        <span>公告列表</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="搜索公告"
          single-line
          hide-details
          density="compact"
          style="max-width: 250px"
          clearable
        />
        <v-btn color="primary" size="small" prepend-icon="mdi-plus" @click="openCreateDialog"> 发布公告 </v-btn>
        <v-btn color="secondary" size="small" prepend-icon="mdi-refresh" @click="fetchNotices" :loading="loading">
          刷新
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="noticesWithStatus" :loading="loading" :items-per-page="10">
        <template #item.title="{ item }">
          <div class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-bullhorn</v-icon>
            {{ item.title }}
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status ?? 0)" size="small" variant="flat">
            {{ getStatusText(item.status ?? 0) }}
          </v-chip>
        </template>

        <template #item.release_time="{ item }">
          {{ formatDate(item.release_time) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn icon size="small" color="info" variant="text" @click="viewNotice(item)">
            <v-icon>mdi-eye</v-icon>
            <v-tooltip activator="parent" location="top">查看详情</v-tooltip>
          </v-btn>
          <v-btn icon size="small" color="warning" variant="text" @click="openEditDialog(item)">
            <v-icon>mdi-pencil</v-icon>
            <v-tooltip activator="parent" location="top">编辑</v-tooltip>
          </v-btn>
          <v-btn icon size="small" color="error" variant="text" @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">删除</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="formDialog" max-width="600">
      <v-card>
        <v-card-title>{{ isEdit ? '编辑公告' : '发布公告' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formData.title"
            label="公告标题"
            variant="outlined"
            density="compact"
            :rules="[v => !!v || '标题不能为空']"
            class="mb-2"
          />

          <v-select
            v-model="formData.status"
            :items="statusOptions"
            item-title="text"
            item-value="value"
            label="发布状态"
            variant="outlined"
            density="compact"
            class="mb-2"
          />

          <v-text-field
            v-model="formData.release_time"
            label="发布时间"
            type="datetime-local"
            variant="outlined"
            density="compact"
            class="mb-2"
          />

          <v-textarea
            v-model="formData.content"
            label="公告内容"
            variant="outlined"
            rows="5"
            :rules="[v => !!v || '内容不能为空']"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveNotice">
            {{ isEdit ? '保存' : '发布' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-2">mdi-bullhorn</v-icon>
          {{ selectedNotice?.title }}
        </v-card-title>
        <v-card-text>
          <v-chip :color="getStatusColor(1)" size="small" class="mb-4">
            {{ getStatusText(1) }}
          </v-chip>

          <div class="text-caption text-grey mb-2">发布时间: {{ formatDate(selectedNotice?.release_time) }}</div>

          <v-divider class="mb-4" />

          <div class="notice-content">
            {{ selectedNotice?.content }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-error">确认删除</v-card-title>
        <v-card-text>
          确定要删除公告 <strong>{{ selectedNotice?.title }}</strong> 吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteNotice">删除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useMutation, useQuery } from '@pinia/colada'
import { computed, onMounted, reactive, ref } from 'vue'

import {
  deleteApiNotificationByNotificationIdMutation,
  getApiNotificationQuery,
  postApiNotificationMutation,
  putApiNotificationByNotificationIdMutation
} from '@/api/@pinia/colada.gen'

interface Attachment {
  file_name: string
  file_token: string
  file_type: string
  index: number
}

interface Notice {
  attachments: Attachment[]
  content: string
  notification_id: number
  release_time: string
  sender_uid: string
  title: string
}

interface StatusOption {
  text: string
  value: number
}

const search = ref('')
const formDialog = ref(false)
const viewDialog = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedNotice = ref<Notice | null>(null)

const formData = reactive({ content: '', release_time: '', status: 1, title: '' })

const snackbar = reactive({ color: 'success', show: false, text: '' })

const headers = [
  { key: 'title', sortable: true, title: '标题' },
  { key: 'status', sortable: true, title: '状态', width: '120' },
  { key: 'release_time', sortable: true, title: '发布时间', width: '180' },
  { align: 'center' as const, key: 'actions', sortable: false, title: '操作', width: '150' }
]

const statusOptions: StatusOption[] = [
  { text: '立即发布', value: 1 },
  { text: '定时发布', value: 2 },
  { text: '草稿', value: 3 }
]

const { data: noticesData, isLoading: loading, refetch: fetchNotices } = useQuery(getApiNotificationQuery())

const filteredNotices = computed(() => {
  const data = noticesData.value?.data ?? []
  if (!search.value) return data
  const query = search.value.toLowerCase()
  return data.filter((n: { title: string }) => n.title.toLowerCase().includes(query))
})

const noticesWithStatus = computed(() => filteredNotices.value.map(n => ({ ...n, status: 1 })))

const getStatusColor = (status: number): string => {
  const colors: Record<number, string> = { 1: 'success', 2: 'info', 3: 'warning' }
  return colors[status] ?? 'grey'
}

const getStatusText = (status: number): string => {
  const texts: Record<number, string> = { 1: '已发布', 2: '定时发布', 3: '草稿' }
  return texts[status] ?? '未知'
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const openCreateDialog = () => {
  isEdit.value = false
  formData.title = ''
  formData.content = ''
  formData.status = 1
  formData.release_time = ''
  formDialog.value = true
}

const openEditDialog = (notice: Notice) => {
  isEdit.value = true
  selectedNotice.value = notice
  formData.title = notice.title
  formData.content = notice.content
  formData.status = 1
  formData.release_time = notice.release_time ? notice.release_time.slice(0, 16) : ''
  formDialog.value = true
}

const viewNotice = (notice: Notice) => {
  selectedNotice.value = notice
  viewDialog.value = true
}

const confirmDelete = (notice: Notice) => {
  selectedNotice.value = notice
  deleteDialog.value = true
}

const { mutate: createNotice } = useMutation(postApiNotificationMutation())
const { mutate: updateNotice } = useMutation(putApiNotificationByNotificationIdMutation())
const { mutate: removeNotice } = useMutation(deleteApiNotificationByNotificationIdMutation())

const saveNotice = () => {
  if (!formData.title || !formData.content) {
    showSnackbar('请填写标题和内容', 'error')
    return
  }

  saving.value = true

  const body = {
    attachments: [],
    content: formData.content,
    release_time: formData.release_time || new Date().toISOString(),
    status: formData.status,
    title: formData.title
  }

  if (isEdit.value && selectedNotice.value) {
    updateNotice({
      body: { ...body, recevier: null as unknown as string },
      path: { notification_id: selectedNotice.value.notification_id.toString() }
    })

    showSnackbar('公告更新成功', 'success')
    formDialog.value = false
    void fetchNotices()
  } else {
    createNotice({ body: { ...body, recevier_uid: '' } })
    showSnackbar('公告发布成功', 'success')
    formDialog.value = false
    void fetchNotices()
  }

  saving.value = false
}

const deleteNotice = () => {
  if (!selectedNotice.value) return

  deleting.value = true
  removeNotice({ body: {}, path: { notification_id: selectedNotice.value.notification_id.toString() } })

  showSnackbar('公告删除成功', 'success')
  deleteDialog.value = false
  void fetchNotices()

  deleting.value = false
}

const showSnackbar = (text: string, color: string) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

onMounted(() => {
  void fetchNotices()
})
</script>

<style scoped>
.notice-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
