async function checkWeekCalculation() {
  console.log('🔍 检查周次计算逻辑...')

  const getWeekDates = (weekNumber: number) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(currentYear, 0, 1) // 1月1日
    
    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    console.log(`📅 ${currentYear}年第一个周一: ${firstMonday.toISOString().split('T')[0]}`)

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

  // 检查第26周
  console.log('\n📅 第26周:')
  const week26 = getWeekDates(26)
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  week26.forEach((date, index) => {
    console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
  })

  // 检查第27周
  console.log('\n📅 第27周:')
  const week27 = getWeekDates(27)
  week27.forEach((date, index) => {
    console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
  })

  // 检查7月5日和7月6日
  const july5 = new Date('2025-07-05')
  const july6 = new Date('2025-07-06')
  
  console.log(`\n📆 2025-07-05 是星期${july5.getDay() === 0 ? 7 : july5.getDay()} (${dayNames[july5.getDay() === 0 ? 6 : july5.getDay() - 1]})`)
  console.log(`📆 2025-07-06 是星期${july6.getDay() === 0 ? 7 : july6.getDay()} (${dayNames[july6.getDay() === 0 ? 6 : july6.getDay() - 1]})`)

  // 检查7月6日是否在第26周范围内
  const july6InWeek26 = week26.some(date => 
    date.toISOString().split('T')[0] === '2025-07-06'
  )
  console.log(`\n🔍 7月6日是否在第26周范围内: ${july6InWeek26}`)

  if (july6InWeek26) {
    console.log('✅ 7月6日在第26周范围内')
  } else {
    console.log('❌ 7月6日不在第26周范围内，这就是为什么看不到7月6日的课程')
  }
}

checkWeekCalculation()
