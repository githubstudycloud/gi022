<script setup lang="ts">
import { userApi } from '@enterprise/api'
import { useTable, useModal, EPermission } from '@enterprise/ui'
import type { UserProfile } from '@enterprise/types'

const { list, loading, pagination, total, refresh, onPageChange } = useTable<UserProfile>({
  fetchFn: userApi.getUsers,
  initialParams: { keyword: '' },
})

const editModal = useModal<UserProfile>()
const deleteModal = useModal<UserProfile>()

async function handleDelete(user: UserProfile) {
  deleteModal.open(user)
}
</script>

<template>
  <div class="page-users">
    <div class="page-header">
      <h2>用户管理</h2>
      <EPermission :codes="['user:create']">
        <button class="btn-primary" @click="editModal.open()">+ 新增用户</button>
      </EPermission>
    </div>

    <div class="table-toolbar">
      <input placeholder="搜索用户名/邮箱..." class="search-input" />
      <button @click="refresh">刷新</button>
    </div>

    <div v-if="loading" class="loading-state">加载中...</div>

    <table v-else class="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>用户名</th>
          <th>昵称</th>
          <th>邮箱</th>
          <th>状态</th>
          <th>创建时间</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in list" :key="user.id">
          <td>{{ user.id }}</td>
          <td>{{ user.username }}</td>
          <td>{{ user.nickname }}</td>
          <td>{{ user.email }}</td>
          <td>
            <span :class="['status-badge', `status-badge--${user.status}`]">
              {{ { active: '正常', inactive: '停用', locked: '锁定', pending: '待激活' }[user.status] }}
            </span>
          </td>
          <td>{{ user.createdAt }}</td>
          <td>
            <EPermission :codes="['user:edit']">
              <button @click="editModal.open(user)">编辑</button>
            </EPermission>
            <EPermission :codes="['user:delete']">
              <button class="btn-danger" @click="handleDelete(user)">删除</button>
            </EPermission>
          </td>
        </tr>
        <tr v-if="!list.length">
          <td colspan="7" style="text-align:center;color:var(--color-text-secondary)">暂无数据</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      共 {{ total }} 条 |
      <button :disabled="pagination.page <= 1" @click="onPageChange(pagination.page - 1)">上一页</button>
      第 {{ pagination.page }} 页
      <button @click="onPageChange(pagination.page + 1)">下一页</button>
    </div>
  </div>
</template>

<style scoped>
.page-users { display: flex; flex-direction: column; gap: var(--spacing-4); }
.page-header { display: flex; align-items: center; justify-content: space-between; }
.table-toolbar { display: flex; gap: var(--spacing-3); }
.search-input { flex: 1; max-width: 320px; padding: var(--spacing-2) var(--spacing-3); border: 1px solid var(--color-border); border-radius: var(--radius-md); }
.data-table { width: 100%; border-collapse: collapse; background: var(--color-bg); border-radius: var(--radius-lg); overflow: hidden; }
.data-table th, .data-table td { padding: var(--spacing-3) var(--spacing-4); text-align: left; border-bottom: 1px solid var(--color-border); font-size: 0.875rem; }
.data-table th { background: var(--color-bg-secondary); font-weight: 600; }
.status-badge { padding: 2px 8px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 500; }
.status-badge--active { background: #dcfce7; color: #16a34a; }
.status-badge--inactive { background: #f3f4f6; color: #6b7280; }
.status-badge--locked { background: #fef9c3; color: #ca8a04; }
.pagination { display: flex; align-items: center; gap: var(--spacing-3); font-size: 0.875rem; color: var(--color-text-secondary); }
.btn-primary { padding: var(--spacing-2) var(--spacing-4); background: var(--color-primary); color: #fff; border: none; border-radius: var(--radius-md); cursor: pointer; }
.btn-danger { color: var(--color-danger); background: none; border: none; cursor: pointer; }
</style>
