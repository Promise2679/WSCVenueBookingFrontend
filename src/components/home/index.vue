<template>
  <v-container class="home-container pa-4">
    <div v-if="showAdminControls" class="home-admin-controls d-flex justify-end mb-6 ga-3">
      <v-btn v-if="canManageVenue" prepend-icon="mdi-cog" to="/admin" class="home-admin-btn"> 管理场地 </v-btn>
      <v-btn v-if="canManageUser" prepend-icon="mdi-account-group" to="/user-manage" class="home-admin-btn">
        用户管理
      </v-btn>
      <v-btn v-if="canManageNotice" prepend-icon="mdi-bulletin-board" to="/notice-manage" class="home-admin-btn">
        公告管理
      </v-btn>
    </div>

    <v-row class="mb-6">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          placeholder="搜索场地名称或 ID..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          hide-details
          clearable
          class="home-search-field"
        >
          <template v-slot:prepend>
            <v-btn
              icon="mdi-filter"
              variant="text"
              size="small"
              class="home-filter-toggle"
              @click="showFilter = !showFilter"
            />
          </template>
        </v-text-field>

        <v-expand-transition>
          <v-card v-if="showFilter" class="home-filter-card mt-3 pa-4">
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
                  density="comfortable"
                  hide-details
                  class="home-building-select"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-expand-transition>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="venue in venues" :key="venue.venue_id" cols="12" sm="6" md="4">
        <VenueCard :venue="venue" :building-name="getBuildingName(venue.building_id)" @refresh="refreshVenues" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'

import { getApiVenue, type GetApiVenueResponse } from '@/api'
import { getApiVenueLocationsQuery } from '@/api/@pinia/colada.gen'
import { useUserStore } from '@/stores/user'

import VenueCard from './venueCard.vue'

const search = ref('')
const showFilter = ref(false)
const selectedBuildings = ref<number[]>([])
const data = ref<GetApiVenueResponse>()

const { data: locationsData } = useQuery(getApiVenueLocationsQuery({}))
const buildings = computed(() => locationsData.value?.data.buildings ?? [])

const venueQuery = computed(() => ({ query: { b: selectedBuildings.value.map(String), s: search.value || undefined } }))
const venues = computed(() => data.value?.data ?? [])

const { canManageNotice, canManageUser, canManageVenue, showAdminControls } = storeToRefs(useUserStore())

let debounceTimer: null | number = null

watch([selectedBuildings, search], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => void refreshVenues(), 300)
})

function getBuildingName(id: number): string {
  const buildings = locationsData.value?.data.buildings
  if (!buildings) return ''

  const index = buildings.findIndex(item => item.building_id === id)
  return buildings[index]?.building_name ?? ''
}

async function refreshVenues() {
  const { data: raw } = await getApiVenue({ ...venueQuery.value, body: {} })
  data.value = raw
}

onMounted(async () => {
  await refreshVenues()
})
</script>

<style scoped>
.home-container {
  --home-primary: #0081e4;
  --home-surface: #ffffff;
  --home-surface-light: #f8fbff;
  --home-outline: rgb(var(--v-theme-primary) / 0.14);
  --home-text-primary: #0f2a45;
  --home-text-secondary: #4d6682;
  min-height: 100vh;
  background: #fafbff;
  padding: 1.5rem !important;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.home-admin-controls {
  margin-bottom: 2rem;
}

.home-admin-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;
  background: var(--home-primary);
  color: white;
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.home-admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.25);
}

.home-search-field {
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
}

.home-search-field :deep(.v-field) {
  border-radius: 8px;
  border: 1px solid var(--home-outline);
  background: var(--home-surface);
  box-shadow: 0 4px 8px rgba(var(--v-theme-primary), 0.08);
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.home-search-field :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.24);
  box-shadow: 0 6px 16px rgba(var(--v-theme-primary), 0.12);
}

.home-search-field :deep(.v-field.v-field--focused) {
  border-color: rgba(var(--home-primary), 0.5);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.16);
}

.home-filter-toggle {
  color: var(--home-primary) !important;
  border-radius: 8px;
  transition:
    transform 0.24s ease,
    background-color 0.24s ease;
}

.home-filter-toggle:hover {
  transform: scale(1.1);
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.home-filter-card {
  border: 1px solid var(--home-outline);
  background: linear-gradient(160deg, var(--home-surface) 0%, var(--home-surface-light) 100%);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.12);
  backdrop-filter: blur(8px);
  animation: slideDown 0.24s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-building-select :deep(.v-field) {
  border-radius: 12px;
  border: 1px solid var(--home-outline);
  background: var(--home-surface);
  transition:
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.home-building-select :deep(.v-field:hover) {
  border-color: rgba(var(--v-theme-primary), 0.24);
}

.home-building-select :deep(.v-field.v-field--focused) {
  border-color: var(--home-primary);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.12);
}

@media (max-width: 1280px) {
  .home-admin-btn {
    font-size: 14px;
    padding: 0px 15px;
    border-radius: 8px;
  }
}

@media (max-width: 600px) {
  .home-container {
    padding: 12px !important;
  }

  .home-admin-controls {
    gap: 8px !important;
    margin-bottom: 1.5rem !important;
    flex-wrap: wrap;
  }

  .home-admin-btn {
    font-size: 14px;
    padding: 8px 12px;
    border-radius: 8px;
  }

  .home-filter-card {
    border-radius: 12px;
    padding: 12px !important;
    margin-top: 12px !important;
  }
}
</style>
