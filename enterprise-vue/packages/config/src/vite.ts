import { defineConfig, mergeConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import checker from 'vite-plugin-checker'
import { visualizer } from 'rollup-plugin-visualizer'
import { resolve } from 'path'

export interface BaseViteConfigOptions {
  /** 应用根目录 */
  root?: string
  /** 是否开启类型检查 */
  typeCheck?: boolean
  /** 是否开启 Bundle 分析 */
  analyze?: boolean
  /** 额外的路径别名 */
  alias?: Record<string, string>
  /** 代理配置 */
  proxy?: Record<string, string | object>
}

/**
 * 创建企业级 Vite 基础配置
 */
export function createBaseViteConfig(options: BaseViteConfigOptions = {}): UserConfig {
  const { root = process.cwd(), typeCheck = true, analyze = false, alias = {}, proxy = {} } = options

  return defineConfig({
    plugins: [
      vue(),
      vueJsx(),
      typeCheck &&
        checker({
          vueTsc: true,
          eslint: {
            lintCommand: 'eslint . --ext .ts,.vue',
          },
        }),
      analyze &&
        visualizer({
          filename: 'stats/index.html',
          open: true,
          gzipSize: true,
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        ...alias,
      },
    },

    server: {
      port: 3000,
      host: true,
      open: false,
      proxy: Object.fromEntries(
        Object.entries(proxy).map(([key, value]) => [
          key,
          typeof value === 'string'
            ? { target: value, changeOrigin: true, rewrite: (p: string) => p.replace(new RegExp(`^${key}`), '') }
            : value,
        ]),
      ),
    },

    build: {
      target: 'es2020',
      minify: 'esbuild',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
          },
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          entryFileNames: 'js/[name]-[hash].js',
        },
      },
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'axios', 'dayjs'],
    },
  })
}

/**
 * 扩展基础配置
 */
export function extendViteConfig(
  baseOptions: BaseViteConfigOptions,
  extension: UserConfig,
): UserConfig {
  return mergeConfig(createBaseViteConfig(baseOptions), extension)
}
