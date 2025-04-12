<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-container">
        <img src="@/assets/logo.svg" alt="Logo" class="logo" />
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <input
            type="text"
            v-model="username"
            placeholder="请输入账号"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>
        <div class="input-group">
          <input
            type="password"
            v-model="password"
            placeholder="请输入密码"
            class="input-field"
            :disabled="loading"
            required
          />
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const handleLogin = async () => {
  try {
    loading.value = true
    error.value = null
    await authStore.login({
      phone: username.value,
      password: password.value
    })
  } catch (err) {
    error.value = authStore.error || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.login-box {
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(8px);
  margin: 0 20px;
}

.logo-container {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo {
  width: 120px;
  height: auto;
  transition: transform 0.3s ease;
}

.logo:hover {
  transform: scale(1.05);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: var(--color-input-bg);
  color: var(--color-text);
}

.input-field:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #94a3b8;
}

.login-button {
  background: var(--color-primary);
  color: var(--color-white);
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.login-button:hover {
  background: var(--color-primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.login-button:active {
  transform: translateY(0);
}

.error-message {
  color: #ef4444;
  font-size: 14px;
  text-align: center;
  margin-top: 0.5rem;
}

.login-button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

.login-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

.input-field:disabled {
  background: #f1f5f9;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-box {
    padding: 2rem;
  }

  .input-field {
    padding: 12px 16px;
  }

  .login-button {
    padding: 12px 20px;
  }
}
</style>
