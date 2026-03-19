# 代码规范

> 版本：v1.0 | 日期：2026-03-18 | 强制执行：通过 ESLint + Prettier + Husky

---

## 1. 文件命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| Vue 组件 | PascalCase | `UserCard.vue`、`EButton.vue` |
| 页面视图 | PascalCase + View 后缀 | `HomeView.vue`、`UsersView.vue` |
| Composable | camelCase + use 前缀 | `useTable.ts`、`useModal.ts` |
| Store | camelCase | `auth.ts`、`user.ts` |
| 工具函数 | camelCase | `format.ts`、`validate.ts` |
| 类型定义 | camelCase | `api.ts`、`user.ts` |
| 常量文件 | camelCase | `constants.ts` |
| 测试文件 | 同源文件名 + `.spec` | `useTable.spec.ts` |

---

## 2. Vue 组件规范

### 2.1 文件结构顺序（强制）

```vue
<script setup lang="ts">
// 1. 类型导入（type imports 在前）
// 2. 库导入
// 3. 本地模块导入
// 4. defineOptions（如需）
// 5. defineProps / defineEmits / defineSlots
// 6. 响应式数据
// 7. 计算属性
// 8. 方法
// 9. 生命周期钩子
// 10. watch
</script>

<template>
  <!-- 模板内容 -->
</template>

<style scoped>
/* 样式 */
</style>
```

### 2.2 Props 定义

```ts
// ✅ 正确：接口定义 Props
interface Props {
  title: string
  count?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  disabled: false,
})

// ❌ 错误：对象式 Props
const props = defineProps({
  title: String,    // 缺失类型检查
  count: Number,
})
```

### 2.3 Emits 定义

```ts
// ✅ 正确
const emit = defineEmits<{
  change: [value: string]
  submit: [data: FormData]
  'update:modelValue': [value: string]  // v-model
}>()

// ❌ 错误
const emit = defineEmits(['change', 'submit'])
```

### 2.4 组件命名

```ts
// ✅ PascalCase 组件名
<UserCard />
<EButton variant="primary" />

// ❌ 不允许 kebab-case（除自定义元素）
<user-card />
```

---

## 3. TypeScript 规范

### 3.1 类型声明

```ts
// ✅ 用 interface 定义对象形状
interface User {
  id: number
  name: string
  email: string
}

// ✅ 用 type 定义联合/交叉类型、工具类型
type Status = 'active' | 'inactive' | 'locked'
type UserWithStatus = User & { status: Status }

// ❌ 禁止 any（除特殊情况需注释说明）
const data: any = {}  // 应该标注具体类型

// ✅ 使用 unknown 替代 any 处理未知类型
function parseJson(str: string): unknown {
  return JSON.parse(str)
}
```

### 3.2 类型导入

```ts
// ✅ 使用 type-only import
import type { User, Role } from '@enterprise/types'

// ❌ 混合导入
import { User, getUser } from '@enterprise/types'  // User 是类型
```

### 3.3 函数签名

```ts
// ✅ 参数和返回值都有类型
function formatDate(date: string | Date, format?: string): string {
  // ...
}

// ✅ 异步函数明确 Promise 类型
async function fetchUser(id: number): Promise<User> {
  // ...
}

// ❌ 缺少返回类型
function calcTotal(items) {  // 参数无类型
  return items.reduce(...)   // 返回类型依赖推断
}
```

---

## 4. CSS / 样式规范

### 4.1 作用域策略

```vue
<!-- ✅ 组件样式必须 scoped -->
<style scoped>
.component-name { }
</style>

<!-- ✅ 全局样式放在 styles/global.css 中 -->
<!-- ❌ 不在组件中写无 scoped 的全局样式 -->
```

### 4.2 CSS 变量使用

```css
/* ✅ 使用设计令牌（CSS 变量） */
.btn {
  background: var(--color-primary);
  border-radius: var(--radius-md);
  transition: background var(--transition-base);
}

/* ❌ 禁止硬编码颜色值 */
.btn {
  background: #3b82f6;  /* 应使用 var(--color-primary) */
}
```

### 4.3 类名命名

```css
/* ✅ BEM 命名 */
.user-card { }               /* Block */
.user-card__avatar { }       /* Element */
.user-card--highlighted { }  /* Modifier */

/* ✅ 组件库前缀 e- */
.e-button { }
.e-button--primary { }
```

---

## 5. 导入顺序规范

```ts
// 1. 类型导入（最先）
import type { User } from '@enterprise/types'

// 2. Vue 生态
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 3. 第三方库
import axios from 'axios'
import dayjs from 'dayjs'

// 4. 内部 packages（workspace）
import { userApi } from '@enterprise/api'
import { useTable } from '@enterprise/ui'

// 5. 本应用内部（相对路径）
import { formatDate } from '../utils/date'
import UserCard from './UserCard.vue'
```

---

## 6. 注释规范

```ts
/**
 * 创建 HTTP 客户端实例
 *
 * @param config - 客户端配置
 * @returns Axios 实例
 * @example
 * const client = createApiClient({ baseURL: 'http://api.example.com' })
 */
export function createApiClient(config: ApiClientConfig): AxiosInstance {
  // ...
}

// 单行注释：解释「为什么」，而非「是什么」
// Token 过期时先加入队列，等刷新完成后统一重发
if (isRefreshing) {
  return new Promise(...)
}
```

---

## 7. 禁止事项

| 禁止 | 原因 | 替代方案 |
|------|------|---------|
| `console.log` | 生产泄漏 | `console.warn`/`error` 或 Sentry |
| `debugger` | 生产风险 | 本地调试完后删除 |
| `v-html` + 用户输入 | XSS 风险 | 先 DOMPurify 净化 |
| `!important` | 样式难维护 | 提高选择器权重 |
| 魔法数字 | 可读性差 | 定义常量 `const MAX_RETRY = 3` |
| `any` 类型 | 丧失类型安全 | 用 `unknown` + 类型守卫 |
| 直接 `localStorage` | 跨包不一致 | 使用 `@enterprise/utils` 的 `tokenStorage` |
