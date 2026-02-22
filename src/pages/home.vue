<template>
  <v-app id="inspire">
    <v-app-bar class="px-3" density="comfortable">
      <v-icon icon="access-point" size="large" />
      <v-spacer />
      <v-tabs align-tabs="center" color="grey-darken-2">
        <v-tab v-for="tab in homeTabs" :key="tab.name" :to="tab.path" hide-slider :color="tab.color">
          <v-icon :icon="tab.icon" :color="tab.color" size="large" />
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main class="bg-grey-lighten-3">
      <RouterView />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { homeTabs } from '@/constants/tabs'
</script>
