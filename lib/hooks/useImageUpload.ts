import { useState } from 'react'

interface UploadResponse {
  success: boolean
  url?: string
  fileName?: string
  fileSize?: number
  error?: string
  message?: string
}

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      })

      const data: UploadResponse = await response.json()

      if (data.success && data.url) {
        return data.url
      } else {
        setUploadError(data.error || 'Upload failed')
        return null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setUploadError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const uploadImageFromDataURL = async (dataURL: string, fileName: string = 'image.jpg'): Promise<string | null> => {
    try {
      // 将 data URL 转换为 File 对象
      const response = await fetch(dataURL)
      const blob = await response.blob()
      const file = new File([blob], fileName, { type: blob.type })

      return await uploadImage(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image'
      setUploadError(errorMessage)
      return null
    }
  }

  return {
    uploadImage,
    uploadImageFromDataURL,
    isUploading,
    uploadError,
    clearError: () => setUploadError(null)
  }
} 