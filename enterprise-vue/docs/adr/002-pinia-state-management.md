# ADR-002: 采用 Pinia 作为全局状态管理方案

> 日期：2026-03-18 | 状态：已采纳 | 作者：架构组

---

## 背景

Vue 3 项目需要一套全局状态管理方案，管理用户认证状态、权限、应用配置等全局共享数据。

## 决策

采用 **Pinia** 作为唯一的状态管理库，配合 **pinia-plugin-persistedstate** 实现持久化。

## 备选方案对比

| 方案 | 优点 | 缺点 | 是否采用 |
|------|------|------|---------|
| Pinia | Vue 官方、TypeScript 友好、轻量 | - | ✅ 采纳 |
| Vuex 4 | 熟悉度高 | 冗余的 mutations，TS 支持弱 | ❌ |
| Zustand（移植） | 极简 | 非 Vue 生态 | ❌ |
| Composable（响应式） | 无额外依赖 | 复杂场景难管理，无 DevTools | ❌（局部使用） |

## Store 设计原则

1. **按领域划分**：auth / user / app / permission，不建超级大 Store
2. **最小化状态**：能从状态派生的用 `computed`，不重复存储
3. **Action 处理副作用**：Store 的 action 负责 API 调用和状态更新
4. **持久化策略**：只持久化必要字段（theme/locale/sidebarCollapsed）

## 影响

- 所有应用共享 `@enterprise/stores` 包中的基础 Store
- 各应用可以在自己的 stores/ 目录扩展业务相关 Store
- DevTools 通过 Vue Devtools 可视化调试
