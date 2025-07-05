'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, GraduationCap } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DataPagination } from "@/components/data-pagination"

interface Teacher {
  id: string
  name: string
  phone?: string
  email?: string
  subject?: string
  createdAt: string
  updatedAt: string
}

interface TeacherFormData {
  name: string
  phone: string
  email: string
  subject: string
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // 获取教师列表
  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('limit', pageSize.toString())
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/teachers?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTeachers(data.teachers)
        setTotalPages(data.pagination.pages)
        setTotalCount(data.pagination.total)
      } else {
        toast.error(data.error || '获取教师列表失败')
      }
    } catch (error) {
      toast.error('获取教师列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeachers()
  }, [searchTerm, currentPage])

  // 搜索时重置到第一页
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [searchTerm])

  // 创建教师
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教师创建成功')
        setIsCreateDialogOpen(false)
        setFormData({ name: '', phone: '', email: '', subject: '' })
        fetchTeachers()
      } else {
        toast.error(data.error || '创建教师失败')
      }
    } catch (error) {
      toast.error('创建教师失败')
    }
  }

  // 更新教师
  const handleUpdate = async () => {
    if (!editingTeacher) return
    
    try {
      const response = await fetch(`/api/teachers/${editingTeacher.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教师信息更新成功')
        setIsEditDialogOpen(false)
        setEditingTeacher(null)
        setFormData({ name: '', phone: '', email: '', subject: '' })
        fetchTeachers()
      } else {
        toast.error(data.error || '更新教师失败')
      }
    } catch (error) {
      toast.error('更新教师失败')
    }
  }

  // 删除教师
  const handleDelete = async (teacher: Teacher) => {
    if (!confirm(`确定要删除教师 ${teacher.name} 吗？`)) return
    
    try {
      const response = await fetch(`/api/teachers/${teacher.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教师删除成功')
        fetchTeachers()
      } else {
        toast.error(data.error || '删除教师失败')
      }
    } catch (error) {
      toast.error('删除教师失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (teacher: Teacher) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      phone: teacher.phone || '',
      email: teacher.email || '',
      subject: teacher.subject || '',
    })
    setIsEditDialogOpen(true)
  }

  return (
    <AuthGuard requiredRole="ADMIN">
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">教师管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加教师
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新教师</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">姓名 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入教师姓名"
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
                <Label htmlFor="email">邮箱</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="请输入邮箱"
                />
              </div>
              <div>
                <Label htmlFor="subject">主要科目</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="请输入主要科目"
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                创建教师
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
              placeholder="搜索教师姓名、手机号、邮箱或科目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* 教师列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="w-5 h-5 mr-2" />
            教师列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '没有找到匹配的教师' : '还没有教师记录'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>手机号</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>主要科目</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell>{teacher.phone || '-'}</TableCell>
                    <TableCell>{teacher.email || '-'}</TableCell>
                    <TableCell>
                      {teacher.subject ? (
                        <Badge variant="secondary">{teacher.subject}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(teacher.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(teacher)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(teacher)}
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
            <DialogTitle>编辑教师信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">姓名 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入教师姓名"
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
              <Label htmlFor="edit-email">邮箱</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="请输入邮箱"
              />
            </div>
            <div>
              <Label htmlFor="edit-subject">主要科目</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="请输入主要科目"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full">
              更新教师信息
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AuthGuard>
  )
}
