import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { layout: 'blank' } },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('../views/dashboard/DashboardView.vue'), meta: { title: '仪表盘' } },
      { path: 'users', name: 'Users', component: () => import('../views/users/UsersView.vue'), meta: { title: '用户管理', permission: 'user:list' } },
      { path: 'roles', name: 'Roles', component: () => import('../views/roles/RolesView.vue'), meta: { title: '角色管理', permission: 'role:list' } },
      { path: 'system', name: 'System', component: () => import('../views/system/SystemView.vue'), meta: { title: '系统设置', role: 'SUPER_ADMIN' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
