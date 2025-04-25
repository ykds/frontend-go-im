import { request } from '@/utils/request'

export interface LoginRequest {
  phone: string
  password: string
}

export interface LoginResponse {
 token: string
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return request.post<LoginResponse>('/api/user/login', data)
}

export const register = async (data: RegisterData): Promise<void> => {
  return request.post('/api/user/register', data)
}

export interface RegisterData {
  phone: string
  username: string
  password: string
  confirm_password: string
  avatar: string
  gender: string
}
