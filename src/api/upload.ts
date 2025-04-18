import { request } from '@/utils/request'

export interface UploadResponse {
  url: string
}

export function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const headers = {
    'Content-Type': 'multipart/form-data'
  }
  return request.post<UploadResponse>('/api/upload', formData, { headers })
}
