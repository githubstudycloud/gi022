# Architecture Overview

## 1. Project Introduction

`java-enterprise` is an enterprise-grade Java multi-module framework built on **Spring Boot 3** and **Maven multi-module**. It provides a standardized project skeleton, shared common libraries, and a complete software engineering lifecycle documentation system.

---

## 2. Design Goals

| Goal | Description |
|------|-------------|
| **Modular** | All shared capabilities are extracted into reusable `common-*` modules |
| **Layered** | Strict 4-layer architecture: Controller → Service → Repository → Domain |
| **Secure** | Spring Security 6 + JWT stateless authentication out of the box |
| **Observable** | Structured logging with request tracing via MDC |
| **Testable** | Unit tests (Mockito) + Integration tests (TestContainers) by default |
| **Evolvable** | Database schema versioned with Flyway migrations |

---

## 3. Module Structure

```
java-enterprise/
├── bom/                        # Bill of Materials – unified dependency versions
├── common/                     # Shared library modules
│   ├── common-core/            # Result wrappers, exceptions, base entities, utils
│   ├── common-web/             # GlobalExceptionHandler, CORS, RequestId filter
│   ├── common-security/        # Spring Security config, JWT provider & filter
│   ├── common-redis/           # RedisTemplate config, RedisService, distributed lock
│   └── common-mybatis/         # MyBatis-Plus config, auto-fill, pagination plugin
└── apps/                       # Deployable services
    └── user-service/           # Reference implementation (users + auth)
```

### Dependency Graph

```
apps/user-service
    ├── common-web
    │     └── common-core
    ├── common-security
    │     └── common-core
    ├── common-redis
    │     └── common-core
    └── common-mybatis
          └── common-core
```

---

## 4. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java | 21 (LTS) |
| Framework | Spring Boot | 3.3.x |
| Build | Maven | 3.9+ |
| ORM | MyBatis-Plus | 3.5.x |
| Database | MySQL | 8.0+ |
| Migration | Flyway | 10.x |
| Cache | Spring Data Redis | 3.x |
| Security | Spring Security | 6.x |
| JWT | jjwt | 0.12.x |
| API Docs | springdoc-openapi | 2.x |
| Mapping | MapStruct | 1.6.x |
| Test | JUnit 5 + Mockito | - |
| Test (IT) | TestContainers | 1.20.x |

---

## 5. Request Lifecycle

```
Client
  │
  ▼
RequestIdFilter        → inject X-Request-Id into MDC
  │
  ▼
JwtAuthenticationFilter → parse Bearer token, set SecurityContext
  │
  ▼
SecurityFilterChain     → authorize request (public/authenticated/role)
  │
  ▼
Controller              → validate input (@Valid), call service
  │
  ▼
Service                 → business logic, transaction boundary
  │
  ▼
Mapper (MyBatis-Plus)   → SQL execution, auto-fill audit fields
  │
  ▼
MySQL / Redis
```

---

## 6. Package Conventions

Each service follows the package structure:

```
com.enterprise.{service-name}
├── controller/     REST controllers
├── service/        Service interfaces
│   └── impl/       Service implementations
├── mapper/         MyBatis-Plus mappers
├── domain/
│   ├── entity/     DB-mapped entities (extend BaseEntity)
│   ├── dto/        Input objects (validated with @Valid)
│   └── vo/         Output view objects
└── convert/        MapStruct converters (entity ↔ VO)
```

---

## 7. Security Model

- **Authentication**: Stateless JWT (no session). Access token (1h) + Refresh token (7d).
- **Authorization**: Role-based via `@PreAuthorize("hasRole('ADMIN')")` or `SecurityFilterChain`.
- **Password**: BCrypt with strength 12.
- **Soft delete**: All entities use logical delete (`deleted` flag), never physically removed.

---

## 8. Adding a New Service

1. Create directory under `apps/`
2. Add `pom.xml` inheriting from `apps` parent
3. Add module entry in `apps/pom.xml`
4. Copy package structure from `user-service`
5. Add service-specific `application-{env}.yml`
6. Create Flyway migration scripts in `db/migration/`

Or use the scaffold script:
```bash
make new-service NAME=order-service
```
