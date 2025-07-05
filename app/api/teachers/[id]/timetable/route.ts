import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - 获取教师课表
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // 构建查询条件
    const where: any = { teacherId: id }
    if (startDate && endDate) {
      where.scheduleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // 获取教师的排课
    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        student: true,
        subject: true,
        classroom: true,
      },
      orderBy: [
        { scheduleDate: 'asc' },
        { startTime: 'asc' },
      ],
    })

    // 按日期分组
    const timetableByDate = schedules.reduce((acc, schedule) => {
      const dateKey = schedule.scheduleDate.toISOString().split('T')[0]
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push({
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        subject: schedule.subject.name,
        student: schedule.student.name,
        studentGrade: schedule.student.grade,
        classroom: schedule.classroom.name,
        notes: schedule.notes,
        scheduleDate: schedule.scheduleDate,
      })
      return acc
    }, {} as Record<string, any[]>)

    // 如果指定了日期范围，生成该范围内的课表
    let timetable = []
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const currentDate = new Date(start)

      while (currentDate <= end) {
        const dateKey = currentDate.toISOString().split('T')[0]
        const dayOfWeek = currentDate.getDay() === 0 ? 7 : currentDate.getDay()
        const dayLabels = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

        timetable.push({
          day: dayOfWeek,
          dayLabel: dayLabels[dayOfWeek],
          date: dateKey,
          classes: timetableByDate[dateKey] || [],
        })

        currentDate.setDate(currentDate.getDate() + 1)
      }
    } else {
      // 如果没有指定日期范围，按日期排序返回所有课程
      const sortedDates = Object.keys(timetableByDate).sort()
      timetable = sortedDates.map(dateKey => {
        const date = new Date(dateKey)
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay()
        const dayLabels = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日']

        return {
          day: dayOfWeek,
          dayLabel: dayLabels[dayOfWeek],
          date: dateKey,
          classes: timetableByDate[dateKey],
        }
      })
    }

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
