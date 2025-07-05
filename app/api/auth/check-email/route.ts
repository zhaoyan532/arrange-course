import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists using admin API
    const { data: users, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error checking users:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to check email' },
        { status: 500 }
      )
    }

    // Look for user with this email
    const existingUser = users.users.find(user => user.email === email)

    return NextResponse.json({
      success: true,
      exists: !!existingUser,
      message: existingUser ? 'Email already registered' : 'Email available'
    })

  } catch (error) {
    console.error('Check email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check email' },
      { status: 500 }
    )
  }
} 