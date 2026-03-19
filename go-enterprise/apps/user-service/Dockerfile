# ── Stage 1: 构建 ─────────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /workspace

# 复制 go.work 和各模块的 go.mod（充分利用 Docker 缓存）
COPY go.work go.work.sum ./
COPY libs/config/go.mod libs/config/
COPY libs/logger/go.mod libs/logger/
COPY libs/db/go.mod libs/db/
COPY libs/cache/go.mod libs/cache/
COPY libs/errors/go.mod libs/errors/
COPY libs/tracing/go.mod libs/tracing/
COPY libs/middleware/go.mod libs/middleware/
COPY libs/eventbus/go.mod libs/eventbus/
COPY apps/user-service/go.mod apps/user-service/

# 下载依赖
RUN go work sync

# 复制源码
COPY libs/ libs/
COPY apps/user-service/ apps/user-service/

# 编译（关闭 CGO，生成静态二进制）
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s -X main.version=$(git describe --tags --always)" \
    -o /bin/user-service \
    ./apps/user-service/cmd

# ── Stage 2: 最小运行镜像 ─────────────────────────────────────────────────────
FROM gcr.io/distroless/static-debian12

# 时区数据
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
# CA 证书（HTTPS 请求需要）
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
# 二进制
COPY --from=builder /bin/user-service /user-service

# 非 root 用户运行
USER nonroot:nonroot

EXPOSE 8080 9090

ENTRYPOINT ["/user-service"]
