# 发布规范

## 1. 版本号规范（Semantic Versioning）

```
版本格式：MAJOR.MINOR.PATCH[-prerelease]

示例：
  1.0.0       正式版
  1.1.0       新增向后兼容功能
  1.1.1       Bug 修复
  2.0.0       破坏性变更
  2.0.0-alpha.1   预发布
  2.0.0-beta.1    公测版
  2.0.0-rc.1      候选版本
```

| 版本类型 | 何时升级 | 示例 |
|----------|----------|------|
| MAJOR | 有破坏性 API 变更 | 移除 props、改变行为 |
| MINOR | 新增功能（向后兼容） | 新组件、新配置项 |
| PATCH | Bug 修复 | 样式修复、逻辑修复 |

## 2. 发布流程

### 标准发布（MINOR / PATCH）

```bash
# Step 1: 确保 develop 分支最新且干净
git checkout develop
git pull origin develop

# Step 2: 创建 release 分支
git checkout -b release/1.2.0

# Step 3: 更新版本号
pnpm nx run-many --target=version --all
# 或手动修改各 package.json 中的 version

# Step 4: 更新 CHANGELOG（见下方规范）
# 手动更新 CHANGELOG.md

# Step 5: 提交版本变更
git add -A
git commit -m "chore(release): bump version to 1.2.0"

# Step 6: 合并到 main
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release v1.2.0"

# Step 7: 合并回 develop
git checkout develop
git merge --no-ff release/1.2.0

# Step 8: 推送（触发 CI/CD release 流水线）
git push origin main --tags
git push origin develop

# Step 9: 清理
git branch -d release/1.2.0
```

### Hotfix 流程

```bash
# Step 1: 从 main 拉出 hotfix 分支
git checkout main
git checkout -b hotfix/1.2.1

# Step 2: 修复并提交
git commit -m "fix(scope): description of fix"

# Step 3: 更新版本号和 CHANGELOG
# 修改 version: 1.2.0 → 1.2.1

# Step 4: 合并到 main 和 develop
git checkout main && git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git checkout develop && git merge --no-ff hotfix/1.2.1

git push origin main --tags
git push origin develop
```

## 3. CHANGELOG 规范

遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/) 格式：

```markdown
# Changelog

所有值得注意的变更都记录在此文件中。
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/)，
版本管理遵循 [Semantic Versioning](https://semver.org/)。

## [未发布]

## [1.2.0] - 2024-06-01

### 新增
- `packages/ui`: 新增 `Tooltip` 组件，支持 4 个方向 (#123)
- `apps/admin`: 用户管理页面支持批量操作 (#124)

### 变更
- `packages/utils`: `formatDate` 参数顺序调整（破坏性变更见迁移指南）

### 修复
- `apps/web`: 修复 Dashboard 页面在 Safari 下闪烁问题 (#125)
- `packages/ui`: Button 组件 loading 状态下 onClick 仍触发的问题 (#126)

### 移除
- `packages/utils`: 移除已弃用的 `parseDate` 函数（已于 v1.1.0 弃用）

## [1.1.0] - 2024-05-01
...
```

## 4. 发布检查清单

### 发布前
- [ ] 所有 CI 通过（lint + type-check + test + build）
- [ ] E2E 测试在 staging 环境通过
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新（package.json）
- [ ] Breaking changes 已在 CHANGELOG 说明并提供迁移指南
- [ ] 已通知相关依赖方（下游项目、设计团队）

### 发布后
- [ ] GitHub Release 已创建
- [ ] npm 包已成功发布（如适用）
- [ ] 监控告警正常（无异常错误率上升）
- [ ] 验证生产环境核心功能正常
- [ ] 团队已收到发布通知

## 5. 回滚流程

```bash
# 方式 1: Git 标签回滚（推荐）
git checkout v1.1.0
# 重新触发 CI/CD

# 方式 2: Revert 提交
git revert v1.2.0..HEAD
git push origin main

# 方式 3: 强制回滚（仅紧急情况）
git reset --hard v1.1.0
git push origin main --force-with-lease
```
