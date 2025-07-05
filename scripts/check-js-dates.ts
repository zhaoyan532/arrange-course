async function checkJSDates() {
  console.log('🔍 检查JavaScript日期计算...')

  const july5 = new Date('2025-07-05')
  const july6 = new Date('2025-07-06')
  
  console.log(`📅 2025-07-05:`)
  console.log(`  getDay(): ${july5.getDay()} (0=周日, 1=周一, ..., 6=周六)`)
  console.log(`  实际是: ${july5.getDay() === 0 ? '周日' : july5.getDay() === 1 ? '周一' : july5.getDay() === 2 ? '周二' : july5.getDay() === 3 ? '周三' : july5.getDay() === 4 ? '周四' : july5.getDay() === 5 ? '周五' : '周六'}`)
  
  console.log(`\n📅 2025-07-06:`)
  console.log(`  getDay(): ${july6.getDay()} (0=周日, 1=周一, ..., 6=周六)`)
  console.log(`  实际是: ${july6.getDay() === 0 ? '周日' : july6.getDay() === 1 ? '周一' : july6.getDay() === 2 ? '周二' : july6.getDay() === 3 ? '周三' : july6.getDay() === 4 ? '周四' : july6.getDay() === 5 ? '周五' : '周六'}`)

  // 检查一周的日期
  console.log('\n📅 2025年7月第一周:')
  for (let i = 1; i <= 7; i++) {
    const date = new Date(`2025-07-0${i}`)
    console.log(`  7月${i}日: getDay()=${date.getDay()} (${date.getDay() === 0 ? '周日' : date.getDay() === 1 ? '周一' : date.getDay() === 2 ? '周二' : date.getDay() === 3 ? '周三' : date.getDay() === 4 ? '周四' : date.getDay() === 5 ? '周五' : '周六'})`)
  }

  console.log('\n🔍 问题分析:')
  console.log('- JavaScript中 getDay() 返回 0-6，其中 0=周日，1=周一，...，6=周六')
  console.log('- 7月5日 getDay()=6，是周六')
  console.log('- 7月6日 getDay()=0，是周日')
  console.log('- 所以7月6日应该和7月5日在同一周，但我们的计算把它当作了下一周的开始')
}

checkJSDates()
