'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

interface DataPaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
  showInfo?: boolean
}

export function DataPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  className,
  showInfo = true
}: DataPaginationProps) {
  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisiblePages = 7 // 最多显示7个页码

    if (totalPages <= maxVisiblePages) {
      // 如果总页数小于等于最大显示页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 复杂分页逻辑
      if (currentPage <= 4) {
        // 当前页在前面
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // 当前页在后面
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // 当前页在中间
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  // 计算显示的记录范围
  const startRecord = (currentPage - 1) * pageSize + 1
  const endRecord = Math.min(currentPage * pageSize, totalCount)



  return (
    <div className={cn("flex items-center justify-between mt-6", className)}>
      {/* 记录信息 */}
      {showInfo && (
        <div className="text-sm text-gray-600">
          显示第 {startRecord} - {endRecord} 条，共 {totalCount} 条记录
        </div>
      )}

      {/* 分页控件 */}
      <div className={cn("flex items-center space-x-2", !showInfo && "mx-auto")}>
        {/* 上一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一页</span>
        </Button>

        {/* 页码按钮 */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className="px-2">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              )
            }

            const pageNum = page as number
            const isCurrentPage = pageNum === currentPage

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "min-w-[40px]",
                  isCurrentPage && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>

        {/* 下一页按钮 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center space-x-1"
        >
          <span>下一页</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

// 简化版分页组件（用于空间较小的地方）
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className
}: Omit<DataPaginationProps, 'totalCount' | 'pageSize' | 'showInfo'>) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn("flex items-center justify-center space-x-2 mt-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <span className="text-sm text-gray-600 px-4">
        第 {currentPage} / {totalPages} 页
      </span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}
