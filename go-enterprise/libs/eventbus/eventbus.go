// Package eventbus 提供领域事件发布/订阅接口，底层支持 Kafka。
// 通过接口解耦，业务代码不依赖具体 MQ 实现，方便测试和替换。
package eventbus

import (
	"context"
	"encoding/json"
	"fmt"
	"time"
)

// Event 领域事件
type Event struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`       // 事件类型，如 user.created
	Source    string          `json:"source"`     // 事件来源服务
	Timestamp time.Time       `json:"timestamp"`
	Payload   json.RawMessage `json:"payload"`
}

// Handler 事件处理函数
type Handler func(ctx context.Context, event Event) error

// Publisher 事件发布接口
type Publisher interface {
	Publish(ctx context.Context, topic string, event Event) error
	Close() error
}

// Subscriber 事件订阅接口
type Subscriber interface {
	Subscribe(ctx context.Context, topic string, groupID string, handler Handler) error
	Close() error
}

// Bus 事件总线（同时实现发布和订阅）
type Bus interface {
	Publisher
	Subscriber
}

// NewEvent 创建事件（payload 会被 JSON 序列化）
func NewEvent(eventType, source string, payload interface{}) (Event, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return Event{}, fmt.Errorf("eventbus: marshal payload: %w", err)
	}
	return Event{
		ID:        generateID(),
		Type:      eventType,
		Source:    source,
		Timestamp: time.Now().UTC(),
		Payload:   data,
	}, nil
}

// UnmarshalPayload 反序列化 Payload 到目标结构
func (e Event) UnmarshalPayload(dest interface{}) error {
	return json.Unmarshal(e.Payload, dest)
}

func generateID() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}

// ─── Kafka 实现 ──────────────────────────────────────────────────────────────

// KafkaConfig Kafka 配置
type KafkaConfig struct {
	Brokers []string
	Version string // Kafka 版本，如 "2.8.0"
}

// InMemoryBus 内存实现（仅用于开发/测试）
type InMemoryBus struct {
	handlers map[string][]Handler
}

// NewInMemoryBus 创建内存事件总线
func NewInMemoryBus() *InMemoryBus {
	return &InMemoryBus{handlers: make(map[string][]Handler)}
}

func (b *InMemoryBus) Publish(ctx context.Context, topic string, event Event) error {
	for _, h := range b.handlers[topic] {
		if err := h(ctx, event); err != nil {
			return err
		}
	}
	return nil
}

func (b *InMemoryBus) Subscribe(_ context.Context, topic string, _ string, handler Handler) error {
	b.handlers[topic] = append(b.handlers[topic], handler)
	return nil
}

func (b *InMemoryBus) Close() error { return nil }
