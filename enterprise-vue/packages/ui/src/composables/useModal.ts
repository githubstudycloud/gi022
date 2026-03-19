import { ref } from 'vue'

/**
 * 弹窗状态管理 Composable
 */
export function useModal<T = unknown>() {
  const visible = ref(false)
  const data = ref<T | null>(null)
  const loading = ref(false)

  function open(payload?: T): void {
    data.value = (payload ?? null) as T | null
    visible.value = true
  }

  function close(): void {
    visible.value = false
    data.value = null
  }

  function setLoading(val: boolean): void {
    loading.value = val
  }

  return { visible, data, loading, open, close, setLoading }
}
