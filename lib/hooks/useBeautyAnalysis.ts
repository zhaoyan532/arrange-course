import { useState, useCallback } from 'react'

interface AnalysisFeatures {
  hairColor: string
  hairStyle: string
  hairTexture: string
  faceShape: string
  skinTone: string
  eyeColor: string
  ageRange: string
  gender: string
}

interface Product {
  id: string
  title: string
  price: number
  imageUrl?: string
  productUrl: string
  rating?: number
  category: string
}

interface AnalysisResult {
  analysis: any
  recommendations: {
    hairProducts: Product[]
    skinProducts: Product[]
  }
}

export const useBeautyAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 执行面部分析并获取推荐
  const analyzeAndRecommend = useCallback(async (
    sessionId: string,
    features: AnalysisFeatures,
    imageUrl?: string,
    userId?: string
  ) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          imageUrl,
          hairColor: features.hairColor,
          hairStyle: features.hairStyle,
          hairTexture: features.hairTexture,
          faceShape: features.faceShape,
          skinTone: features.skinTone,
          eyeColor: features.eyeColor,
          ageRange: features.ageRange,
          gender: features.gender,
        }),
      })

      if (!response.ok) {
        throw new Error('分析失败，请重试')
      }

      const result = await response.json()
      setAnalysisResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setError(errorMessage)
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  // 根据sessionId获取已有的分析结果
  const getAnalysisResult = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/analysis?sessionId=${sessionId}`)
      
      if (!response.ok) {
        throw new Error('获取分析结果失败')
      }

      const result = await response.json()
      setAnalysisResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误'
      setError(errorMessage)
      throw error
    }
  }, [])

  // 订阅邮件
  const subscribeEmail = useCallback(async (
    email: string,
    preferences?: any
  ) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences,
        }),
      })

      if (!response.ok) {
        throw new Error('订阅失败，请重试')
      }

      const result = await response.json()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '订阅失败'
      setError(errorMessage)
      throw error
    }
  }, [])

  // 取消订阅
  const unsubscribeEmail = useCallback(async (email: string) => {
    try {
      const response = await fetch(`/api/subscribe?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('取消订阅失败')
      }

      const result = await response.json()
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '取消订阅失败'
      setError(errorMessage)
      throw error
    }
  }, [])

  // 清除错误
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    setAnalysisResult(null)
    setError(null)
    setIsAnalyzing(false)
  }, [])

  return {
    // 状态
    isAnalyzing,
    analysisResult,
    error,

    // 方法
    analyzeAndRecommend,
    getAnalysisResult,
    subscribeEmail,
    unsubscribeEmail,
    clearError,
    reset,

    // 便捷访问器
    hairProducts: analysisResult?.recommendations?.hairProducts || [],
    skinProducts: analysisResult?.recommendations?.skinProducts || [],
    analysis: analysisResult?.analysis || null,
  }
} 