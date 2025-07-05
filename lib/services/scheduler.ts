/**
 * Next.js内置定时任务调度器
 * 使用Node.js定时器实现邮件提醒的定时发送
 */

import { emailSubscriptionService } from './database'

class EmailScheduler {
  private intervals: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  /**
   * 启动定时任务
   */


  /**
   * 停止定时任务
   */
  stop() {
    console.log('🛑 Stopping email scheduler...')
    
    this.intervals.forEach((interval, name) => {
      clearInterval(interval)
      console.log(`  Stopped: ${name}`)
    })
    
    this.intervals.clear()
    this.isRunning = false
    console.log('✅ Email scheduler stopped')
  }

  /**
   * 记录结果到日志文件
   */
  private logResults(results: any) {
    try {
      const fs = require('fs')
      const path = require('path')
      
      const logDir = path.join(process.cwd(), 'logs')
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      const logFile = path.join(logDir, 'scheduler.log')
      const logEntry = `${results.timestamp} - Processed: ${results.totalUsers}, Sent: ${results.sent}, Failed: ${results.failed}\n`
      
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Failed to write log:', error)
    }
  }

  /**
   * 获取调度器状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeIntervals: Array.from(this.intervals.keys()),
      nextCheck: this.isRunning ? 'Within 24 hours' : 'Not scheduled'
    }
  }

}

// 创建全局实例

// 调度器实例已创建，初始化由 init-scheduler.ts 处理 