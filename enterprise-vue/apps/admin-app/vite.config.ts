import { extendViteConfig } from '@enterprise/config/vite'

export default extendViteConfig(
  { proxy: { '/api': 'http://localhost:8081' } },
  { server: { port: 3001 } },
)
