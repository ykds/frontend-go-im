import axios from 'axios'
import type { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse, ApiError } from '@/types/api'

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers.token = `${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, message, data } = response.data

    if (code !== 200) {
      const error: ApiError = {
        code,
        message,
        data
      }
      return Promise.reject(error)
    }

    return response
  },
  (error: AxiosError) => {
    const apiError: ApiError = {
      code: error.response?.status || 500,
      message: error.message || '请求失败',
      data: error.response?.data
    }
    return Promise.reject(apiError)
  }
)

export const request = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.get<ApiResponse<T>>(url, config).then(res => res.data.data)
  },

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.post<ApiResponse<T>>(url, data, config).then(res => res.data.data)
  },

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
    return api.put<ApiResponse<T>>(url, data, config).then(res => res.data.data)
  },

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    return api.delete<ApiResponse<T>>(url, config).then(res => res.data.data)
  }
}

export default api
