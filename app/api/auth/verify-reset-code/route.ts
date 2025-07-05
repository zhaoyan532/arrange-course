import { NextRequest, NextResponse } from 'next/server'
import { resetCodeStore } from '@/lib/services/reset-codes'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Verify the reset code
    const verification = resetCodeStore.verify(email, code)
    
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Code verified successfully'
    })

  } catch (error) {
    console.error('Verify reset code error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

// Export reset code store for the reset-password endpoint
export { resetCodeStore } 