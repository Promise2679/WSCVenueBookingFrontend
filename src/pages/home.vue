<template>
  <v-app id="inspire">
    <v-app-bar class="px-3" density="comfortable">
      <v-icon icon="access-point" size="large" />
      <v-spacer />
      <v-tabs align-tabs="center" color="grey-darken-2">
        <v-tab to="/" hide-slider>
          <v-icon icon="mdi-home" size="large" />
        </v-tab>
        <v-tab to="/notice" hide-slider>
          <v-icon icon="mdi-email" size="large" />
        </v-tab>
        <v-tab hide-slider>
          <v-icon icon="mdi-cog" size="large" />
          <v-menu activator="parent">
            <v-list>
              <v-list-item v-for="(item, index) in settings" :key="item.label" :value="index" :to="item.path">
                <v-list-item-title>{{ item.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-tab>
        <v-tab color="red" hide-slider @click="showLogoutDialog = true">
          <v-icon color="red" icon="mdi-exit-to-app" size="large" />
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <RouterView />
    </v-main>

    <v-dialog v-model="showLogoutDialog" max-width="300">
      <v-card>
        <v-card-text>确定退出登录吗？</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showLogoutDialog = false">取消</v-btn>
          <v-btn variant="flat" @click="logout">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import { settings } from '@/constants/settings'
import router from '@/router'
import { useUserStore } from '@/stores/user'

const showLogoutDialog = ref(false)

async function logout() {
  const { name, token, uid } = storeToRefs(useUserStore())
  name.value = ''
  token.value = ''
  uid.value = ''

  await router.push('/login')
}
</script>
