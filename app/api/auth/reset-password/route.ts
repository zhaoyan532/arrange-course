import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resetCodeStore } from '@/lib/services/reset-codes'

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code, and new password are required' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Verify reset code one more time
    const verification = resetCodeStore.verify(email, code)
    
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      )
    }

    // Find user and update password
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      console.error('Error finding user:', userError)
      return NextResponse.json(
        { success: false, error: 'Failed to find user' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u.email === email)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Clean up reset code
    resetCodeStore.delete(email)

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reset password' },
      { status: 500 }
    )
  }
} 