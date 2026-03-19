import { extendViteConfig } from '@enterprise/config/vite'

export default extendViteConfig(
  { proxy: { '/api': 'http://localhost:8080' } },
  {
    server: { port: 3002 },
    build: {
      // 移动端启用更激进的代码分割
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
          },
        },
      },
    },
  },
)
