import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logOperation } from '@/lib/operation-log'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '当前密码不能为空'),
  newPassword: z.string().min(6, '新密码至少6位'),
  confirmPassword: z.string().min(1, '确认密码不能为空'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json(
        { error: '未登录' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = changePasswordSchema.parse(body)

    // 获取当前用户的密码
    const teacher = await prisma.teacher.findUnique({
      where: { id: user.id },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    // 验证当前密码
    const isValidPassword = await verifyPassword(currentPassword, teacher.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: '当前密码错误' },
        { status: 400 }
      )
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword)

    // 更新密码
    await prisma.teacher.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    // 记录操作日志
    await logOperation({
      operation: 'UPDATE',
      tableName: 'teachers',
      recordId: user.id,
      operatorName: user.name,
      operatorType: user.role,
      description: `${user.name} 修改了密码`,
    })

    return NextResponse.json({ message: '密码修改成功' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Change password error:', error)
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    )
  }
}
