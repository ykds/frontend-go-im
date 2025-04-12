import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login as loginApi, type LoginRequest } from '@/api/auth'
import { useRouter } from 'vue-router'
import type { ApiError } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<any>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  const login = async (credentials: LoginRequest) => {
    try {
      loading.value = true
      error.value = null
      const token = await loginApi(credentials)
      setToken(token)
      router.push('/friend')
    } catch (err) {
      const apiError = err as ApiError
      error.value = apiError.message || '登录失败，请重试'
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return {
    token,
    user,
    loading,
    error,
    login,
    logout
  }
})
