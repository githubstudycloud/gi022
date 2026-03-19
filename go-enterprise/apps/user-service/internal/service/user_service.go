// Package service 实现用户业务逻辑层。
package service

import (
	"context"
	"crypto/sha256"
	"fmt"
	"time"

	"github.com/your-org/go-enterprise/apps/user-service/internal/domain"
	"github.com/your-org/go-enterprise/apps/user-service/internal/repository"
	"github.com/your-org/go-enterprise/libs/cache"
	apperrors "github.com/your-org/go-enterprise/libs/errors"
	"github.com/your-org/go-enterprise/libs/logger"
)

const userCacheTTL = 10 * time.Minute

// UserService 用户业务接口
type UserService interface {
	CreateUser(ctx context.Context, cmd domain.CreateUserCommand) (*domain.User, error)
	GetUser(ctx context.Context, id int64) (*domain.User, error)
	ListUsers(ctx context.Context, q domain.UserQuery) (*domain.UserList, error)
	UpdateUser(ctx context.Context, id int64, cmd domain.UpdateUserCommand) (*domain.User, error)
	DeleteUser(ctx context.Context, id int64) error
}

type userService struct {
	repo  repository.UserRepository
	cache *cache.Cache
	log   *logger.Logger
}

// NewUserService 创建用户服务
func NewUserService(repo repository.UserRepository, c *cache.Cache, log *logger.Logger) UserService {
	return &userService{repo: repo, cache: c, log: log}
}

func (s *userService) CreateUser(ctx context.Context, cmd domain.CreateUserCommand) (*domain.User, error) {
	// 1. 检查邮箱是否已存在
	if _, err := s.repo.FindByEmail(ctx, cmd.Email); err == nil {
		return nil, apperrors.New(apperrors.CodeConflict, "email already registered")
	}

	// 2. 构建领域对象并校验
	user := &domain.User{
		Username: cmd.Username,
		Email:    cmd.Email,
		Phone:    cmd.Phone,
		Status:   domain.StatusActive,
	}
	if err := user.Validate(); err != nil {
		return nil, err
	}

	// 3. 密码哈希（生产应使用 bcrypt）
	hashedPwd := hashPassword(cmd.Password)

	// 4. 持久化
	if err := s.repo.Create(ctx, user, hashedPwd); err != nil {
		return nil, err
	}

	s.log.WithContext(ctx).Info("user created",
		logger.Int64("user_id", user.ID),
		logger.String("email", user.Email),
	)

	return user, nil
}

func (s *userService) GetUser(ctx context.Context, id int64) (*domain.User, error) {
	cacheKey := fmt.Sprintf("user:%d", id)
	var user domain.User

	err := s.cache.GetOrSet(ctx, cacheKey, &user, userCacheTTL, func() (interface{}, error) {
		return s.repo.FindByID(ctx, id)
	})
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *userService) ListUsers(ctx context.Context, q domain.UserQuery) (*domain.UserList, error) {
	if q.Page == 0 {
		q.Page = 1
	}
	if q.PageSize == 0 {
		q.PageSize = 20
	}
	return s.repo.List(ctx, q)
}

func (s *userService) UpdateUser(ctx context.Context, id int64, cmd domain.UpdateUserCommand) (*domain.User, error) {
	// 确认用户存在
	if _, err := s.repo.FindByID(ctx, id); err != nil {
		return nil, err
	}

	if err := s.repo.Update(ctx, id, cmd); err != nil {
		return nil, err
	}

	// 淘汰缓存
	_ = s.cache.Del(ctx, fmt.Sprintf("user:%d", id))

	return s.repo.FindByID(ctx, id)
}

func (s *userService) DeleteUser(ctx context.Context, id int64) error {
	if err := s.repo.Delete(ctx, id); err != nil {
		return err
	}
	_ = s.cache.Del(ctx, fmt.Sprintf("user:%d", id))
	return nil
}

func hashPassword(pwd string) string {
	h := sha256.New()
	h.Write([]byte(pwd))
	return fmt.Sprintf("%x", h.Sum(nil))
}
