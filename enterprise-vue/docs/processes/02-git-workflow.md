# Git 工作流规范

> 版本：v1.0 | 日期：2026-03-18 | 模型：GitHub Flow（简化 GitFlow）

---

## 1. 分支策略

```
main ─────────────────────────────────────────────► (生产)
  │                                          ▲
  │ checkout                                 │ merge via PR
  │                                          │
  ├── feature/EVS-123-user-auth ────────────►│
  ├── feature/EVS-456-dark-theme ───────────►│
  ├── fix/EVS-789-login-redirect ───────────►│
  └── release/v1.2.0 ────────────────────────►│
```

### 分支类型

| 分支 | 命名规范 | 来源 | 合并目标 | 保护 |
|------|---------|------|---------|------|
| `main` | main | - | - | ✅ 强保护 |
| `feature/*` | `feature/EVS-{ID}-{short-desc}` | main | main | ❌ |
| `fix/*` | `fix/EVS-{ID}-{short-desc}` | main | main | ❌ |
| `hotfix/*` | `hotfix/{version}-{desc}` | main | main | ❌ |
| `release/*` | `release/v{major}.{minor}.{patch}` | main | main | ✅ |
| `chore/*` | `chore/{desc}` | main | main | ❌ |

---

## 2. Commit 规范（Conventional Commits）

### 格式

```
<type>(<scope>): <subject>

[body]

[footer]
```

### type 枚举

| type | 含义 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(users): add avatar upload` |
| `fix` | Bug 修复 | `fix(auth): handle token refresh race condition` |
| `docs` | 文档更新 | `docs(readme): update installation steps` |
| `style` | 代码格式（无逻辑变化） | `style: fix eslint warnings` |
| `refactor` | 重构 | `refactor(api): extract request retry logic` |
| `perf` | 性能优化 | `perf(table): add virtual scroll for large datasets` |
| `test` | 测试 | `test(utils): add maskPhone edge case tests` |
| `build` | 构建系统 | `build: upgrade vite to v6` |
| `ci` | CI/CD 配置 | `ci: add security audit workflow` |
| `chore` | 杂项 | `chore(deps): update pinia to 2.3.0` |
| `revert` | 回滚 | `revert: feat(users): avatar upload (#123)` |

### 示例

```
feat(admin): add role permission matrix page

- 添加角色权限矩阵视图，支持批量配置权限
- 权限数据从后端实时加载，支持搜索过滤
- 修改成功后自动刷新用户权限缓存

Closes #EVS-234
```

---

## 3. 分支生命周期

### 创建特性分支

```bash
# 1. 确保 main 最新
git checkout main && git pull

# 2. 创建功能分支
git checkout -b feature/EVS-123-user-login

# 3. 开发...

# 4. 提交（遵循 Conventional Commits）
git add -p  # 选择性暂存，避免大包提交
git commit -m "feat(auth): implement JWT login flow"
```

### 保持分支同步

```bash
# 定期 rebase（不用 merge，保持线性历史）
git fetch origin
git rebase origin/main

# 解决冲突后继续
git rebase --continue
```

### 提 PR

```bash
git push origin feature/EVS-123-user-login
# 在 GitHub 创建 PR，填写描述模板
```

---

## 4. PR 合并策略

| 场景 | 策略 | 原因 |
|------|------|------|
| feature → main | Squash merge | 保持 main 历史整洁 |
| fix → main | Squash merge | 同上 |
| hotfix → main | Merge commit | 保留修复上下文 |
| release → main | Merge commit | 保留发布记录 |

---

## 5. 分支保护规则（GitHub 配置）

`main` 分支保护：
- ✅ 要求 PR（禁止直接 push）
- ✅ 至少 1 人 Code Review 通过
- ✅ 所有 CI checks 通过
- ✅ 要求分支最新（no stale merge）
- ✅ 禁止 force push
- ✅ 禁止删除分支

---

## 6. Tag 规范

```bash
# 语义化版本
v{major}.{minor}.{patch}[-{prerelease}]

# 示例
v1.0.0          # 正式版
v1.1.0-beta.1   # Beta 版
v2.0.0-rc.1     # Release Candidate

# 通过 Changesets 自动生成（不要手动打 Tag）
pnpm changeset
pnpm version-packages
pnpm release
```
