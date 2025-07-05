import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkWeek27() {
  try {
    console.log('🔍 检查第27周的课程...')

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

    // 检查第27周
    const week27Dates = getWeekDates(27)
    console.log('📅 第27周日期范围:')
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    week27Dates.forEach((date, index) => {
      console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
    })

    // 查询第27周的课程
    const startDate = week27Dates[0].toISOString().split('T')[0]
    const endDate = week27Dates[6].toISOString().split('T')[0]

    const xiaogangSchedules = await prisma.schedule.findMany({
      where: {
        student: { name: '小刚' },
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

    console.log(`\n📊 第27周小刚的课程: ${xiaogangSchedules.length} 条记录`)
    xiaogangSchedules.forEach(schedule => {
      console.log(`- ${schedule.subject.name}: ${schedule.scheduleDate.toISOString().split('T')[0]} ${schedule.startTime}-${schedule.endTime}`)
    })

    // 检查7月6日具体在哪一周
    const july6 = new Date('2025-07-06')
    console.log(`\n📅 2025-07-06 是星期${july6.getDay() === 0 ? 7 : july6.getDay()}`)
    
    // 计算7月6日是第几周
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(currentYear, 0, 1)
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)
    
    const diffTime = july6.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    const july6Week = Math.floor(diffDays / 7) + 1
    
    console.log(`📆 2025-07-06 属于第 ${july6Week} 周`)

  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkWeek27()
