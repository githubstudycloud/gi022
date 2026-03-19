/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新功能
        'fix',      // Bug 修复
        'docs',     // 文档变更
        'style',    // 格式调整（不影响逻辑）
        'refactor', // 重构
        'perf',     // 性能优化
        'test',     // 测试相关
        'build',    // 构建系统
        'ci',       // CI/CD 配置
        'chore',    // 其他杂项
        'revert',   // 回滚
      ],
    ],
    'scope-enum': [
      2,
      'always',
      ['web', 'admin', 'ui', 'utils', 'configs', 'docs', 'ci', 'deps', 'release'],
    ],
    'subject-max-length': [2, 'always', 100],
  },
};
