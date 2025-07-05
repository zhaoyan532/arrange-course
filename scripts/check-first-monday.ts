async function checkFirstMonday() {
  console.log('🔍 检查2025年第一个周一...')

  const yearStart = new Date(2025, 0, 1) // 2025年1月1日
  console.log(`📅 2025年1月1日: getDay()=${yearStart.getDay()} (${yearStart.getDay() === 0 ? '周日' : yearStart.getDay() === 1 ? '周一' : yearStart.getDay() === 2 ? '周二' : yearStart.getDay() === 3 ? '周三' : yearStart.getDay() === 4 ? '周四' : yearStart.getDay() === 5 ? '周五' : '周六'})`)

  // 找到第一个周一
  const firstDayOfWeek = yearStart.getDay()
  const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
  const firstMonday = new Date(yearStart)
  firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

  console.log(`📅 计算的第一个周一: ${firstMonday.toISOString().split('T')[0]} (getDay()=${firstMonday.getDay()})`)

  // 验证1月的前几天
  console.log('\n📅 2025年1月前几天:')
  for (let i = 1; i <= 10; i++) {
    const date = new Date(2025, 0, i)
    console.log(`  1月${i}日: getDay()=${date.getDay()} (${date.getDay() === 0 ? '周日' : date.getDay() === 1 ? '周一' : date.getDay() === 2 ? '周二' : date.getDay() === 3 ? '周三' : date.getDay() === 4 ? '周四' : date.getDay() === 5 ? '周五' : '周六'})`)
  }

  // 手动验证
  console.log('\n🔍 手动验证:')
  console.log('- 1月1日是周三')
  console.log('- 1月2日是周四')
  console.log('- 1月3日是周五')
  console.log('- 1月4日是周六')
  console.log('- 1月5日是周日')
  console.log('- 1月6日是周一 ← 这应该是第一个周一')

  // 重新计算
  console.log('\n🔧 重新计算第一个周一:')
  const jan6 = new Date(2025, 0, 6)
  console.log(`1月6日: getDay()=${jan6.getDay()} (${jan6.getDay() === 1 ? '周一' : '不是周一'})`)
}

checkFirstMonday()
