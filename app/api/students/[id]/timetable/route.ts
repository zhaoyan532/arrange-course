import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取学生课表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取学生信息
    const student = await prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      return NextResponse.json(
        { error: '学生不存在' },
        { status: 404 }
      )
    }

    // 获取学生的所有排课
    const schedules = await prisma.schedule.findMany({
      where: { studentId: id },
      include: {
        teacher: true,
        subject: true,
        classroom: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    })

    // 按星期几分组
    const timetableByDay = schedules.reduce((acc, schedule) => {
      const day = schedule.dayOfWeek
      if (!acc[day]) {
        acc[day] = []
      }
      acc[day].push({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        subject: schedule.subject.name,
        teacher: schedule.teacher.name,
        classroom: schedule.classroom.name,
        notes: schedule.notes,
      })
      return acc
    }, {} as Record<number, any[]>)

    // 生成完整的课表结构（包含空时间段）
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00'
    ]

    const daysOfWeek = [
      { value: 1, label: '周一' },
      { value: 2, label: '周二' },
      { value: 3, label: '周三' },
      { value: 4, label: '周四' },
      { value: 5, label: '周五' },
      { value: 6, label: '周六' },
      { value: 7, label: '周日' },
    ]

    const timetable = daysOfWeek.map(day => ({
      day: day.value,
      dayLabel: day.label,
      classes: timetableByDay[day.value] || [],
    }))

    return NextResponse.json({
      student,
      timetable,
      schedules,
    })
  } catch (error) {
    console.error('获取学生课表失败:', error)
    return NextResponse.json(
      { error: '获取学生课表失败' },
      { status: 500 }
    )
  }
}
