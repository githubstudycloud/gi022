.PHONY: help infra-up infra-down run dev test lint build new-service new-lib clean

# ── 变量 ──────────────────────────────────────────────────────────────────────
SERVICES := user-service order-service api-gateway
LIBS     := config logger db cache errors tracing middleware eventbus
GO       := go
SERVICE  ?= user-service

# ── 帮助 ──────────────────────────────────────────────────────────────────────
help: ## 显示帮助信息
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── 基础设施 ──────────────────────────────────────────────────────────────────
infra-up: ## 启动本地基础设施（MySQL/Redis/Kafka/Jaeger）
	docker compose -f deployments/docker/docker-compose.infra.yml up -d
	@echo "等待服务就绪..."
	@sleep 5
	@echo "✓ 基础设施已启动"
	@echo "  MySQL:      localhost:3306"
	@echo "  Redis:      localhost:6379"
	@echo "  Kafka:      localhost:9092"
	@echo "  Jaeger UI:  http://localhost:16686"
	@echo "  Prometheus: http://localhost:9090"

infra-down: ## 停止本地基础设施
	docker compose -f deployments/docker/docker-compose.infra.yml down

# ── 运行服务 ──────────────────────────────────────────────────────────────────
run: ## 运行服务 (SERVICE=user-service)
	@echo "▶ 运行 $(SERVICE)..."
	$(GO) run ./apps/$(SERVICE)/cmd/...

run-all: ## 并行运行所有服务
	@for svc in $(SERVICES); do \
		$(GO) run ./apps/$$svc/cmd/... & \
	done
	@wait

dev: ## 热重载开发 (需安装 air, SERVICE=user-service)
	@which air > /dev/null || (echo "请安装 air: go install github.com/air-verse/air@latest" && exit 1)
	@cd apps/$(SERVICE) && air

# ── 测试 ──────────────────────────────────────────────────────────────────────
test: ## 运行所有测试
	@echo "▶ 测试所有模块..."
	@for lib in $(LIBS); do \
		echo "  Testing libs/$$lib..."; \
		cd libs/$$lib && $(GO) test -race -coverprofile=coverage.out ./... && cd -; \
	done
	@for svc in $(SERVICES); do \
		echo "  Testing apps/$$svc..."; \
		cd apps/$$svc && $(GO) test -race -coverprofile=coverage.out ./... && cd -; \
	done
	@echo "✓ 所有测试通过"

test-service: ## 测试单个服务 (SERVICE=user-service)
	cd apps/$(SERVICE) && $(GO) test -v -race -coverprofile=coverage.out ./...
	cd apps/$(SERVICE) && $(GO) tool cover -html=coverage.out -o coverage.html
	@echo "✓ 覆盖率报告: apps/$(SERVICE)/coverage.html"

test-lib: ## 测试单个库 (LIB=config)
	cd libs/$(LIB) && $(GO) test -v -race ./...

# ── 代码检查 ──────────────────────────────────────────────────────────────────
lint: ## 运行代码检查
	@which golangci-lint > /dev/null || (echo "请安装: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest" && exit 1)
	golangci-lint run ./...

fmt: ## 格式化代码
	@for lib in $(LIBS); do \
		cd libs/$$lib && goimports -w . && cd -; \
	done
	@for svc in $(SERVICES); do \
		cd apps/$$svc && goimports -w . && cd -; \
	done

vet: ## go vet 检查
	@for lib in $(LIBS); do \
		cd libs/$$lib && $(GO) vet ./... && cd -; \
	done
	@for svc in $(SERVICES); do \
		cd apps/$$svc && $(GO) vet ./... && cd -; \
	done

vuln: ## 安全漏洞扫描
	@which govulncheck > /dev/null || go install golang.org/x/vuln/cmd/govulncheck@latest
	@for lib in $(LIBS); do \
		cd libs/$$lib && govulncheck ./... && cd -; \
	done
	@for svc in $(SERVICES); do \
		cd apps/$$svc && govulncheck ./... && cd -; \
	done

# ── 构建 ──────────────────────────────────────────────────────────────────────
build: ## 构建所有服务二进制
	@mkdir -p bin
	@for svc in $(SERVICES); do \
		echo "  Building $$svc..."; \
		CGO_ENABLED=0 $(GO) build -ldflags="-w -s" \
			-o bin/$$svc \
			./apps/$$svc/cmd; \
	done
	@echo "✓ 构建完成，输出至 bin/"

build-service: ## 构建单个服务 (SERVICE=user-service)
	@mkdir -p bin
	CGO_ENABLED=0 $(GO) build -ldflags="-w -s" -o bin/$(SERVICE) ./apps/$(SERVICE)/cmd
	@echo "✓ bin/$(SERVICE)"

docker-build: ## 构建 Docker 镜像 (SERVICE=user-service)
	docker build -f apps/$(SERVICE)/Dockerfile -t go-enterprise/$(SERVICE):latest .

# ── 脚手架 ───────────────────────────────────────────────────────────────────
new-service: ## 创建新服务 (NAME=payment-service)
	@[ -n "$(NAME)" ] || (echo "用法: make new-service NAME=payment-service" && exit 1)
	@bash scripts/new-service.sh $(NAME)
	@echo "✓ 服务 $(NAME) 已创建，记得在 go.work 中添加路径"

new-lib: ## 创建新公共库 (NAME=ratelimiter)
	@[ -n "$(NAME)" ] || (echo "用法: make new-lib NAME=ratelimiter" && exit 1)
	@bash scripts/new-lib.sh $(NAME)
	@echo "✓ 库 $(NAME) 已创建"

# ── 数据库 ───────────────────────────────────────────────────────────────────
migrate-up: ## 执行数据库迁移 (SERVICE=user-service)
	@which migrate > /dev/null || go install -tags 'mysql' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
	migrate -path ./apps/$(SERVICE)/migrations \
		-database "$$DATABASE_URL" up

migrate-down: ## 回滚数据库迁移 (SERVICE=user-service)
	migrate -path ./apps/$(SERVICE)/migrations \
		-database "$$DATABASE_URL" down 1

# ── 清理 ──────────────────────────────────────────────────────────────────────
clean: ## 清理构建产物
	@rm -rf bin/ tmp/
	@find . -name "coverage.out" -o -name "coverage.html" | xargs rm -f
	@echo "✓ 清理完成"

# ── 版本发布 ──────────────────────────────────────────────────────────────────
release: ## 打发布 Tag (VERSION=1.2.3)
	@[ -n "$(VERSION)" ] || (echo "用法: make release VERSION=1.2.3" && exit 1)
	@echo "发布版本 v$(VERSION)..."
	git tag -a "v$(VERSION)" -m "Release v$(VERSION)"
	git push origin "v$(VERSION)"
	@echo "✓ Tag v$(VERSION) 已推送，CI/CD 将自动构建并发布"
