<template>
  <v-app>
    <v-sheet class="ma-auto text-center" width="300">
      <div class="text-h5 mb-5">场地预约系统</div>
      <v-form @submit.prevent>
        <v-text-field v-model="username" :rules="[Boolean]" label="用户名"></v-text-field>
        <v-text-field
          v-model="password"
          :rules="[Boolean]"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append="showPassword = !showPassword"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
        ></v-text-field>
        <v-btn @click="handleLogin" :loading="isLoading" class="mt-2" text="登录" type="submit"></v-btn>
        <div>忘记密码</div>
      </v-form>
    </v-sheet>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import { getApiLoginSessionSalt, postApiLogin } from '@/api'
import { useUserStore } from '@/stores/user'

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

  // TODO: 哈希算法具体逻辑待讨论，先不写
  const encryptedToken = '123'

  const { data } = await postApiLogin({ body: { login_name: username.value, login_token: encryptedToken } })
  if (!data) {
    isLoading.value = false
    return
  }
  const { display_name: name, uid, webtoken: token } = data.data
  useUserStore().$patch({ name, token, uid })

  isLoading.value = false
}
</script>
