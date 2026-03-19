// user-service 入口
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
	"github.com/your-org/go-enterprise/libs/cache"
	"github.com/your-org/go-enterprise/libs/config"
	"github.com/your-org/go-enterprise/libs/db"
	"github.com/your-org/go-enterprise/libs/logger"
	"github.com/your-org/go-enterprise/libs/middleware"
	"github.com/your-org/go-enterprise/libs/tracing"

	"github.com/your-org/go-enterprise/apps/user-service/internal/handler"
	"github.com/your-org/go-enterprise/apps/user-service/internal/repository"
	"github.com/your-org/go-enterprise/apps/user-service/internal/service"
)

func main() {
	// ── 1. 加载配置 ────────────────────────────────────────────────────────────
	cfgPath := envOr("CONFIG_FILE", "config/app.yaml")
	cfg := config.MustLoad(cfgPath)

	var appCfg config.BaseConfig
	if err := cfg.Unmarshal(&appCfg); err != nil {
		fmt.Fprintf(os.Stderr, "unmarshal config: %v\n", err)
		os.Exit(1)
	}

	// ── 2. 初始化日志 ──────────────────────────────────────────────────────────
	log := logger.MustNew(logger.Config{
		Level:  appCfg.Log.Level,
		Format: appCfg.Log.Format,
		Output: appCfg.Log.Output,
		File:   appCfg.Log.File,
	})
	defer log.Sync()

	// ── 3. 初始化追踪 ──────────────────────────────────────────────────────────
	ctx := context.Background()
	_, shutdown, err := tracing.Init(ctx, tracing.Config{
		ServiceName:    appCfg.App.Name,
		ServiceVersion: appCfg.App.Version,
		Endpoint:       appCfg.Tracing.Endpoint,
		SampleRate:     appCfg.Tracing.SampleRate,
		Enabled:        appCfg.Tracing.Enabled,
	})
	if err != nil {
		log.Fatal("init tracing", logger.Err(err))
	}
	defer shutdown(ctx)

	// ── 4. 数据库 ──────────────────────────────────────────────────────────────
	database, err := db.New(db.Config{
		Driver:          appCfg.Database.Driver,
		DSN:             appCfg.Database.DSN,
		MaxOpenConns:    appCfg.Database.MaxOpenConns,
		MaxIdleConns:    appCfg.Database.MaxIdleConns,
		ConnMaxLifetime: time.Duration(appCfg.Database.ConnMaxLifetime) * time.Second,
	})
	if err != nil {
		log.Fatal("connect database", logger.Err(err))
	}
	defer database.Close()

	// ── 5. 缓存 ────────────────────────────────────────────────────────────────
	cacheClient, err := cache.New(cache.Config{
		Addr:     appCfg.Redis.Addr,
		Password: appCfg.Redis.Password,
		DB:       appCfg.Redis.DB,
	}, "user-svc")
	if err != nil {
		log.Fatal("connect cache", logger.Err(err))
	}
	defer cacheClient.Close()

	// ── 6. 依赖注入组装 ────────────────────────────────────────────────────────
	userRepo := repository.NewUserRepository(database)
	userSvc := service.NewUserService(userRepo, cacheClient, log)
	userHandler := handler.NewUserHandler(userSvc, log)

	// ── 7. HTTP 路由 ──────────────────────────────────────────────────────────
	if appCfg.App.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}
	router := gin.New()
	router.Use(
		middleware.Recovery(log),
		middleware.TraceID(),
		middleware.RequestLogger(log),
		middleware.CORS(),
	)

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "service": appCfg.App.Name})
	})

	// 注册路由
	userHandler.Register(router)

	// ── 8. 启动 HTTP 服务 ──────────────────────────────────────────────────────
	addr := fmt.Sprintf("%s:%d", appCfg.HTTP.Host, appCfg.HTTP.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  time.Duration(appCfg.HTTP.ReadTimeoutSec) * time.Second,
		WriteTimeout: time.Duration(appCfg.HTTP.WriteTimeoutSec) * time.Second,
	}

	go func() {
		log.Info("user-service started", logger.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("listen", logger.Err(err))
		}
	}()

	// ── 9. 优雅关闭 ───────────────────────────────────────────────────────────
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("shutting down server...")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Error("server forced shutdown", logger.Err(err))
	}
	log.Info("server exited")
}

func envOr(key, defaultVal string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultVal
}
