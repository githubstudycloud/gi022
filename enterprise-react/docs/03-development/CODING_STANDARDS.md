# 开发规范

## 1. 命名规范

### 文件命名
| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `UserProfile.tsx` |
| Hook 文件 | camelCase，以 `use` 开头 | `usePermission.ts` |
| 工具函数文件 | camelCase | `formatDate.ts` |
| 类型文件 | camelCase，`.types.ts` 后缀 | `user.types.ts` |
| 测试文件 | 与被测文件同名，`.test.ts(x)` 后缀 | `UserProfile.test.tsx` |
| Story 文件 | 与组件同名，`.stories.tsx` 后缀 | `UserProfile.stories.tsx` |
| 常量文件 | 全大写 SNAKE_CASE | `API_ENDPOINTS.ts` |

### 变量/函数命名
```typescript
// ✅ 布尔值用 is/has/can 前缀
const isLoading = true;
const hasPermission = false;
const canDelete = true;

// ✅ 事件处理函数用 handle 前缀
const handleSubmit = () => {};
const handleInputChange = () => {};

// ✅ 异步函数用动词命名
async function fetchUsers() {}
async function createUser() {}

// ✅ 常量用全大写
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = '/api';
```

---

## 2. React 组件规范

### 组件结构顺序
```typescript
// 1. Imports（按 import/order 规则自动排序）
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@enterprise/ui';
import type { User } from '@/types';

// 2. 类型定义（props interface）
interface MyComponentProps {
  user: User;
  onSave: (user: User) => void;
  className?: string;
}

// 3. 组件实现
export const MyComponent: React.FC<MyComponentProps> = ({
  user,
  onSave,
  className,
}) => {
  // 3a. Hooks（hooks 顺序固定：state → ref → custom hooks → effects）
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 3b. 事件处理函数
  const handleSave = async () => {
    setLoading(true);
    await onSave(user);
    setLoading(false);
  };

  // 3c. 渲染
  return (
    <div className={className}>
      <Button onClick={handleSave} loading={loading}>Save</Button>
    </div>
  );
};

// 4. displayName（仅 forwardRef 组件需要）
MyComponent.displayName = 'MyComponent';
```

### 组件设计原则
- **单一职责**：一个组件只做一件事
- **受控优先**：优先使用受控组件（value + onChange）
- **组合优于继承**：通过 props.children 和 render props 扩展
- **Props 精简**：超过 7 个 props 考虑拆分组件
- **类型安全**：所有 props 必须有 TypeScript 类型，禁用 `any`

---

## 3. TypeScript 规范

```typescript
// ✅ 使用 interface 定义对象类型
interface User {
  id: string;
  name: string;
  email: string;
}

// ✅ 使用 type 定义联合类型、工具类型
type Status = 'active' | 'inactive' | 'pending';
type UserWithoutId = Omit<User, 'id'>;

// ✅ 使用 const assertion
const ROLES = ['admin', 'editor', 'viewer'] as const;
type Role = typeof ROLES[number];

// ❌ 禁止
const data: any = fetchData();  // 使用 unknown 替代 any
function foo(x) { }             // 所有参数必须有类型
```

---

## 4. Git 工作流

### 分支策略（GitFlow 简化版）

```
main          ─────●─────────────────●──── (生产环境)
                   │                  ↑
develop       ─────●──●──●──●──●──●──●─── (集成测试)
                      ↑  ↑  ↑
feature/xxx   ─────●──●  │  │
fix/yyy       ──────────●──  │
hotfix/zzz    ────────────────●──────────
```

| 分支类型 | 命名规范 | 从哪创建 | 合并到 |
|----------|----------|----------|--------|
| 功能分支 | `feat/{scope}/{description}` | develop | develop |
| 修复分支 | `fix/{scope}/{description}` | develop | develop |
| 紧急修复 | `hotfix/{version}` | main | main + develop |
| 发布分支 | `release/{version}` | develop | main + develop |

### Commit 规范（Conventional Commits）

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**type 枚举**：
| type | 使用场景 |
|------|----------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 格式调整（不影响逻辑） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建系统 |
| `ci` | CI/CD 配置 |
| `chore` | 其他杂项 |

**示例**：
```bash
feat(ui): add Tooltip component with placement support

fix(web): handle 401 response by redirecting to login

docs(admin): update RBAC permission matrix
```

---

## 5. PR 规范

### PR 标题格式
与 Commit 规范相同：`<type>(<scope>): <description>`

### PR 描述模板
```markdown
## 变更内容
> 简述本次 PR 做了什么

## 关联 Issue / Ticket
Closes #123

## 变更类型
- [ ] 新功能 (feat)
- [ ] Bug 修复 (fix)
- [ ] 重构 (refactor)
- [ ] 文档 (docs)

## 测试
- [ ] 单元测试覆盖
- [ ] E2E 测试通过
- [ ] 手动测试截图（如有 UI 变更）

## 上线风险
> 是否需要数据迁移？是否影响现有用户？
```

### Code Review 标准
- **必须**：所有 PR 至少 1 个 Approve
- **必须**：CI 全部通过
- **必须**：没有 requested changes 未解决
- **推荐**：PR 大小 < 400 行变更（超过需拆分）

---

## 6. 目录结构规范

### 应用（apps/*）
```
src/
├── components/       # 业务组件（非通用）
│   └── {Name}/
│       ├── index.tsx       # 组件实现
│       └── {Name}.test.tsx # 组件测试
├── hooks/            # 自定义 Hooks
├── layouts/          # 布局组件
├── pages/            # 页面组件（与路由对应）
├── router/           # 路由配置
├── services/         # API 调用层
├── store/            # Zustand stores
├── styles/           # 全局样式
├── test-utils/       # 测试工具（setup.ts 等）
└── types/            # 全局类型定义
```

### 包（packages/*）
```
src/
├── components/       # React 组件
│   └── {Name}/
│       ├── index.tsx
│       ├── {Name}.stories.tsx
│       └── {Name}.test.tsx
├── lib/              # 工具函数
├── styles/           # 样式
└── index.ts          # 公开导出（barrel export）
```
