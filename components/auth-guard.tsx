'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN' | 'TEACHER'
  fallback?: React.ReactNode
}

export function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-blue-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // 会被重定向到登录页
  }

  // 检查权限
  if (requiredRole) {
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">权限不足</h1>
            <p className="text-gray-600">您没有访问此页面的权限</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// 权限检查 Hook
export function usePermission() {
  const { user } = useAuth()

  const hasPermission = (requiredRole: 'ADMIN' | 'TEACHER') => {
    if (!user) return false
    
    if (requiredRole === 'ADMIN') {
      return user.role === 'ADMIN'
    }
    
    return user.role === 'ADMIN' || user.role === 'TEACHER'
  }

  const canManageTeachers = () => {
    return user?.role === 'ADMIN'
  }

  return {
    user,
    hasPermission,
    canManageTeachers,
    isAdmin: user?.role === 'ADMIN',
    isTeacher: user?.role === 'TEACHER',
  }
}
