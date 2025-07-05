import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testStudentTimetableAPI() {
  try {
    console.log('🔍 测试学生课表API...')

    // 获取小刚的ID
    const student = await prisma.student.findFirst({
      where: { name: '小刚' }
    })

    if (!student) {
      console.log('❌ 找不到学生小刚')
      return
    }

    console.log(`👤 学生: ${student.name} (${student.id})`)

    // 模拟API调用逻辑
    const startDate = '2025-06-29'
    const endDate = '2025-07-05'

    console.log(`📅 查询日期范围: ${startDate} 到 ${endDate}`)

    // 获取学生信息
    const studentInfo = await prisma.student.findUnique({
      where: { id: student.id },
    })

    if (!studentInfo) {
      console.log('❌ 学生不存在')
      return
    }

    // 构建查询条件
    const where: any = { studentId: student.id }
    if (startDate && endDate) {
      where.scheduleDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    // 获取学生的排课
    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        teacher: true,
        subject: true,
        classroom: true,
      },
      orderBy: [
        { scheduleDate: 'asc' },
        { startTime: 'asc' },
      ],
    })

    console.log(`📊 找到 ${schedules.length} 条排课记录`)

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
        teacher: schedule.teacher.name,
        classroom: schedule.classroom.name,
        notes: schedule.notes,
        scheduleDate: schedule.scheduleDate,
      })
      return acc
    }, {} as Record<string, any[]>)

    console.log('📋 按日期分组的数据:')
    console.log(JSON.stringify(timetableByDate, null, 2))

    // 生成课表结构
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
    }

    console.log('📅 生成的课表结构:')
    console.log(JSON.stringify(timetable, null, 2))

    // 模拟API返回
    const apiResponse = {
      student: studentInfo,
      timetable,
      schedules,
    }

    console.log('🎯 API返回的数据结构:')
    console.log('student:', studentInfo)
    console.log('timetable length:', timetable.length)
    console.log('schedules length:', schedules.length)

    // 检查每天的课程
    timetable.forEach(day => {
      console.log(`${day.dayLabel} (${day.date}): ${day.classes.length} 节课`)
      day.classes.forEach(cls => {
        console.log(`  - ${cls.subject} ${cls.startTime}-${cls.endTime}`)
      })
    })

  } catch (error) {
    console.error('❌ 测试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testStudentTimetableAPI()
