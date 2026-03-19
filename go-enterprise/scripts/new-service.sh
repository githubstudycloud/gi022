#!/usr/bin/env bash
# 新建微服务脚手架
set -euo pipefail

NAME="${1:?Usage: new-service.sh <service-name>}"
DIR="apps/$NAME"

if [ -d "$DIR" ]; then
  echo "Error: $DIR already exists" >&2
  exit 1
fi

echo "Creating service: $NAME"

# 创建目录结构
mkdir -p "$DIR"/{cmd,internal/{domain,repository,service,handler},config,migrations}

# go.mod
cat > "$DIR/go.mod" << EOF
module github.com/your-org/go-enterprise/apps/$NAME

go 1.22

require (
	github.com/gin-gonic/gin v1.10.0
	github.com/your-org/go-enterprise/libs/config v0.0.0
	github.com/your-org/go-enterprise/libs/logger v0.0.0
	github.com/your-org/go-enterprise/libs/db v0.0.0
	github.com/your-org/go-enterprise/libs/cache v0.0.0
	github.com/your-org/go-enterprise/libs/errors v0.0.0
	github.com/your-org/go-enterprise/libs/tracing v0.0.0
	github.com/your-org/go-enterprise/libs/middleware v0.0.0
)

replace (
	github.com/your-org/go-enterprise/libs/config => ../../libs/config
	github.com/your-org/go-enterprise/libs/logger => ../../libs/logger
	github.com/your-org/go-enterprise/libs/db => ../../libs/db
	github.com/your-org/go-enterprise/libs/cache => ../../libs/cache
	github.com/your-org/go-enterprise/libs/errors => ../../libs/errors
	github.com/your-org/go-enterprise/libs/tracing => ../../libs/tracing
	github.com/your-org/go-enterprise/libs/middleware => ../../libs/middleware
)
EOF

# cmd/main.go
cat > "$DIR/cmd/main.go" << 'EOF'
package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-enterprise/libs/config"
	"github.com/your-org/go-enterprise/libs/logger"
	"github.com/your-org/go-enterprise/libs/middleware"
)

func main() {
	cfg := config.MustLoad(envOr("CONFIG_FILE", "config/app.yaml"))

	var appCfg config.BaseConfig
	cfg.Unmarshal(&appCfg)

	log := logger.MustNew(logger.Config{
		Level:  appCfg.Log.Level,
		Format: appCfg.Log.Format,
		Output: appCfg.Log.Output,
	})
	defer log.Sync()

	router := gin.New()
	router.Use(middleware.Recovery(log), middleware.TraceID(), middleware.RequestLogger(log))
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	addr := fmt.Sprintf("%s:%d", appCfg.HTTP.Host, appCfg.HTTP.Port)
	srv := &http.Server{Addr: addr, Handler: router}

	go func() {
		log.Info("service started", logger.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("listen", logger.Err(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	srv.Shutdown(ctx)
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" { return v }
	return def
}
EOF

# config/app.yaml
cat > "$DIR/config/app.yaml" << EOF
app:
  name: $NAME
  version: "1.0.0"
  env: dev

http:
  host: 0.0.0.0
  port: 8080

database:
  driver: mysql
  dsn: "root:password@tcp(localhost:3306)/${NAME//-/_}?charset=utf8mb4&parseTime=True"
  max_open_conns: 50
  max_idle_conns: 10

redis:
  addr: "localhost:6379"

log:
  level: debug
  format: text
  output: stdout

tracing:
  enabled: false
EOF

# Dockerfile
cat > "$DIR/Dockerfile" << 'DOCKEREOF'
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache git ca-certificates tzdata
WORKDIR /workspace
COPY go.work go.work.sum ./
COPY libs/ libs/
COPY apps/SERVICE_NAME/ apps/SERVICE_NAME/
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /bin/service ./apps/SERVICE_NAME/cmd
FROM gcr.io/distroless/static-debian12
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /bin/service /service
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/service"]
DOCKEREOF

sed -i "s/SERVICE_NAME/$NAME/g" "$DIR/Dockerfile"

echo "✓ Service '$NAME' created at $DIR"
echo ""
echo "Next steps:"
echo "  1. Add './apps/$NAME' to go.work"
echo "  2. cd apps/$NAME && go mod tidy"
echo "  3. make run SERVICE=$NAME"
