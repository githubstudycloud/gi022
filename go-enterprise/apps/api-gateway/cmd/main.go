// api-gateway 入口：反向代理 + 鉴权 + 限流
package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-enterprise/libs/config"
	"github.com/your-org/go-enterprise/libs/logger"
	"github.com/your-org/go-enterprise/libs/middleware"
	"github.com/your-org/go-enterprise/libs/tracing"
)

// RouteConfig 上游服务路由配置
type RouteConfig struct {
	Prefix   string `mapstructure:"prefix"`
	Upstream string `mapstructure:"upstream"`
}

// GatewayConfig 网关配置
type GatewayConfig struct {
	config.BaseConfig
	Routes     []RouteConfig `mapstructure:"routes"`
	RateLimit  float64       `mapstructure:"rate_limit_rps"`
	RateBurst  int           `mapstructure:"rate_limit_burst"`
}

func main() {
	cfg := config.MustLoad(envOr("CONFIG_FILE", "config/app.yaml"))
	var gwCfg GatewayConfig
	if err := cfg.Unmarshal(&gwCfg); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}

	log := logger.MustNew(logger.Config{
		Level:  gwCfg.Log.Level,
		Format: gwCfg.Log.Format,
		Output: gwCfg.Log.Output,
	})
	defer log.Sync()

	ctx := context.Background()
	_, shutdown, _ := tracing.Init(ctx, tracing.Config{
		ServiceName: gwCfg.App.Name,
		Enabled:     gwCfg.Tracing.Enabled,
		Endpoint:    gwCfg.Tracing.Endpoint,
		SampleRate:  gwCfg.Tracing.SampleRate,
	})
	defer shutdown(ctx)

	if gwCfg.App.Env == "prod" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(
		middleware.Recovery(log),
		middleware.TraceID(),
		middleware.RequestLogger(log),
		middleware.CORS(),
		middleware.RateLimiter(gwCfg.RateLimit, gwCfg.RateBurst),
	)

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// 动态注册反向代理路由
	for _, route := range gwCfg.Routes {
		upstreamURL, err := url.Parse(route.Upstream)
		if err != nil {
			log.Fatal("invalid upstream url",
				logger.String("upstream", route.Upstream),
				logger.Err(err),
			)
		}
		proxy := newReverseProxy(upstreamURL)
		prefix := route.Prefix
		router.Any(prefix+"/*path", func(c *gin.Context) {
			// 重写路径
			c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, prefix)
			proxy.ServeHTTP(c.Writer, c.Request)
		})
		log.Info("registered route", logger.String("prefix", prefix), logger.String("upstream", route.Upstream))
	}

	addr := fmt.Sprintf("%s:%d", gwCfg.HTTP.Host, gwCfg.HTTP.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  time.Duration(gwCfg.HTTP.ReadTimeoutSec) * time.Second,
		WriteTimeout: time.Duration(gwCfg.HTTP.WriteTimeoutSec) * time.Second,
	}

	go func() {
		log.Info("api-gateway started", logger.String("addr", addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("listen", logger.Err(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	srv.Shutdown(shutdownCtx)
}

func newReverseProxy(target *url.URL) *httputil.ReverseProxy {
	proxy := httputil.NewSingleHostReverseProxy(target)
	proxy.ModifyResponse = func(resp *http.Response) error {
		resp.Header.Set("X-Proxied-By", "go-enterprise-gateway")
		return nil
	}
	return proxy
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
