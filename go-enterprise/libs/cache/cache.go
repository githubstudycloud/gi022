// Package cache 提供 Redis 缓存封装，支持序列化、分布式锁、缓存穿透防护。
package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

// ErrCacheMiss 缓存未命中
var ErrCacheMiss = errors.New("cache: key not found")

// Config Redis 配置
type Config struct {
	Addr         string
	Password     string
	DB           int
	PoolSize     int
	DialTimeout  time.Duration
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
}

// Cache Redis 缓存客户端
type Cache struct {
	rdb    *redis.Client
	prefix string
}

// New 创建缓存实例
func New(cfg Config, keyPrefix string) (*Cache, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:         cfg.Addr,
		Password:     cfg.Password,
		DB:           cfg.DB,
		PoolSize:     cfg.PoolSize,
		DialTimeout:  cfg.DialTimeout,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("cache: connect to %s: %w", cfg.Addr, err)
	}

	return &Cache{rdb: rdb, prefix: keyPrefix}, nil
}

// key 生成带前缀的键
func (c *Cache) key(k string) string {
	if c.prefix == "" {
		return k
	}
	return c.prefix + ":" + k
}

// Set 序列化存储（JSON）
func (c *Cache) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("cache: marshal: %w", err)
	}
	return c.rdb.Set(ctx, c.key(key), data, ttl).Err()
}

// Get 反序列化读取
func (c *Cache) Get(ctx context.Context, key string, dest interface{}) error {
	data, err := c.rdb.Get(ctx, c.key(key)).Bytes()
	if errors.Is(err, redis.Nil) {
		return ErrCacheMiss
	}
	if err != nil {
		return fmt.Errorf("cache: get %q: %w", key, err)
	}
	return json.Unmarshal(data, dest)
}

// Del 删除缓存
func (c *Cache) Del(ctx context.Context, keys ...string) error {
	ks := make([]string, len(keys))
	for i, k := range keys {
		ks[i] = c.key(k)
	}
	return c.rdb.Del(ctx, ks...).Err()
}

// GetOrSet 缓存未命中时执行 fetch 并回填（防缓存击穿）
func (c *Cache) GetOrSet(ctx context.Context, key string, dest interface{}, ttl time.Duration, fetch func() (interface{}, error)) error {
	err := c.Get(ctx, key, dest)
	if err == nil {
		return nil
	}
	if !errors.Is(err, ErrCacheMiss) {
		return err
	}

	val, err := fetch()
	if err != nil {
		return err
	}
	if err := c.Set(ctx, key, val, ttl); err != nil {
		return err
	}

	data, _ := json.Marshal(val)
	return json.Unmarshal(data, dest)
}

// Lock 分布式锁（SET NX）
func (c *Cache) Lock(ctx context.Context, key string, ttl time.Duration) (bool, error) {
	return c.rdb.SetNX(ctx, c.key("lock:"+key), 1, ttl).Result()
}

// Unlock 释放分布式锁
func (c *Cache) Unlock(ctx context.Context, key string) error {
	return c.rdb.Del(ctx, c.key("lock:"+key)).Err()
}

// Ping 检查连接
func (c *Cache) Ping(ctx context.Context) error {
	return c.rdb.Ping(ctx).Err()
}

// Close 关闭连接
func (c *Cache) Close() error {
	return c.rdb.Close()
}

// Client 返回原始 redis.Client（高级操作时使用）
func (c *Cache) Client() *redis.Client {
	return c.rdb
}
