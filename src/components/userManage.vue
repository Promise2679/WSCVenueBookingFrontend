<template>
  <v-container>
    <v-row class="mb-4" align="center">
      <v-col cols="12" class="d-flex align-center flex-wrap ga-2">
        <v-card-title class="text-h5 pa-0 mr-2">用户管理</v-card-title>
        <v-btn prepend-icon="mdi-calendar-clock" to="/"> 预约场地 </v-btn>
        <v-btn prepend-icon="mdi-domain" to="/admin"> 管理场地 </v-btn>
        <v-btn prepend-icon="mdi-bullhorn" to="/notice-manage"> 公告管理 </v-btn>
      </v-col>
    </v-row>

    <v-card elevation="2">
      <v-card-title class="d-flex align-center flex-wrap ga-2 pb-0">
        <span>用户列表</span>
        <v-spacer />
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="搜索用户"
          single-line
          hide-details
          density="compact"
          style="max-width: 250px"
          clearable
        />
        <v-btn color="primary" size="small" prepend-icon="mdi-refresh" @click="fetchUsers" :loading="loading">
          刷新
        </v-btn>
      </v-card-title>

      <v-data-table :headers="headers" :items="filteredUsers" :loading="loading" :items-per-page="10">
        <template #item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-body-2">{{ item.name?.charAt(0)?.toUpperCase() }}</span>
            </v-avatar>
            {{ item.name }}
          </div>
        </template>

        <template #item.identity="{ item }">
          <v-chip :color="getIdentityColor(item.identity)" size="small" variant="flat">
            {{ getIdentityText(item.identity) }}
          </v-chip>
        </template>

        <template #item.applications_num="{ item }">
          <div class="text-caption">
            <div>总数: {{ item.applications_num?.total_applications ?? 0 }}</div>
            <div>使用: {{ item.applications_num?.use ?? 0 }}</div>
            <div>取消: {{ item.applications_num?.cancel ?? 0 }}</div>
            <div v-if="item.applications_num?.review >= 0">审核: {{ item.applications_num?.review }}</div>
          </div>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon size="small" color="warning" variant="text" @click="openPermissionDialog(item)">
            <v-icon>mdi-shield-account</v-icon>
            <v-tooltip activator="parent" location="top">修改权限</v-tooltip>
          </v-btn>
          <v-btn icon size="small" color="error" variant="text" @click="confirmDelete(item)">
            <v-icon>mdi-delete</v-icon>
            <v-tooltip activator="parent" location="top">删除用户</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="permissionDialog" max-width="400">
      <v-card>
        <v-card-title>修改用户权限</v-card-title>
        <v-card-text>
          <p class="mb-4">
            用户: <strong>{{ selectedUser?.name }}</strong>
          </p>
          <v-select
            v-model="selectedPermission"
            :items="permissionOptions"
            item-title="text"
            item-value="value"
            label="选择权限等级"
            variant="outlined"
            density="compact"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="permissionDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="savingPermission" @click="savePermission"> 保存 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-error">确认删除</v-card-title>
        <v-card-text>
          确定要删除用户 <strong>{{ selectedUser?.name }}</strong> 吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">取消</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteUser"> 删除 </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, onMounted, reactive, ref } from 'vue'

import { getApiAccountQuery } from '@/api/@pinia/colada.gen'
import { putApiUserSystemPermission } from '@/api/sdk.gen'

interface PermissionOption {
  text: string
  value: number
}

interface User {
  applications_num: { cancel: number; review: number; total_applications: number; use: number }
  avg_id: number
  identity: number
  name: string
}

const savingPermission = ref(false)
const deleting = ref(false)
const search = ref('')
const permissionDialog = ref(false)

const filteredUsers = computed(() => {
  const data = usersData.value?.data ?? []
  if (!search.value) return data
  const query = search.value.toLowerCase()
  return data.filter(
    (u: User) =>
      u.name.toLowerCase().includes(query) ||
      u.avg_id.toString().includes(query) ||
      getIdentityText(u.identity).toLowerCase().includes(query)
  )
})
const deleteDialog = ref(false)
const selectedUser = ref<null | User>(null)
const selectedPermission = ref<number>(0)

const snackbar = reactive({ color: 'success', show: false, text: '' })

const headers = [
  { key: 'name', sortable: true, title: '用户名' },
  { key: 'identity', sortable: true, title: '身份', width: '100' },
  { key: 'avg_id', sortable: true, title: '用户ID', width: '120' },
  { key: 'applications_num', sortable: false, title: '申请统计', width: '150' },
  { align: 'center' as const, key: 'actions', sortable: false, title: '操作', width: '120' }
]

const permissionOptions: PermissionOption[] = [
  { text: '普通用户', value: 0 },
  { text: '学生', value: 1 },
  { text: '教师', value: 2 }
]

const getIdentityColor = (identity: number): string => {
  const colors: Record<number, string> = { 0: 'grey', 1: 'blue', 2: 'green' }
  return colors[identity] ?? 'grey'
}

const getIdentityText = (identity: number): string => {
  const texts: Record<number, string> = { 0: '普通用户', 1: '学生', 2: '教师' }
  return texts[identity] ?? '未知'
}

const { data: usersData, isLoading: loading, refetch: fetchUsers } = useQuery(getApiAccountQuery())

const openPermissionDialog = (user: User) => {
  selectedUser.value = user
  selectedPermission.value = user.identity
  permissionDialog.value = true
}

const savePermission = async () => {
  if (!selectedUser.value) return

  savingPermission.value = true
  const res = await putApiUserSystemPermission({
    body: { system_permission: selectedPermission.value, uids: [selectedUser.value.avg_id.toString()] }
  })

  if (res.error) showSnackbar('网络错误，请稍后重试', 'error')
  else if (res.data?.code === 200) {
    showSnackbar('权限修改成功', 'success')
    permissionDialog.value = false
    void fetchUsers()
  } else showSnackbar(res.data?.msg ?? '权限修改失败', 'error')

  savingPermission.value = false
}

const confirmDelete = (user: User) => {
  selectedUser.value = user
  deleteDialog.value = true
}

const deleteUser = () => {
  if (!selectedUser.value) return

  deleting.value = true
  try {
    showSnackbar('删除功能开发中', 'warning')
    deleteDialog.value = false
  } finally {
    deleting.value = false
  }
}

const showSnackbar = (text: string, color: string) => {
  snackbar.text = text
  snackbar.color = color
  snackbar.show = true
}

onMounted(() => {
  void fetchUsers()
})
</script>
