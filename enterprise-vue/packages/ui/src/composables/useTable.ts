import { ref, reactive, onMounted } from 'vue'
import type { QueryParams, PageResponse } from '@enterprise/types'

interface UseTableOptions<T, P extends QueryParams> {
  fetchFn: (params: P) => Promise<{ data: { data: PageResponse<T> } }>
  initialParams?: Partial<P>
  immediate?: boolean
}

/**
 * 通用表格数据管理 Composable
 */
export function useTable<T, P extends QueryParams = QueryParams>(
  options: UseTableOptions<T, P>,
) {
  const { fetchFn, immediate = true } = options

  const loading = ref(false)
  const list = ref<T[]>([])
  const total = ref(0)

  const pagination = reactive({
    page: 1,
    pageSize: 20,
  })

  const params = reactive<Partial<P>>({
    ...options.initialParams,
  })

  async function fetch(): Promise<void> {
    loading.value = true
    try {
      const query = { ...params, ...pagination } as unknown as P
      const res = await fetchFn(query)
      const pageData = res.data.data
      list.value = pageData.list
      total.value = pageData.total
    } finally {
      loading.value = false
    }
  }

  async function refresh(): Promise<void> {
    pagination.page = 1
    await fetch()
  }

  function onPageChange(page: number): void {
    pagination.page = page
    fetch()
  }

  function onPageSizeChange(size: number): void {
    pagination.page = 1
    pagination.pageSize = size
    fetch()
  }

  function setParams(newParams: Partial<P>): void {
    Object.assign(params, newParams)
  }

  if (immediate) onMounted(fetch)

  return {
    loading,
    list,
    total,
    pagination,
    params,
    fetch,
    refresh,
    onPageChange,
    onPageSizeChange,
    setParams,
  }
}
