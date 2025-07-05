import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取教师课表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取教师信息
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: '教师不存在' },
        { status: 404 }
      )
    }

    // 获取教师的所有排课
    const schedules = await prisma.schedule.findMany({
      where: { teacherId: id },
      include: {
        student: true,
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
        student: schedule.student.name,
        studentGrade: schedule.student.grade,
        classroom: schedule.classroom.name,
        notes: schedule.notes,
      })
      return acc
    }, {} as Record<number, any[]>)

    // 生成完整的课表结构
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
      teacher,
      timetable,
      schedules,
    })
  } catch (error) {
    console.error('获取教师课表失败:', error)
    return NextResponse.json(
      { error: '获取教师课表失败' },
      { status: 500 }
    )
  }
}
