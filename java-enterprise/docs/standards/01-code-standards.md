# Code Standards

## 1. General Principles

- **Clarity over cleverness** — code is read 10× more than written
- **Single Responsibility** — one class/method does one thing
- **Fail fast** — validate inputs at boundaries; throw `BusinessException` immediately on rule violation
- **No magic numbers** — use `ResultCode` enum or named constants
- **No raw types** — always use generics (`List<User>` not `List`)

---

## 2. Naming Conventions

### Classes

| Type | Convention | Example |
|------|-----------|---------|
| Entity | `{Domain}` | `User`, `Order` |
| DTO (input) | `{Action}Request` | `LoginRequest`, `CreateOrderRequest` |
| VO (output) | `{Domain}VO` | `UserVO`, `OrderDetailVO` |
| Service interface | `{Domain}Service` | `UserService` |
| Implementation | `{Domain}ServiceImpl` | `UserServiceImpl` |
| Mapper | `{Domain}Mapper` | `UserMapper` |
| Controller | `{Domain}Controller` | `UserController`, `AuthController` |
| Converter | `{Domain}Convert` | `UserConvert` |
| Exception | descriptive + `Exception` | `BusinessException` |

### Methods

| Type | Convention | Example |
|------|-----------|---------|
| Query single | `getBy{Field}` | `getById`, `getByUsername` |
| Query list | `list{Domain}s` or `list{Domain}By{Field}` | `listUsers`, `listUsersByRole` |
| Query page | `page{Domain}s` | `pageUsers` |
| Create | `create` or `register` | `createUser`, `register` |
| Update | `update{Domain}` | `updateUser` |
| Delete | `delete{Domain}` | `deleteUser` |
| Status change | `{action}{Domain}` | `disableUser`, `enableUser` |
| Check exists | `exists{By}` | `existsByUsername` |

### Variables

- Use descriptive names: `userList` not `list`, `orderId` not `id`
- Boolean: `isActive`, `hasPermission`, `canEdit`
- Collections: plural noun: `users`, `orderIds`

---

## 3. Controller Layer Standards

```java
@Tag(name = "Users", description = "User management APIs")
@RestController
@RequestMapping("/api/v1/users")       // versioned path
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;  // inject via constructor (final field)

    @Operation(summary = "Get user by ID")
    @GetMapping("/{id}")
    public Result<UserVO> getById(@PathVariable Long id) {
        return Result.ok(userService.getById(id));
    }
}
```

**Rules:**
- Always return `Result<T>` — never return raw objects
- Always add `@Operation(summary = ...)` for OpenAPI docs
- Always use constructor injection (`@RequiredArgsConstructor`)
- API path format: `/api/v{version}/{resource}` (kebab-case plural noun)
- HTTP methods: GET=query, POST=create, PUT=full update, PATCH=partial, DELETE=delete

---

## 4. Service Layer Standards

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    @Override
    @Transactional
    public UserVO createUser(CreateUserRequest request) {
        // 1. Validate business rules
        if (userMapper.exists(...)) {
            throw BusinessException.of(ResultCode.USER_ALREADY_EXISTS);
        }
        // 2. Build entity
        User user = new User();
        user.setUsername(request.getUsername());
        // 3. Persist
        userMapper.insert(user);
        // 4. Log significant events
        log.info("User [{}] created by [{}]", user.getId(), SecurityUtils.getCurrentUserId());
        // 5. Return VO (never expose entity directly)
        return userConvert.toVO(user);
    }
}
```

**Rules:**
- `@Transactional` on write methods; read methods without (uses default read-only)
- Validate business rules first, before any writes
- Log all significant state changes at INFO level
- Never return entity objects — always convert to VO
- Catch only exceptions you can handle; let others bubble up

---

## 5. Exception Handling

```java
// DO: throw specific BusinessException
throw BusinessException.of(ResultCode.USER_NOT_FOUND);
throw BusinessException.notFound("User");
throw BusinessException.conflict("Username already taken");

// DON'T: throw generic RuntimeException
throw new RuntimeException("not found");   // ❌

// DON'T: catch and swallow
try { ... } catch (Exception e) { }        // ❌

// DO: log before rethrowing
try { ... } catch (Exception e) {
    log.error("Failed to ...: ", e);
    throw e;
}
```

---

## 6. Validation Standards

Use Jakarta Validation on all DTO classes:

```java
public class CreateUserRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username only allows letters, digits, underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Email(message = "Invalid email format")
    private String email;
}
```

**Rules:**
- Always include human-readable `message` in each annotation
- Use `@Valid` on `@RequestBody` parameters in controllers
- Never validate manually in service when `@Valid` covers it

---

## 7. Logging Standards

```java
// INFO: business events (login, create, delete)
log.info("User [{}] logged in from IP [{}]", userId, ip);

// WARN: recoverable issues, business rule violations
log.warn("Login attempt failed for user [{}]", username);

// ERROR: unexpected failures (always include exception)
log.error("Failed to send email to [{}]: ", email, ex);

// DEBUG: development aids (disabled in prod)
log.debug("Query result: {}", result);
```

**Rules:**
- Use parameterized logging `log.info("msg {}", var)` — never string concatenation
- Include `requestId` via MDC automatically (set by `RequestIdFilter`)
- Never log passwords, tokens, or PII data
- Log at ERROR only for truly unexpected exceptions

---

## 8. Code Formatting

- **Indentation**: 4 spaces (no tabs)
- **Line length**: max 120 characters
- **Blank lines**: 1 blank line between methods, 2 between class sections
- **Imports**: no wildcard imports (`import java.util.*` is forbidden)
- **Final fields**: always use `final` for injected dependencies
- **Lombok**: use `@Getter`, `@Setter`, `@Data`, `@RequiredArgsConstructor` — avoid `@Data` on entities (equals/hashCode issues)

---

## 9. Forbidden Patterns

```java
// ❌ Field injection
@Autowired
private UserService userService;

// ❌ Returning entity from controller
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) { ... }

// ❌ Catching and ignoring
catch (Exception e) { }

// ❌ Hardcoded secrets
String secret = "mySecret123";

// ❌ System.out.println
System.out.println("debug");

// ❌ Mutable static state
private static List<User> cache = new ArrayList<>();
```
