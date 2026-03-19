package service_test

import (
	"context"
	"testing"

	"github.com/your-org/go-enterprise/apps/user-service/internal/domain"
	"github.com/your-org/go-enterprise/apps/user-service/internal/service"
	apperrors "github.com/your-org/go-enterprise/libs/errors"
	"github.com/your-org/go-enterprise/libs/eventbus"
	"github.com/your-org/go-enterprise/libs/logger"
)

// ─── Mock Repository ─────────────────────────────────────────────────────────

type mockUserRepo struct {
	users map[int64]*domain.User
	seq   int64
}

func newMockRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[int64]*domain.User)}
}

func (m *mockUserRepo) Create(ctx context.Context, user *domain.User, _ string) error {
	m.seq++
	user.ID = m.seq
	m.users[user.ID] = user
	return nil
}

func (m *mockUserRepo) FindByID(ctx context.Context, id int64) (*domain.User, error) {
	if u, ok := m.users[id]; ok {
		return u, nil
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockUserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	for _, u := range m.users {
		if u.Email == email {
			return u, nil
		}
	}
	return nil, apperrors.ErrNotFound
}

func (m *mockUserRepo) List(_ context.Context, q domain.UserQuery) (*domain.UserList, error) {
	var items []*domain.User
	for _, u := range m.users {
		items = append(items, u)
	}
	return &domain.UserList{Items: items, Total: int64(len(items)), Page: q.Page}, nil
}

func (m *mockUserRepo) Update(_ context.Context, id int64, cmd domain.UpdateUserCommand) error {
	if u, ok := m.users[id]; ok {
		if cmd.Phone != nil {
			u.Phone = *cmd.Phone
		}
		return nil
	}
	return apperrors.ErrNotFound
}

func (m *mockUserRepo) Delete(_ context.Context, id int64) error {
	delete(m.users, id)
	return nil
}

// ─── Mock Cache ───────────────────────────────────────────────────────────────

type mockCache struct{}

func (m *mockCache) GetOrSet(_ context.Context, _ string, _ interface{}, _ interface{}, fetch func() (interface{}, error)) error {
	_, err := fetch()
	return err
}

// ─── Tests ───────────────────────────────────────────────────────────────────

func newSvc() service.UserService {
	log := logger.MustNew(logger.Config{Level: "error", Format: "text", Output: "stdout"})
	bus := eventbus.NewInMemoryBus()
	_ = bus
	// 使用轻量内存缓存（跳过 Redis）
	return service.NewUserServiceWithDeps(newMockRepo(), nil, log)
}

func TestCreateUser_Success(t *testing.T) {
	svc := newSvc()
	cmd := domain.CreateUserCommand{
		Username: "alice",
		Email:    "alice@example.com",
		Password: "password123",
	}
	user, err := svc.CreateUser(context.Background(), cmd)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if user.ID == 0 {
		t.Error("expected non-zero user ID")
	}
	if user.Username != "alice" {
		t.Errorf("expected username 'alice', got %q", user.Username)
	}
}

func TestCreateUser_DuplicateEmail(t *testing.T) {
	svc := newSvc()
	cmd := domain.CreateUserCommand{
		Username: "bob",
		Email:    "bob@example.com",
		Password: "password123",
	}
	if _, err := svc.CreateUser(context.Background(), cmd); err != nil {
		t.Fatalf("first create failed: %v", err)
	}

	_, err := svc.CreateUser(context.Background(), cmd)
	if err == nil {
		t.Fatal("expected error for duplicate email")
	}
	ae, ok := apperrors.AsAppError(err)
	if !ok || ae.Code != apperrors.CodeConflict {
		t.Errorf("expected conflict error, got %v", err)
	}
}

func TestGetUser_NotFound(t *testing.T) {
	svc := newSvc()
	_, err := svc.GetUser(context.Background(), 999)
	if err == nil {
		t.Fatal("expected not found error")
	}
}
