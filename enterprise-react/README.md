# Enterprise React Monorepo

企业级 React 多项目框架，基于 **Nx 19 + pnpm + Vite** 构建。

## 项目结构

```
enterprise-react/
├── apps/
│   ├── web/          # 主应用 (port 3000)
│   └── admin/        # 后台管理 (port 3001)
├── packages/
│   ├── ui/           # 共享组件库 + Storybook
│   └── utils/        # 共享工具函数库
├── configs/
│   ├── typescript/   # 共享 TypeScript 配置
│   ├── eslint/       # 共享 ESLint 配置
│   └── vite/         # 共享 Vite 配置
├── docs/             # 全流程工程文档
└── .github/workflows/ # CI/CD 流水线
```

## 快速开始

### 环境要求
- Node.js >= 20
- pnpm >= 9

### 安装依赖
```bash
pnpm install
```

### 开发

```bash
# 主应用
pnpm dev:web          # http://localhost:3000

# 后台管理
pnpm dev:admin        # http://localhost:3001

# 组件库文档
pnpm storybook        # http://localhost:6006
```

### 构建
```bash
# 构建所有项目
pnpm build

# 只构建受影响的项目（CI 优化）
pnpm build:affected
```

### 测试
```bash
# 运行所有测试
pnpm test

# 测试覆盖率
pnpm nx run-many --target=test:coverage --all

# E2E 测试
pnpm nx run web:test:e2e
```

### 代码质量
```bash
# 类型检查
pnpm type-check

# Lint 检查
pnpm lint

# 代码格式化
pnpm format
```

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| Monorepo | Nx | 19.x |
| 包管理 | pnpm | 9.x |
| 构建 | Vite | 5.x |
| 框架 | React | 18.x |
| 类型 | TypeScript | 5.x |
| 路由 | React Router | 6.x |
| 状态 | Zustand | 4.x |
| 样式 | Tailwind CSS | 3.x |
| 组件文档 | Storybook | 8.x |
| 单元测试 | Vitest | 1.x |
| E2E | Playwright | 1.x |

## 工程文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 架构总览 | `docs/00-overview/ARCHITECTURE.md` | 系统架构、技术选型 |
| 需求模板 | `docs/01-requirements/PRD_TEMPLATE.md` | 产品需求文档模板 |
| 技术设计 | `docs/02-design/TECH_DESIGN_TEMPLATE.md` | 技术方案模板 |
| ADR 模板 | `docs/02-design/ADR_TEMPLATE.md` | 架构决策记录 |
| 开发规范 | `docs/03-development/CODING_STANDARDS.md` | 命名/组件/Git 规范 |
| 测试策略 | `docs/04-testing/TESTING_STRATEGY.md` | 测试金字塔 & 规范 |
| 发布流程 | `docs/05-release/RELEASE_PROCESS.md` | 版本管理 & Changelog |
| 运维手册 | `docs/06-operations/RUNBOOK.md` | 故障处理 & 监控 |

## Nx 常用命令

```bash
# 查看项目依赖图
pnpm nx graph

# 查看受影响的项目
pnpm nx show projects --affected

# 运行特定项目的任务
pnpm nx run <project>:<target>
# 例如: pnpm nx run ui:storybook

# 清理缓存
pnpm nx reset
```

## 贡献指南

1. Fork 项目
2. 从 `develop` 创建功能分支：`git checkout -b feat/ui/new-component`
3. 遵循 [开发规范](./docs/03-development/CODING_STANDARDS.md)
4. 提交遵循 [Conventional Commits](https://www.conventionalcommits.org/)
5. 创建 PR 到 `develop` 分支

## License

MIT
