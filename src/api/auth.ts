import { request } from '@/utils/request'

export interface LoginRequest {
  phone: string
  password: string
}

export interface UserInfo {
  id: string
  username: string
  nickname: string
}

export interface LoginResponse {
  token: string
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  return request.post<LoginResponse>('/api/user/login', data)
}
