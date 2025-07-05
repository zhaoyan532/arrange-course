'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DataPagination } from "@/components/data-pagination"

interface Student {
  id: string
  name: string
  phone: string
  grade: string
  classroom: string
  createdAt: string
  updatedAt: string
}

interface StudentFormData {
  name: string
  phone: string
  grade: string
  classroom: string
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    phone: '',
    grade: '',
    classroom: '',
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // 创建加载状态
  const [isCreating, setIsCreating] = useState(false)

  // 获取学生列表
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/students?${params}`)
      const data = await response.json()

      if (response.ok) {
        setStudents(data.students)
        setTotalPages(data.pagination.pages)
        setTotalCount(data.pagination.total)
      } else {
        toast.error(data.error || '获取学生列表失败')
      }
    } catch (error) {
      toast.error('获取学生列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchStudents()
  }, [searchTerm])

  // 创建学生
  const handleCreate = async () => {
    if (isCreating) return // 防止重复提交

    try {
      setIsCreating(true)
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('学生创建成功')
        setIsCreateDialogOpen(false)
        setFormData({ name: '', phone: '', grade: '', classroom: '' })
        fetchStudents()
      } else {
        toast.error(data.error || '创建学生失败')
      }
    } catch (error) {
      toast.error('创建学生失败')
    } finally {
      setIsCreating(false)
    }
  }

  // 更新学生
  const handleUpdate = async () => {
    if (!editingStudent) return
    
    try {
      const response = await fetch(`/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('学生信息更新成功')
        setIsEditDialogOpen(false)
        setEditingStudent(null)
        setFormData({ name: '', phone: '', grade: '', classroom: '' })
        fetchStudents()
      } else {
        toast.error(data.error || '更新学生失败')
      }
    } catch (error) {
      toast.error('更新学生失败')
    }
  }

  // 删除学生
  const handleDelete = async (student: Student) => {
    if (!confirm(`确定要删除学生 ${student.name} 吗？`)) return
    
    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('学生删除成功')
        fetchStudents()
      } else {
        toast.error(data.error || '删除学生失败')
      }
    } catch (error) {
      toast.error('删除学生失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      name: student.name,
      phone: student.phone,
      grade: student.grade,
      classroom: student.classroom,
    })
    setIsEditDialogOpen(true)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">学生管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加学生
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新学生</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入学生姓名"
                />
              </div>
              <div>
                <Label htmlFor="phone">手机号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <Label htmlFor="grade">年级</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  placeholder="请输入年级"
                />
              </div>
              <div>
                <Label htmlFor="classroom">教室</Label>
                <Input
                  id="classroom"
                  value={formData.classroom}
                  onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                  placeholder="请输入教室"
                />
              </div>
              <Button
                onClick={handleCreate}
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? '创建中...' : '创建学生'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索框 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索学生姓名、手机号、年级或教室..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 学生列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            学生列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '没有找到匹配的学生' : '还没有学生记录'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>年级</TableHead>
                  <TableHead>教室</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.grade}</Badge>
                    </TableCell>
                    <TableCell>{student.classroom}</TableCell>
                    <TableCell>
                      {new Date(student.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
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

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑学生信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">姓名</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入学生姓名"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">手机号</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="请输入手机号"
              />
            </div>
            <div>
              <Label htmlFor="edit-grade">年级</Label>
              <Input
                id="edit-grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="请输入年级"
              />
            </div>
            <div>
              <Label htmlFor="edit-classroom">教室</Label>
              <Input
                id="edit-classroom"
                value={formData.classroom}
                onChange={(e) => setFormData({ ...formData, classroom: e.target.value })}
                placeholder="请输入教室"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              更新学生信息
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AuthGuard>
  )
}
