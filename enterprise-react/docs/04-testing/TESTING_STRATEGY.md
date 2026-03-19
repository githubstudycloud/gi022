# 测试策略

## 1. 测试金字塔

```
         ┌─────────────┐
         │   E2E 测试   │  少量，覆盖核心业务流程
         │  Playwright  │  ~10 个关键场景
         └──────┬───────┘
         ┌──────▼───────┐
         │  集成/组件测试  │  中量，覆盖组件交互
         │Testing Library│  ~100 个组件测试
         └──────┬────────┘
    ┌──────────▼──────────────┐
    │         单元测试          │  大量，覆盖纯函数逻辑
    │          Vitest          │  ~500 个单元测试
    └─────────────────────────┘
```

## 2. 覆盖率要求

| 项目 | 行覆盖率 | 函数覆盖率 | 分支覆盖率 |
|------|----------|------------|------------|
| `packages/utils` | ≥ 90% | ≥ 90% | ≥ 80% |
| `packages/ui` | ≥ 85% | ≥ 85% | ≥ 75% |
| `apps/web` | ≥ 80% | ≥ 80% | ≥ 70% |
| `apps/admin` | ≥ 80% | ≥ 80% | ≥ 70% |

## 3. 单元测试规范（Vitest）

### 文件组织
```
src/
└── __tests__/         # 工具函数测试放在 __tests__ 目录
    └── date.test.ts
└── components/
    └── Button/
        └── Button.test.tsx  # 组件测试与组件并排
```

### 测试结构模板
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ComponentName / functionName', () => {
  // Setup
  beforeEach(() => { /* 每个 test 前执行 */ });
  afterEach(() => { vi.clearAllMocks(); });

  describe('正常场景', () => {
    it('should [预期行为] when [条件]', () => {
      // Arrange — 准备数据
      const input = 'test';

      // Act — 执行操作
      const result = someFunction(input);

      // Assert — 断言结果
      expect(result).toBe('expected');
    });
  });

  describe('异常场景', () => {
    it('should handle [异常] gracefully', () => {
      expect(() => someFunction(null)).toThrow('expected error');
    });
  });
});
```

### Mock 规范
```typescript
// ✅ Mock 模块
vi.mock('@enterprise/utils', () => ({
  formatDate: vi.fn().mockReturnValue('2024-01-01'),
}));

// ✅ Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: 'test' }),
});

// ✅ Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## 4. 组件测试规范（Testing Library）

### 查询优先级（按可维护性排序）
```
最优 → getByRole → getByLabelText → getByPlaceholderText
     → getByText → getByDisplayValue → getByAltText
     → getByTitle → getByTestId ← 最差（避免使用）
```

### 用户交互测试
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ✅ 使用 userEvent 替代 fireEvent（更接近真实用户行为）
it('submits form on button click', async () => {
  const user = userEvent.setup();
  const onSubmit = vi.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Email'), 'test@example.com');
  await user.type(screen.getByLabelText('Password'), 'password123');
  await user.click(screen.getByRole('button', { name: '登录' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  });
});
```

### 异步测试
```typescript
// ✅ 使用 findBy* 等待异步渲染
it('shows user list after loading', async () => {
  render(<UserList />);
  expect(screen.getByRole('status')).toBeInTheDocument(); // Loading spinner
  const items = await screen.findAllByRole('row');
  expect(items).toHaveLength(4); // header + 3 data rows
});
```

## 5. E2E 测试规范（Playwright）

### 测试分层
- **Smoke Tests**：核心功能冒烟测试，每次部署必须通过
- **Regression Tests**：回归测试，每天夜间执行
- **Performance Tests**：Core Web Vitals 监控（独立运行）

### 最佳实践
```typescript
import { test, expect, type Page } from '@playwright/test';

// ✅ 使用 Page Object 模式封装页面操作
class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('邮箱').fill(email);
    await this.page.getByLabel('密码').fill(password);
    await this.page.getByRole('button', { name: '登录' }).click();
  }
}

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('admin@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

## 6. 运行命令

```bash
# 单元测试（watch 模式）
pnpm nx run utils:test:watch
pnpm nx run ui:test:watch

# 全量测试
pnpm test

# 测试覆盖率报告
pnpm nx run-many --target=test:coverage --all

# E2E 测试（需先启动应用）
pnpm nx run web:test:e2e

# E2E UI 调试模式
pnpm exec playwright test --ui
```

## 7. CI 测试门禁

所有 PR 合并前必须通过：
- [ ] 所有单元测试通过
- [ ] 覆盖率不低于阈值
- [ ] TypeScript 类型检查通过
- [ ] ESLint 无错误
- [ ] Smoke E2E 通过（合并到 main/develop 时）
