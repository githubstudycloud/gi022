/** 登录请求 */
export interface LoginRequest {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
  rememberMe?: boolean
}

/** 登录响应 */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: 'Bearer'
}

/** Token 载荷 */
export interface TokenPayload {
  sub: string
  userId: number | string
  username: string
  roles: string[]
  permissions: string[]
  iat: number
  exp: number
}

/** 权限类型 */
export interface Permission {
  code: string
  name: string
  type: 'menu' | 'button' | 'api'
  path?: string
}

/** 角色 */
export interface Role {
  id: number | string
  code: string
  name: string
  permissions: Permission[]
}
