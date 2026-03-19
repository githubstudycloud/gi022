<script setup lang="ts">
import { useUserStore } from '@enterprise/stores'

const userStore = useUserStore()
</script>

<template>
  <div class="home-view">
    <div class="home-view__header">
      <h1>欢迎回来，{{ userStore.currentUser?.nickname ?? '用户' }}</h1>
      <p>今天是个好日子，继续努力吧！</p>
    </div>

    <div class="home-view__stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <span class="stat-card__icon">{{ stat.icon }}</span>
        <div class="stat-card__info">
          <div class="stat-card__value">{{ stat.value }}</div>
          <div class="stat-card__label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
const stats = [
  { icon: '📊', value: '1,234', label: '本月访问' },
  { icon: '✅', value: '56', label: '已完成任务' },
  { icon: '🔔', value: '8', label: '待处理通知' },
  { icon: '👥', value: '128', label: '活跃用户' },
]
</script>

<style scoped>
.home-view {
  max-width: 1200px;
}

.home-view__header {
  margin-bottom: var(--spacing-8);
}

.home-view__header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-2);
}

.home-view__header p {
  color: var(--color-text-secondary);
  margin: 0;
}

.home-view__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--spacing-4);
}

.stat-card {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  box-shadow: var(--shadow-sm);
}

.stat-card__icon {
  font-size: 2rem;
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-card__label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-1);
}
</style>
