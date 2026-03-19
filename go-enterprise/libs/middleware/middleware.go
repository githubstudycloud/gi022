// Package middleware 提供 Gin 中间件集合：请求日志、TraceID 注入、
// 统一错误处理、Rate Limiting、鉴权等。
package middleware

import (
	"net/http"
	"runtime/debug"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	apperrors "github.com/your-org/go-enterprise/libs/errors"
	"github.com/your-org/go-enterprise/libs/logger"
	"github.com/your-org/go-enterprise/libs/tracing"
	"golang.org/x/time/rate"
)

// ─── 响应结构 ─────────────────────────────────────────────────────────────────

// Response 统一响应体
type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	TraceID string      `json:"trace_id,omitempty"`
}

// Success 写入成功响应
func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
		TraceID: tracing.TraceID(c.Request.Context()),
	})
}

// Fail 写入失败响应
func Fail(c *gin.Context, err error) {
	ae, _ := apperrors.AsAppError(err)
	c.JSON(ae.HTTPStatus(), Response{
		Code:    int(ae.Code),
		Message: ae.Message,
		TraceID: tracing.TraceID(c.Request.Context()),
	})
}

// ─── 中间件 ──────────────────────────────────────────────────────────────────

// RequestLogger 请求日志中间件（记录耗时、状态码、trace_id）
func RequestLogger(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		log.WithContext(c.Request.Context()).Info("http request",
			logger.String("method", c.Request.Method),
			logger.String("path", c.FullPath()),
			logger.Int("status", c.Writer.Status()),
			logger.Duration("latency", time.Since(start)),
			logger.String("ip", c.ClientIP()),
		)
	}
}

// Recovery 全局 panic 恢复，统一返回 500
func Recovery(log *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Error("panic recovered",
					logger.Any("error", r),
					logger.String("stack", string(debug.Stack())),
				)
				c.AbortWithStatusJSON(http.StatusInternalServerError, Response{
					Code:    int(apperrors.CodeInternal),
					Message: "internal server error",
					TraceID: tracing.TraceID(c.Request.Context()),
				})
			}
		}()
		c.Next()
	}
}

// TraceID 注入 trace_id 到 context 和响应头
func TraceID() gin.HandlerFunc {
	return func(c *gin.Context) {
		traceID := c.GetHeader("X-Trace-ID")
		if traceID == "" {
			traceID = tracing.TraceID(c.Request.Context())
		}
		ctx := logger.WithTraceID(c.Request.Context(), traceID)
		c.Request = c.Request.WithContext(ctx)
		c.Header("X-Trace-ID", traceID)
		c.Next()
	}
}

// CORS 跨域中间件
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization,Content-Type,X-Trace-ID")
		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	}
}

// RateLimiter 简单令牌桶限流（per-process，生产环境应使用 Redis 分布式限流）
func RateLimiter(rps float64, burst int) gin.HandlerFunc {
	limiter := rate.NewLimiter(rate.Limit(rps), burst)
	return func(c *gin.Context) {
		if !limiter.Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, Response{
				Code:    int(apperrors.CodeTooManyReqs),
				Message: "rate limit exceeded",
			})
			return
		}
		c.Next()
	}
}

// RequestID 生成唯一请求 ID 写入响应头
func RequestID() gin.HandlerFunc {
	var counter uint64
	return func(c *gin.Context) {
		// 简单实现：ts + counter（生产可换 uuid）
		counter++
		reqID := strconv.FormatInt(time.Now().UnixNano(), 36) + strconv.FormatUint(counter, 36)
		c.Header("X-Request-ID", reqID)
		c.Set("request_id", reqID)
		c.Next()
	}
}
