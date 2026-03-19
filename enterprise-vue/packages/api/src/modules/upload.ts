import { getApiClient } from '../client'

export interface UploadResult {
  url: string
  key: string
  name: string
  size: number
  mimeType: string
}

export const uploadApi = {
  /** 单文件上传 */
  upload: (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    return getApiClient().post<UploadResult>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
  },

  /** 批量上传 */
  batchUpload: (files: File[]) => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))
    return getApiClient().post<UploadResult[]>('/upload/batch', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /** 删除文件 */
  deleteFile: (key: string) =>
    getApiClient().delete(`/upload/${encodeURIComponent(key)}`),
}
