import { extendViteConfig } from '@enterprise/config/vite'

export default extendViteConfig(
  {
    typeCheck: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  {
    server: { port: 3000 },
  },
)
