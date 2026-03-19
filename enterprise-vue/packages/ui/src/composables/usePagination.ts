import { reactive, computed } from 'vue'

export function usePagination(initialPageSize = 20) {
  const state = reactive({ page: 1, pageSize: initialPageSize, total: 0 })

  const totalPages = computed(() => Math.ceil(state.total / state.pageSize))

  function setTotal(total: number) { state.total = total }
  function goTo(page: number) { state.page = Math.max(1, Math.min(page, totalPages.value)) }
  function next() { goTo(state.page + 1) }
  function prev() { goTo(state.page - 1) }
  function reset() { state.page = 1 }

  return { state, totalPages, setTotal, goTo, next, prev, reset }
}
