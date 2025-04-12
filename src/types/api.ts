export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  code: number
  message: string
  data?: any
}
