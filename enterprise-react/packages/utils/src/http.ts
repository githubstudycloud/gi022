/**
 * HTTP 请求工具
 * 基于 fetch API 的轻量封装，支持拦截器、超时、重试
 */

export interface RequestConfig extends RequestInit {
  baseURL?: string;
  timeout?: number;
  retry?: number;
  retryDelay?: number;
}

export interface ResponseData<T = unknown> {
  data: T;
  code: number;
  message: string;
  success: boolean;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string,
  ) {
    super(message ?? `HTTP ${status}: ${statusText}`);
    this.name = 'HttpError';
  }
}

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor<T = unknown> = (response: T) => T | Promise<T>;

export class HttpClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(private readonly defaultConfig: RequestConfig = {}) {}

  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(interceptor as ResponseInterceptor);
  }

  async request<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
    let mergedConfig: RequestConfig = {
      ...this.defaultConfig,
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...this.defaultConfig.headers,
        ...config.headers,
      },
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      mergedConfig = await interceptor(mergedConfig);
    }

    const { baseURL = '', timeout = 30000, retry = 0, retryDelay = 1000, ...fetchConfig } =
      mergedConfig;

    const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;

    const fetchWithTimeout = async (): Promise<Response> => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        return await fetch(fullUrl, { ...fetchConfig, signal: controller.signal });
      } finally {
        clearTimeout(timer);
      }
    };

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const response = await fetchWithTimeout();
        if (!response.ok) {
          throw new HttpError(response.status, response.statusText);
        }
        let data = await response.json() as T;

        // Apply response interceptors
        for (const interceptor of this.responseInterceptors) {
          data = await interceptor(data) as T;
        }

        return data;
      } catch (err) {
        lastError = err as Error;
        if (attempt < retry) {
          await new Promise((r) => setTimeout(r, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }

  get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  post<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  patch<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, {
      ...config,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' });
  }
}

/** 默认客户端实例 */
export const http = new HttpClient();
