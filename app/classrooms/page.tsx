'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Building } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DataPagination } from "@/components/data-pagination"

interface Classroom {
  id: string
  name: string
  capacity?: number
  location?: string
  createdAt: string
  updatedAt: string
}

interface ClassroomFormData {
  name: string
  capacity: string
  location: string
}

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null)
  const [formData, setFormData] = useState<ClassroomFormData>({
    name: '',
    capacity: '',
    location: '',
  })

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 10

  // 获取教室列表
  const fetchClassrooms = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/classrooms?${params}`)
      const data = await response.json()

      if (response.ok) {
        setClassrooms(data.classrooms)
        setTotalPages(data.pagination.pages)
        setTotalCount(data.pagination.total)
      } else {
        toast.error(data.error || '获取教室列表失败')
      }
    } catch (error) {
      toast.error('获取教室列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClassrooms()
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchClassrooms()
  }, [searchTerm])

  // 创建教室
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教室创建成功')
        setIsCreateDialogOpen(false)
        setFormData({ name: '', capacity: '', location: '' })
        fetchClassrooms()
      } else {
        toast.error(data.error || '创建教室失败')
      }
    } catch (error) {
      toast.error('创建教室失败')
    }
  }

  // 更新教室
  const handleUpdate = async () => {
    if (!editingClassroom) return
    
    try {
      const response = await fetch(`/api/classrooms/${editingClassroom.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教室信息更新成功')
        setIsEditDialogOpen(false)
        setEditingClassroom(null)
        setFormData({ name: '', capacity: '', location: '' })
        fetchClassrooms()
      } else {
        toast.error(data.error || '更新教室失败')
      }
    } catch (error) {
      toast.error('更新教室失败')
    }
  }

  // 删除教室
  const handleDelete = async (classroom: Classroom) => {
    if (!confirm(`确定要删除教室 ${classroom.name} 吗？`)) return
    
    try {
      const response = await fetch(`/api/classrooms/${classroom.id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('教室删除成功')
        fetchClassrooms()
      } else {
        toast.error(data.error || '删除教室失败')
      }
    } catch (error) {
      toast.error('删除教室失败')
    }
  }

  // 打开编辑对话框
  const openEditDialog = (classroom: Classroom) => {
    setEditingClassroom(classroom)
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity?.toString() || '',
      location: classroom.location || '',
    })
    setIsEditDialogOpen(true)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">教室管理</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              添加教室
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新教室</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">教室名称 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入教室名称"
                />
              </div>
              <div>
                <Label htmlFor="capacity">容量</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="请输入教室容量"
                />
              </div>
              <div>
                <Label htmlFor="location">位置</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="请输入教室位置"
                />
              </div>
              <Button onClick={handleCreate} className="w-full bg-blue-600 hover:bg-blue-700">
                创建教室
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 搜索框 */}
      <Card className="mb-6 border-blue-200">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="搜索教室名称或位置..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-blue-200 focus:border-blue-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* 教室列表 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Building className="w-5 h-5 mr-2" />
            教室列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : classrooms.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '没有找到匹配的教室' : '还没有教室记录'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>教室名称</TableHead>
                  <TableHead>容量</TableHead>
                  <TableHead>位置</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.map((classroom) => (
                  <TableRow key={classroom.id}>
                    <TableCell className="font-medium text-blue-800">{classroom.name}</TableCell>
                    <TableCell>
                      {classroom.capacity ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          {classroom.capacity}人
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{classroom.location || '-'}</TableCell>
                    <TableCell>
                      {new Date(classroom.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(classroom)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(classroom)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
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
            <DialogTitle>编辑教室信息</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">教室名称 *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入教室名称"
              />
            </div>
            <div>
              <Label htmlFor="edit-capacity">容量</Label>
              <Input
                id="edit-capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="请输入教室容量"
              />
            </div>
            <div>
              <Label htmlFor="edit-location">位置</Label>
              <Input
                id="edit-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="请输入教室位置"
              />
            </div>
            <Button onClick={handleUpdate} className="w-full bg-blue-600 hover:bg-blue-700">
              更新教室信息
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </AuthGuard>
  )
}
