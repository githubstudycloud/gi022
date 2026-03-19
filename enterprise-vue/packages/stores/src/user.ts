import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@enterprise/api'
import type { CurrentUser } from '@enterprise/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<CurrentUser | null>(null)
  const loading = ref(false)

  async function fetchCurrentUser(): Promise<void> {
    loading.value = true
    try {
      const res = await userApi.getCurrentUser()
      currentUser.value = (res.data as { data: CurrentUser }).data
    } finally {
      loading.value = false
    }
  }

  function clearUser(): void {
    currentUser.value = null
  }

  return { currentUser, loading, fetchCurrentUser, clearUser }
})
