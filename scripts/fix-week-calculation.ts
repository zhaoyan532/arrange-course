async function fixWeekCalculation() {
  console.log('🔧 修复周次计算...')

  // 当前的错误计算
  const getCurrentWeekWrong = () => {
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

  const getWeekDatesWrong = (weekNumber: number) => {
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

    // 生成一周的日期（周一到周日）
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  console.log('❌ 当前错误的计算:')
  const currentWeek = getCurrentWeekWrong()
  console.log(`当前周次: ${currentWeek}`)
  
  const week26Wrong = getWeekDatesWrong(26)
  console.log('第26周:')
  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  week26Wrong.forEach((date, index) => {
    console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
  })

  // 检查问题
  console.log('\n🔍 问题分析:')
  console.log('- 第26周从6月29日（周日）开始，到7月5日（周六）结束')
  console.log('- 但是6月29日应该是第25周的周日，不是第26周的周一')
  console.log('- 7月6日（周日）应该是第26周的最后一天')

  console.log('\n✅ 正确的计算应该是:')
  console.log('第26周应该是: 6月30日(周一) 到 7月6日(周日)')
  
  // 修复后的计算
  const getWeekDatesFixed = (weekNumber: number) => {
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

    // 生成一周的日期（周一到周日）
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  const week26Fixed = getWeekDatesFixed(26)
  console.log('修复后的第26周:')
  week26Fixed.forEach((date, index) => {
    console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
  })

  // 检查7月6日是否在修复后的第26周
  const july6InWeek26 = week26Fixed.some(date => 
    date.toISOString().split('T')[0] === '2025-07-06'
  )
  console.log(`\n🔍 7月6日是否在修复后的第26周: ${july6InWeek26}`)
}

fixWeekCalculation()
