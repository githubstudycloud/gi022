# 架构总览

## 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                     enterprise-react Monorepo                    │
│                      (Nx + pnpm workspaces)                      │
├─────────────────┬───────────────────────────────────────────────┤
│   Applications  │                Packages                        │
│                 │                                                 │
│  ┌──────────┐  │  ┌───────────┐        ┌────────────┐           │
│  │  apps/   │  │  │ packages/ │        │  configs/  │           │
│  │  web     │  │  │   ui      │        │ typescript │           │
│  │  :3000   │  │  │ (React    │        │   eslint   │           │
│  └────┬─────┘  │  │  Storybook│        │    vite    │           │
│       │        │  │  6006)    │        └────────────┘           │
│  ┌────▼─────┐  │  └─────┬─────┘                                 │
│  │  apps/   │  │        │ depends on                            │
│  │  admin   │  │  ┌─────▼─────┐                                 │
│  │  :3001   │  │  │ packages/ │                                  │
│  └──────────┘  │  │   utils   │                                  │
│                 │  │ (zero dep)│                                  │
│                 │  └───────────┘                                  │
└─────────────────┴───────────────────────────────────────────────┘
```

## 目录说明

| 目录 | 作用 |
|------|------|
| `apps/web` | 面向用户的主应用（React + React Router + Zustand） |
| `apps/admin` | 后台管理系统（RBAC 权限体系） |
| `packages/ui` | 跨项目共享组件库（Storybook 文档） |
| `packages/utils` | 零依赖工具函数库（date/http/storage/validator） |
| `configs/typescript` | 共享 TypeScript 配置 |
| `configs/eslint` | 共享 ESLint 9 flat config |
| `configs/vite` | 共享 Vite 配置工厂函数 |
| `docs/` | 软件工程全流程文档 |
| `.github/workflows` | CI/CD 自动化流水线 |

## 技术选型决策

| 层级 | 选型 | 理由 |
|------|------|------|
| Monorepo 管理 | **Nx 19** | 增量构建、缓存、可视化依赖图，大型团队首选 |
| 包管理器 | **pnpm 9** | 严格 hoisting，磁盘高效，速度快 |
| 构建工具 | **Vite 5** | 开发体验极佳，生产构建基于 Rollup |
| 框架 | **React 18** | 并发渲染，生态成熟 |
| TypeScript | **5.x strict** | 全量开启严格模式，减少运行时错误 |
| 状态管理 | **Zustand** | 轻量（2KB），API 简洁，无 boilerplate |
| 路由 | **React Router v6** | 数据路由，lazy loading，嵌套路由 |
| 样式 | **Tailwind CSS v3** | 原子化 CSS，一致性高，无运行时开销 |
| 组件文档 | **Storybook 8** | 自动 autodocs，CSF 3.0 标准 |
| 测试 | **Vitest + Playwright** | Vitest 与 Vite 零配置集成，Playwright 跨浏览器 E2E |
| 代码规范 | **ESLint 9 flat + Prettier** | 新 flat config API，统一格式 |

## 数据流向

```
User Action
    │
    ▼
React Component
    │
    ├── Local State (useState/useReducer)
    │
    ├── Global State (Zustand Store)
    │       └── persist → localStorage
    │
    └── Server State (useRequest hook)
            └── HttpClient (interceptors)
                    └── REST API
```

## 部署架构

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐
│  GitHub │───▶│ GitHub      │───▶│  CDN/Hosting │
│  Push   │    │ Actions CI  │    │  (apps/web)  │
└─────────┘    │             │    └──────────────┘
               │ lint        │
               │ type-check  │    ┌──────────────┐
               │ test        │───▶│  CDN/Hosting │
               │ build       │    │ (apps/admin) │
               └─────────────┘    └──────────────┘
```
