import { NextResponse } from 'next/server'
import { clearUserCookie } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ message: '登出成功' })
  
  // 清除用户 Cookie
  response.headers.set('Set-Cookie', clearUserCookie())
  
  return response
}
