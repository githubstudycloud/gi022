import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'auto'
export type LayoutMode = 'sidebar' | 'topbar' | 'mixed'

export const useAppStore = defineStore(
  'app',
  () => {
    const theme = ref<ThemeMode>('light')
    const layout = ref<LayoutMode>('sidebar')
    const sidebarCollapsed = ref(false)
    const locale = ref<'zh-CN' | 'en-US'>('zh-CN')
    const globalLoading = ref(false)
    const loadingText = ref('')

    const isDark = computed(
      () =>
        theme.value === 'dark' ||
        (theme.value === 'auto' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches),
    )

    function setTheme(mode: ThemeMode): void {
      theme.value = mode
      document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
    }

    function toggleSidebar(): void {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    function showLoading(text = '加载中...'): void {
      globalLoading.value = true
      loadingText.value = text
    }

    function hideLoading(): void {
      globalLoading.value = false
      loadingText.value = ''
    }

    return {
      theme,
      layout,
      sidebarCollapsed,
      locale,
      globalLoading,
      loadingText,
      isDark,
      setTheme,
      toggleSidebar,
      showLoading,
      hideLoading,
    }
  },
  {
    persist: {
      paths: ['theme', 'layout', 'sidebarCollapsed', 'locale'],
    },
  },
)
