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
              <span class="text-body-2">{{ item.username?.charAt(0)?.toUpperCase() }}</span>
            </v-avatar>
            {{ item.username }}
          </div>
        </template>

        <template #item.identity="{ item }">
          <v-chip :color="getIdentityColor(item.perm_map)" size="small" variant="flat">
            {{ getIdentityText(item.perm_map) }}
          </v-chip>
        </template>

        <template #item.avg_id="{ item }">
          {{ item.uid }}
        </template>

        <template #item.actions="{ item }">
          <v-btn icon size="small" color="warning" variant="text" @click="openPermissionDialog(item)">
            <v-icon>mdi-shield-account</v-icon>
            <v-tooltip activator="parent" location="top">修改权限</v-tooltip>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="permissionDialog" max-width="400">
      <v-card>
        <v-card-title>修改用户权限</v-card-title>
        <v-card-text>
          <p class="mb-4">
            用户: <strong>{{ selectedUser?.username }}</strong>
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
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, ref } from 'vue'

import { getApiAccountQuery } from '@/api/@pinia/colada.gen'
import { putApiUserSystemPermission } from '@/api/sdk.gen'
import { useMessagesStore } from '@/stores/message'

interface PermissionOption {
  text: string
  value: number
}

interface User {
  perm_map: number
  perm_vagid: number
  phone_number: string
  real_name: string
  registered_at: string
  school_id: string
  uid: string
  updated_at: string
  username: string
}

const savingPermission = ref(false)
const search = ref('')
const permissionDialog = ref(false)

const message = useMessagesStore()

const filteredUsers = computed(() => {
  const data = usersData.value?.data ?? []
  if (!search.value) return data
  const query = search.value.toLowerCase()
  return data.filter(
    (u: User) =>
      u.username.toLowerCase().includes(query) ||
      u.uid.toLowerCase().includes(query) ||
      getIdentityText(u.perm_map).toLowerCase().includes(query)
  )
})
const selectedUser = ref<null | User>(null)
const selectedPermission = ref<number>(0)

const headers = [
  { key: 'name', sortable: true, title: '用户名' },
  { key: 'identity', sortable: true, title: '身份', width: '100' },
  { key: 'avg_id', sortable: true, title: '用户ID', width: '120' },
  { align: 'center' as const, key: 'actions', sortable: false, title: '操作', width: '120' }
]

const permissionOptions: PermissionOption[] = [
  { text: '普通用户', value: 0 },
  { text: '学生', value: 1 },
  { text: '教师', value: 2 }
]

const getIdentityColor = (identity: number): string => (identity === 1 ? 'blue' : 'green')
const getIdentityText = (identity: number): string => (identity === 1 ? '用户' : '管理员')

const { data: usersData, isLoading: loading, refetch: fetchUsers } = useQuery(getApiAccountQuery())

const openPermissionDialog = (user: User) => {
  selectedUser.value = user
  selectedPermission.value = user.perm_map
  permissionDialog.value = true
}

const savePermission = async () => {
  if (!selectedUser.value) return

  savingPermission.value = true
  const res = await putApiUserSystemPermission({
    body: { system_permission: selectedPermission.value, uids: [selectedUser.value.uid] }
  })

  if (res.error) message.add({ color: 'error', text: '网络错误，请稍后重试' })
  else if (res.data?.code === 200) {
    message.add({ color: 'success', text: '权限修改成功' })
    permissionDialog.value = false
    void fetchUsers()
  } else message.add({ color: 'error', text: res.data?.msg ?? '权限修改失败' })

  savingPermission.value = false
}
</script>
