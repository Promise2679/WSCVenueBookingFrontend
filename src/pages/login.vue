<template>
  <v-app>
    <v-sheet class="ma-auto text-center" width="300">
      <div class="text-h5 mb-5">场地预约系统</div>
      <v-form @submit.prevent="handleLogin">
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
      </v-form>
    </v-sheet>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getApiLoginSessionSalt, postApiLogin } from '@/api'
import router from '@/router'
import { useUserStore } from '@/stores/user'
import { sha256 } from '@/utils/sha256'

const username = ref('')
const password = ref('')

const showPassword = ref(false)
const isLoading = ref(false)

async function handleLogin() {
  isLoading.value = true

  const { data: saltRawData } = await getApiLoginSessionSalt({ query: { login_name: username.value } })
  if (!saltRawData) {
    isLoading.value = false
    return
  }

  const { session_salt, user_salt } = saltRawData.data
  const encryptedToken = session_salt + (await sha256(session_salt + (await sha256(password.value + user_salt))))

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
</script>
