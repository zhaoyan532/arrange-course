-- 添加新的日期字段
ALTER TABLE "Schedule" ADD COLUMN "schedule_date" TIMESTAMP(3);

-- 将现有的 dayOfWeek 数据转换为具体日期（示例：转换为本周的日期）
-- 这里使用一个基准日期，你可以根据实际需要调整
UPDATE "Schedule" 
SET "schedule_date" = CASE 
  WHEN "day_of_week" = 1 THEN '2024-12-02 00:00:00'::timestamp  -- 周一
  WHEN "day_of_week" = 2 THEN '2024-12-03 00:00:00'::timestamp  -- 周二
  WHEN "day_of_week" = 3 THEN '2024-12-04 00:00:00'::timestamp  -- 周三
  WHEN "day_of_week" = 4 THEN '2024-12-05 00:00:00'::timestamp  -- 周四
  WHEN "day_of_week" = 5 THEN '2024-12-06 00:00:00'::timestamp  -- 周五
  WHEN "day_of_week" = 6 THEN '2024-12-07 00:00:00'::timestamp  -- 周六
  WHEN "day_of_week" = 7 THEN '2024-12-08 00:00:00'::timestamp  -- 周日
  ELSE '2024-12-02 00:00:00'::timestamp
END;

-- 设置新字段为非空
ALTER TABLE "Schedule" ALTER COLUMN "schedule_date" SET NOT NULL;

-- 删除旧的索引
DROP INDEX IF EXISTS "Schedule_studentId_day_of_week_start_time_end_time_idx";
DROP INDEX IF EXISTS "Schedule_teacherId_day_of_week_start_time_end_time_idx";
DROP INDEX IF EXISTS "Schedule_classroomId_day_of_week_start_time_end_time_idx";

-- 删除旧字段
ALTER TABLE "Schedule" DROP COLUMN "day_of_week";

-- 创建新的索引
CREATE INDEX "Schedule_studentId_schedule_date_start_time_end_time_idx" ON "Schedule"("student_id", "schedule_date", "start_time", "end_time");
CREATE INDEX "Schedule_teacherId_schedule_date_start_time_end_time_idx" ON "Schedule"("teacher_id", "schedule_date", "start_time", "end_time");
CREATE INDEX "Schedule_classroomId_schedule_date_start_time_end_time_idx" ON "Schedule"("classroom_id", "schedule_date", "start_time", "end_time");
