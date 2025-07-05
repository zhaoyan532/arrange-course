import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDatabaseStructure() {
  try {
    console.log('🔍 检查数据库结构...')

    // 检查 schedules 表的结构
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'schedules' 
      ORDER BY ordinal_position;
    `

    console.log('📋 schedules 表结构:')
    console.table(tableInfo)

    // 检查现有数据
    const scheduleCount = await prisma.schedule.count()
    console.log(`📊 现有排课数据: ${scheduleCount} 条`)

    if (scheduleCount > 0) {
      // 尝试获取一条数据看看结构
      const sampleData = await prisma.$queryRaw`
        SELECT * FROM "schedules" LIMIT 1;
      `
      console.log('📝 示例数据:')
      console.log(sampleData)
    }

  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabaseStructure()
