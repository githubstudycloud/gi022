import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';
import type { UserConfig } from 'vite';

interface AppConfigOptions {
  root: string;
  port?: number;
  outDir?: string;
}

interface LibConfigOptions {
  root: string;
  entry: string;
  name: string;
  outDir?: string;
}

/**
 * 应用项目的 Vite 基础配置工厂
 */
export function createAppConfig(options: AppConfigOptions): UserConfig {
  const { root, port = 3000, outDir = 'dist' } = options;

  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
      },
    },
    server: {
      port,
      open: true,
      cors: true,
    },
    build: {
      outDir,
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [resolve(root, 'src/test-utils/setup.ts')],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 70,
          statements: 80,
        },
      },
    },
  };
}

/**
 * 库项目的 Vite 基础配置工厂（lib 模式）
 */
export function createLibConfig(options: LibConfigOptions): UserConfig {
  const { root, entry, name, outDir = 'dist' } = options;

  return {
    plugins: [react(), tsconfigPaths()],
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
      },
    },
    build: {
      lib: {
        entry: resolve(root, entry),
        name,
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'mjs' : 'cjs'}`,
      },
      outDir,
      sourcemap: true,
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [resolve(root, 'src/test-utils/setup.ts')],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        thresholds: {
          lines: 85,
          functions: 85,
          branches: 75,
          statements: 85,
        },
      },
    },
  };
}
