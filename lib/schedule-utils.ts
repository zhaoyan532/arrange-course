import { prisma } from '@/lib/prisma'

// 时间重叠检测函数
function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const start1Minutes = timeToMinutes(start1)
  const end1Minutes = timeToMinutes(end1)
  const start2Minutes = timeToMinutes(start2)
  const end2Minutes = timeToMinutes(end2)

  return start1Minutes < end2Minutes && end1Minutes > start2Minutes
}

// 时间转换为分钟数
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 获取冲突检测的辅助函数
export async function checkScheduleConflicts(
  studentId: string,
  teacherId: string,
  classroomId: string,
  scheduleDate: Date,
  startTime: string,
  endTime: string,
  excludeId?: string
) {
  const conflicts = []

  // 检查学生冲突
  const studentConflicts = await prisma.schedule.findMany({
    where: {
      studentId,
      scheduleDate: {
        gte: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate()),
        lt: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate() + 1),
      },
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { subject: true, teacher: true },
  })

  for (const conflict of studentConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'student',
        message: `学生时间冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  // 检查教师冲突
  const teacherConflicts = await prisma.schedule.findMany({
    where: {
      teacherId,
      scheduleDate: {
        gte: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate()),
        lt: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate() + 1),
      },
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { student: true, subject: true },
  })

  for (const conflict of teacherConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'teacher',
        message: `教师时间冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  // 检查教室冲突
  const classroomConflicts = await prisma.schedule.findMany({
    where: {
      classroomId,
      scheduleDate: {
        gte: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate()),
        lt: new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate() + 1),
      },
      ...(excludeId && { id: { not: excludeId } }),
    },
    include: { student: true, teacher: true, subject: true },
  })

  for (const conflict of classroomConflicts) {
    if (isTimeOverlap(startTime, endTime, conflict.startTime, conflict.endTime)) {
      conflicts.push({
        type: 'classroom',
        message: `教室使用冲突：${conflict.subject.name}（${conflict.startTime}-${conflict.endTime}）`,
      })
    }
  }

  return conflicts
}
