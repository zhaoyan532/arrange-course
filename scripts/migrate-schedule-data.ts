import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateScheduleData() {
  try {
    console.log('🔄 开始迁移排课数据...')

    // 1. 添加新字段（允许为空）
    console.log('📝 添加 schedule_date 字段...')
    await prisma.$executeRaw`
      ALTER TABLE "schedules" 
      ADD COLUMN IF NOT EXISTS "schedule_date" TIMESTAMP(3);
    `

    // 2. 获取现有数据
    console.log('📊 获取现有排课数据...')
    const existingSchedules = await prisma.$queryRaw<Array<{
      id: string
      dayOfWeek: number
      startTime: string
      endTime: string
    }>>`
      SELECT id, "dayOfWeek", "startTime", "endTime"
      FROM "schedules"
      WHERE schedule_date IS NULL
    `

    console.log(`📋 找到 ${existingSchedules.length} 条需要迁移的数据`)

    // 3. 转换数据：将 day_of_week 转换为具体日期
    // 使用 2024年12月2日（周一）作为基准日期
    const baseDate = new Date('2024-12-02') // 周一

    for (const schedule of existingSchedules) {
      // 计算具体日期
      const dayOffset = schedule.dayOfWeek - 1 // 转换为0-6
      const scheduleDate = new Date(baseDate)
      scheduleDate.setDate(baseDate.getDate() + dayOffset)

      // 更新数据
      await prisma.$executeRaw`
        UPDATE "schedules"
        SET "schedule_date" = ${scheduleDate}
        WHERE "id" = ${schedule.id}
      `

      console.log(`✅ 迁移排课 ${schedule.id}: 星期${schedule.dayOfWeek} → ${scheduleDate.toISOString().split('T')[0]}`)
    }

    // 4. 设置字段为必填
    console.log('🔒 设置 schedule_date 为必填字段...')
    await prisma.$executeRaw`
      ALTER TABLE "schedules" 
      ALTER COLUMN "schedule_date" SET NOT NULL;
    `

    // 5. 删除旧的索引
    console.log('🗑️ 删除旧索引...')
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "schedules_student_id_day_of_week_start_time_end_time_idx";
    `
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "schedules_teacher_id_day_of_week_start_time_end_time_idx";
    `
    await prisma.$executeRaw`
      DROP INDEX IF EXISTS "schedules_classroom_id_day_of_week_start_time_end_time_idx";
    `

    // 6. 删除旧字段
    console.log('🗑️ 删除 dayOfWeek 字段...')
    await prisma.$executeRaw`
      ALTER TABLE "schedules"
      DROP COLUMN IF EXISTS "dayOfWeek";
    `

    // 7. 创建新索引
    console.log('🔍 创建新索引...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "schedules_student_id_schedule_date_start_time_end_time_idx"
      ON "schedules"("student_id", "schedule_date", "startTime", "endTime");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "schedules_teacher_id_schedule_date_start_time_end_time_idx"
      ON "schedules"("teacher_id", "schedule_date", "startTime", "endTime");
    `
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "schedules_classroom_id_schedule_date_start_time_end_time_idx"
      ON "schedules"("classroom_id", "schedule_date", "startTime", "endTime");
    `

    console.log('✅ 数据迁移完成！')
    console.log('🎉 排课系统已升级为基于具体日期的模式')

  } catch (error) {
    console.error('❌ 迁移失败:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// 运行迁移
migrateScheduleData()
  .catch((error) => {
    console.error('迁移脚本执行失败:', error)
    process.exit(1)
  })
