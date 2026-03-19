/** 分页查询参数 */
export interface PaginationParams {
  page: number
  pageSize: number
}

/** 带排序的分页参数 */
export interface SortablePaginationParams extends PaginationParams {
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

/** 通用查询参数 */
export interface QueryParams extends SortablePaginationParams {
  keyword?: string
  [key: string]: unknown
}
