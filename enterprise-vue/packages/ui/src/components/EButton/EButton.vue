<script lang="ts">
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'
</script>

<script setup lang="ts">
interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  block?: boolean
  icon?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(e: MouseEvent): void {
  if (!props.loading && !props.disabled) emit('click', e)
}
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'e-btn',
      `e-btn--${variant}`,
      `e-btn--${size}`,
      { 'e-btn--block': block, 'e-btn--loading': loading },
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="e-btn__spinner" aria-hidden="true" />
    <span v-if="icon && !loading" class="e-btn__icon" :class="icon" aria-hidden="true" />
    <span class="e-btn__label">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.e-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}

.e-btn--sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; }
.e-btn--md { padding: 0.5rem 1rem; font-size: 0.875rem; }
.e-btn--lg { padding: 0.625rem 1.25rem; font-size: 1rem; }
.e-btn--block { width: 100%; }

.e-btn--primary { background: var(--color-primary); color: #fff; }
.e-btn--primary:hover:not(:disabled) { background: var(--color-primary-hover); }
.e-btn--secondary { background: transparent; border-color: var(--color-border); color: var(--color-text); }
.e-btn--danger { background: var(--color-danger); color: #fff; }
.e-btn--ghost { background: transparent; color: var(--color-primary); }
.e-btn--link { background: transparent; border: none; color: var(--color-primary); padding-left: 0; padding-right: 0; }

.e-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.e-btn__spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
