# 软件开发生命周期（SDLC）总览

> 版本：v1.0 | 日期：2026-03-18

---

## 1. 开发流程全景图

```
┌──────────────────────────────────────────────────────────────────┐
│                     Enterprise Vue SDLC                          │
│                                                                  │
│  需求        设计        开发        测试        发布        运维  │
│   │           │           │           │           │           │  │
│  PRD → ADR → 技术方案 → 编码 → 单测 → Review → 集成测试 → 部署 → 监控 │
│   │           │           │           │           │           │  │
│  Sprint    API规范    Feature     CI自动     Release     告警     │
│  Planning  DB设计     Branch      化测试     Pipeline    处理     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. 迭代周期（2周 Sprint）

| 时间 | 活动 | 产出 |
|------|------|------|
| Sprint 第0天 | Sprint Planning：需求澄清、任务拆解、工作量估算 | Sprint Backlog |
| Sprint 第1-9天 | 开发、每日站会（15min）、代码 Review | Feature PRs |
| Sprint 第8天 | Code Freeze，转测 | Release Candidate |
| Sprint 第9-10天 | QA 回归测试、缺陷修复 | 测试报告 |
| Sprint 第10天 | 版本发布、Sprint Review、Retrospective | Release + 复盘文档 |

---

## 3. 各阶段详细说明

### 3.1 需求阶段
- 输入：产品 PRD 文档
- 活动：技术可行性分析、复杂度评估、风险识别
- 产出：开发任务单（含 AC - Acceptance Criteria）
- 工具：Jira/飞书项目

### 3.2 设计阶段
- 输入：需求任务单
- 活动：架构设计评审、API 接口设计、数据库 Schema 设计
- 产出：技术设计文档（TDD）、ADR（架构决策记录）、OpenAPI Spec、DB 迁移脚本
- 规范：[架构设计规范](../architecture/01-overview.md)

### 3.3 开发阶段
- 从 `main` 分支创建 `feature/xxx` 分支
- 遵循代码规范（ESLint + Prettier 强制）
- 编写单元测试（同步提交）
- 提交信息遵循 Conventional Commits
- 完成后提 PR，至少 1 人 Review

### 3.4 测试阶段
- 开发自测（单测通过率 100%）
- CI 自动化：类型检查 + ESLint + 单测 + 构建
- QA 手动测试（基于 AC 验收）
- E2E 测试覆盖关键路径

### 3.5 发布阶段
- 通过 Changesets 管理版本号
- 自动生成 CHANGELOG
- 打 Release Tag，触发 CD 流水线
- 分阶段发布（灰度 → 全量）

### 3.6 运维阶段
- Sentry 错误监控
- 性能监控（Core Web Vitals）
- 告警响应（P0: 30min, P1: 2h, P2: 24h）

---

## 4. 关联文档

- [Git 工作流](./02-git-workflow.md)
- [PR Review 规范](./03-pr-review.md)
- [发布流程](./04-release-process.md)
- [事故响应流程](./05-incident-response.md)
