import { storeToRefs } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import HomeComponent from '@/components/home.vue'
import Notice from '@/components/notice.vue'
import Setting from '@/components/setting.vue'
import Home from '@/pages/home.vue'
import Login from '@/pages/login.vue'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { component: Login, path: '/login' },
    {
      children: [
        { component: HomeComponent, path: '' },
        { component: Notice, path: 'notice' },
        { component: Setting, path: 'setting' }
      ],
      component: Home,
      path: '/'
    }
  ]
})

router.beforeEach(to => {
  const { token } = storeToRefs(useUserStore())
  if (token.value) {
    if (to.path === '/login') return '/'
  } else if (to.path !== '/login') return '/login'
})

export default router
