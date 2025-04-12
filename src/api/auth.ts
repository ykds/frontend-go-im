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

export const login = async (data: LoginRequest): Promise<string> => {
  return request.post<string>('/api/user/login', data)
}
