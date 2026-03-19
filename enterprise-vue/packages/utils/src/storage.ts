/**
 * 类型安全的 Storage 工具
 */
type StorageType = 'local' | 'session'

export function createStorage(type: StorageType = 'local') {
  const store = type === 'local' ? localStorage : sessionStorage

  return {
    get<T>(key: string): T | null {
      try {
        const raw = store.getItem(key)
        if (raw === null) return null
        return JSON.parse(raw) as T
      } catch {
        return null
      }
    },

    set<T>(key: string, value: T): void {
      store.setItem(key, JSON.stringify(value))
    },

    remove(key: string): void {
      store.removeItem(key)
    },

    clear(): void {
      store.clear()
    },

    has(key: string): boolean {
      return store.getItem(key) !== null
    },
  }
}

export const localStorage_ = createStorage('local')
export const sessionStorage_ = createStorage('session')

/** Token 存储键 */
const ACCESS_TOKEN_KEY = '__access_token__'
const REFRESH_TOKEN_KEY = '__refresh_token__'

export const tokenStorage = {
  getAccessToken: () => localStorage_.get<string>(ACCESS_TOKEN_KEY),
  setAccessToken: (token: string) => localStorage_.set(ACCESS_TOKEN_KEY, token),
  getRefreshToken: () => localStorage_.get<string>(REFRESH_TOKEN_KEY),
  setRefreshToken: (token: string) => localStorage_.set(REFRESH_TOKEN_KEY, token),
  clearTokens: () => {
    localStorage_.remove(ACCESS_TOKEN_KEY)
    localStorage_.remove(REFRESH_TOKEN_KEY)
  },
}
