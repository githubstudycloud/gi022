# 测试规范

> 版本：v1.0 | 日期：2026-03-18

---

## 1. 测试分层策略

```
E2E 测试（Playwright）        ← 用户视角，覆盖关键业务流程
      ▲  少而精（~10%）
      │
集成测试（Vitest + Vue Test Utils）  ← 组件交互、Store 联动
      ▲  适量（~20%）
      │
单元测试（Vitest）            ← 工具函数、Composables、Store 逻辑
      ▲  多而快（~70%）
```

**覆盖率目标：**
- 整体：≥ 70%
- `packages/utils`：≥ 90%
- `packages/stores`：≥ 80%

---

## 2. 单元测试规范

### 2.1 文件位置

```
src/
├── utils/
│   ├── format.ts
│   └── __tests__/
│       └── format.spec.ts    ← 单元测试与源码同级
```

### 2.2 测试结构（AAA 模式）

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatDate, maskPhone } from '../format'

describe('formatDate', () => {
  it('formats date with default format', () => {
    // Arrange
    const input = '2026-03-18T10:00:00Z'

    // Act
    const result = formatDate(input)

    // Assert
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/)
  })

  it('formats date with custom format', () => {
    const result = formatDate('2026-03-18', 'MM/DD/YYYY')
    expect(result).toBe('03/18/2026')
  })
})

describe('maskPhone', () => {
  it.each([
    ['13800138000', '138****8000'],
    ['19912345678', '199****5678'],
  ])('masks %s to %s', (input, expected) => {
    expect(maskPhone(input)).toBe(expected)
  })
})
```

### 2.3 Mock 规范

```ts
// ✅ Mock 外部依赖（API、Router、Store）
vi.mock('@enterprise/api', () => ({
  userApi: {
    getUsers: vi.fn().mockResolvedValue({
      data: { data: { list: [], total: 0 } },
    }),
  },
}))

// ✅ 测试后还原
afterEach(() => {
  vi.restoreAllMocks()
})
```

---

## 3. 组件测试规范

```ts
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import UserCard from '../UserCard.vue'

describe('UserCard', () => {
  function createWrapper(props = {}) {
    return mount(UserCard, {
      props: { user: { id: 1, name: 'Test', email: 'test@test.com' }, ...props },
      global: {
        plugins: [createTestingPinia()],
      },
    })
  }

  it('renders user name', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Test')
  })

  it('emits delete event when delete button clicked', async () => {
    const wrapper = createWrapper()
    await wrapper.find('[data-testid="delete-btn"]').trigger('click')
    expect(wrapper.emitted('delete')).toHaveLength(1)
    expect(wrapper.emitted('delete')?.[0]).toEqual([1])
  })
})
```

**关键原则：** 给交互元素加 `data-testid` 属性，不依赖 CSS 类名选择。

---

## 4. E2E 测试规范

```ts
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('登录流程', () => {
  test('正确用户名密码登录成功，跳转首页', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('Admin123!')
    await page.getByRole('button', { name: '登 录' }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText('欢迎回来')).toBeVisible()
  })

  test('密码错误显示错误提示', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('用户名').fill('admin')
    await page.getByLabel('密码').fill('wrongpassword')
    await page.getByRole('button', { name: '登 录' }).click()

    await expect(page.getByRole('alert')).toContainText('登录失败')
  })
})
```

---

## 5. 运行命令

```bash
# 单元测试
pnpm test:unit

# 单元测试 + 覆盖率
pnpm test:unit --coverage

# E2E 测试（需先 build）
pnpm build && pnpm test:e2e

# 监听模式（开发时）
pnpm test:unit --watch

# 特定文件
pnpm test:unit packages/utils/src/__tests__/format.spec.ts
```
