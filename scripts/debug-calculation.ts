async function debugCalculation() {
  console.log('🔍 调试第一个周一的计算...')

  const yearStart = new Date(2025, 0, 1) // 1月1日
  console.log(`📅 yearStart: ${yearStart.toISOString().split('T')[0]} (getDay()=${yearStart.getDay()})`)

  const firstDayOfWeek = yearStart.getDay()
  console.log(`📊 firstDayOfWeek: ${firstDayOfWeek}`)

  // 我们当前的计算
  const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 
                            firstDayOfWeek === 1 ? 0 : 
                            8 - firstDayOfWeek
  console.log(`📊 daysToFirstMonday: ${daysToFirstMonday}`)

  const firstMonday = new Date(yearStart)
  firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)
  console.log(`📅 计算的第一个周一: ${firstMonday.toISOString().split('T')[0]} (getDay()=${firstMonday.getDay()})`)

  // 验证计算
  console.log('\n🔍 验证计算:')
  console.log(`1月1日 + ${daysToFirstMonday}天 = 1月${1 + daysToFirstMonday}日`)

  // 手动验证
  console.log('\n📅 手动验证:')
  for (let i = 1; i <= 10; i++) {
    const date = new Date(2025, 0, i)
    const dayName = date.getDay() === 0 ? '周日' : 
                    date.getDay() === 1 ? '周一' : 
                    date.getDay() === 2 ? '周二' : 
                    date.getDay() === 3 ? '周三' : 
                    date.getDay() === 4 ? '周四' : 
                    date.getDay() === 5 ? '周五' : '周六'
    console.log(`  1月${i}日: ${dayName} (getDay()=${date.getDay()})`)
  }

  console.log('\n🔧 正确的计算应该是:')
  console.log('- 1月1日是周三(3)')
  console.log('- 到下一个周一需要: 8 - 3 = 5天')
  console.log('- 所以第一个周一是: 1月1日 + 5天 = 1月6日')

  // 检查我们的setDate是否有问题
  console.log('\n🔍 检查setDate:')
  const testDate = new Date(2025, 0, 1)
  console.log(`原始日期: ${testDate.toISOString().split('T')[0]}`)
  testDate.setDate(testDate.getDate() + 5)
  console.log(`+5天后: ${testDate.toISOString().split('T')[0]} (getDay()=${testDate.getDay()})`)
}

debugCalculation()
