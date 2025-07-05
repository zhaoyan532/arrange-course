import { prisma } from './prisma'

export interface LogOperationParams {
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  tableName: string
  recordId: string
  operatorName: string
  operatorType: 'TEACHER' | 'ADMIN'
  oldData?: any
  newData?: any
  description?: string
}

// 记录操作日志
export async function logOperation(params: LogOperationParams) {
  try {
    await prisma.operationLog.create({
      data: {
        operation: params.operation,
        tableName: params.tableName,
        recordId: params.recordId,
        operatorName: params.operatorName,
        operatorType: params.operatorType,
        oldData: params.oldData || null,
        newData: params.newData || null,
        description: params.description || null,
      },
    })
  } catch (error) {
    console.error('记录操作日志失败:', error)
    // 日志记录失败不应该影响主要操作，所以这里只记录错误但不抛出异常
  }
}

// 获取操作日志
export async function getOperationLogs(options?: {
  tableName?: string
  recordId?: string
  operatorName?: string
  limit?: number
  offset?: number
}) {
  const where: any = {}
  
  if (options?.tableName) where.tableName = options.tableName
  if (options?.recordId) where.recordId = options.recordId
  if (options?.operatorName) where.operatorName = options.operatorName

  const logs = await prisma.operationLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: options?.limit || 50,
    skip: options?.offset || 0,
  })

  return logs
}

// 获取特定表的操作统计
export async function getOperationStats(tableName?: string) {
  const where = tableName ? { tableName } : {}
  
  const stats = await prisma.operationLog.groupBy({
    by: ['operation'],
    where,
    _count: {
      operation: true,
    },
  })

  return stats.reduce((acc, stat) => {
    acc[stat.operation] = stat._count.operation
    return acc
  }, {} as Record<string, number>)
}

// 清理旧日志（保留最近30天的日志）
export async function cleanupOldLogs() {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const result = await prisma.operationLog.deleteMany({
    where: {
      createdAt: {
        lt: thirtyDaysAgo,
      },
    },
  })

  return result.count
}
