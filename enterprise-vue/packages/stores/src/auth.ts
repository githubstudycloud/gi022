import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@enterprise/api'
import { tokenStorage } from '@enterprise/utils'
import type { LoginRequest, LoginResponse } from '@enterprise/types'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(tokenStorage.getAccessToken())
  const refreshToken = ref<string | null>(tokenStorage.getRefreshToken())

  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(credentials: LoginRequest): Promise<void> {
    const res = await authApi.login(credentials)
    const { data } = res.data as { data: LoginResponse }
    setTokens(data.accessToken, data.refreshToken)
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } finally {
      clearTokens()
    }
  }

  async function refresh(): Promise<string> {
    const token = refreshToken.value
    if (!token) throw new Error('No refresh token')
    const res = await authApi.refreshToken(token)
    const newToken = (res.data as { data: { accessToken: string } }).data.accessToken
    tokenStorage.setAccessToken(newToken)
    accessToken.value = newToken
    return newToken
  }

  function setTokens(access: string, refresh: string): void {
    accessToken.value = access
    refreshToken.value = refresh
    tokenStorage.setAccessToken(access)
    tokenStorage.setRefreshToken(refresh)
  }

  function clearTokens(): void {
    accessToken.value = null
    refreshToken.value = null
    tokenStorage.clearTokens()
  }

  return {
    accessToken,
    isAuthenticated,
    login,
    logout,
    refresh,
    setTokens,
    clearTokens,
  }
})
