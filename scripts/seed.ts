import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建示例数据...')

  // 创建科目
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { name: '数学' },
      update: {},
      create: { name: '数学', description: '数学基础课程' },
    }),
    prisma.subject.upsert({
      where: { name: '语文' },
      update: {},
      create: { name: '语文', description: '语文基础课程' },
    }),
    prisma.subject.upsert({
      where: { name: '英语' },
      update: {},
      create: { name: '英语', description: '英语基础课程' },
    }),
    prisma.subject.upsert({
      where: { name: '物理' },
      update: {},
      create: { name: '物理', description: '物理基础课程' },
    }),
    prisma.subject.upsert({
      where: { name: '化学' },
      update: {},
      create: { name: '化学', description: '化学基础课程' },
    }),
  ])

  console.log('科目创建完成:', subjects.length)

  // 创建教室
  const classrooms = await Promise.all([
    prisma.classroom.upsert({
      where: { name: 'A101' },
      update: {},
      create: { name: 'A101', capacity: 30, location: 'A栋1楼' },
    }),
    prisma.classroom.upsert({
      where: { name: 'A102' },
      update: {},
      create: { name: 'A102', capacity: 30, location: 'A栋1楼' },
    }),
    prisma.classroom.upsert({
      where: { name: 'B201' },
      update: {},
      create: { name: 'B201', capacity: 25, location: 'B栋2楼' },
    }),
    prisma.classroom.upsert({
      where: { name: 'B202' },
      update: {},
      create: { name: 'B202', capacity: 25, location: 'B栋2楼' },
    }),
    prisma.classroom.upsert({
      where: { name: 'C301' },
      update: {},
      create: { name: 'C301', capacity: 35, location: 'C栋3楼' },
    }),
  ])

  console.log('教室创建完成:', classrooms.length)

  // 创建默认密码哈希
  const defaultPassword = await bcrypt.hash('123456', 10)

  // 创建教师（包含登录信息）
  const teachers = await Promise.all([
    prisma.teacher.upsert({
      where: { phone: '13800138001' },
      update: {},
      create: {
        name: '系统管理员',
        phone: '13800138001',
        email: 'admin@example.com',
        subject: '系统管理',
        password: defaultPassword,
        role: 'ADMIN',
        isActive: true,
      },
    }),
    prisma.teacher.upsert({
      where: { phone: '13800138002' },
      update: {},
      create: {
        name: '张老师',
        phone: '13800138002',
        email: 'zhang@example.com',
        subject: '数学',
        password: defaultPassword,
        role: 'TEACHER',
        isActive: true,
      },
    }),
    prisma.teacher.upsert({
      where: { phone: '13800138003' },
      update: {},
      create: {
        name: '李老师',
        phone: '13800138003',
        email: 'li@example.com',
        subject: '语文',
        password: defaultPassword,
        role: 'TEACHER',
        isActive: true,
      },
    }),
    prisma.teacher.upsert({
      where: { phone: '13800138004' },
      update: {},
      create: {
        name: '王老师',
        phone: '13800138004',
        email: 'wang@example.com',
        subject: '英语',
        password: defaultPassword,
        role: 'TEACHER',
        isActive: true,
      },
    }),
  ])

  console.log('教师创建完成:', teachers.length)

  // 创建学生
  const students = await Promise.all([
    prisma.student.upsert({
      where: { name_phone: { name: '小明', phone: '13900139001' } },
      update: {},
      create: {
        name: '小明',
        phone: '13900139001',
        grade: '高一',
        classroom: 'A101',
      },
    }),
    prisma.student.upsert({
      where: { name_phone: { name: '小红', phone: '13900139002' } },
      update: {},
      create: {
        name: '小红',
        phone: '13900139002',
        grade: '高一',
        classroom: 'A101',
      },
    }),
    prisma.student.upsert({
      where: { name_phone: { name: '小刚', phone: '13900139003' } },
      update: {},
      create: {
        name: '小刚',
        phone: '13900139003',
        grade: '高二',
        classroom: 'B201',
      },
    }),
    prisma.student.upsert({
      where: { name_phone: { name: '小丽', phone: '13900139004' } },
      update: {},
      create: {
        name: '小丽',
        phone: '13900139004',
        grade: '高二',
        classroom: 'B201',
      },
    }),
    prisma.student.upsert({
      where: { name_phone: { name: '小华', phone: '13900139005' } },
      update: {},
      create: {
        name: '小华',
        phone: '13900139005',
        grade: '高三',
        classroom: 'C301',
      },
    }),
  ])

  console.log('学生创建完成:', students.length)

  // 创建一些示例排课
  const schedules = await Promise.all([
    // 小明的课程
    prisma.schedule.create({
      data: {
        studentId: students[0].id,
        teacherId: teachers[0].id,
        subjectId: subjects[0].id,
        classroomId: classrooms[0].id,
        dayOfWeek: 1, // 周一
        startTime: '09:00',
        endTime: '10:00',
        notes: '数学基础课',
      },
    }),
    prisma.schedule.create({
      data: {
        studentId: students[0].id,
        teacherId: teachers[1].id,
        subjectId: subjects[1].id,
        classroomId: classrooms[0].id,
        dayOfWeek: 1, // 周一
        startTime: '10:00',
        endTime: '11:00',
        notes: '语文阅读课',
      },
    }),
    // 小红的课程
    prisma.schedule.create({
      data: {
        studentId: students[1].id,
        teacherId: teachers[0].id,
        subjectId: subjects[0].id,
        classroomId: classrooms[1].id,
        dayOfWeek: 2, // 周二
        startTime: '09:00',
        endTime: '10:00',
        notes: '数学进阶课',
      },
    }),
    // 小刚的课程
    prisma.schedule.create({
      data: {
        studentId: students[2].id,
        teacherId: teachers[2].id,
        subjectId: subjects[2].id,
        classroomId: classrooms[2].id,
        dayOfWeek: 3, // 周三
        startTime: '14:00',
        endTime: '15:00',
        notes: '英语口语课',
      },
    }),
  ])

  console.log('排课创建完成:', schedules.length)
  console.log('示例数据创建完成！')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
