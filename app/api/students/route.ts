import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 学生数据验证 schema
const studentSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  phone: z.string().min(1, '手机号不能为空'),
  grade: z.string().min(1, '年级不能为空'),
  classroom: z.string().min(1, '教室不能为空'),
})

// GET - 获取所有学生
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
            { grade: { contains: search, mode: 'insensitive' as const } },
            { classroom: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取学生列表失败:', error)
    return NextResponse.json(
      { error: '获取学生列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新学生
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    // 检查是否已存在相同姓名和手机号的学生
    const existingStudent = await prisma.student.findUnique({
      where: {
        name_phone: {
          name: validatedData.name,
          phone: validatedData.phone,
        },
      },
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: '已存在相同姓名和手机号的学生' },
        { status: 400 }
      )
    }

    const student = await prisma.student.create({
      data: validatedData,
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建学生失败:', error)
    return NextResponse.json(
      { error: '创建学生失败' },
      { status: 500 }
    )
  }
}
