# 技术设计文档模板

> **文档状态**：草稿 / 评审中 / 已确认
> **作者**：@{作者}
> **评审人**：@{评审人}
> **创建日期**：YYYY-MM-DD
> **关联 PRD**：[链接]
> **关联 ADR**：[ADR-xxx]

---

## 1. 背景

> 简述需要解决的技术问题，以及为什么现在解决它。

---

## 2. 目标与约束

### 技术目标
- [ ] 目标一
- [ ] 目标二

### 约束条件
- 必须兼容现有 API 契约
- 不能引入超过 50KB 的新依赖

---

## 3. 方案对比

> 列出 2-3 个候选方案，说明最终选择原因。

| 方案 | 优点 | 缺点 | 是否选用 |
|------|------|------|----------|
| 方案 A | 实现简单 | 扩展性差 | ❌ |
| 方案 B | 可扩展，性能好 | 学习成本高 | ✅ 选用 |
| 方案 C | 社区成熟 | 依赖重 | ❌ |

---

## 4. 详细设计

### 4.1 整体架构

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Layer A │────▶│  Layer B │────▶│  Layer C │
└──────────┘     └──────────┘     └──────────┘
```

### 4.2 数据模型

```typescript
// 核心数据结构定义
interface Entity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  // ...
}
```

### 4.3 API 接口设计

#### POST /api/v1/resource

**请求**：
```json
{
  "field": "value"
}
```

**响应（200）**：
```json
{
  "code": 0,
  "data": { "id": "xxx" },
  "message": "success"
}
```

**错误码**：
| 错误码 | 含义 | HTTP 状态 |
|--------|------|-----------|
| 4001 | 参数错误 | 400 |
| 4003 | 无权限 | 403 |

### 4.4 时序图

```
Client          Frontend         Backend          Database
  │                │                │                │
  │──请求─────────▶│                │                │
  │                │──API call─────▶│                │
  │                │                │──query────────▶│
  │                │                │◀──result───────│
  │                │◀──response─────│                │
  │◀──渲染─────────│                │                │
```

### 4.5 状态管理

> 说明哪些状态放 Zustand，哪些用 local state，哪些缓存到 localStorage

### 4.6 组件拆分

```
PageComponent
├── FeatureSection
│   ├── ListItem (ui/Table)
│   └── EmptyState
└── ActionPanel
    ├── CreateButton (ui/Button)
    └── SearchInput (ui/Input)
```

---

## 5. 性能考量

| 场景 | 预期性能 | 优化手段 |
|------|----------|----------|
| 首屏加载 | < 1.5s | Code splitting, preload |
| 列表渲染（1000条） | < 16ms | 虚拟滚动 |
| 搜索响应 | < 300ms | 防抖 + 服务端分页 |

---

## 6. 安全考量

- [ ] XSS 防御：所有用户输入使用 `dangerouslySetInnerHTML` 替换为文本节点
- [ ] CSRF：使用 SameSite cookie + CSRF token
- [ ] 权限：所有写操作前端 + 后端双重校验
- [ ] 敏感数据：不在 localStorage 存储明文凭证

---

## 7. 测试策略

| 层级 | 覆盖范围 | 工具 |
|------|----------|------|
| 单元测试 | 纯函数、Hooks | Vitest |
| 组件测试 | 交互逻辑、渲染 | Testing Library |
| E2E 测试 | 核心用户流程 | Playwright |

---

## 8. 上线计划

- [ ] feature flag 控制灰度
- [ ] 监控指标：错误率、P95 响应时间
- [ ] 回滚方案：关闭 feature flag

---

## 9. 遗留问题

| 问题 | 负责人 | 截止日期 |
|------|--------|----------|
| 待确认 API 字段命名 | @backend | YYYY-MM-DD |
