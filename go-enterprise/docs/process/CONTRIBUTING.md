# 贡献指南

欢迎贡献代码！请在开始前阅读本文档。

---

## 本地环境搭建

```bash
# 1. Fork 并克隆
git clone https://github.com/your-org/go-enterprise.git
cd go-enterprise

# 2. 安装 Go 工具链
go install golang.org/x/tools/cmd/goimports@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install github.com/air-verse/air@latest  # 热重载

# 3. 安装 pre-commit hooks
cp scripts/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit

# 4. 启动基础设施
make infra-up

# 5. 验证环境
make test
make lint
```

---

## 开发流程

1. 从 `develop` 创建功能分支
2. 开发、写测试
3. 本地通过 `make lint && make test`
4. 提交 PR 至 `develop`，填写 PR 描述
5. 等待 CI 通过 + 2 个 Approve
6. Squash merge（保持主干历史整洁）

---

## 新增服务

```bash
make new-service NAME=payment-service
```

脚手架会自动生成：
- `apps/payment-service/` 完整目录结构
- `go.mod`（已配置 replace 指令）
- `config/app.yaml` 默认配置
- `cmd/main.go` 启动入口
- `Dockerfile`
- 基础 k8s Deployment 配置

---

## 新增公共库

```bash
make new-lib NAME=ratelimiter
```

---

## 规范参考

| 规范 | 文档 |
|------|------|
| 代码规范 | [development-workflow.md](01-development-workflow.md) |
| Commit 规范 | [development-workflow.md#42](01-development-workflow.md#42-commit-规范conventional-commits) |
| PR 规范 | [development-workflow.md#51](01-development-workflow.md#51-pr-规范) |
| 发布规范 | [release-process.md](02-release-process.md) |
