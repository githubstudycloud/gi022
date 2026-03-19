// Package db 提供 GORM 数据库连接池封装，支持多驱动、读写分离、慢查询日志。
package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Config 数据库配置
type Config struct {
	Driver          string        // mysql | postgres
	DSN             string        // 连接字符串
	MaxOpenConns    int           // 最大连接数
	MaxIdleConns    int           // 最大空闲连接
	ConnMaxLifetime time.Duration // 连接最大生命周期
	SlowThreshold   time.Duration // 慢查询阈值（默认 200ms）
	LogLevel        logger.LogLevel
}

// DB 封装 gorm.DB 提供生命周期管理
type DB struct {
	*gorm.DB
	cfg Config
}

// New 创建数据库连接
func New(cfg Config) (*DB, error) {
	if cfg.SlowThreshold == 0 {
		cfg.SlowThreshold = 200 * time.Millisecond
	}
	if cfg.LogLevel == 0 {
		cfg.LogLevel = logger.Warn
	}

	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             cfg.SlowThreshold,
			LogLevel:                  cfg.LogLevel,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	var dialector gorm.Dialector
	switch cfg.Driver {
	case "mysql":
		dialector = mysql.Open(cfg.DSN)
	case "postgres":
		dialector = postgres.Open(cfg.DSN)
	default:
		return nil, fmt.Errorf("db: unsupported driver %q", cfg.Driver)
	}

	gdb, err := gorm.Open(dialector, &gorm.Config{Logger: gormLogger})
	if err != nil {
		return nil, fmt.Errorf("db: open connection: %w", err)
	}

	sqlDB, err := gdb.DB()
	if err != nil {
		return nil, fmt.Errorf("db: get sql.DB: %w", err)
	}
	sqlDB.SetMaxOpenConns(cfg.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(cfg.ConnMaxLifetime)

	return &DB{DB: gdb, cfg: cfg}, nil
}

// WithContext 返回带 context 的 DB
func (d *DB) WithContext(ctx context.Context) *gorm.DB {
	return d.DB.WithContext(ctx)
}

// Ping 检查数据库连通性
func (d *DB) Ping() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

// Close 关闭连接池
func (d *DB) Close() error {
	sqlDB, err := d.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Transaction 开启事务，自动处理 commit/rollback
func (d *DB) Transaction(ctx context.Context, fn func(tx *gorm.DB) error) error {
	return d.DB.WithContext(ctx).Transaction(fn)
}

// Paginate 通用分页 scope
//
// 用法：db.Scopes(Paginate(page, pageSize)).Find(&items)
func Paginate(page, pageSize int) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if page <= 0 {
			page = 1
		}
		switch {
		case pageSize > 200:
			pageSize = 200
		case pageSize <= 0:
			pageSize = 20
		}
		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}
