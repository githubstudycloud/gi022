import type { UserConfig } from 'vitest/config'

export function createVitestConfig(overrides: UserConfig['test'] = {}): UserConfig {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'lcov', 'html'],
        exclude: [
          'node_modules/**',
          'dist/**',
          '**/*.d.ts',
          'tests/**',
          '**/*.config.*',
        ],
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
          },
        },
      },
      ...overrides,
    },
  }
}
