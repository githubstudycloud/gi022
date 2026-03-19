import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

export const usePermissionStore = defineStore('permission', () => {
  const permissions = ref<string[]>([])
  const roles = ref<string[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])

  const hasPermission = computed(
    () =>
      (code: string): boolean =>
        permissions.value.includes(code),
  )

  const hasRole = computed(
    () =>
      (role: string): boolean =>
        roles.value.includes(role),
  )

  const hasAnyPermission = computed(
    () =>
      (codes: string[]): boolean =>
        codes.some((code) => permissions.value.includes(code)),
  )

  function setPermissions(perms: string[], roleList: string[]): void {
    permissions.value = perms
    roles.value = roleList
  }

  function setDynamicRoutes(routes: RouteRecordRaw[]): void {
    dynamicRoutes.value = routes
  }

  function clearPermissions(): void {
    permissions.value = []
    roles.value = []
    dynamicRoutes.value = []
  }

  return {
    permissions,
    roles,
    dynamicRoutes,
    hasPermission,
    hasRole,
    hasAnyPermission,
    setPermissions,
    setDynamicRoutes,
    clearPermissions,
  }
})
