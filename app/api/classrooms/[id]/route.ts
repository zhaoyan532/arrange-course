import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 教室数据验证 schema
const classroomUpdateSchema = z.object({
  name: z.string().min(1, '教室名称不能为空').optional(),
  capacity: z.number().int().positive('容量必须是正整数').optional(),
  location: z.string().optional(),
})

// GET - 获取单个教室
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            student: true,
            teacher: true,
            subject: true,
          },
          orderBy: [
            { scheduleDate: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    })

    if (!classroom) {
      return NextResponse.json(
        { error: '教室不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(classroom)
  } catch (error) {
    console.error('获取教室信息失败:', error)
    return NextResponse.json(
      { error: '获取教室信息失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新教室
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = classroomUpdateSchema.parse(body)

    // 如果更新教室名称，需要检查唯一性
    if (validatedData.name) {
      const existingClassroom = await prisma.classroom.findFirst({
        where: {
          AND: [
            { name: validatedData.name },
            { id: { not: id } }, // 排除当前教室
          ],
        },
      })

      if (existingClassroom) {
        return NextResponse.json(
          { error: '教室名称已存在' },
          { status: 400 }
        )
      }
    }

    // 处理空值
    const cleanData = {
      ...validatedData,
      capacity: validatedData.capacity || null,
      location: validatedData.location || null,
    }

    const classroom = await prisma.classroom.update({
      where: { id },
      data: cleanData,
    })

    return NextResponse.json(classroom)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('更新教室失败:', error)
    return NextResponse.json(
      { error: '更新教室失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除教室
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查教室是否存在
    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        schedules: true,
      },
    })

    if (!classroom) {
      return NextResponse.json(
        { error: '教室不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的排课
    if (classroom.schedules.length > 0) {
      return NextResponse.json(
        { error: '该教室还有排课记录，无法删除' },
        { status: 400 }
      )
    }

    await prisma.classroom.delete({
      where: { id },
    })

    return NextResponse.json({ message: '教室删除成功' })
  } catch (error) {
    console.error('删除教室失败:', error)
    return NextResponse.json(
      { error: '删除教室失败' },
      { status: 500 }
    )
  }
}
