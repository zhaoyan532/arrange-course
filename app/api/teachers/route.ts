import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth'
import { logOperation } from '@/lib/operation-log'
import { hashPassword } from '@/lib/auth'

// 教师数据验证 schema
const teacherSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(1, '手机号不能为空'),
  email: z.string().email('邮箱格式不正确').optional().or(z.literal('')),
  subject: z.string().optional(),
  password: z.string().min(6, '密码至少6位').optional(),
})

// GET - 获取所有教师
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { subject: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacher.count({ where }),
    ])

    return NextResponse.json({
      teachers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取教师列表失败:', error)
    return NextResponse.json(
      { error: '获取教师列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新教师
export async function POST(request: NextRequest) {
  try {
    // 检查权限
    const currentUser = await getCurrentUser(request)
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: '权限不足，只有管理员可以管理教师' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = teacherSchema.parse(body)

    // 检查手机号是否已存在
    const existingTeacher = await prisma.teacher.findUnique({
      where: { phone: validatedData.phone },
    })

    if (existingTeacher) {
      return NextResponse.json(
        { error: '该手机号已被使用' },
        { status: 400 }
      )
    }

    // 处理密码，如果没有提供则使用默认密码
    const password = validatedData.password || 'Xx@123456'
    const hashedPassword = await hashPassword(password)

    // 处理空字符串
    const cleanData = {
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email || null,
      subject: validatedData.subject || null,
      password: hashedPassword,
    }

    const teacher = await prisma.teacher.create({
      data: cleanData,
    })

    // 记录操作日志
    await logOperation({
      operation: 'CREATE',
      tableName: 'teachers',
      recordId: teacher.id,
      operatorName: '系统管理员', // 这里可以从请求中获取实际操作者
      operatorType: 'ADMIN',
      newData: teacher,
      description: `创建教师：${teacher.name}`,
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建教师失败:', error)
    return NextResponse.json(
      { error: '创建教师失败' },
      { status: 500 }
    )
  }
}
