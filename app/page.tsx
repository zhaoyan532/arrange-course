'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, GraduationCap, Calendar, BookOpen, Building, FileText } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const { user } = useAuth()
  const allFeatures = [
    {
      title: '学生管理',
      description: '管理学生信息，包括姓名、手机号、年级和教室',
      icon: User,
      href: '/students',
      color: 'bg-blue-500',
    },
    {
      title: '教师管理',
      description: '管理教师信息，包括姓名、联系方式和主要科目',
      icon: GraduationCap,
      href: '/teachers',
      color: 'bg-green-500',
      requireAdmin: true, // 只有管理员可以访问
    },
    {
      title: '排课管理',
      description: '创建和管理课程安排，自动检测时间冲突',
      icon: Calendar,
      href: '/schedules',
      color: 'bg-purple-500',
    },
    {
      title: '学生课表',
      description: '查看学生的课程表，支持导出功能',
      icon: BookOpen,
      href: '/student-timetable',
      color: 'bg-orange-500',
    },
    {
      title: '教室管理',
      description: '管理教室信息，包括教室名称、容量和位置',
      icon: Building,
      href: '/classrooms',
      color: 'bg-cyan-500',
    },
    {
      title: '教师课表',
      description: '查看教师的课程表，支持导出功能',
      icon: GraduationCap,
      href: '/teacher-timetable',
      color: 'bg-red-500',
    },
    {
      title: '操作日志',
      description: '查看系统操作记录，包括增删改操作',
      icon: FileText,
      href: '/operation-logs',
      color: 'bg-gray-500',
    },
  ]

  // 根据用户权限过滤功能
  const features = allFeatures.filter(feature => {
    if (feature.requireAdmin) {
      return user?.role === 'ADMIN'
    }
    return true
  })

  return (
    <AuthGuard>
      <div className="container mx-auto p-6">
        <Navigation />
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">排课系统</h1>
        <p className="text-gray-600 text-lg">
          专为教师设计的智能排课管理系统，支持学生管理、课程安排和课表生成
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card key={feature.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{feature.description}</p>
                <Link href={feature.href}>
                  <Button className="w-full">
                    进入管理
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="bg-gray-50">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">系统特色</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div>
                <h3 className="font-semibold mb-2">智能冲突检测</h3>
                <p className="text-gray-600">
                  自动检测学生、教师和教室的时间冲突，确保排课的合理性
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">课表生成</h3>
                <p className="text-gray-600">
                  支持生成 HTML 格式的课表，并可导出为 Excel 文件和图片
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">数据管理</h3>
                <p className="text-gray-600">
                  完整的学生和教师信息管理，支持搜索和批量操作
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </AuthGuard>
  )
}
