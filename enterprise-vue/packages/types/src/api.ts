/** 统一 API 响应结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
  timestamp: number
  traceId?: string
}

/** 分页响应 */
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** 请求配置扩展 */
export interface RequestConfig {
  showLoading?: boolean
  showError?: boolean
  retry?: number
  timeout?: number
  signal?: AbortSignal
}

/** API 错误 */
export interface ApiError {
  code: number
  message: string
  details?: Record<string, string[]>
  traceId?: string
}

/** HTTP 状态码枚举 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus]

/** 业务状态码 */
export const BizCode = {
  SUCCESS: 0,
  FAIL: -1,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PARAM_ERROR: 422,
  TOKEN_EXPIRED: 1001,
  TOKEN_INVALID: 1002,
} as const

export type BizCodeType = (typeof BizCode)[keyof typeof BizCode]
