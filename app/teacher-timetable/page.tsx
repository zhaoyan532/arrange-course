'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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

interface TimetableClass {
  id: string
  subject: string
  student: string
  studentGrade: string
  classroom: string
  startTime: string
  endTime: string
  notes?: string
}

interface TimetableDay {
  day: string
  dayLabel: string
  date: string
  classes: TimetableClass[]
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

  // 获取当前周次
  const getCurrentWeek = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(`${currentYear}-01-01`)

    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 :
                              firstDayOfWeek === 1 ? 0 :
                              8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

    const diffTime = today.getTime() - firstMonday.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    const todayDayOfWeek = today.getDay()
    let currentWeek

    if (todayDayOfWeek === 0) {
      currentWeek = Math.floor(diffDays / 7) + 1
    } else {
      currentWeek = Math.floor(diffDays / 7) + 1
    }

    return Math.max(1, Math.min(52, currentWeek))
  }

  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek())

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

  // 获取指定周次的日期
  const getWeekDates = (weekNumber: number) => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const yearStart = new Date(`${currentYear}-01-01`)

    const firstDayOfWeek = yearStart.getDay()
    const daysToFirstMonday = firstDayOfWeek === 0 ? 1 :
                              firstDayOfWeek === 1 ? 0 :
                              8 - firstDayOfWeek
    const firstMonday = new Date(yearStart)
    firstMonday.setDate(yearStart.getDate() + daysToFirstMonday)

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

  // 获取教师课表
  const fetchTimetable = async (teacherId: string) => {
    try {
      setLoading(true)
      const weekDates = getWeekDates(selectedWeek)
      const startDate = weekDates[0].toISOString().split('T')[0]
      const endDate = weekDates[6].toISOString().split('T')[0]

      const response = await fetch(`/api/teachers/${teacherId}/timetable?startDate=${startDate}&endDate=${endDate}`)
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
  }, [selectedTeacherId, selectedWeek])

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
  const timeSlots = generateTimeSlots()

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

        {/* 教师选择和周次选择 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="teacher-select">选择教师</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger id="teacher-select">
                    <SelectValue placeholder="请选择教师" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>{teacher.name}</span>
                          {teacher.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {teacher.subject}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-32">
                <Label htmlFor="week-select">选择周次</Label>
                <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                  <SelectTrigger id="week-select">
                    <SelectValue />
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
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>{timetableData.teacher.name} 的课表</span>
                <span className="text-sm font-normal text-gray-500">
                  ({weekDates[0]?.toLocaleDateString('zh-CN')} - {weekDates[6]?.toLocaleDateString('zh-CN')})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div id="teacher-timetable" className="overflow-x-auto">
                {/* 时间轴样式课表 */}
                <div className="border rounded-lg bg-white">
                  {/* 表头 */}
                  <div className="grid grid-cols-8 border-b bg-gray-50">
                    <div className="p-3 font-medium border-r">时间</div>
                    {timetableData.timetable.map((day, index) => (
                      <div key={day.day} className="p-3 text-center border-r last:border-r-0">
                        <div className="font-medium">{day.dayLabel}</div>
                        <div className="text-xs text-gray-500">
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
                              className="absolute left-1 right-1 bg-green-50 border border-green-200 rounded p-2 text-xs shadow-sm z-10"
                              style={{
                                top: `${position.top}px`,
                                height: `${position.height}px`,
                              }}
                            >
                              <div className="font-medium text-green-800 truncate">{cls.subject}</div>
                              <div className="text-green-600 truncate">{cls.student} ({cls.studentGrade})</div>
                              <div className="text-green-500 truncate">{cls.classroom}</div>
                              <div className="text-green-400 text-xs mt-1">{cls.startTime}-{cls.endTime}</div>
                              {cls.notes && (
                                <div className="text-green-400 text-xs truncate">{cls.notes}</div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
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