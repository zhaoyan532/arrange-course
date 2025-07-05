'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Download, FileText, Image } from "lucide-react"
import { toast } from "sonner"
import { exportStudentTimetableToExcel, exportTimetableToImage } from "@/lib/export-utils"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"

interface Student {
  id: string
  name: string
  grade: string
  classroom: string
}

interface ClassInfo {
  id: string
  startTime: string
  endTime: string
  subject: string
  teacher: string
  classroom: string
  notes?: string
}

interface TimetableDay {
  day: number
  dayLabel: string
  classes: ClassInfo[]
}

interface TimetableData {
  student: Student
  timetable: TimetableDay[]
  schedules: any[]
}

export default function StudentTimetablePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(1) // 当前选择的周次

  // 获取指定周次的日期范围
  const getWeekDates = (weekNumber: number) => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    // 假设学期从9月1日开始
    const semesterStart = new Date(currentYear, 8, 1) // 9月1日

    // 找到学期开始的周一
    const startDayOfWeek = semesterStart.getDay()
    const daysToMonday = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    const firstMonday = new Date(semesterStart)
    firstMonday.setDate(semesterStart.getDate() - daysToMonday)

    // 计算指定周次的周一
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    // 生成一周的日期
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      weekDates.push(date)
    }

    return weekDates
  }

  // 格式化日期显示
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students')
      const data = await response.json()
      
      if (response.ok) {
        setStudents(data.students)
      } else {
        toast.error('获取学生列表失败')
      }
    } catch (error) {
      toast.error('获取学生列表失败')
    }
  }

  // 获取学生课表
  const fetchTimetable = async (studentId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/students/${studentId}/timetable`)
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
    fetchStudents()
  }, [])

  useEffect(() => {
    if (selectedStudentId) {
      fetchTimetable(selectedStudentId)
    } else {
      setTimetableData(null)
    }
  }, [selectedStudentId])

  // 导出为 Excel
  const exportToExcel = () => {
    if (!timetableData) return

    try {
      exportStudentTimetableToExcel(timetableData.student, timetableData.timetable)
      toast.success('Excel 导出成功')
    } catch (error) {
      toast.error('Excel 导出失败')
    }
  }

  // 导出为图片
  const exportToImage = async () => {
    if (!timetableData) return

    try {
      await exportTimetableToImage('student-timetable', `${timetableData.student.name}_课表.png`)
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
        <h1 className="text-3xl font-bold">学生课表</h1>
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

      {/* 学生选择和周次选择 */}
      <Card className="mb-6 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-blue-700 font-medium">选择学生</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="请选择学生查看课表" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.name} ({student.grade} - {student.classroom})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">选择周次</Label>
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="请选择周次" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={week.toString()}>
                      第 {week} 周
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {selectedWeek && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-700 text-sm">
                第 {selectedWeek} 周：{weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
              </p>
            </div>
          )}
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
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <BookOpen className="w-5 h-5 mr-2" />
              {timetableData.student.name} 的课表 - 第 {selectedWeek} 周
            </CardTitle>
            <div className="text-sm text-blue-600">
              年级：{timetableData.student.grade} | 教室：{timetableData.student.classroom}
            </div>
            <div className="text-sm text-blue-500">
              {weekDates[0].toLocaleDateString()} - {weekDates[6].toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            <div id="student-timetable" className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">时间</TableHead>
                    {timetableData.timetable.map((day, index) => (
                      <TableHead key={day.day} className="text-center min-w-32">
                        <div className="text-blue-700">{day.dayLabel}</div>
                        <div className="text-xs text-blue-500 font-normal">
                          {weekDates[index]?.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                        </div>
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
                                    className="bg-blue-50 border border-blue-200 rounded p-2 text-xs"
                                  >
                                    <div className="font-medium text-blue-800">
                                      {cls.subject}
                                    </div>
                                    <div className="text-blue-600">
                                      {cls.teacher}
                                    </div>
                                    <div className="text-blue-500">
                                      {cls.classroom}
                                    </div>
                                    <div className="text-blue-400">
                                      {cls.startTime}-{cls.endTime}
                                    </div>
                                    {cls.notes && (
                                      <div className="text-blue-400 mt-1">
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
                    <Card key={schedule.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary">{schedule.subject.name}</Badge>
                            <span className="text-sm text-gray-500">
                              {['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'][schedule.dayOfWeek]}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div><strong>教师：</strong>{schedule.teacher.name}</div>
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
      ) : selectedStudentId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              该学生暂无课程安排
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8 text-gray-500">
              请选择学生查看课表
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </AuthGuard>
  )
}
