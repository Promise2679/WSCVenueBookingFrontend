import { storeToRefs } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import About from '@/components/about.vue'
import Admin from '@/components/admin.vue'
import Edit from '@/components/edit.vue'
import HomeComponent from '@/components/home/index.vue'
import Notice from '@/components/notice.vue'
import Reservation from '@/components/reservation.vue'
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
        { component: Reservation, path: 'reservation' },
        { component: About, path: 'about' },
        { component: Edit, path: 'edit' },
        { component: Admin, path: 'admin' }
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
