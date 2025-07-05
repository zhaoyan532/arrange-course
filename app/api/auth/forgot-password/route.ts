import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sgMail from '@sendgrid/mail'
import { resetCodeStore } from '@/lib/services/reset-codes'

// Initialize Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: NextRequest) {
  try {
      
      const { email } = await request.json()
      
      console.log('asdasd',email);
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: users, error: userError } = await supabase.auth.admin.listUsers()
    if (userError) {
      console.error('Error checking user:', userError)
      return NextResponse.json(
        { success: false, error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    const user = users.users.find(u => u?.email?.toLowerCase() === email?.toLowerCase())
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email address' },
        { status: 404 }
      )
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const expires = Date.now() + 15 * 60 * 1000 // 15 minutes

    // Store reset code
    resetCodeStore.set(email, resetCode)

    // Send reset code email
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL!,
      subject: 'Password Reset Code - Hare',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Hare - Your Beauty Assistant</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px 0;">
              We received a request to reset your password. Use the verification code below to continue:
            </p>
            
            <div style="background: #f3f4f6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
              <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
              <div style="font-size: 32px; font-weight: bold; color: #ec4899; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${resetCode}
              </div>
              <p style="color: #9ca3af; margin: 15px 0 0 0; font-size: 12px;">
                This code expires in 15 minutes
              </p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
              </p>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              © 2025 Hare. All rights reserved.
            </p>
          </div>
        </div>
      `
    }

    await sgMail.send(msg)

    return NextResponse.json({
      success: true,
      message: 'Reset code sent to your email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send reset code' },
      { status: 500 }
    )
  }
}

// Export the reset code store for other endpoints
export { resetCodeStore } 