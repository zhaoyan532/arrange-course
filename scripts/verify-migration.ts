import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyMigration() {
  try {
    console.log('🔍 验证数据库迁移结果...')

    // 检查表结构
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'schedules' 
      ORDER BY ordinal_position;
    `

    console.log('📋 当前 schedules 表结构:')
    console.table(tableInfo)

    // 检查数据
    const schedules = await prisma.$queryRaw`
      SELECT id, schedule_date, "startTime", "endTime"
      FROM "schedules" 
      LIMIT 5;
    `

    console.log('📝 示例排课数据:')
    console.table(schedules)

    const scheduleCount = await prisma.schedule.count()
    console.log(`📊 总排课数量: ${scheduleCount}`)

    console.log('✅ 数据库迁移验证完成！')
    console.log('🎉 现在可以使用基于日期的排课系统了')

  } catch (error) {
    console.error('❌ 验证失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyMigration()
