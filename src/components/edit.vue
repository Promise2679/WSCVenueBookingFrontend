<template>
  <v-container>
    <v-card class="mb-4" variant="outlined">
      <v-card-title>联系电话</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="editingPhone"
          label="联系电话"
          :readonly="!isEditingPhone"
          variant="outlined"
          density="comfortable"
          :append-inner-icon="isEditingPhone ? 'mdi-check' : 'mdi-pencil'"
          @click:append-inner="togglePhoneEdit"
        />
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-card-title>修改密码</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="originalPassword"
          label="原密码"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        />
        <v-text-field
          v-model="newPassword"
          label="新密码"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-2"
        />
        <v-text-field
          v-model="confirmPassword"
          label="确认密码"
          type="password"
          variant="outlined"
          density="comfortable"
          class="mb-4"
        />
        <v-btn size="large" @click="changePassword">确认修改</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'

import { getApiUserProfile, postApiUserChangePassword, putApiUserProfile } from '@/api'
import { useUserStore } from '@/stores/user'
import { generateSalt } from '@/utils/salt'

const rawPhone = ref('')
const phoneDisplay = computed(() => `${rawPhone.value.slice(0, 3)}****${rawPhone.value.slice(-4)}`)

const isEditingPhone = ref(false)
const editingPhone = ref(phoneDisplay.value)
const originalPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const { name } = storeToRefs(useUserStore())

async function togglePhoneEdit() {
  if (isEditingPhone.value) {
    isEditingPhone.value = false

    if (editingPhone.value.length !== 11) {
      editingPhone.value = phoneDisplay.value
      return
    }

    const { error } = await putApiUserProfile({ body: { phone_number: editingPhone.value, username: name.value } })
    if (error) return

    rawPhone.value = editingPhone.value
    editingPhone.value = phoneDisplay.value
  } else {
    editingPhone.value = rawPhone.value
    isEditingPhone.value = true
  }
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) return

  const salt = generateSalt()
  await postApiUserChangePassword({
    body: {
      new_password: newPassword.value,
      new_salt: salt,
      verify_data: originalPassword.value,
      verify_type: 'old_password'
    }
  })
}

onMounted(async () => {
  const { data, error } = await getApiUserProfile()
  if (!error && data) rawPhone.value = data.data.phone_number
  editingPhone.value = phoneDisplay.value
})
</script>
