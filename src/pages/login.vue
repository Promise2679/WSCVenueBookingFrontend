<template>
  <v-app>
    <v-sheet class="ma-auto text-center" width="300">
      <div class="text-h5 mb-5">场地预约系统</div>
      <v-form v-if="!isRegisterMode" @submit.prevent="handleLogin">
        <v-text-field v-model="username" :rules="[Boolean]" label="用户名" />
        <v-text-field
          v-model="password"
          :rules="[Boolean]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
        />
        <v-btn :loading="isLoading" class="mt-2" text="登录" type="submit" block />
        <v-btn variant="text" class="mt-2" block @click="isRegisterMode = true">注册账号</v-btn>
      </v-form>
      <v-form v-else @submit.prevent="handleRegister">
        <v-text-field v-model="regUsername" :rules="[Boolean]" label="用户名" />
        <v-text-field v-model="regSchoolId" :rules="[Boolean]" label="学号" />
        <v-text-field
          v-model="regPassword"
          :rules="[Boolean]"
          :append-icon="showRegPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showRegPassword = !showRegPassword"
          :type="showRegPassword ? 'text' : 'password'"
          label="密码"
        />
        <v-text-field
          v-model="regConfirmPassword"
          :rules="[v => v === regPassword || '密码不一致']"
          :type="showRegPassword ? 'text' : 'password'"
          label="确认密码"
        />
        <v-btn :loading="isLoading" class="mt-2" text="注册" type="submit" block />
        <v-btn variant="text" class="mt-2" block @click="isRegisterMode = false">返回登录</v-btn>
      </v-form>
    </v-sheet>
    <v-snackbar v-model="showSnackbar" :color="snackbarColor">
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getApiLoginSessionSalt, postApiLogin, postApiRegister } from '@/api'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { secureHash, sha256 } from '@/utils/sha256'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const isRegisterMode = ref(false)

const regUsername = ref('')
const regSchoolId = ref('')
const regPassword = ref('')
const regConfirmPassword = ref('')
const showRegPassword = ref(false)

const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

function generateSalt(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) result += chars.charAt(Math.floor(Math.random() * chars.length))

  return result
}

async function handleLogin() {
  isLoading.value = true

  const { data: saltRawData } = await getApiLoginSessionSalt({ query: { login_name: username.value } })
  if (!saltRawData) {
    isLoading.value = false
    return
  }

  const { session_salt, user_salt } = saltRawData.data
  const encryptedToken = session_salt + (await secureHash(password.value, user_salt, session_salt))

  const { data } = await postApiLogin({ body: { login_name: username.value, login_token: encryptedToken } })
  if (!data) {
    isLoading.value = false
    return
  }
  const { display_name: name, uid, webtoken: token } = data.data
  useUserStore().$patch({ name, token, uid })

  await router.push('/')
  isLoading.value = false
}

async function handleRegister() {
  if (regPassword.value !== regConfirmPassword.value) {
    showMessage('两次输入的密码不一致', 'error')
    return
  }

  isLoading.value = true

  const passwordSalt = generateSalt()
  const passwordHash = await sha256(regPassword.value + passwordSalt)

  const { error } = await postApiRegister({
    body: {
      password_hash: passwordHash,
      password_salt: passwordSalt,
      school_id: regSchoolId.value,
      username: regUsername.value
    }
  })

  if (error) return

  showMessage('注册成功，请登录')
  isRegisterMode.value = false
  username.value = regUsername.value
  regUsername.value = ''
  regSchoolId.value = ''
  regPassword.value = ''
  regConfirmPassword.value = ''

  isLoading.value = false
}

function showMessage(text: string, color = 'success') {
  snackbarText.value = text
  snackbarColor.value = color
  showSnackbar.value = true
}
</script>
