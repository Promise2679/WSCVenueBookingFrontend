import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/pages/login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [{ component: Login, path: '/login' }]
})

export default router
