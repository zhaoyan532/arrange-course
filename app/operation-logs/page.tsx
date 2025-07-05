'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Eye } from "lucide-react"
import { toast } from "sonner"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DataPagination } from "@/components/data-pagination"

interface OperationLog {
  id: string
  operation: string
  tableName: string
  recordId: string
  operatorName: string
  operatorType: string
  oldData?: any
  newData?: any
  description?: string
  createdAt: string
}

export default function OperationLogsPage() {
  const [logs, setLogs] = useState<OperationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTable, setSelectedTable] = useState('')
  const [selectedOperation, setSelectedOperation] = useState('')
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  // 获取操作日志
  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })
      if (searchTerm) params.append('search', searchTerm)
      if (selectedTable && selectedTable !== 'all') params.append('tableName', selectedTable)
      if (selectedOperation && selectedOperation !== 'all') params.append('operation', selectedOperation)

      const response = await fetch(`/api/operation-logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setTotalCount(data.total)
        setTotalPages(Math.ceil(data.total / pageSize))
      } else {
        toast.error(data.error || '获取操作日志失败')
      }
    } catch (error) {
      toast.error('获取操作日志失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [currentPage])

  useEffect(() => {
    setCurrentPage(1)
    fetchLogs()
  }, [searchTerm, selectedTable, selectedOperation])

  // 获取操作类型的显示文本和颜色
  const getOperationDisplay = (operation: string) => {
    switch (operation) {
      case 'CREATE':
        return { text: '创建', color: 'bg-green-100 text-green-800' }
      case 'UPDATE':
        return { text: '更新', color: 'bg-blue-100 text-blue-800' }
      case 'DELETE':
        return { text: '删除', color: 'bg-red-100 text-red-800' }
      default:
        return { text: operation, color: 'bg-gray-100 text-gray-800' }
    }
  }

  // 获取表名的显示文本
  const getTableDisplay = (tableName: string) => {
    switch (tableName) {
      case 'teachers':
        return '教师'
      case 'students':
        return '学生'
      case 'classrooms':
        return '教室'
      case 'subjects':
        return '科目'
      case 'schedules':
        return '排课'
      default:
        return tableName
    }
  }

  // 查看详情
  const viewDetails = (log: OperationLog) => {
    setSelectedLog(log)
    setIsDetailDialogOpen(true)
  }

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">操作日志</h1>
      </div>

      {/* 筛选条件 */}
      <Card className="mb-6 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-blue-700 font-medium">搜索操作者</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
                <Input
                  placeholder="搜索操作者姓名..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">表名筛选</Label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="选择表名" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部表</SelectItem>
                  <SelectItem value="teachers">教师</SelectItem>
                  <SelectItem value="students">学生</SelectItem>
                  <SelectItem value="classrooms">教室</SelectItem>
                  <SelectItem value="subjects">科目</SelectItem>
                  <SelectItem value="schedules">排课</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-blue-700 font-medium">操作类型</Label>
              <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                <SelectTrigger className="border-blue-200 focus:border-blue-400">
                  <SelectValue placeholder="选择操作类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部操作</SelectItem>
                  <SelectItem value="CREATE">创建</SelectItem>
                  <SelectItem value="UPDATE">更新</SelectItem>
                  <SelectItem value="DELETE">删除</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日志列表 */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <FileText className="w-5 h-5 mr-2" />
            操作日志列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              没有找到操作日志
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>操作时间</TableHead>
                  <TableHead>操作类型</TableHead>
                  <TableHead>表名</TableHead>
                  <TableHead>操作者</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const operationDisplay = getOperationDisplay(log.operation)
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={operationDisplay.color}>
                          {operationDisplay.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          {getTableDisplay(log.tableName)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-blue-800">
                        {log.operatorName}
                        <div className="text-xs text-blue-500">
                          {log.operatorType === 'ADMIN' ? '管理员' : '教师'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {log.description || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDetails(log)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
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

      {/* 详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>操作详情</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">操作时间</Label>
                  <p className="text-sm">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="font-medium">操作类型</Label>
                  <p className="text-sm">{getOperationDisplay(selectedLog.operation).text}</p>
                </div>
                <div>
                  <Label className="font-medium">表名</Label>
                  <p className="text-sm">{getTableDisplay(selectedLog.tableName)}</p>
                </div>
                <div>
                  <Label className="font-medium">操作者</Label>
                  <p className="text-sm">{selectedLog.operatorName} ({selectedLog.operatorType === 'ADMIN' ? '管理员' : '教师'})</p>
                </div>
              </div>
              
              {selectedLog.description && (
                <div>
                  <Label className="font-medium">描述</Label>
                  <p className="text-sm">{selectedLog.description}</p>
                </div>
              )}

              {selectedLog.oldData && (
                <div>
                  <Label className="font-medium">操作前数据</Label>
                  <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.oldData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.newData && (
                <div>
                  <Label className="font-medium">操作后数据</Label>
                  <pre className="text-xs bg-blue-50 p-3 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </AuthGuard>
  )
}
