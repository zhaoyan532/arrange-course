import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugTimetableDetailed() {
  try {
    console.log('🔍 详细调试课表显示问题...')

    // 1. 检查小刚的所有课程
    const xiaogangSchedules = await prisma.schedule.findMany({
      where: {
        student: { name: '小刚' }
      },
      include: {
        student: true,
        teacher: true,
        subject: true,
        classroom: true,
      },
      orderBy: { scheduleDate: 'asc' }
    })

    console.log('📚 小刚的所有课程:')
    xiaogangSchedules.forEach(schedule => {
      console.log(`- ${schedule.subject.name}: ${schedule.scheduleDate.toISOString().split('T')[0]} ${schedule.startTime}-${schedule.endTime}`)
    })

    // 2. 测试第26周的日期计算
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

    const currentWeek = getCurrentWeek()
    const weekDates = getWeekDates(currentWeek)
    
    console.log(`\n📅 第${currentWeek}周日期范围:`)
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    weekDates.forEach((date, index) => {
      console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
    })

    // 3. 模拟API查询
    const startDate = weekDates[0].toISOString().split('T')[0]
    const endDate = weekDates[6].toISOString().split('T')[0]
    
    console.log(`\n🔍 API查询参数:`)
    console.log(`startDate: ${startDate}`)
    console.log(`endDate: ${endDate}`)

    const xiaogangId = xiaogangSchedules[0]?.student.id
    if (!xiaogangId) {
      console.log('❌ 找不到小刚')
      return
    }

    const apiSchedules = await prisma.schedule.findMany({
      where: {
        studentId: xiaogangId,
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

    console.log(`\n📊 API查询结果: ${apiSchedules.length} 条记录`)
    apiSchedules.forEach(schedule => {
      console.log(`- ${schedule.subject.name}: ${schedule.scheduleDate.toISOString().split('T')[0]} ${schedule.startTime}-${schedule.endTime}`)
    })

    // 4. 模拟前端数据处理
    const timetableByDate = apiSchedules.reduce((acc, schedule) => {
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

    console.log('\n📋 按日期分组:')
    Object.keys(timetableByDate).forEach(dateKey => {
      console.log(`${dateKey}: ${timetableByDate[dateKey].length} 节课`)
      timetableByDate[dateKey].forEach(cls => {
        console.log(`  - ${cls.subject} ${cls.startTime}-${cls.endTime}`)
      })
    })

    // 5. 生成课表结构
    let timetable = []
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

    console.log('\n📅 最终课表结构:')
    timetable.forEach(day => {
      console.log(`${day.dayLabel} (${day.date}): ${day.classes.length} 节课`)
      day.classes.forEach(cls => {
        console.log(`  - ${cls.subject} ${cls.startTime}-${cls.endTime}`)
      })
    })

    // 6. 测试时间段匹配
    console.log('\n🕐 测试时间段匹配:')
    const testTimeSlots = ['03:00', '03:15', '03:30', '03:45', '04:00', '13:00', '13:15', '13:30', '14:00', '14:15']
    
    const getClassesForTimeSlot = (day: any, timeSlot: string) => {
      return day.classes.filter((cls: any) => {
        // 解析时间为分钟数进行比较
        const parseTime = (timeStr: string) => {
          const [hours, minutes] = timeStr.split(':').map(Number)
          return hours * 60 + minutes
        }
        
        const startMinutes = parseTime(cls.startTime)
        const endMinutes = parseTime(cls.endTime)
        const slotMinutes = parseTime(timeSlot)
        
        // 课程在这个时间段内（课程开始时间 <= 时间段 < 课程结束时间）
        return startMinutes <= slotMinutes && slotMinutes < endMinutes
      })
    }

    timetable.forEach(day => {
      if (day.classes.length > 0) {
        console.log(`\n${day.dayLabel} (${day.date}) 时间段匹配测试:`)
        testTimeSlots.forEach(timeSlot => {
          const classes = getClassesForTimeSlot(day, timeSlot)
          if (classes.length > 0) {
            console.log(`  ${timeSlot}: ${classes.map((c: any) => c.subject).join(', ')}`)
          }
        })
      }
    })

  } catch (error) {
    console.error('❌ 调试失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugTimetableDetailed()
