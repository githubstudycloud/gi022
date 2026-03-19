<script setup lang="ts">
import { computed } from 'vue'
import { usePermissionStore } from '@enterprise/stores'

interface Props {
  /** 所需权限码，满足其中之一即可 */
  codes?: string[]
  /** 所需角色，满足其中之一即可 */
  roles?: string[]
  /** 无权限时是否隐藏（false 则禁用） */
  hide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  codes: () => [],
  roles: () => [],
  hide: true,
})

const permStore = usePermissionStore()

const allowed = computed(() => {
  if (!props.codes.length && !props.roles.length) return true
  const hasCode = props.codes.some((c) => permStore.permissions.includes(c))
  const hasRole = props.roles.some((r) => permStore.roles.includes(r))
  return hasCode || hasRole
})
</script>

<template>
  <slot v-if="allowed" />
  <slot v-else-if="!hide" name="fallback" />
</template>
