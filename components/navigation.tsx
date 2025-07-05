'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Home, User, GraduationCap, Calendar, BookOpen, Building, FileText, LogOut, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  {
    href: '/',
    label: '首页',
    icon: Home,
  },
  {
    href: '/students',
    label: '学生管理',
    icon: User,
  },
  {
    href: '/teachers',
    label: '教师管理',
    icon: GraduationCap,
  },
  {
    href: '/classrooms',
    label: '教室管理',
    icon: Building,
  },
  {
    href: '/schedules',
    label: '排课管理',
    icon: Calendar,
  },
  {
    href: '/student-timetable',
    label: '学生课表',
    icon: BookOpen,
  },
  {
    href: '/teacher-timetable',
    label: '教师课表',
    icon: GraduationCap,
  },
  {
    href: '/operation-logs',
    label: '操作日志',
    icon: FileText,
  },
]

export function Navigation() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // 根据权限过滤导航项
  const filteredNavigationItems = navigationItems.filter(item => {
    // 教师管理只有管理员可以访问
    if (item.href === '/teachers') {
      return user?.role === 'ADMIN'
    }
    return true
  })

  const handleLogout = async () => {
    await logout()
  }

  return (
    <Card className="mb-6 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center">
          <nav className="flex flex-wrap gap-2">
            {filteredNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              )
            })}
          </nav>

          {/* 用户信息和操作 */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-700">
              <div className="font-medium">{user?.name}</div>
              <div className="text-xs text-blue-500">
                {user?.role === 'ADMIN' ? '管理员' : '教师'}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-blue-200">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href="/change-password">
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    修改密码
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
