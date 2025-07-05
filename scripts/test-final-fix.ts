async function testFinalFix() {
  console.log('🧪 测试最终修复的周次计算...')

  // 修复后的计算
  const getWeekDates = (weekNumber: number) => {
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1) // 1月1日
    
    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 
                              firstDayOfWeek === 1 ? 0 : 
                              8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    console.log(`📅 ${currentYear}年第一个周一: ${firstMonday.toISOString().split('T')[0]} (getDay()=${firstMonday.getDay()})`)

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

  // 测试第26周
  const week26 = getWeekDates(26)
  console.log('\n📅 修复后的第26周:')
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  week26.forEach((date, index) => {
    const dateStr = date.toISOString().split('T')[0]
    const actualDay = date.getDay()
    const expectedDay = index + 1 === 7 ? 0 : index + 1 // 周日是0，其他是1-6
    const isCorrect = actualDay === expectedDay
    console.log(`  ${dayNames[index]}: ${dateStr} (实际星期${actualDay === 0 ? 7 : actualDay}) ${isCorrect ? '✅' : '❌'}`)
  })

  // 检查7月6日是否在第26周
  const july6InWeek26 = week26.some(date => 
    date.toISOString().split('T')[0] === '2025-07-06'
  )
  console.log(`\n🔍 7月6日是否在第26周: ${july6InWeek26 ? '✅ 是' : '❌ 否'}`)

  // 测试第27周
  const week27 = getWeekDates(27)
  console.log('\n📅 第27周:')
  week27.forEach((date, index) => {
    const dateStr = date.toISOString().split('T')[0]
    console.log(`  ${dayNames[index]}: ${dateStr}`)
  })

  // 验证7月6日的星期
  const july6 = new Date('2025-07-06')
  console.log(`\n📆 2025-07-06 实际是星期${july6.getDay() === 0 ? 7 : july6.getDay()} (getDay()=${july6.getDay()})`)
  
  if (july6InWeek26) {
    console.log('✅ 修复成功！7月6日现在正确地包含在第26周中')
  } else {
    console.log('❌ 还有问题，7月6日仍然不在第26周中')
  }
}

testFinalFix()
