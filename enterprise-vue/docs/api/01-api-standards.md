# API 设计规范

> 版本：v1.0 | 日期：2026-03-18 | 遵循：RESTful + OpenAPI 3.1

---

## 1. URL 设计规范

```
# 格式
/{version}/{resource}/{identifier}/{sub-resource}

# 规则
- 全小写，单词用 - 连接（kebab-case）
- 资源名用复数名词
- 不在 URL 中使用动词（用 HTTP Method 表达动作）
- 版本号在 URL 中（/api/v1/）

# 示例
✅ GET    /api/v1/users              # 获取用户列表
✅ GET    /api/v1/users/123          # 获取单个用户
✅ POST   /api/v1/users              # 创建用户
✅ PUT    /api/v1/users/123          # 全量更新
✅ PATCH  /api/v1/users/123          # 部分更新
✅ DELETE /api/v1/users/123          # 删除用户

✅ GET    /api/v1/users/123/roles    # 用户的角色列表
✅ POST   /api/v1/auth/login         # 认证动作（特殊情况用动词）

❌ GET    /api/v1/getUser            # 动词
❌ GET    /api/v1/user               # 单数
❌ GET    /api/v1/Users              # 大写
```

---

## 2. 统一响应格式

```json
// 成功响应
{
  "code": 0,
  "message": "success",
  "data": { },
  "timestamp": 1710748800000,
  "traceId": "abc123"
}

// 分页响应
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}

// 错误响应
{
  "code": 422,
  "message": "参数校验失败",
  "data": null,
  "details": {
    "email": ["邮箱格式不正确"],
    "password": ["密码至少8位", "密码需包含大写字母"]
  },
  "traceId": "abc123"
}
```

---

## 3. 业务状态码

| code | 含义 | HTTP Status |
|------|------|------------|
| 0 | 成功 | 200/201 |
| -1 | 通用失败 | 400 |
| 401 | 未认证 | 401 |
| 403 | 无权限 | 403 |
| 404 | 资源不存在 | 404 |
| 422 | 参数校验失败 | 422 |
| 429 | 请求频率超限 | 429 |
| 1001 | Token 已过期 | 401 |
| 1002 | Token 非法 | 401 |
| 5000 | 服务器内部错误 | 500 |

---

## 4. 分页参数规范

```
请求参数（Query String）：
  page      - 页码，从 1 开始，默认 1
  pageSize  - 每页条数，默认 20，最大 500
  sortField - 排序字段名
  sortOrder - asc | desc

示例：
GET /api/v1/users?page=2&pageSize=20&sortField=createdAt&sortOrder=desc&keyword=john
```

---

## 5. 请求头规范

```
Authorization: Bearer {access_token}   # 认证
Content-Type: application/json          # 请求体类型
Accept: application/json               # 期望响应类型
X-Request-Id: {uuid}                   # 请求唯一标识（链路追踪）
Accept-Language: zh-CN                 # 响应语言
```

---

## 6. 前端 API 模块结构

```ts
// packages/api/src/modules/{resource}.ts

export const {resource}Api = {
  // 列表（分页）
  getList: (params: QueryParams) =>
    client.get<PageResponse<Resource>>('/resources', { params }),

  // 详情
  getById: (id: number | string) =>
    client.get<Resource>(`/resources/${id}`),

  // 创建
  create: (data: CreateResourceDto) =>
    client.post<Resource>('/resources', data),

  // 全量更新
  update: (id: number | string, data: UpdateResourceDto) =>
    client.put<Resource>(`/resources/${id}`, data),

  // 部分更新
  patch: (id: number | string, data: Partial<UpdateResourceDto>) =>
    client.patch<Resource>(`/resources/${id}`, data),

  // 删除
  delete: (id: number | string) =>
    client.delete(`/resources/${id}`),
}
```

---

## 7. Mock 规范

开发阶段使用 `vite-plugin-mock` 模拟接口：

```ts
// src/mocks/users.ts
import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/v1/users',
    method: 'get',
    response: ({ query }) => {
      const { page = 1, pageSize = 20 } = query
      return {
        code: 0,
        message: 'success',
        data: {
          list: Array.from({ length: Number(pageSize) }, (_, i) => ({
            id: (Number(page) - 1) * Number(pageSize) + i + 1,
            username: `user_${i}`,
            email: `user${i}@example.com`,
            status: 'active',
          })),
          total: 100,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(100 / Number(pageSize)),
        },
        timestamp: Date.now(),
      }
    },
  },
] as MockMethod[]
```
