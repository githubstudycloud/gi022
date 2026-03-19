# Enterprise Vue — 企业级多项目 Monorepo 框架

[![CI](https://github.com/your-org/enterprise-vue/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/enterprise-vue/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange)](https://pnpm.io)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org)

企业级 Vue 3 多应用 Monorepo 框架，包含完整的工程规范、共享包体系和 SDLC 文档。

---

## 快速开始

### 环境要求

| 工具 | 版本 |
|------|------|
| Node.js | ≥ 20.0 |
| pnpm | ≥ 9.0 |

### 安装

```bash
# 克隆项目
git clone https://github.com/your-org/enterprise-vue.git
cd enterprise-vue

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env.local
```

### 开发

```bash
# 启动所有应用
pnpm dev

# 单独启动
pnpm dev:main    # 主应用 → http://localhost:3000
pnpm dev:admin   # 管理后台 → http://localhost:3001
pnpm dev:mobile  # 移动端 → http://localhost:3002
```

### 构建

```bash
pnpm build           # 构建所有应用
pnpm build:main      # 仅构建主应用
```

### 测试

```bash
pnpm test            # 所有测试
pnpm test:unit       # 单元测试
pnpm test:e2e        # E2E 测试
```

### 代码质量

```bash
pnpm lint            # ESLint 检查
pnpm lint:fix        # 自动修复
pnpm typecheck       # TypeScript 类型检查
pnpm format          # Prettier 格式化
```

---

## 项目结构

```
enterprise-vue/
├── apps/
│   ├── main-app/        # 主用户端（Vue 3 + Vue Router + Pinia）
│   ├── admin-app/       # 管理后台（带权限控制）
│   └── mobile-app/      # 移动 H5 端
│
├── packages/
│   ├── ui/              # 共享 UI 组件库 + Composables
│   ├── api/             # Axios HTTP 客户端 + API 模块
│   ├── stores/          # 共享 Pinia Store（auth/user/app/permission）
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数（format/validate/crypto/tree等）
│   └── config/          # Vite/Vitest 基础配置
│
├── docs/
│   ├── architecture/    # 架构设计文档
│   ├── standards/       # 代码/组件/安全/测试规范
│   ├── processes/       # SDLC 流程（Git/PR/Release/Incident）
│   ├── api/             # API 设计规范
│   └── adr/             # 架构决策记录（ADR）
│
├── scripts/
│   └── generator/       # 代码生成器（pnpm gen）
│
└── .github/workflows/   # CI/CD 流水线
```

---

## 代码生成器

```bash
# 生成页面视图
pnpm gen view ProductList main-app

# 生成 UI 组件
pnpm gen component EDatePicker

# 生成 Pinia Store
pnpm gen store notification main-app

# 生成 API 模块
pnpm gen api product

# 生成 Composable
pnpm gen composable useInfiniteScroll main-app
```

---

## 共享包

| 包名 | 描述 | 主要导出 |
|------|------|---------|
| `@enterprise/ui` | UI 组件库 + Composables | `EButton`, `useTable`, `useForm`, `useModal` |
| `@enterprise/api` | HTTP 客户端封装 | `createApiClient`, `authApi`, `userApi` |
| `@enterprise/stores` | 共享 Pinia Store | `useAuthStore`, `useUserStore`, `useAppStore`, `usePermissionStore` |
| `@enterprise/types` | TypeScript 类型定义 | `ApiResponse`, `UserProfile`, `LoginRequest` |
| `@enterprise/utils` | 工具函数库 | `formatDate`, `maskPhone`, `useDebounce`, `listToTree` |
| `@enterprise/config` | 构建配置基类 | `createBaseViteConfig`, `createVitestConfig` |

---

## 文档索引

| 文档 | 路径 |
|------|------|
| 架构概览 | [docs/architecture/01-overview.md](docs/architecture/01-overview.md) |
| 代码规范 | [docs/standards/01-code-standards.md](docs/standards/01-code-standards.md) |
| 组件规范 | [docs/standards/02-component-standards.md](docs/standards/02-component-standards.md) |
| 安全规范 | [docs/standards/03-security-standards.md](docs/standards/03-security-standards.md) |
| 测试规范 | [docs/standards/04-testing-standards.md](docs/standards/04-testing-standards.md) |
| SDLC 总览 | [docs/processes/01-sdlc-overview.md](docs/processes/01-sdlc-overview.md) |
| Git 工作流 | [docs/processes/02-git-workflow.md](docs/processes/02-git-workflow.md) |
| PR Review 规范 | [docs/processes/03-pr-review.md](docs/processes/03-pr-review.md) |
| 发布流程 | [docs/processes/04-release-process.md](docs/processes/04-release-process.md) |
| 事故响应 | [docs/processes/05-incident-response.md](docs/processes/05-incident-response.md) |
| API 规范 | [docs/api/01-api-standards.md](docs/api/01-api-standards.md) |

---

## 技术栈

- **框架：** Vue 3.5 + TypeScript 5.7
- **构建：** Vite 6 + Turborepo 2
- **包管理：** pnpm 9 (Workspaces)
- **状态：** Pinia 2
- **路由：** Vue Router 4
- **HTTP：** Axios 1.7
- **测试：** Vitest 2 + Playwright
- **规范：** ESLint 9 + Prettier 3 + Commitlint
- **版本：** Changesets
- **部署：** Docker + Nginx + GitHub Actions

---

## License

MIT © Enterprise Vue Team
