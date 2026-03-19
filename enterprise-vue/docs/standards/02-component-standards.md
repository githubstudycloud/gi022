# 组件设计规范

> 版本：v1.0 | 日期：2026-03-18

---

## 1. 组件分层

```
packages/ui/src/components/    ← 原子/分子级通用组件（EButton、EInput等）
apps/*/src/components/         ← 应用级业务组件（UserCard、OrderTable等）
apps/*/src/views/              ← 页面级组件（仅负责布局和数据编排）
apps/*/src/layouts/            ← 布局组件（DefaultLayout、BlankLayout等）
```

**原则：** 越靠近底层的组件越通用，越靠近顶层越业务化。通用组件不依赖业务 API。

---

## 2. 组件设计原则

### 2.1 单一职责
每个组件只做一件事。若超过 300 行，考虑拆分。

### 2.2 Props 设计
```ts
// ✅ Props 默认值合理，不强制要求不必要的字段
interface Props {
  title: string        // 必填（无默认值）
  size?: 'sm' | 'md' | 'lg'  // 可选，有约束
  loading?: boolean    // 可选，默认 false
}

// ✅ 用 withDefaults 声明默认值
const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  loading: false,
})
```

### 2.3 事件设计
```ts
// ✅ 事件名语义化，参数类型明确
const emit = defineEmits<{
  submit: [data: FormData]        // 提交
  cancel: []                      // 取消（无参数）
  'update:modelValue': [v: string] // 双向绑定
}>()
```

### 2.4 Slot 设计
```vue
<template>
  <div class="card">
    <!-- 命名 slot 语义明确 -->
    <header v-if="$slots.header" class="card__header">
      <slot name="header" />
    </header>

    <main class="card__body">
      <slot />  <!-- default slot -->
    </main>

    <footer v-if="$slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </div>
</template>
```

---

## 3. Composable 设计规范

```ts
// ✅ 标准 Composable 结构
export function useXxx(options: XxxOptions = {}) {
  // 1. 响应式状态
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 2. 计算属性
  const isEmpty = computed(() => !data.value)

  // 3. 方法
  async function fetch() {
    loading.value = true
    error.value = null
    try {
      data.value = await options.fetchFn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // 4. 副作用（明确清理）
  const stop = watchEffect(() => {
    if (options.immediate) fetch()
  })

  onUnmounted(stop)

  // 5. 返回值（仅暴露需要的）
  return { data, loading, error, isEmpty, fetch }
}
```

---

## 4. 性能优化检查清单

- [ ] 长列表使用虚拟滚动（`vue-virtual-scroller`）
- [ ] 频繁变化的组件用 `v-memo` 缓存
- [ ] 路由组件按需导入 `() => import(...)`
- [ ] 图片组件添加 `loading="lazy"`
- [ ] 事件监听在 `onUnmounted` 中清理
- [ ] `watch` 避免 `deep: true`（改用具体路径）
- [ ] 计算属性代替 `watch` + 副作用（在可能的情况下）
- [ ] 大型 Store 按模块拆分，避免单个 Store 过胖
