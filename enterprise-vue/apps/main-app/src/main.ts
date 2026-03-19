import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import { EnterpriseUIPlugin } from '@enterprise/ui'
import { initApiClient } from '@enterprise/api'
import '@enterprise/ui/styles'
import App from './App.vue'
import router from './router'
import { i18n } from './locales'
import './assets/styles/main.css'

// 初始化 API 客户端
const pinia = createPinia()
pinia.use(piniaPersistedstate)

initApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  onUnauthorized: () => {
    router.push({ name: 'Login' })
  },
  onRefreshToken: async () => {
    const { useAuthStore } = await import('@enterprise/stores')
    const authStore = useAuthStore()
    return authStore.refresh()
  },
})

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(EnterpriseUIPlugin)

app.mount('#app')
