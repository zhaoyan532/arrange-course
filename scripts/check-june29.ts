async function checkJune29() {
  console.log('🔍 检查6月29日是星期几...')

  const june29 = new Date('2025-06-29')
  console.log(`📅 2025-06-29: getDay()=${june29.getDay()}`)
  console.log(`实际是: ${june29.getDay() === 0 ? '周日' : june29.getDay() === 1 ? '周一' : june29.getDay() === 2 ? '周二' : june29.getDay() === 3 ? '周三' : june29.getDay() === 4 ? '周四' : june29.getDay() === 5 ? '周五' : '周六'}`)

  console.log('\n📅 6月最后一周:')
  for (let i = 29; i <= 30; i++) {
    const date = new Date(`2025-06-${i}`)
    console.log(`  6月${i}日: getDay()=${date.getDay()} (${date.getDay() === 0 ? '周日' : date.getDay() === 1 ? '周一' : date.getDay() === 2 ? '周二' : date.getDay() === 3 ? '周三' : date.getDay() === 4 ? '周四' : date.getDay() === 5 ? '周五' : '周六'})`)
  }

  console.log('\n📅 7月第一周:')
  for (let i = 1; i <= 7; i++) {
    const date = new Date(`2025-07-0${i}`)
    console.log(`  7月${i}日: getDay()=${date.getDay()} (${date.getDay() === 0 ? '周日' : date.getDay() === 1 ? '周一' : date.getDay() === 2 ? '周二' : date.getDay() === 3 ? '周三' : date.getDay() === 4 ? '周四' : date.getDay() === 5 ? '周五' : '周六'})`)
  }

  console.log('\n🔍 正确的第26周应该是:')
  console.log('- 周一: 6月30日')
  console.log('- 周二: 7月1日')
  console.log('- 周三: 7月2日')
  console.log('- 周四: 7月3日')
  console.log('- 周五: 7月4日')
  console.log('- 周六: 7月5日')
  console.log('- 周日: 7月6日')

  console.log('\n❌ 我们当前的计算错误地认为:')
  console.log('- 周一: 6月29日 (实际是周日)')
  console.log('- 周二: 6月30日 (实际是周一)')
  console.log('- ...')
  console.log('- 周日: 7月5日 (实际是周六)')
  console.log('- 遗漏了7月6日(周日)')
}

checkJune29()
