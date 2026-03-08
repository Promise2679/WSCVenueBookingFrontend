<template>
  <v-app class="login-page">
    <div class="login-stage">
      <v-card class="auth-card" rounded="xl" elevation="14">
        <v-card-text class="auth-card__body">
          <div class="auth-header">
            <p class="auth-eyebrow">WSC Venue Booking</p>
            <h1 class="auth-title">场地预约系统</h1>
            <p class="auth-subtitle">
              {{ isRegisterMode ? '创建新账号后即可提交场地申请。' : '登录后继续预约、审批和管理场地。' }}
            </p>
          </div>

          <div class="mode-switch" role="tablist" aria-label="身份操作切换">
            <v-btn
              class="mode-switch__button"
              :variant="isRegisterMode ? 'text' : 'flat'"
              :color="isRegisterMode ? undefined : 'primary'"
              @click="isRegisterMode = false"
            >
              登录
            </v-btn>
            <v-btn
              class="mode-switch__button"
              :variant="isRegisterMode ? 'flat' : 'text'"
              :color="isRegisterMode ? 'primary' : undefined"
              @click="isRegisterMode = true"
            >
              注册
            </v-btn>
          </div>

          <v-form v-if="!isRegisterMode" class="auth-form" @submit.prevent="handleLogin">
            <v-text-field
              v-model="username"
              :rules="[Boolean]"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="username"
              label="用户名"
            />
            <v-text-field
              v-model="password"
              :rules="[Boolean]"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="current-password"
              label="密码"
            />

            <v-btn :loading="isLoading" class="auth-submit" color="primary" size="large" type="submit" block>
              登录
            </v-btn>

            <div class="auth-switch">
              <span>还没有账号？</span>
              <v-btn variant="text" size="small" class="auth-link" @click="isRegisterMode = true">立即注册</v-btn>
            </div>
          </v-form>

          <v-form v-else class="auth-form" @submit.prevent="handleRegister">
            <v-text-field
              v-model="regUsername"
              :rules="[Boolean]"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="username"
              label="用户名"
            />
            <v-text-field
              v-model="regSchoolId"
              :rules="[Boolean]"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="off"
              label="学号（12 位）"
            />
            <v-text-field
              v-model="regPassword"
              :rules="[Boolean]"
              :append-icon="showRegPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showRegPassword = !showRegPassword"
              :type="showRegPassword ? 'text' : 'password'"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="new-password"
              label="密码"
            />
            <v-text-field
              v-model="regConfirmPassword"
              :rules="[v => v === regPassword || '密码不一致']"
              :append-icon="showRegPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showRegPassword = !showRegPassword"
              :type="showRegPassword ? 'text' : 'password'"
              class="auth-input"
              density="comfortable"
              variant="outlined"
              hide-details="auto"
              autocomplete="new-password"
              label="确认密码"
            />

            <v-btn :loading="isLoading" class="auth-submit" color="primary" size="large" type="submit" block>
              注册账号
            </v-btn>

            <div class="auth-switch">
              <span>已有账号？</span>
              <v-btn variant="text" size="small" class="auth-link" @click="isRegisterMode = false">返回登录</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
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

<style scoped>
.login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 18%, rgb(var(--v-theme-primary) / 0.22) 0%, transparent 42%),
    radial-gradient(circle at 88% 10%, rgb(var(--v-theme-secondary) / 0.18) 0%, transparent 36%),
    linear-gradient(160deg, #f2f7ff 0%, #ecf5ff 45%, #f8fbff 100%);
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.login-stage {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card {
  width: min(100%, 460px);
  border: 1px solid rgb(var(--v-theme-primary) / 0.14);
  box-shadow: 0 24px 48px rgb(var(--v-theme-primary) / 0.12);
}

.auth-card__body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.auth-eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--v-theme-primary-darken-1));
  margin: 0;
}

.auth-title {
  margin: 0;
  font-size: 32px;
  line-height: 1.1;
  font-weight: 700;
  color: #0f2a45;
}

.auth-subtitle {
  margin: 0;
  color: #4d6682;
  font-size: 14px;
  line-height: 1.5;
}

.mode-switch {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 6px;
  padding: 4px;
  border-radius: 14px;
  background-color: #e8f3ff;
}

.mode-switch__button {
  min-height: 40px;
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-input {
  margin-bottom: 4px;
}

.auth-input :deep(.v-field) {
  border-radius: 12px;
}

.auth-submit {
  min-height: 44px;
  margin-top: 0;
  border-radius: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.auth-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #4d6682;
  font-size: 13px;
}

.auth-link {
  min-width: auto;
  padding-inline: 6px;
}

@media (max-width: 600px) {
  .login-stage {
    padding: 16px;
  }

  .auth-card__body {
    padding: 24px 20px;
  }

  .auth-title {
    font-size: 28px;
  }
}
</style>
