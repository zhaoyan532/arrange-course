import { NextRequest, NextResponse } from 'next/server'
import { getOperationLogs, getOperationStats } from '@/lib/operation-log'

// GET - 获取操作日志
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const tableName = searchParams.get('tableName') || ''
    const operation = searchParams.get('operation') || ''

    const offset = (page - 1) * limit

    const options: any = {
      limit,
      offset,
    }

    if (tableName) options.tableName = tableName
    if (search) options.operatorName = search

    // 如果指定了操作类型，需要在数据库查询中处理
    // 这里简化处理，实际应该在 getOperationLogs 函数中支持 operation 参数
    const logs = await getOperationLogs(options)
    
    // 如果指定了操作类型，在内存中过滤
    const filteredLogs = operation 
      ? logs.filter(log => log.operation === operation)
      : logs

    return NextResponse.json({
      logs: filteredLogs,
      pagination: {
        page,
        limit,
        total: filteredLogs.length,
      },
    })
  } catch (error) {
    console.error('获取操作日志失败:', error)
    return NextResponse.json(
      { error: '获取操作日志失败' },
      { status: 500 }
    )
  }
}
