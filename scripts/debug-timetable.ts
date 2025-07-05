import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugTimetable() {
  try {
    console.log('🔍 调试课表数据...')

    // 获取所有学生
    const students = await prisma.student.findMany({
      select: { id: true, name: true }
    })
    console.log('👥 学生列表:')
    console.table(students)

    // 获取所有排课数据
    const schedules = await prisma.schedule.findMany({
      include: {
        student: { select: { name: true } },
        teacher: { select: { name: true } },
        subject: { select: { name: true } },
        classroom: { select: { name: true } }
      },
      orderBy: { scheduleDate: 'asc' }
    })

    console.log('📅 所有排课数据:')
    schedules.forEach(schedule => {
      console.log(`- ${schedule.student.name}: ${schedule.subject.name} (${schedule.teacher.name}) 
        日期: ${schedule.scheduleDate.toISOString().split('T')[0]} 
        时间: ${schedule.startTime}-${schedule.endTime}
        教室: ${schedule.classroom.name}`)
    })

    // 测试当前周次计算
    const getCurrentWeek = () => {
      const today = new Date()
      const currentYear = today.getFullYear()
      const yearStart = new Date(currentYear, 0, 1) // 1月1日
      
      // 找到今年第一个周一
      const firstDayOfWeek = yearStart.getDay()
      const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
      const firstMonday = new Date(yearStart)
      firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)
      
      // 计算当前是第几周
      const diffTime = today.getTime() - firstMonday.getTime()
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const currentWeek = Math.floor(diffDays / 7) + 1
      
      return Math.max(1, Math.min(52, currentWeek))
    }

    const currentWeek = getCurrentWeek()
    console.log(`📆 当前周次: ${currentWeek}`)

    // 测试获取当前周的日期范围
    const getWeekDates = (weekNumber: number) => {
      const today = new Date()
      const currentYear = today.getFullYear()
      const yearStart = new Date(currentYear, 0, 1) // 1月1日
      
      // 找到今年第一个周一
      const firstDayOfWeek = yearStart.getDay()
      const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
      const firstMonday = new Date(yearStart)
      firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

      // 计算指定周次的周一
      const weekStart = new Date(firstMonday)
      weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

      // 生成一周的日期
      const weekDates = []
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + i)
        weekDates.push(date)
      }

      return weekDates
    }

    const currentWeekDates = getWeekDates(currentWeek)
    console.log(`📅 当前周 (第${currentWeek}周) 日期范围:`)
    currentWeekDates.forEach((date, index) => {
      const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
      console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
    })

    // 测试API查询
    if (students.length > 0) {
      const studentId = students[0].id
      const startDate = currentWeekDates[0].toISOString().split('T')[0]
      const endDate = currentWeekDates[6].toISOString().split('T')[0]

      console.log(`\n🔍 测试学生 ${students[0].name} 的课表查询:`)
      console.log(`查询日期范围: ${startDate} 到 ${endDate}`)

      const studentSchedules = await prisma.schedule.findMany({
        where: {
          studentId,
          scheduleDate: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        },
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

      console.log(`📊 找到 ${studentSchedules.length} 条课程`)
      studentSchedules.forEach(schedule => {
        console.log(`  - ${schedule.subject.name}: ${schedule.scheduleDate.toISOString().split('T')[0]} ${schedule.startTime}-${schedule.endTime}`)
      })
    }

  } catch (error) {
    console.error('❌ 调试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugTimetable()
