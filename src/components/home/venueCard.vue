<template>
  <v-card variant="outlined" class="h-100">
    <v-card-item>
      <v-card-title>{{ venue.name }}</v-card-title>
      <v-card-subtitle>
        <v-icon size="small" class="mr-1" icon="mdi-map-marker" />
        场地 ID: {{ venue.building_id }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <v-chip size="small" variant="tonal">类型: {{ venue.type_id }}</v-chip>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-dialog width="600">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" variant="text" color="primary" @click="openEditDialog">编辑信息</v-btn>
        </template>
        <template v-slot:default="{ isActive }">
          <v-card>
            <v-card-title class="d-flex align-center pa-4">
              <span class="text-h6">编辑场地信息</span>
              <v-spacer />
              <v-btn icon="mdi-close" variant="text" size="small" @click="isActive.value = false" />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-4">
              <v-form ref="editForm" v-model="editFormValid">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editFormData.name"
                      label="场地名称"
                      variant="outlined"
                      density="comfortable"
                      :rules="[Boolean]"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editFormData.capacity"
                      label="容量"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :rules="[v => v > 0 || '请输入有效容量']"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="editFormData.type"
                      label="场地类型"
                      :items="['运动场地', '会议室', '教室', '多功能厅']"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-textarea
                      v-model="editFormData.description"
                      label="场地描述"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      auto-grow
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="editFormData.cover_image_token"
                      label="图片链接"
                      variant="outlined"
                      density="comfortable"
                      placeholder="https://example.com/image.jpg"
                      prepend-inner-icon="mdi-image"
                    />
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn variant="text" @click="isActive.value = false">取消</v-btn>
              <v-btn
                color="primary"
                variant="flat"
                :disabled="!editFormValid"
                @click="(saveVenueEdit(), (isActive.value = false))"
              >
                确认修改
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
      <v-dialog width="700">
        <template v-slot:activator="{ props: activatorProps }">
          <v-btn v-bind="activatorProps" variant="text" color="primary" @click="openVenueDetail">查看详情</v-btn>
        </template>
        <template v-slot:default="{ isActive }">
          <v-card>
            <v-card-title class="d-flex align-center pa-4">
              <v-btn
                v-if="bookingMode"
                icon="mdi-arrow-left"
                variant="text"
                size="small"
                class="mr-2"
                @click="bookingMode = false"
              />
              <span class="text-h6">{{ bookingMode ? '预约场地' : '场地详情' }}</span>
              <v-spacer />
              <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog(isActive)" />
            </v-card-title>

            <v-divider />

            <!-- 场地详情页 -->
            <v-card-text v-if="!bookingMode" class="pa-4">
              <v-img
                :src="venue.cover_image_token || 'https://placehold.co/600x200?text=场地图片'"
                height="200"
                cover
                class="rounded mb-4"
              />

              <div class="d-flex align-center mb-2">
                <div class="text-h5">{{ venue.name }}</div>
                <v-spacer />
                <v-btn color="primary" variant="flat" @click="bookingMode = true">
                  <v-icon start icon="mdi-calendar-plus" />
                  立即预约
                </v-btn>
              </div>

              <v-row dense>
                <v-col cols="4">
                  <div class="text-caption text-medium-emphasis">场地类型</div>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="small" icon="mdi-tag" />
                    <span>{{ venue.type_id }}</span>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-medium-emphasis">容纳人数</div>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="small" icon="mdi-account-group" />
                    <span>{{ venue.capacity ?? '-' }}</span>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-caption text-medium-emphasis">地点</div>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="small" icon="mdi-map-marker" />
                    <span>{{ venue.building_id }}</span>
                  </div>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-subtitle-2 mb-2">描述</div>
              <div class="text-body-2 text-medium-emphasis">
                {{ venue.description_text }}
              </div>

              <v-divider class="my-4" />

              <div class="text-subtitle-2 mb-2">时间表</div>
              <v-table density="compact">
                <thead>
                  <tr>
                    <th class="text-left">开始时间</th>
                    <th class="text-left">结束时间</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(time, index) in venue.timetable" :key="index">
                    <td>{{ time.start }}</td>
                    <td>{{ time.end }}</td>
                  </tr>
                </tbody>
              </v-table>
            </v-card-text>

            <!-- 预约表单页 -->
            <v-card-text v-else class="pa-4">
              <v-form ref="bookingForm" v-model="formValid">
                <v-row dense>
                  <v-col cols="12">
                    <v-text-field
                      v-model="bookingFormData.activity_name"
                      label="活动名称"
                      variant="outlined"
                      density="comfortable"
                      :rules="[Boolean]"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model="bookingFormData.activity_organizer"
                      label="主办单位"
                      variant="outlined"
                      density="comfortable"
                      :rules="[Boolean]"
                    />
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="bookingFormData.estimated_participants"
                      label="预估人数"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :rules="[v => v > 0]"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="bookingFormData.description"
                      label="简要说明"
                      variant="outlined"
                      density="comfortable"
                      rows="3"
                      auto-grow
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-file-input
                      v-model="bookingFormData.activityPlan"
                      label="活动策划书（Word文件）"
                      variant="outlined"
                      density="comfortable"
                      accept=".doc,.docx"
                      prepend-icon="mdi-file-document"
                      show-size
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-2">
                      <div class="text-subtitle-2 mb-2">使用时间</div>
                      <v-row dense>
                        <v-col cols="12" sm="6">
                          <v-text-field
                            v-model="bookingFormData.time_request.date"
                            label="使用日期"
                            type="date"
                            variant="outlined"
                            density="comfortable"
                            :rules="[Boolean]"
                          />
                        </v-col>
                        <v-col cols="6" sm="3">
                          <v-select
                            v-model="bookingFormData.time_request.startTime"
                            label="开始时间"
                            :items="timeOptions"
                            variant="outlined"
                            density="comfortable"
                            :rules="[Boolean]"
                          />
                        </v-col>
                        <v-col cols="6" sm="3">
                          <v-select
                            v-model="bookingFormData.time_request.endTime"
                            label="结束时间"
                            :items="timeOptions"
                            variant="outlined"
                            density="comfortable"
                            :rules="[Boolean]"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
              <v-spacer />
              <v-btn v-if="bookingMode" color="primary" variant="flat" :disabled="!formValid" @click="submitBooking">
                提交预约
              </v-btn>
            </v-card-actions>
          </v-card>
        </template>
      </v-dialog>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

import { type GetApiVenueResponse, putApiVenueByVenueId } from '@/api'

interface BookingFormData {
  activity_name: string
  activity_organizer: string
  activityPlan: File | null
  description: string
  estimated_participants: null | number
  time_request: { date: string; endTime: string; startTime: string }
}

const props = defineProps<{ venue: GetApiVenueResponse['data'][number] }>()
const emit = defineEmits<{ refresh: [] }>()

const bookingMode = ref(false)
const formValid = ref(false)
const editFormValid = ref(false)

const bookingFormData = reactive<BookingFormData>(getInitialFormData())
const editFormData = reactive({ capacity: 0, cover_image_token: '', description: '', name: '', type: '' })

const timeOptions = Array.from({ length: 20 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8
  const minute = (i % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

function closeDialog(isActive: { value: boolean }) {
  isActive.value = false
  bookingMode.value = false
  Object.assign(bookingFormData, getInitialFormData())
}

function getInitialFormData(): BookingFormData {
  return {
    activity_name: '',
    activity_organizer: '',
    activityPlan: null,
    description: '',
    estimated_participants: null,
    time_request: { date: '', endTime: '', startTime: '' }
  }
}

function openEditDialog() {
  editFormData.name = props.venue.name
  editFormData.capacity = props.venue.capacity ?? 0
  editFormData.type = String(props.venue.type_id)
  editFormData.description = props.venue.description_text
  editFormData.cover_image_token = props.venue.cover_image_token
}

function openVenueDetail() {
  bookingMode.value = false
  Object.assign(bookingFormData, getInitialFormData())
}

async function saveVenueEdit() {
  await putApiVenueByVenueId({
    body: {
      ...editFormData,
      building_id: props.venue.building_id,
      images_token: [props.venue.cover_image_token],
      type_id: props.venue.type_id
    },
    path: { venue_id: props.venue.venue_id.toString() }
  })
  emit('refresh')
}

function submitBooking() {
  console.log('11')
}
</script>
