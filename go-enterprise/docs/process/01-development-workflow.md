# 研发流程规范

**版本**: 1.0 | **更新**: 2026-03-18

---

## 1. 整体流程

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  需求分析    │──►│  技术设计    │──►│  开发实现    │──►│  测试验证    │
│  PRD 文档   │   │  设计文档    │   │  编码规范    │   │  测试规范    │
└─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
                                                              │
┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│  线上运维    │◄──│  发布上线    │◄──│  Code Review│◄─────────┘
│  Runbook    │   │  发布规范    │   │  PR 规范    │
└─────────────┘   └─────────────┘   └─────────────┘
```

---

## 2. 需求阶段

### 2.1 需求来源

| 来源 | 处理方式 |
|------|---------|
| 产品需求 | 产品经理出 PRD，技术评审 |
| Bug 修复 | 直接创建 Issue，评估优先级 |
| 技术改进 | 提案 + ADR，架构评审 |
| 紧急需求 | 走绿色通道，事后补文档 |

### 2.2 PRD 文档规范

PRD 存放于：`docs/requirements/{YYYY-MM}/{feature-name}.md`

**必须包含**：
- [ ] 背景与目标（为什么做）
- [ ] 用户故事（谁来用，用来做什么）
- [ ] 功能描述（做什么）
- [ ] 边界条件（不做什么）
- [ ] 验收标准（怎么算完成）
- [ ] 优先级（P0/P1/P2）

### 2.3 技术评审 Checklist

- [ ] 是否影响现有接口（向前兼容性）
- [ ] 数据量估算（存储、QPS）
- [ ] 是否需要数据库迁移
- [ ] 是否需要新增基础设施
- [ ] 安全影响（鉴权、敏感数据）
- [ ] 是否需要灰度方案

---

## 3. 设计阶段

### 3.1 技术设计文档规范

模板：[design-doc-template.md](templates/design-doc-template.md)

**重要功能必须出设计文档**（P0 必须，P1 建议）：

- 系统上下文图（C4 Model Level 1/2）
- 数据模型设计（ER 图）
- 接口设计（OpenAPI）
- 异常流程处理
- 性能估算

### 3.2 数据库设计规范

- 表名：`snake_case`，使用复数，如 `users`、`orders`
- 所有表必须有：`id`（BIGINT AUTO_INCREMENT）、`created_at`、`updated_at`
- 软删除用 `deleted_at`（Nullable），禁止物理删除业务数据
- 迁移脚本放在：`apps/{service}/migrations/`
- 命名：`V{版本}_{描述}.sql`，如 `V1__create_users_table.sql`

---

## 4. 开发阶段

### 4.1 分支策略（Git Flow Lite）

```
main          ← 生产分支，保护分支，只允许 PR 合并
  └── develop ← 集成分支，feature 分支从此创建
        └── feature/{ticket-id}-{描述}  ← 功能分支
        └── fix/{ticket-id}-{描述}      ← Bug 修复
        └── hotfix/{ticket-id}-{描述}   ← 生产紧急修复（从 main 创建）
```

**分支命名示例**：
- `feature/USER-123-add-phone-field`
- `fix/ORDER-456-fix-price-calculation`
- `hotfix/ALERT-789-fix-memory-leak`

### 4.2 Commit 规范（Conventional Commits）

```
<type>(<scope>): <subject>

[body]

[footer]
```

**类型**：

| type | 用途 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档变更 |
| style | 代码格式（不影响逻辑） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试 |
| chore | 构建/工具链 |
| revert | 回滚 |

**示例**：
```
feat(user): add phone number field

Add phone field to user model and update API.
Closes #123
```

### 4.3 编码规范

1. **包名**：小写单词，不使用下划线，如 `userservice`（但目录可用 `-`）
2. **接口命名**：动宾结构，如 `UserRepository`、`OrderService`
3. **错误处理**：每个 error 都要处理，禁止 `_ = err`（除非有注释说明原因）
4. **上下文传递**：函数第一个参数必须是 `context.Context`（Handler/Service/Repository 层）
5. **禁止全局变量**：通过依赖注入传递，全局变量只允许用于 `sync.Once` 的单例

### 4.4 本地开发命令

```bash
# 启动基础设施
make infra-up

# 运行指定服务
make run SERVICE=user-service

# 热重载开发（需安装 air）
make dev SERVICE=user-service

# 运行测试
make test SERVICE=user-service

# 代码检查
make lint
```

---

## 5. Code Review 规范

### 5.1 PR 规范

**PR 标题格式**：`[type] scope: 简短描述`（与 commit 类型一致）

**PR 描述必须包含**：
```markdown
## 变更说明
简述本次变更的目的和内容

## 变更类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 重构
- [ ] 文档
- [ ] 性能优化

## 测试情况
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试步骤

## 注意事项 / 风险点
（是否有 Breaking Change，是否需要数据库迁移等）

## 关联 Issue
Closes #123
```

### 5.2 Review Checklist

**功能正确性**：
- [ ] 功能是否满足需求
- [ ] 边界条件是否处理
- [ ] 错误情况是否处理

**代码质量**：
- [ ] 命名是否清晰
- [ ] 是否有重复代码（DRY 原则）
- [ ] 函数复杂度是否合理（建议单函数不超过 50 行）

**安全**：
- [ ] 是否存在 SQL 注入
- [ ] 是否存在敏感信息泄露（日志中禁止打印密码/Token）
- [ ] 权限控制是否正确

**性能**：
- [ ] 是否存在 N+1 查询
- [ ] 循环内是否有数据库/缓存调用
- [ ] 大列表是否有分页

**测试**：
- [ ] 关键逻辑是否有单元测试
- [ ] 测试覆盖率是否达标（≥80%）

### 5.3 Review SLA

| 优先级 | 响应时间 |
|--------|---------|
| Hotfix | 1 小时内 |
| P0 功能 | 4 小时内 |
| 普通 PR | 1 个工作日 |

**合并要求**：≥ 2 个 Approve，CI 全绿，无 Unresolved Comment

---

## 6. 测试规范

### 6.1 测试层次

| 层次 | 工具 | 覆盖目标 | 运行时机 |
|------|------|---------|---------|
| 单元测试 | Go 标准库 + testify | Service/Domain 层逻辑 | pre-commit + CI |
| 集成测试 | testcontainers-go | Repository 层（真实 DB）| CI |
| E2E 测试 | httptest / k6 | 关键业务流程 | 发布前 |
| 性能测试 | k6 | 核心接口压测 | 每个 release |

### 6.2 单元测试规范

```go
// 测试函数命名：Test{被测函数}_{场景}_{期望结果}
func TestCreateUser_DuplicateEmail_ReturnsConflict(t *testing.T) {
    // Arrange
    svc := newTestUserService()

    // Act
    _, err := svc.CreateUser(ctx, cmd)

    // Assert
    assert.ErrorIs(t, err, ErrConflict)
}
```

### 6.3 覆盖率要求

| 层次 | 最低覆盖率 |
|------|---------|
| Domain 层 | ≥ 90% |
| Service 层 | ≥ 80% |
| Handler 层 | ≥ 70% |
| Repository 层 | 集成测试覆盖 |
