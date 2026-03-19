/** 可空类型 */
export type Nullable<T> = T | null

/** 可选类型（含 undefined） */
export type Optional<T> = T | undefined

/** 深度只读 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K]
}

/** 深度可选 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

/** 提取 Promise 泛型 */
export type Awaited<T> = T extends PromiseLike<infer U> ? U : T

/** 键值对 */
export type KeyValue<K extends string | number | symbol = string, V = unknown> = Record<K, V>

/** 树节点 */
export interface TreeNode<T = unknown> {
  id: string | number
  label: string
  children?: TreeNode<T>[]
  data?: T
  disabled?: boolean
}

/** 选项类型 */
export interface SelectOption<V = string | number> {
  label: string
  value: V
  disabled?: boolean
  [key: string]: unknown
}

/** 时间戳实体基类 */
export interface TimestampEntity {
  createdAt: string
  updatedAt: string
}

/** 带 ID 的实体基类 */
export interface BaseEntity extends TimestampEntity {
  id: number | string
}

/** 操作结果 */
export interface OperationResult<T = void> {
  success: boolean
  data?: T
  message?: string
}

/** 排序方向 */
export type SortOrder = 'asc' | 'desc'

/** 排序字段 */
export interface SortField {
  field: string
  order: SortOrder
}
