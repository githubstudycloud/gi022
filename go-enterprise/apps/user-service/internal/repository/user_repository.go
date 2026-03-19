// Package repository 实现用户数据持久化（GORM）。
package repository

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/your-org/go-enterprise/apps/user-service/internal/domain"
	apperrors "github.com/your-org/go-enterprise/libs/errors"
	"github.com/your-org/go-enterprise/libs/db"
)

// userPO 数据库持久化对象
type userPO struct {
	ID        int64     `gorm:"primaryKey;autoIncrement"`
	Username  string    `gorm:"uniqueIndex;size:32;not null"`
	Email     string    `gorm:"uniqueIndex;size:128;not null"`
	Password  string    `gorm:"size:128;not null"`
	Phone     string    `gorm:"size:32"`
	Status    int8      `gorm:"default:1"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

func (userPO) TableName() string { return "users" }

// UserRepository 用户数据访问层接口
type UserRepository interface {
	Create(ctx context.Context, user *domain.User, password string) error
	FindByID(ctx context.Context, id int64) (*domain.User, error)
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	List(ctx context.Context, q domain.UserQuery) (*domain.UserList, error)
	Update(ctx context.Context, id int64, cmd domain.UpdateUserCommand) error
	Delete(ctx context.Context, id int64) error
}

type userRepository struct {
	db *db.DB
}

// NewUserRepository 创建用户 Repository
func NewUserRepository(database *db.DB) UserRepository {
	return &userRepository{db: database}
}

func (r *userRepository) Create(ctx context.Context, user *domain.User, password string) error {
	po := &userPO{
		Username: user.Username,
		Email:    user.Email,
		Password: password,
		Phone:    user.Phone,
		Status:   int8(user.Status),
	}
	if err := r.db.WithContext(ctx).Create(po).Error; err != nil {
		return apperrors.Wrap(apperrors.CodeDBError, "create user failed", err)
	}
	user.ID = po.ID
	user.CreatedAt = po.CreatedAt
	user.UpdatedAt = po.UpdatedAt
	return nil
}

func (r *userRepository) FindByID(ctx context.Context, id int64) (*domain.User, error) {
	var po userPO
	err := r.db.WithContext(ctx).First(&po, id).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, apperrors.Wrap(apperrors.CodeDBError, "find user", err)
	}
	return poToDomain(&po), nil
}

func (r *userRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var po userPO
	err := r.db.WithContext(ctx).Where("email = ?", email).First(&po).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, apperrors.ErrNotFound
	}
	if err != nil {
		return nil, apperrors.Wrap(apperrors.CodeDBError, "find user by email", err)
	}
	return poToDomain(&po), nil
}

func (r *userRepository) List(ctx context.Context, q domain.UserQuery) (*domain.UserList, error) {
	query := r.db.WithContext(ctx).Model(&userPO{})
	if q.Keyword != "" {
		query = query.Where("username LIKE ? OR email LIKE ?", "%"+q.Keyword+"%", "%"+q.Keyword+"%")
	}
	if q.Status != nil {
		query = query.Where("status = ?", *q.Status)
	}

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, apperrors.Wrap(apperrors.CodeDBError, "count users", err)
	}

	var pos []userPO
	if err := query.Scopes(db.Paginate(q.Page, q.PageSize)).Find(&pos).Error; err != nil {
		return nil, apperrors.Wrap(apperrors.CodeDBError, "list users", err)
	}

	items := make([]*domain.User, len(pos))
	for i := range pos {
		items[i] = poToDomain(&pos[i])
	}

	pages := int(total) / q.PageSize
	if int(total)%q.PageSize != 0 {
		pages++
	}

	return &domain.UserList{Items: items, Total: total, Page: q.Page, Pages: pages}, nil
}

func (r *userRepository) Update(ctx context.Context, id int64, cmd domain.UpdateUserCommand) error {
	updates := map[string]interface{}{}
	if cmd.Phone != nil {
		updates["phone"] = *cmd.Phone
	}
	if cmd.Status != nil {
		updates["status"] = int8(*cmd.Status)
	}
	if len(updates) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Model(&userPO{}).Where("id = ?", id).Updates(updates).Error
}

func (r *userRepository) Delete(ctx context.Context, id int64) error {
	return r.db.WithContext(ctx).Delete(&userPO{}, id).Error
}

func poToDomain(po *userPO) *domain.User {
	return &domain.User{
		ID:        po.ID,
		Username:  po.Username,
		Email:     po.Email,
		Phone:     po.Phone,
		Status:    domain.Status(po.Status),
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}
}
