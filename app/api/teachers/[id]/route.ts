import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { logOperation } from '@/lib/operation-log'
import { getCurrentUser } from '@/lib/auth'

// 教师数据验证 schema
const teacherUpdateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').optional(),
  phone: z.string().optional(),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  subject: z.string().optional(),
})

// GET - 获取单个教师
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            student: true,
            subject: true,
            classroom: true,
          },
          orderBy: [
            { scheduleDate: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: '教师不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(teacher)
  } catch (error) {
    console.error('获取教师信息失败:', error)
    return NextResponse.json(
      { error: '获取教师信息失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新教师
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以管理教师' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = teacherUpdateSchema.parse(body)

    // 获取更新前的数据
    const oldTeacher = await prisma.teacher.findUnique({
      where: { id },
    })

    if (!oldTeacher) {
      return NextResponse.json(
        { error: '教师不存在' },
        { status: 404 }
      )
    }

    // 检查手机号是否已被其他教师使用
    if (validatedData.phone && validatedData.phone !== oldTeacher.phone) {
      const existingTeacher = await prisma.teacher.findUnique({
        where: { phone: validatedData.phone },
      })

      if (existingTeacher && existingTeacher.id !== id) {
        return NextResponse.json(
          { error: '该手机号已被其他教师使用' },
          { status: 400 }
        )
      }
    }

    // 处理空字符串，但保持手机号为必填
    const cleanData = {
      ...validatedData,
      phone: validatedData.phone || oldTeacher.phone, // 如果没有提供新手机号，保持原有的
      email: validatedData.email || null,
      subject: validatedData.subject || null,
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: cleanData,
    })

    // 记录操作日志
    await logOperation({
      operation: 'UPDATE',
      tableName: 'teachers',
      recordId: teacher.id,
      operatorName: '系统管理员', // 这里可以从请求中获取实际操作者
      operatorType: 'ADMIN',
      oldData: oldTeacher,
      newData: teacher,
      description: `更新教师信息：${teacher.name}`,
    })

    return NextResponse.json(teacher)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('更新教师失败:', error)
    return NextResponse.json(
      { error: '更新教师失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除教师
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查权限
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以管理教师' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 检查教师是否存在
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        schedules: true,
      },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: '教师不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的排课
    if (teacher.schedules.length > 0) {
      return NextResponse.json(
        { error: '该教师还有排课记录，无法删除' },
        { status: 400 }
      )
    }

    await prisma.teacher.delete({
      where: { id },
    })

    // 记录操作日志
    await logOperation({
      operation: 'DELETE',
      tableName: 'teachers',
      recordId: id,
      operatorName: '系统管理员', // 这里可以从请求中获取实际操作者
      operatorType: 'ADMIN',
      oldData: teacher,
      description: `删除教师：${teacher.name}`,
    })

    return NextResponse.json({ message: '教师删除成功' })
  } catch (error) {
    console.error('删除教师失败:', error)
    return NextResponse.json(
      { error: '删除教师失败' },
      { status: 500 }
    )
  }
}
