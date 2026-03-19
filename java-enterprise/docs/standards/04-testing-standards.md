# Testing Standards

## 1. Testing Pyramid

```
        ┌──────────┐
        │   E2E    │  < 10%  Playwright / RestAssured
        ├──────────┤
        │  Integration │ ~20%  @SpringBootTest + TestContainers
        ├──────────────┤
        │  Unit Tests  │ ~70%  JUnit5 + Mockito
        └──────────────┘
```

**Coverage Requirement**: ≥70% line coverage (enforced by JaCoCo in CI).

---

## 2. Unit Tests

### Naming Convention

```
{ClassUnderTest}Test.java
Method: {method}_{scenario}_{expectedResult}

Example:
UserServiceTest
  register_success()
  register_conflictUsername_throwsBusinessException()
  getById_userNotFound_throwsBusinessException()
```

### Structure: AAA Pattern

```java
@Test
@DisplayName("register - success when username is unique")
void register_success() {
    // Arrange
    RegisterRequest request = buildRequest("newuser");
    when(userMapper.exists(any())).thenReturn(false);
    when(passwordEncoder.encode(any())).thenReturn("hashed");
    when(userConvert.toVO(any())).thenReturn(expectedVO);

    // Act
    UserVO result = userService.register(request);

    // Assert
    assertThat(result.getUsername()).isEqualTo("newuser");
    verify(userMapper).insert(any(User.class));
}
```

### Tools

```java
@ExtendWith(MockitoExtension.class)   // Unit test - no Spring context
class UserServiceTest {

    @Mock  UserMapper userMapper;
    @Mock  PasswordEncoder passwordEncoder;
    @InjectMocks  UserServiceImpl userService;
}
```

**Rules:**
- Use `@ExtendWith(MockitoExtension.class)` — NOT `@SpringBootTest` for unit tests
- Use AssertJ (`assertThat`) — not JUnit `assertEquals`
- Each test should assert exactly one behavior
- Test edge cases: null inputs, empty collections, boundary values
- Test exception scenarios with `assertThatThrownBy`

---

## 3. Controller Tests

Use `@WebMvcTest` for slice tests — loads only the web layer:

```java
@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  UserService userService;       // mock the service

    @Test
    void getById_returnsUser() throws Exception {
        when(userService.getById(1L)).thenReturn(userVO);

        mockMvc.perform(get("/api/v1/users/1")
                .header("Authorization", "Bearer " + validToken))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.code").value(200))
               .andExpect(jsonPath("$.data.username").value("admin"));
    }
}
```

---

## 4. Integration Tests

Use `@SpringBootTest` + TestContainers for real database tests:

```java
@SpringBootTest
@Testcontainers
@ActiveProfiles("test")
class UserRepositoryIT {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("test_db")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired UserMapper userMapper;

    @Test
    @Transactional
    void insert_andQuery_success() {
        User user = buildUser("testuser");
        userMapper.insert(user);
        User found = userMapper.selectById(user.getId());
        assertThat(found).isNotNull();
        assertThat(found.getUsername()).isEqualTo("testuser");
    }
}
```

**Rules:**
- Integration test class suffix: `IT` (e.g., `UserRepositoryIT`)
- Always `@Transactional` to rollback after each test
- Use `application-test.yml` for test-specific config
- TestContainers handles DB lifecycle — no local DB required

---

## 5. Test Data Builders

Create static factory methods or builder classes for test data:

```java
// In test utility class
public static User buildUser(String username) {
    User user = new User();
    user.setId(IdWorker.getId());
    user.setUsername(username);
    user.setPassword("$2a$12$hashed");
    user.setNickname("Test " + username);
    user.setStatus(0);
    user.setRoles("USER");
    return user;
}

public static RegisterRequest buildRegisterRequest() {
    RegisterRequest req = new RegisterRequest();
    req.setUsername("testuser");
    req.setPassword("P@ssw0rd123");
    req.setNickname("Test User");
    req.setEmail("test@example.com");
    return req;
}
```

---

## 6. Test Configuration

`src/test/resources/application-test.yml`:

```yaml
spring:
  flyway:
    enabled: true
  jpa:
    show-sql: true
mybatis-plus:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
jwt:
  secret: test-secret-key-must-be-at-least-256-bits-long-for-testing
  access-token-expiry: 3600
logging:
  level:
    com.enterprise: DEBUG
```

---

## 7. What to Test

| Layer | Focus |
|-------|-------|
| Controller | Input validation, HTTP status codes, response structure |
| Service | Business rules, edge cases, exception scenarios, state transitions |
| Mapper | Actual SQL queries (integration), pagination, soft-delete |
| Security | Auth required, role enforcement, token validation |

---

## 8. CI Coverage Gate

JaCoCo is configured in parent `pom.xml` with a 70% line coverage minimum.
Build will **fail** if coverage drops below threshold.

Run locally:
```bash
mvn verify -P coverage
# Report at: target/site/jacoco/index.html
```
