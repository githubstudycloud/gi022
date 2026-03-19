import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
  type NavigationGuardNext,
  type RouteLocationNormalized,
} from 'vue-router'
import { useAuthStore, useUserStore, usePermissionStore } from '@enterprise/stores'

/** 白名单路由（无需登录） */
const WHITE_LIST = ['/login', '/register', '/forgot-password', '/404', '/403']

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { title: '登录', layout: 'blank' },
  },
  {
    path: '/',
    component: () => import('../layouts/DefaultLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/HomeView.vue'),
        meta: { title: '首页' },
      },
      {
        path: 'about',
        name: 'About',
        component: () => import('../views/about/AboutView.vue'),
        meta: { title: '关于' },
      },
    ],
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/error/403View.vue'),
    meta: { title: '无权访问', layout: 'blank' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404View.vue'),
    meta: { title: '页面不存在', layout: 'blank' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, behavior: 'smooth' }
  },
})

/** 全局路由守卫 */
router.beforeEach(
  async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    // 设置页面标题
    document.title = `${to.meta.title as string ?? ''} - ${import.meta.env.VITE_APP_TITLE}`

    const authStore = useAuthStore()

    // 白名单直接放行
    if (WHITE_LIST.includes(to.path)) {
      if (authStore.isAuthenticated && to.path === '/login') {
        return next('/')
      }
      return next()
    }

    // 未登录重定向
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // 加载用户信息（首次）
    const userStore = useUserStore()
    if (!userStore.currentUser) {
      try {
        await userStore.fetchCurrentUser()
      } catch {
        authStore.clearTokens()
        return next({ name: 'Login' })
      }
    }

    next()
  },
)

export default router
