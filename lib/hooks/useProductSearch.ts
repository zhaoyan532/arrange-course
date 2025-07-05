import { useState, useCallback } from 'react'

// 产品类型定义
export interface Product {
  id: string
  name: string
  description: string
  price: string
  originalPrice?: string
  image: string
  buyUrl: string
  category: string
  rating?: number
  reviewCount?: number
  features?: string[]
  relevanceScore?: number
}

export interface ProductSearchParams {
  hairColor?: string
  faceShape?: string
  skinTone?: string
  eyeColor?: string
  age?: string
  gender?: string
  keywords?: string[]
}

export interface ProductSearchResult {
  products: Product[]
  total: number
  searchCriteria?: any
  message?: string
}

export interface UseProductSearchReturn {
  products: Product[]
  isLoading: boolean
  error: string | null
  searchProducts: (params: ProductSearchParams) => Promise<void>
  clearError: () => void
}

export function useProductSearch(): UseProductSearchReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchProducts = useCallback(async (params: ProductSearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      
      if (params.hairColor) queryParams.set('hairColor', params.hairColor)
      if (params.faceShape) queryParams.set('faceShape', params.faceShape)
      if (params.skinTone) queryParams.set('skinTone', params.skinTone)
      if (params.eyeColor) queryParams.set('eyeColor', params.eyeColor)
      if (params.age) queryParams.set('age', params.age)
      if (params.gender) queryParams.set('gender', params.gender)
      if (params.keywords && params.keywords.length > 0) {
        queryParams.set('keywords', params.keywords.join(','))
      }

      const response = await fetch(`/api/products/search?${queryParams.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.products) {
        setProducts(data.products)
      } else {
        throw new Error(data.error || 'Failed to fetch product recommendations')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search products'
      setError(errorMessage)
      console.error('Product search error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    products,
    isLoading,
    error,
    searchProducts,
    clearError
  }
}

// 辅助函数：基于用户特征生成搜索关键词
export function generateSearchKeywords(userFeatures: ProductSearchParams): string[] {
  const keywords: string[] = []
  
  // 基于发色
  if (userFeatures.hairColor === 'Brown' || userFeatures.hairColor === 'Black') {
    keywords.push('shampoo', 'conditioner', 'dark hair')
  } else if (userFeatures.hairColor === 'Blonde') {
    keywords.push('blonde hair', 'purple shampoo', 'toning')
  } else if (userFeatures.hairColor === 'Red') {
    keywords.push('red hair', 'color-safe', 'gentle')
  }
  
  // 基于肤色
  if (userFeatures.skinTone === 'Cool') {
    keywords.push('cool undertones', 'moisturizer')
  } else if (userFeatures.skinTone === 'Warm') {
    keywords.push('warm undertones', 'foundation')
  } else if (userFeatures.skinTone === 'Neutral') {
    keywords.push('neutral skin', 'daily moisturizer')
  }
  
  // 基于年龄
  if (userFeatures.age) {
    const ageNum = parseInt(userFeatures.age.split('-')[0])
    if (ageNum >= 30) {
      keywords.push('anti-aging', 'firming', 'wrinkle')
    } else {
      keywords.push('gentle', 'hydrating', 'daily care')
    }
  }
  
  // 基础护理关键词
  keywords.push('skincare', 'beauty', 'face care')
  
  return keywords
}

// 辅助函数：获取产品类别的推荐关键词
export function getCategoryKeywords(category: string): string[] {
  const categoryMap: { [key: string]: string[] } = {
    'hair': ['shampoo', 'conditioner', 'hair mask', 'hair oil', 'hair treatment'],
    'skincare': ['moisturizer', 'cleanser', 'serum', 'toner', 'sunscreen'],
    'makeup': ['foundation', 'concealer', 'blush', 'eyeshadow', 'lipstick'],
    'eyecare': ['eye cream', 'eye serum', 'under eye', 'eye mask']
  }
  
  return categoryMap[category.toLowerCase()] || []
} 