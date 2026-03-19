# go-enterprise

企业级 Go 微服务框架 —— Monorepo 多项目模板

## 项目概览

```
go-enterprise/
├── apps/                    # 业务服务
│   ├── api-gateway/         # API 网关
│   ├── user-service/        # 用户服务
│   └── order-service/       # 订单服务
├── libs/                    # 公共库
│   ├── config/              # 配置管理
│   ├── logger/              # 结构化日志
│   ├── db/                  # 数据库封装
│   ├── cache/               # 缓存封装
│   ├── errors/              # 错误处理
│   ├── tracing/             # 分布式追踪
│   ├── middleware/          # 中间件集合
│   └── eventbus/            # 事件总线
├── docs/                    # 工程文档
│   ├── architecture/        # 架构设计文档
│   ├── adr/                 # 架构决策记录
│   ├── api/                 # API 规范
│   ├── runbook/             # 运维手册
│   └── process/             # 研发流程规范
├── deployments/             # 部署配置
│   ├── docker/
│   └── k8s/
├── scripts/                 # 工程脚本
├── .github/workflows/       # CI/CD 流水线
└── Makefile                 # 工程入口命令
```

## 快速开始

### 环境要求

- Go 1.22+
- Docker & Docker Compose
- Make

### 本地开发

```bash
# 克隆项目
git clone https://github.com/your-org/go-enterprise.git
cd go-enterprise

# 启动依赖（MySQL, Redis, Kafka）
make infra-up

# 运行所有服务
make run-all

# 运行单个服务
make run SERVICE=user-service

# 运行测试
make test

# 代码检查
make lint
```

### 新建服务

```bash
make new-service NAME=payment-service
```

## 文档导航

| 文档 | 路径 | 说明 |
|------|------|------|
| 架构设计 | [docs/architecture/](docs/architecture/) | 系统整体架构 |
| ADR | [docs/adr/](docs/adr/) | 架构决策记录 |
| API 规范 | [docs/api/](docs/api/) | OpenAPI 3.1 规范 |
| 研发流程 | [docs/process/](docs/process/) | 需求→发布全流程 |
| 运维手册 | [docs/runbook/](docs/runbook/) | 运维操作指南 |

## 研发流程

```
需求分析 → 技术设计 → API 设计 → 数据库设计 → 编码开发
    ↓          ↓         ↓           ↓            ↓
  PRD文档   设计文档   OpenAPI     迁移脚本     单元测试
                                               集成测试
                                                  ↓
                                           Code Review → 合并主干
                                                  ↓
                                           CI/CD 流水线
                                                  ↓
                                           灰度发布 → 全量发布
```

## 贡献指南

请阅读 [docs/process/CONTRIBUTING.md](docs/process/CONTRIBUTING.md)
