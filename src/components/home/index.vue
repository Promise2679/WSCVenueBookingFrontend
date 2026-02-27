<template>
  <v-container class="pa-4">
    <div class="d-flex justify-end mb-4 ga-2">
      <v-btn prepend-icon="mdi-cog" to="/admin">管理场地</v-btn>
      <v-btn prepend-icon="mdi-account-group" to="/user-manage">用户管理</v-btn>
      <v-btn prepend-icon="mdi-bulletin-board" to="/notice-manage">公告管理</v-btn>
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
            <v-btn icon="mdi-filter" variant="text" size="small" @click="showFilter = !showFilter" />
          </template>
        </v-text-field>

        <v-expand-transition>
          <v-card v-if="showFilter" variant="outlined" class="mt-2 pa-3">
            <v-row dense>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="selectedBuildings"
                  :items="buildings"
                  item-title="building_name"
                  item-value="building_id"
                  label="选择楼区"
                  multiple
                  chips
                  closable-chips
                  variant="outlined"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-card>
        </v-expand-transition>
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
import { computed, ref, watch } from 'vue'

import { getApiVenueLocationsQuery, getApiVenueQuery } from '@/api/@pinia/colada.gen'

import VenueCard from './venueCard.vue'

const search = ref('')
const showFilter = ref(false)
const selectedBuildings = ref<number[]>([])

const { data: locationsData } = useQuery(getApiVenueLocationsQuery({}))
const buildings = computed(() => locationsData.value?.data.buildings ?? [])

const venueQuery = computed(() => ({ query: { b: selectedBuildings.value.map(String), s: search.value || undefined } }))

const { data, refetch } = useQuery(getApiVenueQuery({ ...venueQuery.value, body: {} }))
const venues = computed(() => data.value?.data ?? [])

let debounceTimer: null | ReturnType<typeof setTimeout> = null
watch([selectedBuildings, search], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void refetch(), 300)
})

async function refreshVenues() {
  await refetch()
}
</script>
