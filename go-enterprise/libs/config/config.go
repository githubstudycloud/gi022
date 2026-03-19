// Package config 提供统一的配置管理，支持文件、环境变量、热更新。
//
// 优先级（由高到低）：环境变量 > 配置文件 > 默认值
//
// 用法：
//
//	cfg, err := config.Load("config/app.yaml")
//	var c MyConfig
//	cfg.Unmarshal(&c)
package config

import (
	"fmt"
	"strings"
	"sync"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

// Config 配置实例
type Config struct {
	v    *viper.Viper
	mu   sync.RWMutex
	path string
}

// BaseConfig 所有服务共享的基础配置结构
type BaseConfig struct {
	App      AppConfig      `mapstructure:"app"`
	HTTP     HTTPConfig     `mapstructure:"http"`
	GRPC     GRPCConfig     `mapstructure:"grpc"`
	Database DatabaseConfig `mapstructure:"database"`
	Redis    RedisConfig    `mapstructure:"redis"`
	Log      LogConfig      `mapstructure:"log"`
	Tracing  TracingConfig  `mapstructure:"tracing"`
}

type AppConfig struct {
	Name    string `mapstructure:"name"`
	Version string `mapstructure:"version"`
	Env     string `mapstructure:"env"` // dev | test | staging | prod
}

type HTTPConfig struct {
	Host            string `mapstructure:"host"`
	Port            int    `mapstructure:"port"`
	ReadTimeoutSec  int    `mapstructure:"read_timeout_sec"`
	WriteTimeoutSec int    `mapstructure:"write_timeout_sec"`
}

type GRPCConfig struct {
	Host string `mapstructure:"host"`
	Port int    `mapstructure:"port"`
}

type DatabaseConfig struct {
	Driver          string `mapstructure:"driver"`
	DSN             string `mapstructure:"dsn"`
	MaxOpenConns    int    `mapstructure:"max_open_conns"`
	MaxIdleConns    int    `mapstructure:"max_idle_conns"`
	ConnMaxLifetime int    `mapstructure:"conn_max_lifetime_sec"`
}

type RedisConfig struct {
	Addr     string `mapstructure:"addr"`
	Password string `mapstructure:"password"`
	DB       int    `mapstructure:"db"`
}

type LogConfig struct {
	Level  string `mapstructure:"level"`  // debug | info | warn | error
	Format string `mapstructure:"format"` // json | text
	Output string `mapstructure:"output"` // stdout | file
	File   string `mapstructure:"file"`
}

type TracingConfig struct {
	Enabled     bool   `mapstructure:"enabled"`
	Endpoint    string `mapstructure:"endpoint"`
	ServiceName string `mapstructure:"service_name"`
	SampleRate  float64 `mapstructure:"sample_rate"`
}

// Load 加载配置文件，自动绑定环境变量
func Load(path string) (*Config, error) {
	v := viper.New()
	v.SetConfigFile(path)
	v.AutomaticEnv()
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	setDefaults(v)

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("config: read file %q: %w", path, err)
	}

	return &Config{v: v, path: path}, nil
}

// MustLoad 加载配置，失败时 panic（适合 main 入口）
func MustLoad(path string) *Config {
	c, err := Load(path)
	if err != nil {
		panic(err)
	}
	return c
}

// Unmarshal 反序列化到目标结构体
func (c *Config) Unmarshal(target interface{}) error {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.v.Unmarshal(target)
}

// Get 获取配置值
func (c *Config) Get(key string) interface{} {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.v.Get(key)
}

// GetString 获取字符串配置
func (c *Config) GetString(key string) string {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.v.GetString(key)
}

// GetInt 获取整型配置
func (c *Config) GetInt(key string) int {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.v.GetInt(key)
}

// WatchAndReload 开启配置热更新，变更时调用 onChange
func (c *Config) WatchAndReload(onChange func()) {
	c.v.WatchConfig()
	c.v.OnConfigChange(func(e fsnotify.Event) {
		c.mu.Lock()
		defer c.mu.Unlock()
		if onChange != nil {
			onChange()
		}
	})
}

func setDefaults(v *viper.Viper) {
	v.SetDefault("app.env", "dev")
	v.SetDefault("http.host", "0.0.0.0")
	v.SetDefault("http.port", 8080)
	v.SetDefault("http.read_timeout_sec", 30)
	v.SetDefault("http.write_timeout_sec", 30)
	v.SetDefault("grpc.host", "0.0.0.0")
	v.SetDefault("grpc.port", 9090)
	v.SetDefault("database.max_open_conns", 50)
	v.SetDefault("database.max_idle_conns", 10)
	v.SetDefault("database.conn_max_lifetime_sec", 300)
	v.SetDefault("log.level", "info")
	v.SetDefault("log.format", "json")
	v.SetDefault("log.output", "stdout")
	v.SetDefault("tracing.sample_rate", 0.1)
}
