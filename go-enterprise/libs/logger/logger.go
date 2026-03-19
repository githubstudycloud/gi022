// Package logger 提供基于 zap 的结构化日志，支持 trace_id 透传和动态日志级别。
package logger

import (
	"context"
	"os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// contextKey 上下文键类型
type contextKey string

const (
	traceIDKey  contextKey = "trace_id"
	loggerKey   contextKey = "logger"
)

// Logger 封装 zap.Logger
type Logger struct {
	zl *zap.Logger
}

// Fields 日志字段
type Fields = []zap.Field

// Config 日志配置
type Config struct {
	Level  string // debug | info | warn | error
	Format string // json | text
	Output string // stdout | file
	File   string
}

// New 创建 Logger 实例
func New(cfg Config) (*Logger, error) {
	level, err := zapcore.ParseLevel(cfg.Level)
	if err != nil {
		level = zapcore.InfoLevel
	}

	encCfg := zap.NewProductionEncoderConfig()
	encCfg.TimeKey = "ts"
	encCfg.EncodeTime = zapcore.ISO8601TimeEncoder
	encCfg.EncodeLevel = zapcore.LowercaseLevelEncoder

	var enc zapcore.Encoder
	if cfg.Format == "text" {
		encCfg.EncodeLevel = zapcore.CapitalColorLevelEncoder
		enc = zapcore.NewConsoleEncoder(encCfg)
	} else {
		enc = zapcore.NewJSONEncoder(encCfg)
	}

	var sink zapcore.WriteSyncer
	if cfg.Output == "file" && cfg.File != "" {
		f, err := os.OpenFile(cfg.File, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			return nil, err
		}
		sink = zapcore.AddSync(f)
	} else {
		sink = zapcore.AddSync(os.Stdout)
	}

	core := zapcore.NewCore(enc, sink, zap.NewAtomicLevelAt(level))
	zl := zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))

	return &Logger{zl: zl}, nil
}

// MustNew 创建 Logger，失败时 panic
func MustNew(cfg Config) *Logger {
	l, err := New(cfg)
	if err != nil {
		panic(err)
	}
	return l
}

// WithContext 从上下文提取 trace_id 并返回带字段的 Logger
func (l *Logger) WithContext(ctx context.Context) *Logger {
	fields := extractContextFields(ctx)
	if len(fields) == 0 {
		return l
	}
	return &Logger{zl: l.zl.With(fields...)}
}

// With 添加固定字段
func (l *Logger) With(fields ...zap.Field) *Logger {
	return &Logger{zl: l.zl.With(fields...)}
}

func (l *Logger) Debug(msg string, fields ...zap.Field) { l.zl.Debug(msg, fields...) }
func (l *Logger) Info(msg string, fields ...zap.Field)  { l.zl.Info(msg, fields...) }
func (l *Logger) Warn(msg string, fields ...zap.Field)  { l.zl.Warn(msg, fields...) }
func (l *Logger) Error(msg string, fields ...zap.Field) { l.zl.Error(msg, fields...) }
func (l *Logger) Fatal(msg string, fields ...zap.Field) { l.zl.Fatal(msg, fields...) }

// Sync 刷新缓冲区（程序退出前调用）
func (l *Logger) Sync() error { return l.zl.Sync() }

// WithTraceID 将 trace_id 注入上下文
func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceIDKey, traceID)
}

// FromContext 从上下文获取 Logger（若无则返回 nil）
func FromContext(ctx context.Context) *Logger {
	if l, ok := ctx.Value(loggerKey).(*Logger); ok {
		return l
	}
	return nil
}

// InjectLogger 将 Logger 注入上下文
func InjectLogger(ctx context.Context, l *Logger) context.Context {
	return context.WithValue(ctx, loggerKey, l)
}

func extractContextFields(ctx context.Context) []zap.Field {
	var fields []zap.Field
	if traceID, ok := ctx.Value(traceIDKey).(string); ok && traceID != "" {
		fields = append(fields, zap.String("trace_id", traceID))
	}
	return fields
}

// 便捷字段构造函数（透传给 zap）
var (
	String  = zap.String
	Int     = zap.Int
	Int64   = zap.Int64
	Float64 = zap.Float64
	Bool    = zap.Bool
	Any     = zap.Any
	Err     = zap.Error
	Stringer = zap.Stringer
	Duration = zap.Duration
)
