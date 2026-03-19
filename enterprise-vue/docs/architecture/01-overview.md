# 架构概览

> 版本：v1.0 | 日期：2026-03-18 | 状态：已审核

## 1. 系统定位

Enterprise Vue 是一套面向中大型企业的 **Vue 3 多应用 Monorepo 框架**，提供：

- 统一的技术底座与工程规范
- 多应用间可复用的共享包体系
- 完整的 SDLC（软件开发生命周期）工具链
- 开箱即用的企业级功能（认证、权限、主题、国际化）

---

## 2. 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      企业级 Monorepo                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  main-app   │  │  admin-app  │  │    mobile-app       │ │
│  │  (主用户端) │  │  (管理后台) │  │    (移动H5端)       │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┴─────────────────────┘            │
│                          │                                  │
│              ┌───────────▼───────────┐                      │
│              │     Shared Packages   │                      │
│              │ ┌────────┐ ┌────────┐ │                      │
│              │ │  @ui   │ │ @api  │ │                      │
│              │ ├────────┤ ├────────┤ │                      │
│              │ │@stores │ │@utils │ │                      │
│              │ ├────────┤ ├────────┤ │                      │
│              │ │@types  │ │@config│ │                      │
│              │ └────────┘ └────────┘ │                      │
│              └───────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 技术选型

| 类别 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| 前端框架 | Vue 3 | ^3.5 | Composition API + 性能优异 |
| 语言 | TypeScript | ^5.7 | 类型安全，提升维护性 |
| 构建工具 | Vite | ^6.0 | 极速 HMR，现代 ESM |
| Monorepo | pnpm workspaces + Turborepo | - | 高效依赖管理，增量构建 |
| 状态管理 | Pinia | ^2.3 | Vue 官方推荐，轻量类型安全 |
| 路由 | Vue Router | ^4.5 | Vue 官方路由 |
| HTTP | Axios | ^1.7 | 拦截器完善，生态成熟 |
| 国际化 | Vue I18n | ^10 | Vue 官方 i18n 方案 |
| 测试（单元） | Vitest | ^2.1 | 与 Vite 生态一体化 |
| 测试（E2E） | Playwright | ^1.49 | 跨浏览器，稳定可靠 |
| 代码规范 | ESLint + Prettier | 9/3 | 强制统一代码风格 |
| Git 规范 | Husky + Commitlint | - | 提交信息规范化 |
| 版本管理 | Changesets | ^2.27 | Monorepo 版本发布管理 |
| CI/CD | GitHub Actions | - | 自动化构建测试发布 |
| 容器化 | Docker + Nginx | - | 标准化部署 |

---

## 4. 目录结构

```
enterprise-vue/
├── apps/                    # 应用层（可独立部署）
│   ├── main-app/            # 主用户端（端口 3000）
│   ├── admin-app/           # 管理后台（端口 3001）
│   └── mobile-app/          # 移动 H5 端（端口 3002）
│
├── packages/                # 共享包（不可独立部署）
│   ├── ui/                  # 组件库 + Composables
│   ├── api/                 # HTTP 客户端 + API 模块
│   ├── stores/              # 共享 Pinia Store
│   ├── types/               # TypeScript 类型定义
│   ├── utils/               # 工具函数
│   └── config/              # Vite/Vitest 基础配置
│
├── docs/                    # 工程文档
│   ├── architecture/        # 架构设计文档
│   ├── standards/           # 开发规范
│   ├── processes/           # SDLC 流程
│   ├── api/                 # API 规范
│   └── adr/                 # 架构决策记录
│
├── scripts/                 # 构建/生成脚本
│   ├── generator/           # 代码生成器
│   └── release/             # 发布脚本
│
├── .github/workflows/       # CI/CD 流水线
├── turbo.json               # Turborepo 配置
├── pnpm-workspace.yaml      # pnpm 工作区
└── package.json             # 根配置
```

---

## 5. 数据流架构

```
用户操作
    │
    ▼
Vue 组件（View Layer）
    │  emit / props
    ▼
Composables / useXxx
    │  action
    ▼
Pinia Store（State Layer）
    │  API call
    ▼
@enterprise/api（Service Layer）
    │  Axios interceptors
    ▼
后端 REST API
    │
    ▼
数据返回 → Store 更新 → 视图响应式更新
```

---

## 6. 安全架构

```
前端安全层级：

1. 认证层：JWT AccessToken + RefreshToken 双 Token
2. 路由守卫：未认证重定向 /login，动态路由权限
3. 组件级：<EPermission codes="[]"> 按钮级权限控制
4. 请求层：自动注入 Authorization Header
5. 数据层：敏感字段脱敏展示
6. 输入层：XSS 防御（Vue 默认转义）+ 前端表单校验
7. 通信层：强制 HTTPS（生产环境）
8. 依赖层：定期 pnpm audit，dependabot 自动 PR
```

---

## 7. 性能策略

| 维度 | 策略 |
|------|------|
| 构建优化 | Tree-shaking、代码分割、按需加载路由 |
| 运行时 | 虚拟滚动长列表、防抖节流、KeepAlive 缓存 |
| 网络 | HTTP/2、Gzip/Brotli、CDN 静态资源、接口缓存 |
| 图片 | WebP 格式、懒加载、响应式图片 |
| 首屏 | 骨架屏、SSG/SSR（如需）、预连接 |

---

## 8. 关联文档

- [代码规范](../standards/01-code-standards.md)
- [Git 流程](../processes/02-git-workflow.md)
- [API 设计规范](../api/01-api-standards.md)
- [安全规范](../standards/03-security-standards.md)
- [测试规范](../standards/04-testing-standards.md)
