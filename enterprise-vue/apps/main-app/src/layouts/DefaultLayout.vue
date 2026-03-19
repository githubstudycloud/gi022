<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from '@enterprise/stores'

const appStore = useAppStore()
</script>

<template>
  <div class="layout-default" :class="{ 'layout--collapsed': appStore.sidebarCollapsed }">
    <!-- 侧边栏 -->
    <aside class="layout__sidebar">
      <div class="sidebar__brand">
        <span class="brand__logo">⬡</span>
        <span v-if="!appStore.sidebarCollapsed" class="brand__name">Enterprise</span>
      </div>

      <nav class="sidebar__nav">
        <RouterLink to="/home" class="nav-item" active-class="nav-item--active">
          <span class="nav-item__icon">🏠</span>
          <span v-if="!appStore.sidebarCollapsed" class="nav-item__label">首页</span>
        </RouterLink>
        <RouterLink to="/about" class="nav-item" active-class="nav-item--active">
          <span class="nav-item__icon">ℹ️</span>
          <span v-if="!appStore.sidebarCollapsed" class="nav-item__label">关于</span>
        </RouterLink>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <div class="layout__main">
      <!-- 顶栏 -->
      <header class="layout__header">
        <button class="header__toggle" @click="appStore.toggleSidebar">
          {{ appStore.sidebarCollapsed ? '→' : '←' }}
        </button>
        <div class="header__spacer" />
        <div class="header__actions">
          <button @click="appStore.setTheme(appStore.isDark ? 'light' : 'dark')">
            {{ appStore.isDark ? '☀️' : '🌙' }}
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="layout__content">
        <RouterView v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout__sidebar {
  width: var(--sidebar-width);
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-slow);
  flex-shrink: 0;
}

.layout--collapsed .layout__sidebar {
  width: var(--sidebar-collapsed-width);
}

.sidebar__brand {
  height: var(--header-height);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: 0 var(--spacing-4);
  font-weight: 700;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--color-border);
}

.sidebar__nav {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--color-text-secondary);
  transition: background var(--transition-base);
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover { background: var(--color-bg-hover); color: var(--color-text); }
.nav-item--active { background: var(--color-primary-light); color: var(--color-primary); }

.layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout__header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  gap: var(--spacing-3);
}

.header__spacer { flex: 1; }

.layout__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-6);
  background: var(--color-bg-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
