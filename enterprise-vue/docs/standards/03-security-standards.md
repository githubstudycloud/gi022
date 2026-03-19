# 前端安全规范

> 版本：v1.0 | 日期：2026-03-18 | 参考：OWASP Top 10

---

## 1. 认证与 Token 管理

### 1.1 Token 存储策略

| 存储位置 | AccessToken | RefreshToken |
|---------|------------|-------------|
| localStorage | ✅（记住登录用） | ✅ |
| sessionStorage | ✅（不记住登录） | ❌ |
| Cookie (httpOnly) | 最安全（后端配合） | 最安全（后端配合） |
| JS 变量（内存） | ✅（最安全，刷新丢失） | ❌ |

**企业级推荐：** AccessToken 存内存，RefreshToken 存 httpOnly Cookie（后端实现）。

### 1.2 Token 刷新机制

```
请求 → 401 → 队列等待 → 刷新 Token → 重发队列中请求
                ↓
           刷新失败 → 清除 Token → 跳转登录
```

已在 `packages/api/src/interceptors.ts` 实现。

---

## 2. XSS 防御

```ts
// ✅ Vue 模板自动转义，安全
<div>{{ userInput }}</div>

// ⚠️  v-html 仅在受信任内容使用
// 若必须渲染用户 HTML，先净化
import DOMPurify from 'dompurify'
const safeHtml = DOMPurify.sanitize(userInput, { ALLOWED_TAGS: ['b', 'i', 'em'] })
<div v-html="safeHtml" />

// ✅ CSP 头（在 Nginx 配置）
// Content-Security-Policy: default-src 'self'; script-src 'self'
```

---

## 3. 敏感数据处理

```ts
// ✅ 展示前脱敏
import { maskPhone, maskEmail, maskIdCard } from '@enterprise/utils'

// ✅ 密码不得明文传输（HTTPS + PBKDF2/bcrypt 后端处理）
// ✅ 日志中不打印敏感字段
function handleLogin(data: LoginRequest) {
  // ❌ console.log('login:', data)  // 泄漏密码
  console.log('login attempt:', data.username)
}
```

---

## 4. 路由权限控制

```ts
// ✅ 路由 meta 声明权限
{
  path: '/users',
  meta: {
    requiresAuth: true,       // 需要登录
    permissions: ['user:list'], // 需要权限码
    roles: ['ADMIN'],          // 需要角色
  }
}

// ✅ 全局守卫校验（router/guards.ts）
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if (to.meta.permissions) {
    const hasAll = to.meta.permissions.every(p => permStore.hasPermission(p))
    if (!hasAll) return { name: 'Forbidden' }
  }
})
```

---

## 5. 依赖安全

```bash
# 定期检查漏洞
pnpm audit

# 自动修复
pnpm audit --fix

# 生产依赖最小化（不在 dependencies 放开发工具）
```

**CI 中强制扫描**：`.github/workflows/security.yml` 每周自动运行 `pnpm audit`。

---

## 6. 环境变量安全

```bash
# ✅ 非敏感配置才放 VITE_ 前缀（会打包进前端代码）
VITE_API_BASE_URL=https://api.example.com

# ❌ 绝对不能放在 VITE_ 变量中（暴露给用户）
# VITE_SECRET_KEY=xxx   # 危险！
# VITE_DB_PASSWORD=xxx  # 危险！

# ✅ 真正的密钥只在 CI/CD 环境变量中，不提交到 git
```

---

## 7. HTTPS 与 CSP（Nginx 生产配置）

```nginx
# 强制 HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-{NONCE}'; style-src 'self' 'unsafe-inline'";
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
}
```
