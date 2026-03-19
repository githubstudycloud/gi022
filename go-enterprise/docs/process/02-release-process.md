# 发布流程规范

**版本**: 1.0 | **更新**: 2026-03-18

---

## 1. 发布流程总览

```
feature/fix PR → develop → 集成测试 → staging 验证 → 灰度发布 → 全量发布
                                                           ↑
                                              发布 Checklist 审核
```

---

## 2. 版本号规范

遵循 [Semantic Versioning 2.0.0](https://semver.org/)：

```
MAJOR.MINOR.PATCH[-pre.N]
  │      │     │
  │      │     └── 向后兼容的 Bug 修复
  │      └──────── 向后兼容的新功能
  └─────────────── 不兼容的 API 变更
```

**示例**：`v1.3.2`，`v2.0.0-beta.1`

---

## 3. 发布节奏

| 类型 | 频率 | 分支 |
|------|------|------|
| 常规版本 | 每周一次（周三） | develop → main |
| Hotfix | 按需（紧急修复） | hotfix/* → main |
| 大版本 | 按季度 | main（含迁移方案） |

---

## 4. 发布 Checklist

### 4.1 发布前（T-1 天）

- [ ] 所有 PR 已合并至 develop
- [ ] develop 分支 CI 全绿
- [ ] CHANGELOG 已更新（见下节）
- [ ] 数据库迁移脚本已准备
- [ ] 回滚方案已确认
- [ ] 相关团队已告知（前端、测试、运维）
- [ ] staging 环境已验证

### 4.2 发布中

- [ ] 创建发布 PR：develop → main
- [ ] 至少 2 人 Review 并 Approve
- [ ] 合并后打 Tag：`git tag v1.x.x && git push origin v1.x.x`
- [ ] CI/CD 自动触发部署
- [ ] 先灰度 10% 流量观察 30 分钟
- [ ] 监控面板确认：错误率、延迟、CPU/内存 无异常
- [ ] 灰度正常 → 全量放开

### 4.3 发布后（T+1 小时）

- [ ] 确认监控无告警
- [ ] 更新 JIRA/项目管理工具状态
- [ ] 通知相关方发布完成

---

## 5. CHANGELOG 规范

文件：`apps/{service}/CHANGELOG.md`

格式（Keep a Changelog）：

```markdown
# Changelog

## [Unreleased]

## [1.3.0] - 2026-03-18
### Added
- 用户手机号字段支持 (#123)
- 支持按状态筛选用户列表 (#125)

### Changed
- 优化用户列表查询性能 (#124)

### Fixed
- 修复邮箱重复检查大小写问题 (#126)

### Security
- 升级 gin 至 v1.10.0，修复 CVE-2024-xxxx

## [1.2.1] - 2026-02-28
...
```

---

## 6. 回滚流程

### 6.1 触发条件

- 核心指标异常（错误率 > 1%，P99 延迟 > 500ms）
- 出现 P0/P1 Bug
- 数据异常

### 6.2 回滚步骤

```bash
# 1. 立即决策（不超过 5 分钟）
# 2. 执行回滚
kubectl rollout undo deployment/{service-name} -n production

# 3. 验证回滚成功
kubectl rollout status deployment/{service-name} -n production

# 4. 确认指标恢复正常

# 5. 数据库迁移（如有）
# 执行回滚 SQL：V{version}__rollback_{描述}.sql
```

### 6.3 Hotfix 流程

```
1. 从 main 创建 hotfix/xxx 分支
2. 修复、测试、Code Review（1人 Approve 即可）
3. 合并至 main 并 Tag
4. Cherry-pick 至 develop（避免分叉）
5. 回顾复盘（事后 24h 内）
```

---

## 7. 故障复盘规范

**模板**：[docs/runbook/postmortem-template.md](../runbook/postmortem-template.md)

**必填项**：
- 影响范围与持续时间
- 根因（5 Why 分析）
- 时间线
- 改进措施（含负责人、截止日期）

**原则**：无指责文化（Blameless Postmortem）
