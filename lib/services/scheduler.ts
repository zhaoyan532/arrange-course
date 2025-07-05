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
  start() {
    if (this.isRunning) {
      console.log('📅 Scheduler already running')
      return
    }

    this.isRunning = true
    console.log('🚀 Starting email scheduler...')

    // 每天检查一次是否需要发送提醒邮件
    const dailyCheck = setInterval(async () => {
      await this.checkAndSendReminders()
    }, 24 * 60 * 60 * 1000) // 24小时

    // 立即执行一次检查
    this.checkAndSendReminders()

    this.intervals.set('dailyCheck', dailyCheck)
    console.log('✅ Email scheduler started successfully')
  }

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
   * 检查并发送提醒邮件
   */
  private async checkAndSendReminders() {
    try {
      console.log('🔍 Checking for users needing reminders...')
      
      const reminderMonths = parseInt(process.env.REMINDER_INTERVAL_MONTHS || '3')
      const subscribers = await emailSubscriptionService.getSubscribersForReminder(reminderMonths)
      
      if (subscribers.length === 0) {
        console.log('📭 No users need reminders at this time')
        return
      }

      console.log(`📧 Found ${subscribers.length} users needing reminders`)

      // 批量发送提醒邮件
      let sent = 0
      let failed = 0

      for (const subscriber of subscribers) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-reminder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: subscriber.email,
              userId: subscriber.user_id,
              testMode: false
            })
          })

          const data = await response.json()
          
          if (data.success) {
            sent++
            console.log(`  ✅ Sent to: ${subscriber.email}`)
          } else {
            failed++
            console.log(`  ❌ Failed to send to: ${subscriber.email} - ${data.error}`)
          }

          // 添加延迟避免速率限制
          await new Promise(resolve => setTimeout(resolve, 1000))
          
        } catch (error) {
          failed++
          console.log(`  ❌ Error sending to ${subscriber.email}:`, error)
        }
      }

      console.log(`📊 Batch reminder completed: ${sent} sent, ${failed} failed`)
      
      // 记录日志到文件（可选）
      this.logResults({
        timestamp: new Date().toISOString(),
        totalUsers: subscribers.length,
        sent,
        failed
      })

    } catch (error) {
      console.error('❌ Error in checkAndSendReminders:', error)
    }
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

  /**
   * 手动触发检查（用于测试）
   */
  async triggerCheck() {
    console.log('🔄 Manually triggering reminder check...')
    await this.checkAndSendReminders()
  }
}

// 创建全局实例
export const emailScheduler = new EmailScheduler()

// 调度器实例已创建，初始化由 init-scheduler.ts 处理 