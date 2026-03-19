import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import type { ApiClientConfig } from './client'
import { tokenStorage } from '@enterprise/utils'
import { BizCode } from '@enterprise/types'

/** 是否正在刷新 Token */
let isRefreshing = false
/** 等待刷新的请求队列 */
let waitQueue: Array<(token: string) => void> = []

export function setupInterceptors(instance: AxiosInstance, config: ApiClientConfig): void {
  // ---- 请求拦截：注入 Authorization ----
  instance.interceptors.request.use(
    (req: InternalAxiosRequestConfig) => {
      const token = tokenStorage.getAccessToken()
      if (token) {
        req.headers.Authorization = `Bearer ${token}`
      }
      // 请求唯一标识，方便追踪
      req.headers['X-Request-Id'] = crypto.randomUUID()
      return req
    },
    (err) => Promise.reject(err),
  )

  // ---- 响应拦截：统一错误处理 + Token 刷新 ----
  instance.interceptors.response.use(
    (res: AxiosResponse) => {
      const data = res.data
      if (data?.code !== undefined && data.code !== BizCode.SUCCESS) {
        return Promise.reject(new Error(data.message ?? 'Business error'))
      }
      return res
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
      const status = error.response?.status
      const bizCode = (error.response?.data as { code?: number })?.code

      // Token 过期 → 刷新
      if (
        (status === 401 || bizCode === BizCode.TOKEN_EXPIRED) &&
        !originalRequest._retry &&
        config.onRefreshToken
      ) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            waitQueue.push((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(instance(originalRequest))
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const newToken = await config.onRefreshToken()
          tokenStorage.setAccessToken(newToken)
          waitQueue.forEach((cb) => cb(newToken))
          waitQueue = []
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return instance(originalRequest)
        } catch {
          tokenStorage.clearTokens()
          config.onUnauthorized?.()
          return Promise.reject(error)
        } finally {
          isRefreshing = false
        }
      }

      // 权限不足
      if (status === 403) {
        console.error('[API] Permission denied')
      }

      return Promise.reject(error)
    },
  )
}
