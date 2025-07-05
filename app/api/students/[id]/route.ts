import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 学生数据验证 schema
const studentUpdateSchema = z.object({
  name: z.string().min(1, '姓名不能为空').optional(),
  phone: z.string().min(1, '手机号不能为空').optional(),
  grade: z.string().min(1, '年级不能为空').optional(),
  classroom: z.string().min(1, '教室不能为空').optional(),
})

// GET - 获取单个学生
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        schedules: {
          include: {
            teacher: true,
            subject: true,
            classroom: true,
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' },
          ],
        },
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: '学生不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('获取学生信息失败:', error)
    return NextResponse.json(
      { error: '获取学生信息失败' },
      { status: 500 }
    )
  }
}

// PUT - 更新学生
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validatedData = studentUpdateSchema.parse(body)

    // 如果更新姓名或手机号，需要检查唯一性
    if (validatedData.name || validatedData.phone) {
      const currentStudent = await prisma.student.findUnique({
        where: { id },
      })

      if (!currentStudent) {
        return NextResponse.json(
          { error: '学生不存在' },
          { status: 404 }
        )
      }

      const newName = validatedData.name || currentStudent.name
      const newPhone = validatedData.phone || currentStudent.phone

      // 检查是否与其他学生冲突
      const existingStudent = await prisma.student.findFirst({
        where: {
          AND: [
            { name: newName },
            { phone: newPhone },
            { id: { not: id } }, // 排除当前学生
          ],
        },
      })

      if (existingStudent) {
        return NextResponse.json(
          { error: '已存在相同姓名和手机号的学生' },
          { status: 400 }
        )
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: validatedData,
    })

    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('更新学生失败:', error)
    return NextResponse.json(
      { error: '更新学生失败' },
      { status: 500 }
    )
  }
}

// DELETE - 删除学生
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 检查学生是否存在
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        schedules: true,
      },
    })

    if (!student) {
      return NextResponse.json(
        { error: '学生不存在' },
        { status: 404 }
      )
    }

    // 检查是否有关联的排课
    if (student.schedules.length > 0) {
      return NextResponse.json(
        { error: '该学生还有排课记录，无法删除' },
        { status: 400 }
      )
    }

    await prisma.student.delete({
      where: { id },
    })

    return NextResponse.json({ message: '学生删除成功' })
  } catch (error) {
    console.error('删除学生失败:', error)
    return NextResponse.json(
      { error: '删除学生失败' },
      { status: 500 }
    )
  }
}
