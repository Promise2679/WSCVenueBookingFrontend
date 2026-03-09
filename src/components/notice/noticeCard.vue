<template>
  <v-card variant="flat" rounded="xl" elevation="0" class="notice-card">
    <div class="notice-card__halo" />

    <v-card-item class="notice-card__header">
      <v-card-title class="notice-card__title">{{ notice.title }}</v-card-title>
      <v-card-subtitle class="notice-card__subtitle">
        <v-icon icon="mdi-calendar-clock-outline" size="small" class="notice-card__subtitle-icon" />
        {{ new Date(notice.release_time).toLocaleString() }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="notice-card__content">
      <div
        ref="contentRef"
        :class="['notice-card__text', expanded ? 'notice-card__text--expanded' : 'notice-card__text--collapsed']"
      >
        {{ notice.content }}
      </div>
    </v-card-text>

    <v-card-actions v-if="showExpandAction" class="notice-card__actions">
      <v-btn variant="text" size="small" class="notice-card__action-btn" @click="expanded = !expanded">
        {{ expanded ? '收起内容' : '展开全文' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import type { GetApiNotificationResponse } from '@/api/types.gen'

const props = defineProps<{ notice: GetApiNotificationResponse['data'][number] }>()

const expanded = ref(false)
const showExpandAction = ref(false)
const contentRef = ref<HTMLElement | null>(null)

let resizeObserver: null | ResizeObserver = null

function updateExpandVisibility() {
  const el = contentRef.value
  if (!el) {
    showExpandAction.value = false
    return
  }

  const styles = globalThis.getComputedStyle(el)
  const lineHeightValue = Number.parseFloat(styles.lineHeight)
  const fontSizeValue = Number.parseFloat(styles.fontSize)
  const lineHeight = Number.isFinite(lineHeightValue) ? lineHeightValue : fontSizeValue * 1.75

  const isMoreThanOneLine = el.getBoundingClientRect().height > lineHeight + 1

  showExpandAction.value = isMoreThanOneLine
  if (!isMoreThanOneLine) expanded.value = false
}

onMounted(async () => {
  await nextTick()
  updateExpandVisibility()

  if (typeof ResizeObserver === 'undefined') return

  resizeObserver = new ResizeObserver(() => {
    updateExpandVisibility()
  })

  if (contentRef.value) resizeObserver.observe(contentRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

watch(
  () => props.notice.content,
  async () => {
    await nextTick()
    updateExpandVisibility()
  }
)
</script>

<style scoped>
.notice-card {
  position: relative;
  overflow: hidden;
  --notice-primary: #0081e4;
  --notice-outline: rgb(var(--v-theme-primary) / 0.14);
  --notice-text-primary: #0f2a45;
  --notice-text-secondary: #4d6682;
  border: 1px solid var(--notice-outline);
  background: #ffffff;
  box-shadow:
    0 4px 8px rgb(0 0 0 / 0.1),
    0 2px 4px rgb(0 0 0 / 0.06),
    inset 0 1px 0 rgb(255 255 255 / 0.8) !important;
  font-family: 'Bahnschrift', 'Noto Sans SC', 'Microsoft YaHei UI', sans-serif;
  transition:
    transform 0.24s ease,
    box-shadow 0.24s ease,
    border-color 0.24s ease;
}

.notice-card:hover {
  transform: translateY(-3px);
  border-color: rgb(var(--v-theme-primary) / 0.28);
  box-shadow:
    0 6px 12px rgb(0 0 0 / 0.15),
    0 4px 8px rgb(0 0 0 / 0.1),
    inset 0 1px 0 rgb(255 255 255 / 0.8) !important;
}

.notice-card__halo {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 85% 10%, rgb(var(--v-theme-primary) / 0.09), transparent 46%);
}

.notice-card__header,
.notice-card__content,
.notice-card__actions {
  position: relative;
  z-index: 1;
}

.notice-card__header {
  padding: 20px 20px 8px;
}

.notice-card__title {
  margin: 0;
  font-size: 24px;
  line-height: 1.35;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--notice-text-primary);
}

.notice-card__subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  color: var(--notice-text-secondary);
  font-size: 14px;
}

.notice-card__subtitle-icon {
  color: var(--notice-primary);
}

.notice-card__content {
  padding: 0 22px 0;
}

.notice-card__text {
  color: #24415f;
  line-height: 1.75;
  font-size: 15px;
  padding: 0 0 12px;
  white-space: pre-wrap;
  word-break: break-word;
}

.notice-card__text--collapsed {
  display: -webkit-box;
  overflow: hidden;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.notice-card__actions {
  padding: 8px 22px 18px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.notice-card__action-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--notice-primary);
}

@media (max-width: 600px) {
  .notice-card__header {
    padding: 16px 16px 8px;
  }

  .notice-card__content {
    padding: 2px 16px 0;
  }

  .notice-card__actions {
    padding: 8px 16px 14px;
  }

  .notice-card__title {
    font-size: 18px;
  }

  .notice-card__subtitle {
    font-size: 13px;
  }
}
</style>
