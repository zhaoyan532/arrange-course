import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// 管理员客户端，仅在服务端使用
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side')
  }
  
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
} 