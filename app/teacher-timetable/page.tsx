'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Download, FileText, Image } from "lucide-react"
import { toast } from "sonner"
import { exportTeacherTimetableToExcel, exportTimetableToImage } from "@/lib/export-utils"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"

interface Teacher {
  id: string
  name: string
  subject?: string
  phone?: string
  email?: string
}

interface ClassInfo {
  id: string
  startTime: string
  endTime: string
  subject: string
  student: string
  studentGrade: string
  classroom: string
  notes?: string
}

interface TimetableDay {
  day: number
  dayLabel: string
  classes: ClassInfo[]
}

interface TimetableData {
  teacher: Teacher
  timetable: TimetableDay[]
  schedules: any[]
}

export default function TeacherTimetablePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(1) // 当前选择的周次

  // 获取教师列表
  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers')
      const data = await response.json()
      
      if (response.ok) {
        setTeachers(data.teachers)
      } else {
        toast.error('获取教师列表失败')
      }
    } catch (error) {
      toast.error('获取教师列表失败')
    }
  }

  // 获取教师课表
  const fetchTimetable = async (teacherId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teachers/${teacherId}/timetable`)
      const data = await response.json()
      
      if (response.ok) {
        setTimetableData(data)
      } else {
        toast.error(data.error || '获取课表失败')
        setTimetableData(null)
      }
    } catch (error) {
      toast.error('获取课表失败')
      setTimetableData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selectedTeacherId) {
      fetchTimetable(selectedTeacherId)
    } else {
      setTimetableData(null)
    }
  }, [selectedTeacherId])

  // 导出为 Excel
  const exportToExcel = () => {
    if (!timetableData) return

    try {
      exportTeacherTimetableToExcel(timetableData.teacher, timetableData.timetable)
      toast.success('Excel 导出成功')
    } catch (error) {
      toast.error('Excel 导出失败')
    }
  }

  // 导出为图片
  const exportToImage = async () => {
    if (!timetableData) return

    try {
      await exportTimetableToImage('teacher-timetable', `${timetableData.teacher.name}_课表.png`)
      toast.success('图片导出成功')
    } catch (error) {
      toast.error('图片导出失败')
    }
  }

  // 获取时间段内的课程
  const getClassesForTimeSlot = (day: TimetableDay, timeSlot: string) => {
    return day.classes.filter(cls => {
      const startHour = parseInt(cls.startTime.split(':')[0])
      const slotHour = parseInt(timeSlot.split(':')[0])
      const endHour = parseInt(cls.endTime.split(':')[0])
      
      return startHour <= slotHour && slotHour < endHour
    })
  }

  // 获取指定周次的日期
  const getWeekDates = (weekNumber: number) => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const daysToFirstMonday = (8 - startOfYear.getDay()) % 7
    const firstMonday = new Date(currentYear, 0, 1 + daysToFirstMonday)

    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates(selectedWeek)

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00'
  ]

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">教师课表</h1>
        {timetableData && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportToExcel}>
              <FileText className="w-4 h-4 mr-2" />
              导出 Excel
            </Button>
            <Button variant="outline" onClick={exportToImage}>
              <Image className="w-4 h-4 mr-2" />
              导出图片
            </Button>
          </div>
        )}
      </div>

      {/* 教师选择 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择教师查看课表" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} {teacher.subject && `(${teacher.subject})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 课表显示 */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">加载中...</div>
          </CardContent>
        </Card>
      ) : timetableData ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              {timetableData.teacher.name} 的课表
            </CardTitle>
            <div className="text-sm text-gray-600">
              {timetableData.teacher.subject && `主要科目：${timetableData.teacher.subject}`}
              {timetableData.teacher.phone && ` | 电话：${timetableData.teacher.phone}`}
            </div>
          </CardHeader>
          <CardContent>
            <div id="teacher-timetable" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">时间</TableHead>
                    {timetableData.timetable.map((day) => (
                      <TableHead key={day.day} className="text-center min-w-32">
                        {day.dayLabel}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeSlots.map((timeSlot) => (
                    <TableRow key={timeSlot}>
                      <TableCell className="font-medium">{timeSlot}</TableCell>
                      {timetableData.timetable.map((day) => {
                        const classes = getClassesForTimeSlot(day, timeSlot)
                        return (
                          <TableCell key={day.day} className="p-2">
                            {classes.length > 0 ? (
                              <div className="space-y-1">
                                {classes.map((cls) => (
                                  <div
                                    key={cls.id}
                                    className="bg-green-50 border border-green-200 rounded p-2 text-xs"
                                  >
                                    <div className="font-medium text-green-800">
                                      {cls.subject}
                                    </div>
                                    <div className="text-green-600">
                                      {cls.student} ({cls.studentGrade})
                                    </div>
                                    <div className="text-green-500">
                                      {cls.classroom}
                                    </div>
                                    <div className="text-green-400">
                                      {cls.startTime}-{cls.endTime}
                                    </div>
                                    {cls.notes && (
                                      <div className="text-green-400 mt-1">
                                        {cls.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-gray-300 text-center">-</div>
                            )}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 课程列表 */}
            {timetableData.schedules.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">课程详情</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {timetableData.schedules.map((schedule) => (
                    <Card key={schedule.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{schedule.subject.name}</Badge>
                            <span className="text-sm text-gray-500">
                              {['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'][schedule.dayOfWeek]}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div><strong>学生：</strong>{schedule.student.name} ({schedule.student.grade})</div>
                            <div><strong>教室：</strong>{schedule.classroom.name}</div>
                            <div><strong>时间：</strong>{schedule.startTime}-{schedule.endTime}</div>
                            {schedule.notes && (
                              <div><strong>备注：</strong>{schedule.notes}</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : selectedTeacherId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              该教师暂无课程安排
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              请选择教师查看课表
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AuthGuard>
  )
}
