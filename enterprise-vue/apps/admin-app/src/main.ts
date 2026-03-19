import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import { EnterpriseUIPlugin } from '@enterprise/ui'
import { initApiClient } from '@enterprise/api'
import '@enterprise/ui/styles'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
pinia.use(piniaPersistedstate)

initApiClient({
  baseURL: import.meta.env.VITE_ADMIN_API_BASE_URL,
  onUnauthorized: () => router.push({ name: 'Login' }),
  onRefreshToken: async () => {
    const { useAuthStore } = await import('@enterprise/stores')
    return useAuthStore().refresh()
  },
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(EnterpriseUIPlugin)
app.mount('#app')
