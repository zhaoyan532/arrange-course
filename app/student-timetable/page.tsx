'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

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
  // 获取当前周次
  const getCurrentWeek = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(`${currentYear}-01-01`) // 1月1日

    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    // 修正计算：如果1月1日是周日(0)，第一个周一是1月2日(+1天)
    // 如果1月1日是周一(1)，第一个周一就是1月1日(+0天)
    // 如果1月1日是周二(2)，第一个周一是1月7日(+6天)
    // 如果1月1日是周三(3)，第一个周一是1月6日(+5天)
    // 如果1月1日是周四(4)，第一个周一是1月5日(+4天)
    // 如果1月1日是周五(5)，第一个周一是1月4日(+3天)
    // 如果1月1日是周六(6)，第一个周一是1月3日(+2天)
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 :
                              firstDayOfWeek === 1 ? 0 :
                              8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    // 计算当前日期到第一个周一的天数差
    const diffTime = today.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // 如果是周日，需要特殊处理
    const todayDayOfWeek = today.getDay()
    let currentWeek

    if (todayDayOfWeek === 0) {
      // 周日：属于当前周，不是下一周
      currentWeek = Math.floor(diffDays / 7) + 1
    } else {
      // 周一到周六：正常计算
      currentWeek = Math.floor(diffDays / 7) + 1
    }

    return Math.max(1, Math.min(52, currentWeek))
  }

  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek()) // 默认当前周次

  // 获取指定周次的日期范围
  const getWeekDates = (weekNumber: number) => {
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(`${currentYear}-01-01`) // 1月1日

    // 找到今年第一个周一
    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 :
                              firstDayOfWeek === 1 ? 0 :
                              8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    // 计算指定周次的周一
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + (weekNumber - 1) * 7)

    // 生成一周的日期（周一到周日）
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
      const weekDates = getWeekDates(selectedWeek)
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[6].toISOString().split('T')[0]

      const response = await fetch(`/api/students/${studentId}/timetable?startDate=${startDate}&endDate=${endDate}`)
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
  }, [selectedStudentId, selectedWeek])

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



  // 计算课程在时间轴上的位置和高度
  const calculateClassPosition = (cls: any) => {
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number)
      return hours * 60 + minutes
    }

    const startMinutes = parseTime(cls.startTime)
    const endMinutes = parseTime(cls.endTime)
    const duration = endMinutes - startMinutes

    // 时间轴每行高度是80px（h-20），每15分钟一行
    const rowHeight = 80 // px，对应 h-20
    const minutesPerRow = 15

    // 计算课程高度：根据时长计算需要多少行
    const rowsNeeded = duration / minutesPerRow
    const height = Math.max(rowsNeeded * rowHeight, 60) // 最小高度60px

    // 计算课程位置：找到课程开始时间在时间轴中的位置
    const startTimeIndex = timeSlots.findIndex(slot => slot === cls.startTime)
    const top = startTimeIndex >= 0 ? startTimeIndex * rowHeight : 0

    return { top, height }
  }


  const weekDates = getWeekDates(selectedWeek)

  // 生成动态时间段 - 根据实际课程时间生成
  const generateTimeSlots = () => {
    const slots = new Set<string>()

    // 添加常用时间段
    for (let hour = 8; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.add(timeString)
      }
    }

    // 添加实际课程的开始时间
    if (timetableData) {
      timetableData.timetable.forEach(day => {
        day.classes.forEach(cls => {
          slots.add(cls.startTime)
        })
      })
    }

    return Array.from(slots).sort()
  }

  const timeSlots = generateTimeSlots()

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
                  {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
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
              {/* 时间轴样式课表 */}
              <div className="border rounded-lg bg-white">
                {/* 表头 */}
                <div className="grid grid-cols-8 border-b bg-gray-50">
                  <div className="p-3 font-medium border-r">时间</div>
                  {timetableData.timetable.map((day, index) => (
                    <div key={day.day} className="p-3 text-center border-r last:border-r-0">
                      <div className="text-blue-700 font-medium">{day.dayLabel}</div>
                      <div className="text-xs text-blue-500">
                        {weekDates[index]?.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 时间轴内容区域 */}
                <div className="grid grid-cols-8">
                  {/* 时间轴列 */}
                  <div className="border-r bg-gray-50">
                    {timeSlots.map((timeSlot) => (
                      <div
                        key={timeSlot}
                        className="h-20 flex items-start px-3 py-2 text-sm font-medium border-b last:border-b-0"
                      >
                        {timeSlot}
                      </div>
                    ))}
                  </div>

                  {/* 每一天的课程列 */}
                  {timetableData.timetable.map((day) => (
                    <div key={day.day} className="relative border-r last:border-r-0">
                      {/* 时间格子背景 */}
                      {timeSlots.map((timeSlot) => (
                        <div
                          key={timeSlot}
                          className="h-20 border-b last:border-b-0 border-gray-100"
                        />
                      ))}

                      {/* 课程块 - 绝对定位 */}
                      {day.classes.map((cls: any) => {
                        const position = calculateClassPosition(cls)
                        return (
                          <div
                            key={cls.id}
                            className="absolute left-1 right-1 bg-blue-50 border border-blue-200 rounded p-2 text-xs shadow-sm z-10"
                            style={{
                              top: `${position.top}px`,
                              height: `${position.height}px`,
                            }}
                          >
                            <div className="font-medium text-blue-800 truncate">{cls.subject}</div>
                            <div className="text-blue-600 truncate">{cls.teacher}</div>
                            <div className="text-blue-500 truncate">{cls.classroom}</div>
                            <div className="text-blue-400 text-xs mt-1">{cls.startTime}-{cls.endTime}</div>
                            {cls.notes && (
                              <div className="text-blue-400 text-xs truncate">{cls.notes}</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
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
