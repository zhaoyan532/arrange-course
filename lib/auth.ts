import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface User {
  id: string
  name: string
  phone: string
  role: 'ADMIN' | 'TEACHER'
  email?: string
  subject?: string
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// 加密密码
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// 登录验证
export async function authenticateUser(phone: string, password: string): Promise<User | null> {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { phone },
    })
    if (!teacher || !teacher.isActive) {
      return null
    }
    
    const isValidPassword = await verifyPassword(password, teacher.password)
    console.log(teacher.password,password)
    if (!isValidPassword) {
      return null
    }

    // 更新最后登录时间
    await prisma.teacher.update({
      where: { id: teacher.id },
      data: { lastLoginAt: new Date() },
    })

    return {
      id: teacher.id,
      name: teacher.name,
      phone: teacher.phone,
      role: teacher.role as 'ADMIN' | 'TEACHER',
      email: teacher.email || undefined,
      subject: teacher.subject || undefined,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

// 从请求中获取当前用户
export async function getCurrentUser(request?: NextRequest): Promise<User | null> {
  try {
    let cookieStore
    if (request) {
      // 从请求中获取 cookies
      cookieStore = request.cookies
    } else {
      // 从服务器组件中获取 cookies
      cookieStore = await cookies()
    }
    
    const userCookie = cookieStore.get('user')
    if (!userCookie) {
      return null
    }

    const userData = JSON.parse(userCookie.value)
    
    // 验证用户是否仍然有效
    const teacher = await prisma.teacher.findUnique({
      where: { id: userData.id },
    })

    if (!teacher || !teacher.isActive) {
      return null
    }

    return {
      id: teacher.id,
      name: teacher.name,
      phone: teacher.phone,
      role: teacher.role as 'ADMIN' | 'TEACHER',
      email: teacher.email || undefined,
      subject: teacher.subject || undefined,
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// 检查用户权限
export function hasPermission(user: User | null, requiredRole: 'ADMIN' | 'TEACHER'): boolean {
  if (!user) return false
  
  if (requiredRole === 'ADMIN') {
    return user.role === 'ADMIN'
  }
  
  // TEACHER 权限包括 ADMIN 和 TEACHER
  return user.role === 'ADMIN' || user.role === 'TEACHER'
}

// 检查是否可以管理教师
export function canManageTeachers(user: User | null): boolean {
  return hasPermission(user, 'ADMIN')
}

// 设置用户 Cookie
export function setUserCookie(user: User): string {
  const userData = JSON.stringify(user)
  return `user=${encodeURIComponent(userData)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}` // 7天
}

// 清除用户 Cookie
export function clearUserCookie(): string {
  return 'user=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'
}
