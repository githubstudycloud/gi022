# Module Design Guide

## 1. common-core

**Purpose**: Zero-dependency foundational layer. All other modules depend on this.

### Key Classes

| Class | Description |
|-------|-------------|
| `Result<T>` | Universal API response: `{ code, message, data, timestamp }` |
| `PageResult<T>` | Paginated response with metadata |
| `ResultCode` | Enum of all HTTP + business error codes |
| `BusinessException` | Expected business error (caught by GlobalExceptionHandler) |
| `BaseEntity` | Base entity with id, createTime, updateTime, createBy, updateBy, deleted |
| `SecurityUtils` | Static helpers to read current user from SecurityContext |

### Design Rules

- **No Spring Web dependency** — usable in any context (batch, async, etc.)
- `BusinessException` is always caught and mapped to `Result.fail()`
- `ResultCode` codes follow convention: HTTP codes (2xx/4xx/5xx) for transport layer, `4xxxx/5xxxx` for business layer

---

## 2. common-web

**Purpose**: Web layer infrastructure shared across all REST services.

### Components

| Component | Responsibility |
|-----------|----------------|
| `GlobalExceptionHandler` | `@RestControllerAdvice` — maps all exceptions to `Result` |
| `RequestIdFilter` | Injects `X-Request-Id` into MDC for log correlation |
| `WebMvcConfig` | CORS configuration |

### Exception Mapping

| Exception Type | HTTP Status | Result Code |
|---------------|-------------|-------------|
| `BusinessException` | (from code) | business code |
| `MethodArgumentNotValidException` | 422 | 42201 |
| `ConstraintViolationException` | 422 | 42201 |
| `MethodArgumentTypeMismatchException` | 400 | 400 |
| `Exception` (fallback) | 500 | 500 |

---

## 3. common-security

**Purpose**: Reusable Spring Security + JWT configuration.

### JWT Flow

```
Login → JwtTokenProvider.generateAccessToken()
                ↓
Client sends: Authorization: Bearer <token>
                ↓
JwtAuthenticationFilter.doFilterInternal()
  → parseToken() → getUserId() / getRoles()
  → UsernamePasswordAuthenticationToken → SecurityContext
```

### Configuration Required in Each Service

```yaml
jwt:
  secret: ${JWT_SECRET}          # ≥32 chars, externalized
  access-token-expiry: 3600      # seconds
  refresh-token-expiry: 604800   # seconds
```

### Extending Security Rules

Override `SecurityFilterChain` bean in your service to customize:

```java
@Bean
public SecurityFilterChain customChain(HttpSecurity http) throws Exception {
    // call super configuration + add service-specific rules
}
```

---

## 4. common-redis

**Purpose**: Centralized Redis configuration and utility service.

### RedisService API

```java
// String
redisService.set(key, value, Duration.ofMinutes(30));
Optional<T> val = redisService.get(key);

// Distributed Lock
boolean locked = redisService.tryLock("lock:order:123", uuid, Duration.ofSeconds(10));
redisService.releaseLock("lock:order:123", uuid);
```

### Required Configuration

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: 6379
      password: ${REDIS_PASSWORD:}
```

---

## 5. common-mybatis

**Purpose**: MyBatis-Plus setup with enterprise conventions.

### Plugins Enabled

| Plugin | Purpose |
|--------|---------|
| `PaginationInnerInterceptor` | Automatic pagination (MySQL dialect) |
| `OptimisticLockerInnerInterceptor` | `@Version` field support |
| `BlockAttackInnerInterceptor` | Block full-table UPDATE/DELETE (production safety) |

### Auto-Fill Fields

`MetaObjectHandlerConfig` automatically fills on every INSERT/UPDATE:

| Field | INSERT | UPDATE |
|-------|--------|--------|
| `createTime` | `LocalDateTime.now()` | — |
| `updateTime` | `LocalDateTime.now()` | `LocalDateTime.now()` |
| `createBy` | current user ID | — |
| `updateBy` | current user ID | current user ID |
| `deleted` | `0` | — |

### Soft Delete

All entities extending `BaseEntity` support soft delete automatically:
- `@TableLogic` on `deleted` field
- `selectById`, `selectList` automatically filter `deleted = 0`
- `deleteById` sets `deleted = 1` instead of physical DELETE

---

## 6. apps/user-service

Reference service demonstrating all patterns.

### Layers

```
controller/   HTTP handling, validation, response formatting
service/      Business logic, transaction coordination
mapper/       Data access via MyBatis-Plus
domain/
  entity/     DB models (extends BaseEntity)
  dto/        Input (validated)
  vo/         Output (sanitized, no passwords)
convert/      MapStruct: entity ↔ VO (compile-time, zero reflection)
```

### Adding New Endpoints

1. Define DTO in `domain/dto/` with `@Valid` constraints
2. Define VO in `domain/vo/`
3. Add method to `UserService` interface
4. Implement in `UserServiceImpl` with `@Transactional` where needed
5. Add `@Operation`-annotated method to controller
6. Write unit test in `UserServiceTest`
