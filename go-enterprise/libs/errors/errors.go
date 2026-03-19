// Package errors 提供统一的错误码体系和错误处理工具。
//
// 错误码规则：
//   - 0        成功
//   - 1xxx     通用错误
//   - 2xxx     业务错误（用户、订单等各模块自定义）
//   - 5xxx     系统内部错误
package errors

import (
	"fmt"
	"net/http"
)

// Code 业务错误码
type Code int

const (
	// 通用
	CodeOK            Code = 0
	CodeInvalidParam  Code = 1001
	CodeUnauthorized  Code = 1002
	CodeForbidden     Code = 1003
	CodeNotFound      Code = 1004
	CodeConflict      Code = 1005
	CodeTooManyReqs   Code = 1006
	CodeTimeout       Code = 1007

	// 系统
	CodeInternal      Code = 5000
	CodeDBError       Code = 5001
	CodeCacheError    Code = 5002
	CodeMQError       Code = 5003
	CodeRPCError      Code = 5004
)

// AppError 统一业务错误
type AppError struct {
	Code    Code   `json:"code"`
	Message string `json:"message"`
	Detail  string `json:"detail,omitempty"`
	cause   error
}

func (e *AppError) Error() string {
	if e.cause != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.cause)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error { return e.cause }

// HTTPStatus 将业务错误码映射到 HTTP 状态码
func (e *AppError) HTTPStatus() int {
	switch e.Code {
	case CodeOK:
		return http.StatusOK
	case CodeInvalidParam:
		return http.StatusBadRequest
	case CodeUnauthorized:
		return http.StatusUnauthorized
	case CodeForbidden:
		return http.StatusForbidden
	case CodeNotFound:
		return http.StatusNotFound
	case CodeConflict:
		return http.StatusConflict
	case CodeTooManyReqs:
		return http.StatusTooManyRequests
	case CodeTimeout:
		return http.StatusGatewayTimeout
	default:
		return http.StatusInternalServerError
	}
}

// New 创建新的 AppError
func New(code Code, message string) *AppError {
	return &AppError{Code: code, Message: message}
}

// Wrap 包装原始错误
func Wrap(code Code, message string, cause error) *AppError {
	return &AppError{Code: code, Message: message, cause: cause}
}

// WithDetail 附加详情
func (e *AppError) WithDetail(detail string) *AppError {
	e.Detail = detail
	return e
}

// Is 支持 errors.Is 比较
func (e *AppError) Is(target error) bool {
	t, ok := target.(*AppError)
	if !ok {
		return false
	}
	return e.Code == t.Code
}

// AsAppError 从 error 转换为 AppError
func AsAppError(err error) (*AppError, bool) {
	if err == nil {
		return nil, false
	}
	var ae *AppError
	if ok := isType(err, &ae); ok {
		return ae, true
	}
	return &AppError{Code: CodeInternal, Message: err.Error()}, true
}

func isType(err error, target interface{}) bool {
	switch t := target.(type) {
	case **AppError:
		if ae, ok := err.(*AppError); ok {
			*t = ae
			return true
		}
	}
	return false
}

// 预定义常用错误
var (
	ErrInvalidParam = New(CodeInvalidParam, "invalid parameter")
	ErrUnauthorized = New(CodeUnauthorized, "unauthorized")
	ErrForbidden    = New(CodeForbidden, "forbidden")
	ErrNotFound     = New(CodeNotFound, "resource not found")
	ErrInternal     = New(CodeInternal, "internal server error")
)
