import { supabase, getSupabaseAdmin } from '@/lib/supabase'
import { Database } from '@/lib/database.types'

type Tables = Database['public']['Tables']
type FaceAnalysis = Tables['face_analysis']['Row']
type FaceAnalysisInsert = Tables['face_analysis']['Insert']
type SearchQuery = Tables['search_queries']['Row']
type SearchQueryInsert = Tables['search_queries']['Insert']
type ProductRecommendation = Tables['product_recommendations']['Row']
type ProductRecommendationInsert = Tables['product_recommendations']['Insert']
type EmailSubscription = Tables['email_subscriptions']['Row']
type EmailSubscriptionInsert = Tables['email_subscriptions']['Insert']
type UpdateLog = Tables['update_logs']['Row']
type UpdateLogInsert = Tables['update_logs']['Insert']

// 面部分析相关
export const faceAnalysisService = {
  // 创建分析记录
  async create(data: FaceAnalysisInsert): Promise<FaceAnalysis | null> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: result, error } = await supabaseAdmin
      .from('face_analysis')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating face analysis:', error)
      return null
    }
    
    return result
  },

  // 根据session_id获取分析记录
  async getBySessionId(sessionId: string): Promise<FaceAnalysis | null> {
    const { data, error } = await supabase
      .from('face_analysis')
      .select('*')
      .eq('session_id', sessionId)
      .single()
    
    if (error) {
      console.error('Error getting face analysis:', error)
      return null
    }
    
    return data
  },

  // 获取用户的分析历史
  async getUserHistory(userId: string): Promise<FaceAnalysis[]> {
    const { data, error } = await supabase
      .from('face_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting user history:', error)
      return []
    }
    
    return data || []
  }
}

// 搜索查询相关
export const searchQueryService = {
  // 创建搜索查询记录
  async create(data: SearchQueryInsert): Promise<SearchQuery | null> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data: result, error } = await supabaseAdmin
      .from('search_queries')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating search query:', error)
      return null
    }
    
    return result
  },

  // 创建搜索查询并保存推荐产品
  async createWithProducts(
    queryData: SearchQueryInsert,
    products: any[]
  ): Promise<{ searchQuery: SearchQuery; success: boolean } | null> {
    const supabaseAdmin = getSupabaseAdmin()
    
    try {
      // 创建搜索查询记录
      const { data: searchQuery, error: searchError } = await supabaseAdmin
        .from('search_queries')
        .insert(queryData)
        .select()
        .single()

      if (searchError) {
        console.error('Error creating search query:', searchError)
        return null
      }

      console.log('Search query created successfully:', searchQuery.id)

      // 保存推荐产品
      if (products && products.length > 0) {
        const productRecords = products.map((product: any) => ({
          search_query_id: searchQuery.id,
          analysis_id: queryData.analysis_id,
          product_id: product.id,
          product_name: product.name,
          product_description: product.description,
          price: product.price,
          original_price: product.originalPrice,
          category: product.category,
          rating: product.rating,
          review_count: product.reviewCount,
          amazon_url: product.buyUrl,
          product_image: product.image,
          relevance_score: product.relevanceScore,
          features: product.features
        }))

        console.log(`Inserting ${productRecords.length} product records`)

        const { error: productsError } = await supabaseAdmin
          .from('product_recommendations')
          .insert(productRecords)

        if (productsError) {
          console.error('Products save error:', productsError)
          return { searchQuery, success: false }
        } else {
          console.log('Product recommendations saved successfully')
        }
      }

      return { searchQuery, success: true }

    } catch (error) {
      console.error('Error in createWithProducts:', error)
      return null
    }
  },

  // 获取用户的搜索历史
  async getUserHistory(userId: string): Promise<SearchQuery[]> {
    const { data, error } = await supabase
      .from('search_queries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error getting user search history:', error)
      return []
    }
    
    return data || []
  }
}

// 产品推荐相关
export const productRecommendationService = {
  // 创建推荐记录
  async create(data: ProductRecommendationInsert): Promise<ProductRecommendation | null> {
    const { data: result, error } = await supabase
      .from('product_recommendations')
      .insert(data)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating product recommendation:', error)
      return null
    }
    
    return result
  },

  // 批量创建推荐记录
  async batchCreate(recommendations: ProductRecommendationInsert[]): Promise<boolean> {
    const { error } = await supabase
      .from('product_recommendations')
      .insert(recommendations)
    
    if (error) {
      console.error('Error batch creating product recommendations:', error)
      return false
    }
    
    return true
  },

  // 获取分析的推荐产品
  async getByAnalysisId(analysisId: string): Promise<ProductRecommendation[]> {
    const { data, error } = await supabase
      .from('product_recommendations')
      .select('*')
      .eq('analysis_id', analysisId)
      .order('relevance_score', { ascending: false })
    
    if (error) {
      console.error('Error getting product recommendations:', error)
      return []
    }
    
    return data || []
  }
}

// 邮件订阅相关
export const emailSubscriptionService = {
  // 创建订阅
  async subscribe(email: string, userId?: string, preferences?: any): Promise<EmailSubscription | null> {
    // 使用管理员客户端绕过RLS策略
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .upsert({
        email,
        user_id: userId,
        is_active: true,
        preferences: preferences || {}
      }, {
        onConflict: 'email'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error subscribing email:', error)
      return null
    }
    
    return data
  },

  // 检查订阅状态
  async checkSubscription(email: string): Promise<EmailSubscription | null> {
    // 使用管理员客户端绕过RLS策略
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - not subscribed
        return null
      }
      console.error('Error checking subscription:', error)
      return null
    }
    
    return data
  },

  // 取消订阅
  async unsubscribe(email: string): Promise<boolean> {
    // 使用管理员客户端绕过RLS策略
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('email_subscriptions')
      .update({ is_active: false })
      .eq('email', email)
    
    if (error) {
      console.error('Error unsubscribing email:', error)
      return false
    }
    
    return true
  },

  // 获取活跃订阅者
  async getActiveSubscribers(): Promise<EmailSubscription[]> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('email_subscriptions')
      .select('*')
      .eq('is_active', true)
    
    if (error) {
      console.error('Error getting active subscribers:', error)
      return []
    }
    
    return data || []
  },

  // 更新最后发送时间
  async updateLastSent(email: string): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('email_subscriptions')
      .update({ last_sent: new Date().toISOString() })
      .eq('email', email)
    
    if (error) {
      console.error('Error updating last sent:', error)
      return false
    }
    
    return true
  },

  // 获取用户的最后一次搜索记录
  async getLastSearchQuery(userId: string): Promise<any | null> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('search_queries')
      .select(`
        *,
        product_recommendations (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error) {
      console.error('Error getting last search query:', error)
      return null
    }
    
    return data
  },


}

// 更新日志相关
export const updateLogService = {
  // 开始任务
  async startTask(taskType: string, metadata?: any): Promise<string | null> {
    const supabaseAdmin = getSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('update_logs')
      .insert({
        task_type: taskType,
        status: 'running',
        metadata
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('Error starting task:', error)
      return null
    }
    
    return data.id
  },

  // 完成任务
  async completeTask(taskId: string, recordsProcessed: number): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('update_logs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        records_processed: recordsProcessed
      })
      .eq('id', taskId)
    
    if (error) {
      console.error('Error completing task:', error)
      return false
    }
    
    return true
  },

  // 任务失败
  async failTask(taskId: string, errorMessage: string): Promise<boolean> {
    const supabaseAdmin = getSupabaseAdmin()
    const { error } = await supabaseAdmin
      .from('update_logs')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: errorMessage
      })
      .eq('id', taskId)
    
    if (error) {
      console.error('Error failing task:', error)
      return false
    }
    
    return true
  },

  // 获取最近的日志
  async getRecentLogs(taskType?: string, limit: number = 10): Promise<UpdateLog[]> {
    const supabaseAdmin = getSupabaseAdmin()
    let query = supabaseAdmin
      .from('update_logs')
      .select('*')
    
    if (taskType) {
      query = query.eq('task_type', taskType)
    }
    
    const { data, error } = await query
      .order('started_at', { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error('Error getting recent logs:', error)
      return []
    }
    
    return data || []
  }
}