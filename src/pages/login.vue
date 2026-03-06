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
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getApiLoginSessionSalt, postApiLogin, postApiRegister } from '@/api'
import router from '@/router'
import { useMessagesStore } from '@/stores/message'
import { useUserStore } from '@/stores/user'
import { generateSalt } from '@/utils/salt'
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

const message = useMessagesStore()

async function handleLogin() {
  isLoading.value = true

  const { data: saltRawData } = await getApiLoginSessionSalt({ query: { login_name: username.value } })
  if (!saltRawData) {
    isLoading.value = false
    return
  }

  const { session_salt, user_salt } = saltRawData.data
  const encryptedToken = session_salt + secureHash(password.value, user_salt, session_salt)

  const { data } = await postApiLogin({ body: { login_name: username.value, login_token: encryptedToken } })
  if (!data) {
    isLoading.value = false
    return
  }

  const { display_name: name, system_permission_map: map, uid, webtoken: token } = data.data
  useUserStore().$patch({ map, name, token, uid })

  await router.push('/')
  isLoading.value = false
}

async function handleRegister() {
  if (regPassword.value !== regConfirmPassword.value) {
    message.add({ color: 'error', text: '两次输入的密码不一致' })
    return
  }

  if (regSchoolId.value.length !== 12) {
    message.add({ color: 'error', text: '请输入 12 位学号' })
    return
  }

  isLoading.value = true

  const passwordSalt = generateSalt()
  const passwordHash = sha256(passwordSalt + regPassword.value)

  const { error } = await postApiRegister({
    body: {
      password_hash: passwordHash,
      password_salt: passwordSalt,
      school_id: regSchoolId.value,
      username: regUsername.value
    }
  })

  if (error) {
    isLoading.value = false
    return
  }

  message.add({ color: 'success', text: '注册成功，请登录' })
  isRegisterMode.value = false
  username.value = regUsername.value
  regUsername.value = ''
  regSchoolId.value = ''
  regPassword.value = ''
  regConfirmPassword.value = ''

  isLoading.value = false
}
</script>
