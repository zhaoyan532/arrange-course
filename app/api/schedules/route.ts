import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// 排课数据验证 schema
const scheduleSchema = z.object({
  studentId: z.string().min(1, '请选择学生'),
  teacherId: z.string().min(1, '请选择教师'),
  subjectId: z.string().min(1, '请选择科目'),
  classroomId: z.string().min(1, '请选择教室'),
  dayOfWeek: z.number().int().min(1).max(7, '星期几必须在1-7之间'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '开始时间格式不正确'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '结束时间格式不正确'),
  notes: z.string().optional(),
})

// 时间转换为分钟数，便于比较
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 检查时间段是否重叠
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)
  
  // 两个时间段重叠的条件：start1 < end2 && start2 < end1
  return start1Min < end2Min && start2Min < end1Min
}

// GET - 获取所有排课
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const dayOfWeek = searchParams.get('dayOfWeek')

    const skip = (page - 1) * limit

    const where: any = {}
    if (studentId) where.studentId = studentId
    if (teacherId) where.teacherId = teacherId
    if (dayOfWeek) where.dayOfWeek = parseInt(dayOfWeek)

    const [schedules, total] = await Promise.all([
      prisma.schedule.findMany({
        where,
        skip,
        take: limit,
        include: {
          student: true,
          teacher: true,
          subject: true,
          classroom: true,
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      }),
      prisma.schedule.count({ where }),
    ])

    return NextResponse.json({
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    })
  } catch (error) {
    console.error('获取排课列表失败:', error)
    return NextResponse.json(
      { error: '获取排课列表失败' },
      { status: 500 }
    )
  }
}

// POST - 创建新排课
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = scheduleSchema.parse(body)

    // 验证开始时间必须早于结束时间
    if (timeToMinutes(validatedData.startTime) >= timeToMinutes(validatedData.endTime)) {
      return NextResponse.json(
        { error: '开始时间必须早于结束时间' },
        { status: 400 }
      )
    }

    // 检查学生时间冲突
    const studentConflicts = await prisma.schedule.findMany({
      where: {
        studentId: validatedData.studentId,
        dayOfWeek: validatedData.dayOfWeek,
      },
      include: {
        subject: true,
        teacher: true,
      },
    })

    for (const conflict of studentConflicts) {
      if (isTimeOverlap(
        validatedData.startTime,
        validatedData.endTime,
        conflict.startTime,
        conflict.endTime
      )) {
        return NextResponse.json(
          { 
            error: `创建排课失败，该学生已有重复排课，请检查。冲突课程：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）` 
          },
          { status: 400 }
        )
      }
    }

    // 检查教师时间冲突
    const teacherConflicts = await prisma.schedule.findMany({
      where: {
        teacherId: validatedData.teacherId,
        dayOfWeek: validatedData.dayOfWeek,
      },
      include: {
        student: true,
        subject: true,
      },
    })

    for (const conflict of teacherConflicts) {
      if (isTimeOverlap(
        validatedData.startTime,
        validatedData.endTime,
        conflict.startTime,
        conflict.endTime
      )) {
        return NextResponse.json(
          { 
            error: `创建排课失败，该教师已有重复排课，请检查。冲突课程：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）` 
          },
          { status: 400 }
        )
      }
    }

    // 检查教室使用冲突
    const classroomConflicts = await prisma.schedule.findMany({
      where: {
        classroomId: validatedData.classroomId,
        dayOfWeek: validatedData.dayOfWeek,
      },
      include: {
        student: true,
        teacher: true,
        subject: true,
      },
    })

    for (const conflict of classroomConflicts) {
      if (isTimeOverlap(
        validatedData.startTime,
        validatedData.endTime,
        conflict.startTime,
        conflict.endTime
      )) {
        return NextResponse.json(
          { 
            error: `创建排课失败，该教室已被占用，请检查。冲突课程：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）` 
          },
          { status: 400 }
        )
      }
    }

    // 创建排课
    const schedule = await prisma.schedule.create({
      data: {
        ...validatedData,
        notes: validatedData.notes || null,
      },
      include: {
        student: true,
        teacher: true,
        subject: true,
        classroom: true,
      },
    })

    return NextResponse.json(schedule, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '数据验证失败', details: error.errors },
        { status: 400 }
      )
    }

    console.error('创建排课失败:', error)
    return NextResponse.json(
      { error: '创建排课失败' },
      { status: 500 }
    )
  }
}

// 获取冲突检测的辅助函数
export async function checkScheduleConflicts(
  studentId: string,
  teacherId: string,
  classroomId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeId?: string
) {
  const conflicts = []

  // 检查学生冲突
  const studentConflicts = await prisma.schedule.findMany({
    where: {
      studentId,
      dayOfWeek,
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { subject: true, teacher: true },
  })

  for (const conflict of studentConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'student',
        message: `学生时间冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  // 检查教师冲突
  const teacherConflicts = await prisma.schedule.findMany({
    where: {
      teacherId,
      dayOfWeek,
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { student: true, subject: true },
  })

  for (const conflict of teacherConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'teacher',
        message: `教师时间冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  // 检查教室冲突
  const classroomConflicts = await prisma.schedule.findMany({
    where: {
      classroomId,
      dayOfWeek,
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { student: true, teacher: true, subject: true },
  })

  for (const conflict of classroomConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'classroom',
        message: `教室使用冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  return conflicts
}
