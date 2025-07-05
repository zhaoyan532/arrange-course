import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 教室数据验证 schema
const classroomSchema = z.object({
  name: z.string().min(1, '教室名称不能为空'),
  capacity: z.number().int().positive('容量必须是正整数').optional(),
  location: z.string().optional(),
})

// GET - 获取所有教室
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
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [classrooms, total] = await Promise.all([
      prisma.classroom.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.classroom.count({ where }),
    ])

    return NextResponse.json({
      classrooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('获取教室列表失败:', error)
    return NextResponse.json(
      { error: '获取教室列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新教室
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = classroomSchema.parse(body)

    // 检查教室名称是否已存在
    const existingClassroom = await prisma.classroom.findUnique({
      where: { name: validatedData.name },
    })

    if (existingClassroom) {
      return NextResponse.json(
        { error: '教室名称已存在' },
        { status: 400 }
      )
    }

    const classroom = await prisma.classroom.create({
      data: {
        ...validatedData,
        capacity: validatedData.capacity || null,
        location: validatedData.location || null,
      },
    })

    return NextResponse.json(classroom, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建教室失败:', error)
    return NextResponse.json(
      { error: '创建教室失败' },
      { status: 500 }
    )
  }
}
