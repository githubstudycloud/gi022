#!/usr/bin/env node
/**
 * 企业级代码生成器
 * 用法：pnpm gen [type] [name] [app?]
 *
 * 示例：
 *   pnpm gen view UserList main-app
 *   pnpm gen component UserCard
 *   pnpm gen store notification main-app
 *   pnpm gen api product
 */
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const ROOT = resolve(__dirname, '../..')

const [, , type, name, app = 'main-app'] = process.argv

if (!type || !name) {
  console.error('用法: pnpm gen [view|component|store|api|composable] [name] [app?]')
  process.exit(1)
}

const generators = {
  view: generateView,
  component: generateComponent,
  store: generateStore,
  api: generateApi,
  composable: generateComposable,
}

const gen = generators[type]
if (!gen) {
  console.error(`未知类型: ${type}。支持: ${Object.keys(generators).join(', ')}`)
  process.exit(1)
}

gen(name, app)

// ============== 生成器函数 ==============

function generateView(name, appName) {
  const pascal = toPascalCase(name)
  const kebab = toKebabCase(name)
  const dir = join(ROOT, `apps/${appName}/src/views/${kebab}`)

  ensureDir(dir)

  const content = `<script setup lang="ts">
import { ref } from 'vue'

const loading = ref(false)
</script>

<template>
  <div class="${kebab}-view">
    <div class="page-header">
      <h2>${pascal}</h2>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>
    <div v-else class="page-content">
      <!-- 页面内容 -->
    </div>
  </div>
</template>

<style scoped>
.${kebab}-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
`
  writeFile(join(dir, `${pascal}View.vue`), content)
  console.log(`✅ 创建视图: apps/${appName}/src/views/${kebab}/${pascal}View.vue`)
}

function generateComponent(name) {
  const pascal = toPascalCase(name)
  const kebab = toKebabCase(name)
  const dir = join(ROOT, `packages/ui/src/components/${pascal}`)

  ensureDir(dir)

  const content = `<script setup lang="ts">
interface Props {
  // 定义 Props
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  // 定义事件
}>()
</script>

<template>
  <div class="${kebab}">
    <slot />
  </div>
</template>

<style scoped>
.${kebab} {
  /* 组件样式 */
}
</style>
`
  writeFile(join(dir, `${pascal}.vue`), content)

  // 更新 index.ts
  console.log(`✅ 创建组件: packages/ui/src/components/${pascal}/${pascal}.vue`)
  console.log(`📌 请手动在 packages/ui/src/index.ts 中添加导出:`)
  console.log(`   export { default as ${pascal} } from './components/${pascal}/${pascal}.vue'`)
}

function generateStore(name, appName) {
  const camel = toCamelCase(name)
  const pascal = toPascalCase(name)
  const dir = join(ROOT, `apps/${appName}/src/stores`)

  ensureDir(dir)

  const content = `import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const use${pascal}Store = defineStore('${camel}', () => {
  // 状态
  const data = ref<unknown>(null)
  const loading = ref(false)

  // 计算属性
  const isEmpty = computed(() => !data.value)

  // Actions
  async function fetchData(): Promise<void> {
    loading.value = true
    try {
      // TODO: 调用 API
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = null
  }

  return { data, loading, isEmpty, fetchData, reset }
})
`
  writeFile(join(dir, `${camel}.ts`), content)
  console.log(`✅ 创建 Store: apps/${appName}/src/stores/${camel}.ts`)
}

function generateApi(name) {
  const camel = toCamelCase(name)
  const pascal = toPascalCase(name)
  const kebab = toKebabCase(name)
  const dir = join(ROOT, 'packages/api/src/modules')

  ensureDir(dir)

  const content = `import type { QueryParams, PageResponse } from '@enterprise/types'
import { getApiClient } from '../client'

export interface ${pascal} {
  id: number | string
  // TODO: 定义字段
  createdAt: string
  updatedAt: string
}

export interface Create${pascal}Dto {
  // TODO: 定义创建字段
}

export type Update${pascal}Dto = Partial<Create${pascal}Dto>

export const ${camel}Api = {
  getList: (params: QueryParams) =>
    getApiClient().get<PageResponse<${pascal}>>('/${kebab}s', { params }),

  getById: (id: number | string) =>
    getApiClient().get<${pascal}>(\`/${kebab}s/\${id}\`),

  create: (data: Create${pascal}Dto) =>
    getApiClient().post<${pascal}>('/${kebab}s', data),

  update: (id: number | string, data: Update${pascal}Dto) =>
    getApiClient().put<${pascal}>(\`/${kebab}s/\${id}\`, data),

  delete: (id: number | string) =>
    getApiClient().delete(\`/${kebab}s/\${id}\`),
}
`
  writeFile(join(dir, `${camel}.ts`), content)
  console.log(`✅ 创建 API 模块: packages/api/src/modules/${camel}.ts`)
  console.log(`📌 请在 packages/api/src/index.ts 中添加导出:`)
  console.log(`   export * from './modules/${camel}'`)
}

function generateComposable(name, appName) {
  const camel = toCamelCase(name)
  const useFunc = `use${toPascalCase(name)}`
  const dir = join(ROOT, `apps/${appName}/src/composables`)

  ensureDir(dir)

  const content = `import { ref, computed, onMounted } from 'vue'

export interface ${toPascalCase(name)}Options {
  immediate?: boolean
}

export function ${useFunc}(options: ${toPascalCase(name)}Options = {}) {
  const { immediate = true } = options

  const data = ref<unknown>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const isEmpty = computed(() => !data.value)

  async function fetch(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      // TODO: 实现逻辑
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  if (immediate) onMounted(fetch)

  return { data, loading, error, isEmpty, fetch }
}
`
  writeFile(join(dir, `${useFunc}.ts`), content)
  console.log(`✅ 创建 Composable: apps/${appName}/src/composables/${useFunc}.ts`)
}

// ============== 工具函数 ==============

function toPascalCase(str) {
  return str.replace(/(^\w|-\w|_\w)/g, (m) => m.replace(/[-_]/, '').toUpperCase())
}

function toCamelCase(str) {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/_/g, '-').toLowerCase()
}

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function writeFile(path, content) {
  if (existsSync(path)) {
    console.warn(`⚠️  文件已存在，跳过: ${path}`)
    return
  }
  writeFileSync(path, content, 'utf-8')
}
