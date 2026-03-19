# Security Standards

## 1. Authentication & Authorization

### Token Strategy

| Token | Expiry | Storage | Purpose |
|-------|--------|---------|---------|
| Access Token | 1 hour | Memory / Authorization header | API calls |
| Refresh Token | 7 days | HttpOnly cookie / secure storage | Renew access token |

**Rules:**
- Tokens are **stateless JWT** — no server-side session
- Secrets must be ≥256 bits; rotated every 90 days
- Never log tokens or embed them in URLs

### Role-Based Access Control

```java
// Method-level RBAC
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) { ... }

@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public PageResult<UserVO> listUsers(...) { ... }

// Check programmatically
if (!SecurityUtils.hasRole("ADMIN")) {
    throw BusinessException.forbidden("Admin role required");
}
```

---

## 2. Password Policy

| Rule | Value |
|------|-------|
| Minimum length | 8 characters |
| Complexity | At least 1 uppercase, 1 lowercase, 1 digit |
| Hashing algorithm | BCrypt (strength 12) |
| Maximum age | 90 days (enforced at application level) |
| History | Cannot reuse last 3 passwords |

---

## 3. Input Validation

**Never trust client input.** Apply defense-in-depth:

1. **Jakarta Validation** on DTOs (`@NotBlank`, `@Size`, `@Pattern`, `@Email`)
2. **SQL Injection** — prevented by MyBatis-Plus parameterized queries (never string concatenation in SQL)
3. **XSS** — escape HTML in any content rendered to browser; use `@JsonProperty` to sanitize
4. **Path Traversal** — validate file paths; never use user input directly in file system paths
5. **Mass Assignment** — use distinct DTO classes for input; never bind request directly to entity

---

## 4. Sensitive Data Handling

```java
// ❌ NEVER log sensitive data
log.info("User password: {}", password);
log.info("Token: {}", token);

// ❌ NEVER serialize password in VO
public class UserVO {
    // No password field here!
}

// ✅ Mask in logs
log.info("User [{}] authenticated", username);  // no password

// ✅ Exclude from serialization
@JsonIgnore
private String password;
```

**PII Fields** (never log or expose in API response):
- Password (any form)
- Full credit card numbers
- JWT tokens
- Private keys / secrets

---

## 5. HTTP Security Headers

Configure in `SecurityConfig` or Spring Security:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `Strict-Transport-Security` | `max-age=31536000` | Force HTTPS |
| `Cache-Control` | `no-store` (for auth endpoints) | No sensitive caching |

---

## 6. CORS Policy

Default in `WebMvcConfig`:
- Allowed origins: configured per environment (not `*` in production)
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- `allowCredentials: true` only when specific origins are configured

**Production rule**: never use `allowedOriginPatterns("*")` with `allowCredentials(true)`.

---

## 7. Rate Limiting

Apply rate limiting to sensitive endpoints:

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 10 req / min / IP |
| `POST /auth/register` | 5 req / min / IP |
| General API | 200 req / min / user |

Implementation: use Redis + `tryLock` or Spring's `@RateLimiter` (Resilience4j).

---

## 8. Dependency Security

- Run `mvn dependency-check:check` (OWASP) in CI pipeline
- No `SNAPSHOT` or unverified dependencies in production
- Update dependencies within 30 days of a critical CVE fix

---

## 9. Secret Management

| Environment | Secret Storage |
|-------------|---------------|
| Development | `application-dev.yml` (Git-ignored secrets) |
| Test/Staging | Environment variables in CI |
| Production | Kubernetes Secrets / Vault / AWS Parameter Store |

**Mandatory**: `jwt.secret`, `spring.datasource.password`, `spring.data.redis.password` must be environment variables in all non-local environments.
