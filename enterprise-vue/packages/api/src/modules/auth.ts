import type { LoginRequest, LoginResponse } from '@enterprise/types'
import { getApiClient } from '../client'

export const authApi = {
  login: (data: LoginRequest) =>
    getApiClient().post<LoginResponse>('/auth/login', data),

  logout: () =>
    getApiClient().post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    getApiClient().post<{ accessToken: string; expiresIn: number }>('/auth/refresh', {
      refreshToken,
    }),

  getCaptcha: () =>
    getApiClient().get<{ key: string; image: string }>('/auth/captcha'),
}
