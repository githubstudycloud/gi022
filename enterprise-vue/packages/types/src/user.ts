import type { BaseEntity } from './common'
import type { Role } from './auth'

/** 用户状态 */
export type UserStatus = 'active' | 'inactive' | 'locked' | 'pending'

/** 用户信息 */
export interface UserProfile extends BaseEntity {
  username: string
  nickname: string
  email: string
  phone?: string
  avatar?: string
  status: UserStatus
  roles: Role[]
  lastLoginAt?: string
  lastLoginIp?: string
}

/** 当前登录用户（简化） */
export interface CurrentUser {
  id: number | string
  username: string
  nickname: string
  avatar?: string
  roles: string[]
  permissions: string[]
}
