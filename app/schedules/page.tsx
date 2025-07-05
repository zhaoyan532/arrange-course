'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DataPagination } from "@/components/data-pagination"
import { TimeSelect } from "@/components/ui/time-select"

interface Student {
  id: string
  name: string
  grade: string
}

interface Teacher {
  id: string
  name: string
  subject?: string
}

interface Subject {
  id: string
  name: string
}

interface Classroom {
  id: string
  name: string
}

interface Schedule {
  id: string
  scheduleDate: string
  startTime: string
  endTime: string
  notes?: string
  student: Student
  teacher: Teacher
  subject: Subject
  classroom: Classroom
}

interface ScheduleFormData {
  studentId: string
  teacherId: string
  subjectId: string
  classroomId: string
  scheduleDate: string
  startTime: string
  endTime: string
  notes: string
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    studentId: '',
    teacherId: '',
    subjectId: '',
    classroomId: '',
    scheduleDate: '',
    startTime: '',
    endTime: '',
    notes: '',
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // 创建加载状态
  const [isCreating, setIsCreating] = useState(false)

  // 获取所有数据
  const fetchData = async () => {
    try {
      setLoading(true)

      // 获取排课数据（带分页）
      const schedulesParams = new URLSearchParams()
      schedulesParams.append('page', currentPage.toString())
      schedulesParams.append('limit', pageSize.toString())

      const [schedulesRes, studentsRes, teachersRes, subjectsRes, classroomsRes] = await Promise.all([
        fetch(`/api/schedules?${schedulesParams}`),
        fetch('/api/students'),
        fetch('/api/teachers'),
        fetch('/api/subjects'),
        fetch('/api/classrooms'),
      ])

      const [schedulesData, studentsData, teachersData, subjectsData, classroomsData] = await Promise.all([
        schedulesRes.json(),
        studentsRes.json(),
        teachersRes.json(),
        subjectsRes.json(),
        classroomsRes.json(),
      ])

      if (schedulesRes.ok) {
        setSchedules(schedulesData.schedules)
        setTotalPages(schedulesData.pagination.pages)
        setTotalCount(schedulesData.pagination.total)
      }
      if (studentsRes.ok) setStudents(studentsData.students)
      if (teachersRes.ok) setTeachers(teachersData.teachers)
      if (subjectsRes.ok) setSubjects(subjectsData.subjects)
      if (classroomsRes.ok) setClassrooms(classroomsData.classrooms)
    } catch (error) {
      toast.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [currentPage])

  // 创建排课
  const handleCreate = async () => {
    if (isCreating) return // 防止重复提交

    // 验证表单数据
    if (!formData.studentId || !formData.teacherId || !formData.subjectId ||
        !formData.classroomId || !formData.scheduleDate || !formData.startTime || !formData.endTime) {
      toast.error('请填写所有必填字段')
      return
    }

    // 验证时间
    if (formData.startTime >= formData.endTime) {
      toast.error('结束时间必须晚于开始时间')
      return
    }

    try {
      setIsCreating(true)
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('排课创建成功')
        setIsCreateDialogOpen(false)
        setFormData({
          studentId: '',
          teacherId: '',
          subjectId: '',
          classroomId: '',
          scheduleDate: '',
          startTime: '',
          endTime: '',
          notes: '',
        })
        fetchData()
      } else {
        toast.error(data.error || '创建排课失败')
      }
    } catch (error) {
      toast.error('创建排课失败')
    } finally {
      setIsCreating(false)
    }
  }

  // 格式化日期显示
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    })
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">排课管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加排课
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>添加新排课</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="student">学生 *</Label>
                <Select value={formData.studentId} onValueChange={(value) => setFormData({ ...formData, studentId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择学生" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} ({student.grade})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="teacher">教师 *</Label>
                <Select value={formData.teacherId} onValueChange={(value) => setFormData({ ...formData, teacherId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择教师" />
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

              <div>
                <Label htmlFor="subject">科目 *</Label>
                <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择科目" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="classroom">教室 *</Label>
                <Select value={formData.classroomId} onValueChange={(value) => setFormData({ ...formData, classroomId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择教室" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem key={classroom.id} value={classroom.id}>
                        {classroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="scheduleDate">上课日期 *</Label>
                <Input
                  id="scheduleDate"
                  type="date"
                  value={formData.scheduleDate}
                  onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]} // 不能选择过去的日期
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">开始时间 *</Label>
                  <TimeSelect
                    value={formData.startTime}
                    onChange={(value) => setFormData({ ...formData, startTime: value })}
                    placeholder="选择开始时间"
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">结束时间 *</Label>
                  <TimeSelect
                    value={formData.endTime}
                    onChange={(value) => setFormData({ ...formData, endTime: value })}
                    placeholder="选择结束时间"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">备注</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="请输入备注"
                />
              </div>

              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? '创建中...' : '创建排课'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 排课列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            排课列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              还没有排课记录
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>学生</TableHead>
                  <TableHead>教师</TableHead>
                  <TableHead>科目</TableHead>
                  <TableHead>教室</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead>备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.student.name}
                      <div className="text-sm text-gray-500">{schedule.student.grade}</div>
                    </TableCell>
                    <TableCell>{schedule.teacher.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{schedule.subject.name}</Badge>
                    </TableCell>
                    <TableCell>{schedule.classroom.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(schedule.scheduleDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{schedule.startTime}-{schedule.endTime}</span>
                      </div>
                    </TableCell>
                    <TableCell>{schedule.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* 分页控件 */}
          <DataPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
      </div>
    </AuthGuard>
  )
}
