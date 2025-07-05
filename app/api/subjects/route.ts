import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 科目数据验证 schema
const subjectSchema = z.object({
  name: z.string().min(1, '科目名称不能为空'),
  description: z.string().optional(),
})

// GET - 获取所有科目
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const subjects = await prisma.subject.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ subjects })
  } catch (error) {
    console.error('获取科目列表失败:', error)
    return NextResponse.json(
      { error: '获取科目列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新科目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = subjectSchema.parse(body)

    // 检查科目名称是否已存在
    const existingSubject = await prisma.subject.findUnique({
      where: { name: validatedData.name },
    })

    if (existingSubject) {
      return NextResponse.json(
        { error: '科目名称已存在' },
        { status: 400 }
      )
    }

    const subject = await prisma.subject.create({
      data: {
        ...validatedData,
        description: validatedData.description || null,
      },
    })

    return NextResponse.json(subject, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建科目失败:', error)
    return NextResponse.json(
      { error: '创建科目失败' },
      { status: 500 }
    )
  }
}
