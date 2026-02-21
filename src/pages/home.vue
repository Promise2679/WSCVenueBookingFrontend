<template>
  <v-app id="inspire">
    <v-app-bar class="px-3" density="comfortable">
      <v-icon icon="access-point" size="large"></v-icon>
      <v-spacer></v-spacer>
      <v-tabs align-tabs="center" color="grey-darken-2">
        <v-tab v-for="tab in homeTabs" :key="tab.name" :to="tab.path">
          <v-icon :icon="tab.icon" size="large"></v-icon>
        </v-tab>
      </v-tabs>
      <v-tabs align-tabs="center" color="grey-darken-2">
        <v-tab color="red" hide-slider>
          <v-icon icon="mdi-exit-to-app" size="large" color="red"></v-icon>
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <RouterView></RouterView>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { homeTabs } from '@/constants/tabs'
</script>
