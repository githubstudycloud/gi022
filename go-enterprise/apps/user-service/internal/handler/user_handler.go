// Package handler 实现 HTTP 路由处理层（Controller）。
package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/your-org/go-enterprise/apps/user-service/internal/domain"
	"github.com/your-org/go-enterprise/apps/user-service/internal/service"
	apperrors "github.com/your-org/go-enterprise/libs/errors"
	"github.com/your-org/go-enterprise/libs/logger"
	"github.com/your-org/go-enterprise/libs/middleware"
)

// UserHandler HTTP 处理器
type UserHandler struct {
	svc service.UserService
	log *logger.Logger
}

// NewUserHandler 创建处理器
func NewUserHandler(svc service.UserService, log *logger.Logger) *UserHandler {
	return &UserHandler{svc: svc, log: log}
}

// Register 注册路由
func (h *UserHandler) Register(r *gin.Engine) {
	v1 := r.Group("/api/v1")
	users := v1.Group("/users")
	{
		users.POST("", h.CreateUser)
		users.GET("", h.ListUsers)
		users.GET("/:id", h.GetUser)
		users.PUT("/:id", h.UpdateUser)
		users.DELETE("/:id", h.DeleteUser)
	}
}

// CreateUser POST /api/v1/users
func (h *UserHandler) CreateUser(c *gin.Context) {
	var cmd domain.CreateUserCommand
	if err := c.ShouldBindJSON(&cmd); err != nil {
		middleware.Fail(c, apperrors.New(apperrors.CodeInvalidParam, err.Error()))
		return
	}

	user, err := h.svc.CreateUser(c.Request.Context(), cmd)
	if err != nil {
		middleware.Fail(c, err)
		return
	}

	c.JSON(http.StatusCreated, middleware.Response{
		Code:    0,
		Message: "success",
		Data:    user,
	})
}

// GetUser GET /api/v1/users/:id
func (h *UserHandler) GetUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		middleware.Fail(c, err)
		return
	}

	user, err := h.svc.GetUser(c.Request.Context(), id)
	if err != nil {
		middleware.Fail(c, err)
		return
	}
	middleware.Success(c, user)
}

// ListUsers GET /api/v1/users
func (h *UserHandler) ListUsers(c *gin.Context) {
	var q domain.UserQuery
	if err := c.ShouldBindQuery(&q); err != nil {
		middleware.Fail(c, apperrors.New(apperrors.CodeInvalidParam, err.Error()))
		return
	}

	list, err := h.svc.ListUsers(c.Request.Context(), q)
	if err != nil {
		middleware.Fail(c, err)
		return
	}
	middleware.Success(c, list)
}

// UpdateUser PUT /api/v1/users/:id
func (h *UserHandler) UpdateUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		middleware.Fail(c, err)
		return
	}

	var cmd domain.UpdateUserCommand
	if err := c.ShouldBindJSON(&cmd); err != nil {
		middleware.Fail(c, apperrors.New(apperrors.CodeInvalidParam, err.Error()))
		return
	}

	user, err := h.svc.UpdateUser(c.Request.Context(), id, cmd)
	if err != nil {
		middleware.Fail(c, err)
		return
	}
	middleware.Success(c, user)
}

// DeleteUser DELETE /api/v1/users/:id
func (h *UserHandler) DeleteUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		middleware.Fail(c, err)
		return
	}

	if err := h.svc.DeleteUser(c.Request.Context(), id); err != nil {
		middleware.Fail(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func parseID(c *gin.Context) (int64, error) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil || id <= 0 {
		return 0, apperrors.New(apperrors.CodeInvalidParam, "invalid id")
	}
	return id, nil
}
