<template>
  <v-container class="pa-4">
    <div class="d-flex justify-end mb-4 ga-2">
      <v-btn prepend-icon="mdi-calendar-plus">预约场地</v-btn>
      <v-btn prepend-icon="mdi-cog" to="/admin">管理场地</v-btn>
    </div>

    <v-row class="mb-4">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          placeholder="请输入关键词..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
        >
          <template v-slot:prepend>
            <v-btn icon="mdi-filter" variant="text" size="small" />
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="venue in venues" :key="venue.venue_id" cols="12" sm="6" md="4">
        <VenueCard :venue="venue" @refresh="refreshVenues" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { computed, ref } from 'vue'

import { getApiVenueQuery } from '@/api/@pinia/colada.gen'

import VenueCard from './venueCard.vue'

const search = ref('')

const { data, refetch } = useQuery(getApiVenueQuery({ body: {} }))
const venues = computed(() => data.value?.data ?? [])

async function refreshVenues() {
  await refetch()
}
</script>
