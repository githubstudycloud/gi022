import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import type { ApiResponse } from '@enterprise/types'
import { tokenStorage } from '@enterprise/utils'
import { setupInterceptors } from './interceptors'

export interface ApiClientConfig {
  baseURL: string
  timeout?: number
  onUnauthorized?: () => void
  onRefreshToken?: () => Promise<string>
}

/**
 * 创建 API 客户端实例
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const instance = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? 15000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  setupInterceptors(instance, config)

  return instance
}

/**
 * 默认客户端（应用启动时初始化）
 */
let defaultClient: AxiosInstance | null = null

export function initApiClient(config: ApiClientConfig): void {
  defaultClient = createApiClient(config)
}

export function getApiClient(): AxiosInstance {
  if (!defaultClient) throw new Error('API client not initialized. Call initApiClient() first.')
  return defaultClient
}
