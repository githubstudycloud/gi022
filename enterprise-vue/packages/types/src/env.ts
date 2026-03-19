/** Vite 环境变量类型声明 */
export interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_ADMIN_API_BASE_URL: string
  readonly VITE_CDN_BASE_URL: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENCRYPT_KEY: string
  readonly VITE_FEATURE_ANALYTICS: string
  readonly VITE_FEATURE_MOCK: string
  readonly VITE_SENTRY_DSN: string
}

export interface ImportMeta {
  readonly env: ImportMetaEnv
}
