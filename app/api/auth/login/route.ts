import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { authenticateUser, setUserCookie } from '@/lib/auth'

const loginSchema = z.object({
  phone: z.string().min(1, '手机号不能为空'),
  password: z.string().min(1, '密码不能为空'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = loginSchema.parse(body)

    const user = await authenticateUser(phone, password)
    
    if (!user) {
      return NextResponse.json(
        { error: '手机号或密码错误' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        email: user.email,
        subject: user.subject,
      },
      message: '登录成功',
    })

    // 设置用户 Cookie
    response.headers.set('Set-Cookie', setUserCookie(user))

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    )
  }
}
