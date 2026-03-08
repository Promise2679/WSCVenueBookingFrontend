<template>
  <v-container class="edit-page">
    <v-card class="edit-card mb-4" variant="outlined">
      <v-card-title class="edit-card__title">联系电话</v-card-title>
      <v-card-text class="edit-card__body">
        <v-text-field
          v-model="editingPhone"
          class="edit-input"
          label="联系电话"
          :readonly="!isEditingPhone"
          variant="outlined"
          density="comfortable"
          :append-inner-icon="isEditingPhone ? 'mdi-check' : 'mdi-pencil'"
          @click:append-inner="togglePhoneEdit"
        />
      </v-card-text>
    </v-card>

    <v-card class="edit-card" variant="outlined">
      <v-card-title class="edit-card__title">修改密码</v-card-title>
      <v-card-text class="edit-card__body">
        <v-text-field
          v-model="originalPassword"
          class="edit-input mb-2"
          label="原密码"
          type="password"
          variant="outlined"
          density="comfortable"
        />
        <v-text-field
          v-model="newPassword"
          class="edit-input mb-2"
          label="新密码"
          type="password"
          variant="outlined"
          density="comfortable"
        />
        <v-text-field
          v-model="confirmPassword"
          class="edit-input mb-4"
          label="确认密码"
          type="password"
          variant="outlined"
          density="comfortable"
        />
        <v-btn class="edit-submit" color="primary" size="large" @click="changePassword">确认修改</v-btn>
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

<style scoped>
.edit-page {
  max-width: 760px;
  padding-block: 24px;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.edit-card {
  border: 1px solid rgb(var(--v-theme-primary) / 0.14);
  border-radius: 20px;
  background:
    radial-gradient(circle at 8% 12%, rgb(var(--v-theme-primary) / 0.14) 0%, transparent 44%),
    linear-gradient(165deg, rgb(255 255 255 / 0.95) 0%, rgb(242 248 255 / 0.88) 100%);
  box-shadow: 0 18px 34px rgb(var(--v-theme-primary) / 0.1);
}

.edit-card__title {
  padding: 20px 24px 20px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #0f2a45;
}

.edit-card__body {
  padding: 0 24px 0;
}

.edit-input :deep(.v-field) {
  border-radius: 12px;
  background-color: rgb(255 255 255 / 0.85);
}

.edit-submit {
  min-height: 44px;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

@media (max-width: 600px) {
  .edit-page {
    padding-block: 16px;
  }

  .edit-card__title {
    font-size: 18px;
    padding: 18px 16px 10px;
  }

  .edit-card__body {
    padding: 0 16px 16px;
  }
}
</style>
