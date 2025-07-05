async function testFixedWeek() {
  console.log('🧪 测试修复后的周次计算...')

  // 修复后的getCurrentWeek函数
  const getCurrentWeek = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(currentYear, 0, 1) // 1月1日
    
    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)
    
    // 计算当前日期到第一个周一的天数差
    const diffTime = today.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    // 如果是周日，需要特殊处理
    const todayDayOfWeek = today.getDay()
    let currentWeek
    
    if (todayDayOfWeek === 0) {
      // 周日：属于当前周，不是下一周
      currentWeek = Math.floor(diffDays / 7) + 1
    } else {
      // 周一到周六：正常计算
      currentWeek = Math.floor(diffDays / 7) + 1
    }
    
    return Math.max(1, Math.min(52, currentWeek))
  }

  // 修复后的getWeekDates函数
  const getWeekDates = (weekNumber: number) => {
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1) // 1月1日
    
    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    // 计算指定周次的周一
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    // 生成一周的日期（周一到周日）
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  console.log('📅 2025年第一个周一:', new Date(2025, 0, 5).toISOString().split('T')[0])

  const currentWeek = getCurrentWeek()
  console.log(`\n📆 当前周次: ${currentWeek}`)

  const weekDates = getWeekDates(currentWeek)
  console.log(`\n📅 第${currentWeek}周日期范围:`)
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  weekDates.forEach((date, index) => {
    const dateStr = date.toISOString().split('T')[0]
    const actualDay = date.getDay()
    const expectedDay = index + 1 === 7 ? 0 : index + 1 // 周日是0，其他是1-6
    const isCorrect = actualDay === expectedDay
    console.log(`  ${dayNames[index]}: ${dateStr} (实际星期${actualDay === 0 ? 7 : actualDay}) ${isCorrect ? '✅' : '❌'}`)
  })

  // 检查7月6日是否在当前周
  const july6InCurrentWeek = weekDates.some(date => 
    date.toISOString().split('T')[0] === '2025-07-06'
  )
  console.log(`\n🔍 7月6日是否在第${currentWeek}周: ${july6InCurrentWeek ? '✅ 是' : '❌ 否'}`)

  // 如果7月6日不在当前周，检查它在哪一周
  if (!july6InCurrentWeek) {
    for (let week = 1; week <= 52; week++) {
      const testWeekDates = getWeekDates(week)
      const july6InThisWeek = testWeekDates.some(date => 
        date.toISOString().split('T')[0] === '2025-07-06'
      )
      if (july6InThisWeek) {
        console.log(`📍 7月6日实际在第${week}周`)
        break
      }
    }
  }
}

testFixedWeek()
