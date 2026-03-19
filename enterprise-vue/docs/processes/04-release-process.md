# 发布流程

> 版本：v1.0 | 日期：2026-03-18 | 工具：Changesets + GitHub Actions

---

## 1. 版本号规范（语义化版本）

```
v{MAJOR}.{MINOR}.{PATCH}[-{PRE_RELEASE}.{N}]

MAJOR  ← 破坏性变更（不向后兼容）
MINOR  ← 新功能（向后兼容）
PATCH  ← Bug 修复
PRE    ← alpha | beta | rc
```

| 变更类型 | 版本递增 | 示例 |
|---------|---------|------|
| 破坏性 API 变更 | MAJOR | 1.0.0 → 2.0.0 |
| 新增功能 | MINOR | 1.0.0 → 1.1.0 |
| Bug 修复 | PATCH | 1.0.0 → 1.0.1 |
| 预发布 | 加后缀 | 1.1.0-beta.1 |

---

## 2. 发布步骤

### 2.1 开发阶段：记录变更

```bash
# 开发完成后，创建 changeset（描述变更）
pnpm changeset

# 交互式选择：
# 1. 选择受影响的包
# 2. 选择版本递增类型（major/minor/patch）
# 3. 填写 changeset 描述（会出现在 CHANGELOG）

# 提交 changeset 文件（.changeset/*.md）
git add .changeset/
git commit -m "chore: add changeset for user auth feature"
```

### 2.2 Release 准备：版本升级

```bash
# CI 自动执行（Version PR），或手动运行
pnpm version-packages

# 这会：
# - 更新各包的 package.json 版本号
# - 汇总所有 changeset 生成 CHANGELOG.md
# - 删除已处理的 changeset 文件
```

### 2.3 发布

```bash
# 合并 Version PR 后，CI 自动触发发布
# 或手动运行：
pnpm release

# 这会：
# - 构建所有包
# - 发布到 npm（如需）
# - 打 Git Tag
# - 触发 CD 部署流水线
```

---

## 3. 环境发布策略

```
feature 分支 → CI 构建验证
      ↓
main 分支合并 → 自动部署 开发环境（dev）
      ↓
Release Tag → 自动部署 测试环境（staging）
      ↓
      手动审批
      ↓
灰度发布（5% → 20% → 50% → 100%）→ 生产环境（prod）
```

### 环境说明

| 环境 | 域名 | 触发条件 | 自动/手动 |
|------|------|---------|---------|
| dev | dev.enterprise.com | main 分支 push | 自动 |
| staging | staging.enterprise.com | Release Tag | 自动 |
| prod | enterprise.com | 手动审批 | 手动 |

---

## 4. 紧急热修复流程（Hotfix）

```bash
# 1. 从 main 分支创建 hotfix 分支
git checkout main && git pull
git checkout -b hotfix/v1.2.1-login-crash

# 2. 修复并测试
# ... 修复代码 ...
pnpm test:unit

# 3. 创建 patch changeset
pnpm changeset
# 选择 patch 版本递增

# 4. 提 PR（标记为 P0 Hotfix，加急 Review）
git push && gh pr create --label "hotfix,P0"

# 5. Review 通过后立即合并部署
# 6. 复盘（24h 内完成）
```

---

## 5. 回滚策略

```bash
# 快速回滚（Nginx 切换上一版本）
# 通知 DevOps 执行回滚，目标 30min 内完成

# 代码层面回滚
git revert <commit-sha>
# 或
git checkout v1.1.0 -- apps/main-app/dist/

# 版本回滚后必须：
# 1. 确认回滚成功（监控指标正常）
# 2. 通知相关方
# 3. 创建事故报告（P0/P1）
```

---

## 6. CHANGELOG 格式

```markdown
# Changelog

## v1.2.0 (2026-03-18)

### Features

- **admin-app:** add role permission matrix page (#EVS-234)
- **main-app:** support dark mode theme (#EVS-201)

### Bug Fixes

- **auth:** fix token refresh race condition (#EVS-245)
- **ui:** fix EButton loading state flash (#EVS-238)

### Performance Improvements

- **admin-app:** add virtual scroll for user list (#EVS-229)

---

## v1.1.0 (2026-03-04)
...
```
