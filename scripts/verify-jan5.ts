async function verifyJan5() {
  console.log('🔍 验证1月5日是否真的是周一...')

  const jan5 = new Date(2025, 0, 5) // 1月5日
  console.log(`📅 2025年1月5日: getDay()=${jan5.getDay()}`)
  console.log(`实际是: ${jan5.getDay() === 0 ? '周日' : jan5.getDay() === 1 ? '周一' : jan5.getDay() === 2 ? '周二' : jan5.getDay() === 3 ? '周三' : jan5.getDay() === 4 ? '周四' : jan5.getDay() === 5 ? '周五' : '周六'}`)

  // 检查1月6日
  const jan6 = new Date(2025, 0, 6) // 1月6日
  console.log(`📅 2025年1月6日: getDay()=${jan6.getDay()}`)
  console.log(`实际是: ${jan6.getDay() === 0 ? '周日' : jan6.getDay() === 1 ? '周一' : jan6.getDay() === 2 ? '周二' : jan6.getDay() === 3 ? '周三' : jan6.getDay() === 4 ? '周四' : jan6.getDay() === 5 ? '周五' : '周六'}`)

  console.log('\n🔍 问题分析:')
  if (jan5.getDay() === 1) {
    console.log('✅ 1月5日确实是周一')
  } else {
    console.log('❌ 1月5日不是周一！')
    console.log('真正的第一个周一应该是1月6日')
  }

  // 如果1月5日是周日，那么问题在于我们的计算
  if (jan5.getDay() === 0) {
    console.log('\n🔧 修正：1月5日是周日，1月6日是周一')
    console.log('我们的计算把1月5日当作了第一个周一，这是错误的')
    
    // 重新计算第26周，基于1月6日作为第一个周一
    const firstMonday = new Date(2025, 0, 6) // 1月6日
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (26 - 1) * 7)
    
    console.log(`\n📅 基于1月6日的第26周开始日期: ${weekStart.toISOString().split('T')[0]}`)
    
    const week26Corrected = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      week26Corrected.push(date)
    }
    
    console.log('📅 修正后的第26周:')
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    week26Corrected.forEach((date, index) => {
      console.log(`  ${dayNames[index]}: ${date.toISOString().split('T')[0]}`)
    })
    
    const july6InCorrectedWeek26 = week26Corrected.some(date => 
      date.toISOString().split('T')[0] === '2025-07-06'
    )
    console.log(`\n🔍 7月6日是否在修正后的第26周: ${july6InCorrectedWeek26 ? '✅ 是' : '❌ 否'}`)
  }
}

verifyJan5()
