# 架构决策记录（ADR）

架构决策记录用于记录重要的技术决策、决策背景、备选方案和决策结果。

## 命名规范

`ADR-{编号}-{简短标题}.md`，编号从 001 开始递增。

## 状态说明

| 状态 | 含义 |
|------|------|
| Proposed | 提案中，待讨论 |
| Accepted | 已采纳 |
| Deprecated | 已废弃 |
| Superseded | 被新 ADR 取代 |

## 记录列表

| 编号 | 标题 | 状态 | 日期 |
|------|------|------|------|
| [ADR-001](ADR-001-monorepo.md) | 采用 Go Workspace Monorepo | Accepted | 2026-03-18 |
| [ADR-002](ADR-002-error-handling.md) | 统一错误码体系 | Accepted | 2026-03-18 |
| [ADR-003](ADR-003-cache-strategy.md) | 缓存一致性策略（Cache Aside） | Accepted | 2026-03-18 |
