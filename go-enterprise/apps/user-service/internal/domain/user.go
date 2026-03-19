// Package domain 定义用户领域模型和业务规则（无基础设施依赖）。
package domain

import (
	"regexp"
	"time"

	apperrors "github.com/your-org/go-enterprise/libs/errors"
)

// User 用户领域模型
type User struct {
	ID        int64     `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone,omitempty"`
	Status    Status    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Status 用户状态
type Status int8

const (
	StatusActive   Status = 1
	StatusInactive Status = 0
	StatusBanned   Status = -1
)

func (s Status) String() string {
	switch s {
	case StatusActive:
		return "active"
	case StatusInactive:
		return "inactive"
	case StatusBanned:
		return "banned"
	default:
		return "unknown"
	}
}

var emailReg = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Validate 校验用户数据
func (u *User) Validate() error {
	if u.Username == "" || len(u.Username) < 3 || len(u.Username) > 32 {
		return apperrors.New(apperrors.CodeInvalidParam, "username must be 3-32 characters")
	}
	if !emailReg.MatchString(u.Email) {
		return apperrors.New(apperrors.CodeInvalidParam, "invalid email format")
	}
	return nil
}

// IsActive 用户是否处于活跃状态
func (u *User) IsActive() bool { return u.Status == StatusActive }

// CreateUserCommand 创建用户命令（输入 DTO）
type CreateUserCommand struct {
	Username string `json:"username" binding:"required,min=3,max=32"`
	Email    string `json:"email"    binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Phone    string `json:"phone"`
}

// UpdateUserCommand 更新用户命令
type UpdateUserCommand struct {
	Phone  *string `json:"phone"`
	Status *Status `json:"status"`
}

// UserQuery 用户查询参数
type UserQuery struct {
	Page     int    `form:"page"      binding:"min=1"`
	PageSize int    `form:"page_size" binding:"min=1,max=100"`
	Keyword  string `form:"keyword"`
	Status   *Status `form:"status"`
}

// UserList 用户列表结果
type UserList struct {
	Items []*User `json:"items"`
	Total int64   `json:"total"`
	Page  int     `json:"page"`
	Pages int     `json:"pages"`
}
