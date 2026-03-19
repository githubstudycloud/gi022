/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return function (...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  interval = 300,
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function (...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    }
  }
}

/**
 * Promise 版防抖（取消上次未完成的请求）
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delay = 300,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let rejectPrev: ((reason?: unknown) => void) | null = null

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    if (timer) clearTimeout(timer)
    if (rejectPrev) rejectPrev(new Error('debounced'))

    return new Promise((resolve, reject) => {
      rejectPrev = reject
      timer = setTimeout(() => {
        rejectPrev = null
        ;(fn(...args) as Promise<ReturnType<T>>).then(resolve).catch(reject)
      }, delay)
    })
  }
}
