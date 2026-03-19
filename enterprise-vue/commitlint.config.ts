import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // Bug 修复
        'docs',     // 文档更新
        'style',    // 代码格式（不影响逻辑）
        'refactor', // 重构（无新功能/Bug修复）
        'perf',     // 性能优化
        'test',     // 测试
        'build',    // 构建系统
        'ci',       // CI/CD 配置
        'chore',    // 其他杂项
        'revert',   // 回滚提交
        'release',  // 版本发布
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'main-app',
        'admin-app',
        'mobile-app',
        'ui',
        'utils',
        'types',
        'api',
        'stores',
        'config',
        'docs',
        'ci',
        'deps',
        'release',
      ],
    ],
    'subject-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 100],
  },
}

export default config
