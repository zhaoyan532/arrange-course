export interface Database {
  public: {
    Tables: {
      // 用户表
      users: {
        Row: {
          id: string
          email?: string
          name?: string
          created_at: string
          updated_at: string
          is_subscribed: boolean
        }
        Insert: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
          is_subscribed?: boolean
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
          updated_at?: string
          is_subscribed?: boolean
        }
      }
      // 面部分析结果表
      face_analysis: {
        Row: {
          id: string
          user_id?: string
          session_id?: string
          image_url: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          confidence_score?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          session_id?: string
          image_url: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          confidence_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string
          image_url?: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          confidence_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      // 查询条件表（新增）
      search_queries: {
        Row: {
          id: string
          user_id?: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          image_url?: string
          search_type: 'manual' | 'ai_analysis'
          analysis_id?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          image_url?: string
          search_type: 'manual' | 'ai_analysis'
          analysis_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          hair_color?: string
          hair_style?: string
          hair_texture?: string
          face_shape?: string
          skin_tone?: string
          eye_color?: string
          age_range?: string
          gender?: string
          keywords?: string[]
          image_url?: string
          search_type?: 'manual' | 'ai_analysis'
          analysis_id?: string
          created_at?: string
        }
      }
      // 产品推荐记录表（修改）
      product_recommendations: {
        Row: {
          id: string
          search_query_id: string
          analysis_id?: string
          product_id: string
          product_name: string
          product_description?: string
          price?: string
          original_price?: string
          category?: string
          rating?: number
          review_count?: number
          amazon_url?: string
          product_image?: string
          relevance_score?: number
          features?: string[]
          created_at: string
        }
        Insert: {
          id?: string
          search_query_id: string
          analysis_id?: string
          product_id: string
          product_name: string
          product_description?: string
          price?: string
          original_price?: string
          category?: string
          rating?: number
          review_count?: number
          amazon_url?: string
          product_image?: string
          relevance_score?: number
          features?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          search_query_id?: string
          analysis_id?: string
          product_id?: string
          product_name?: string
          product_description?: string
          price?: string
          original_price?: string
          category?: string
          rating?: number
          review_count?: number
          amazon_url?: string
          product_image?: string
          relevance_score?: number
          features?: string[]
          created_at?: string
        }
      }
      // 邮件订阅表
      email_subscriptions: {
        Row: {
          id: string
          email: string
          user_id?: string
          is_active: boolean
          preferences: any
          last_sent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          user_id?: string
          is_active?: boolean
          preferences?: any
          last_sent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          user_id?: string
          is_active?: boolean
          preferences?: any
          last_sent?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // 数据更新日志表
      update_logs: {
        Row: {
          id: string
          task_type: string
          status: string
          started_at: string
          completed_at: string | null
          records_processed: number
          error_message?: string
          metadata?: any
        }
        Insert: {
          id?: string
          task_type: string
          status?: string
          started_at?: string
          completed_at?: string | null
          records_processed?: number
          error_message?: string
          metadata?: any
        }
        Update: {
          id?: string
          task_type?: string
          status?: string
          started_at?: string
          completed_at?: string | null
          records_processed?: number
          error_message?: string
          metadata?: any
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 