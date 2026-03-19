<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore, useUserStore } from '@enterprise/stores'
import { useForm } from '@enterprise/ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const userStore = useUserStore()

const { model, errors, submitting, submit } = useForm(
  { username: '', password: '', rememberMe: false },
  {
    username: [{ required: true, message: '请输入用户名' }],
    password: [{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }],
  },
)

const error = ref('')

async function handleLogin() {
  error.value = ''
  await submit(async (data) => {
    try {
      await authStore.login(data)
      await userStore.fetchCurrentUser()
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (e) {
      error.value = (e as Error).message || '登录失败，请检查用户名和密码'
    }
  })
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <div class="login-box__header">
        <div class="login-box__logo">⬡</div>
        <h1 class="login-box__title">Enterprise Platform</h1>
        <p class="login-box__subtitle">请登录您的账号</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div v-if="error" class="login-form__error">{{ error }}</div>

        <div class="form-field">
          <label class="form-field__label">用户名</label>
          <input
            v-model="model.username"
            class="form-field__input"
            :class="{ 'form-field__input--error': errors.username }"
            placeholder="请输入用户名"
            autocomplete="username"
          />
          <p v-if="errors.username" class="form-field__msg">{{ errors.username }}</p>
        </div>

        <div class="form-field">
          <label class="form-field__label">密码</label>
          <input
            v-model="model.password"
            type="password"
            class="form-field__input"
            :class="{ 'form-field__input--error': errors.password }"
            placeholder="请输入密码"
            autocomplete="current-password"
          />
          <p v-if="errors.password" class="form-field__msg">{{ errors.password }}</p>
        </div>

        <div class="form-field form-field--inline">
          <label>
            <input v-model="model.rememberMe" type="checkbox" /> 记住我
          </label>
          <a href="#" class="login-form__forgot">忘记密码？</a>
        </div>

        <button type="submit" class="login-form__submit" :disabled="submitting">
          {{ submitting ? '登录中...' : '登 录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
  padding: var(--spacing-4);
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  padding: var(--spacing-8);
  box-shadow: var(--shadow-lg);
}

.login-box__header {
  text-align: center;
  margin-bottom: var(--spacing-8);
}

.login-box__logo {
  font-size: 3rem;
  margin-bottom: var(--spacing-3);
}

.login-box__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-2);
}

.login-box__subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form { display: flex; flex-direction: column; gap: var(--spacing-4); }

.login-form__error {
  padding: var(--spacing-3);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: 0.875rem;
}

.form-field { display: flex; flex-direction: column; gap: var(--spacing-1); }
.form-field--inline { flex-direction: row; align-items: center; justify-content: space-between; }
.form-field__label { font-size: 0.875rem; font-weight: 500; color: var(--color-text); }

.form-field__input {
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  outline: none;
  transition: border-color var(--transition-base);
  background: var(--color-bg);
  color: var(--color-text);
}

.form-field__input:focus { border-color: var(--color-primary); }
.form-field__input--error { border-color: var(--color-danger); }
.form-field__msg { font-size: 0.75rem; color: var(--color-danger); margin: 0; }
.login-form__forgot { font-size: 0.875rem; color: var(--color-primary); text-decoration: none; }

.login-form__submit {
  padding: var(--spacing-3);
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-base);
  letter-spacing: 0.05em;
}

.login-form__submit:hover:not(:disabled) { background: var(--color-primary-hover); }
.login-form__submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
