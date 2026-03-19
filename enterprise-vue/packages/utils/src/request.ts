import type { ApiResponse, ApiError, RequestConfig } from '@enterprise/types'

export class RequestError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'RequestError'
  }
}

/**
 * 创建带超时的 fetch
 */
export function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number } = {},
): Promise<Response> {
  const { timeout = 15000, ...fetchOptions } = options
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  return fetch(url, { ...fetchOptions, signal: controller.signal }).finally(() =>
    clearTimeout(id),
  )
}

/**
 * 创建 HTTP 客户端工厂
 */
export function createHttpClient(baseURL: string, defaultHeaders: Record<string, string> = {}) {
  async function request<T>(
    path: string,
    options: RequestInit & RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { showError = true, retry = 0, timeout = 15000, ...fetchOptions } = options

    const url = `${baseURL}${path}`
    const headers = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
      ...(fetchOptions.headers as Record<string, string>),
    }

    let lastError: Error | null = null
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const res = await fetchWithTimeout(url, { ...fetchOptions, headers, timeout })
        const json = (await res.json()) as ApiResponse<T>

        if (!res.ok || json.code !== 0) {
          const err = new RequestError(
            json.code ?? res.status,
            json.message ?? 'Request failed',
          )
          if (showError) console.error(`[HTTP] ${err.message}`)
          throw err
        }
        return json
      } catch (e) {
        lastError = e as Error
        if (attempt < retry) await sleep(500 * 2 ** attempt)
      }
    }
    throw lastError
  }

  return {
    get: <T>(path: string, config?: RequestConfig) =>
      request<T>(path, { method: 'GET', ...config }),

    post: <T>(path: string, body: unknown, config?: RequestConfig) =>
      request<T>(path, {
        method: 'POST',
        body: JSON.stringify(body),
        ...config,
      }),

    put: <T>(path: string, body: unknown, config?: RequestConfig) =>
      request<T>(path, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...config,
      }),

    patch: <T>(path: string, body: unknown, config?: RequestConfig) =>
      request<T>(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...config,
      }),

    delete: <T>(path: string, config?: RequestConfig) =>
      request<T>(path, { method: 'DELETE', ...config }),
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
