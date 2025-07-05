/**
 * 调度器初始化服务
 * 确保邮件调度器在应用启动时可靠启动
 */

import { emailScheduler } from './scheduler'

let initializationAttempted = false
let initializationPromise: Promise<void> | null = null

/**
 * 初始化邮件调度器
 */
export async function initializeScheduler(): Promise<void> {
  // 避免重复初始化
  if (initializationAttempted) {
    return initializationPromise || Promise.resolve()
  }

  initializationAttempted = true
  
  initializationPromise = new Promise(async (resolve, reject) => {
    try {
      console.log('📅 Initializing email scheduler...')
      
      // 检查是否应该启用调度器 - 默认启用，除非明确禁用
      const shouldEnable = process.env.ENABLE_SCHEDULER !== 'false'
      
      if (!shouldEnable) {
        console.log('⏸️ Scheduler disabled (ENABLE_SCHEDULER=false)')
        resolve()
        return
      }

      // 等待一段时间确保应用完全启动
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // 检查当前状态
      const currentStatus = emailScheduler.getStatus()
      
      if (currentStatus.isRunning) {
        console.log('✅ Scheduler already running')
      } else {
        console.log('🚀 Starting email scheduler...')
        emailScheduler.start()
        
        // 验证启动成功
        await new Promise(resolve => setTimeout(resolve, 1000))
        const newStatus = emailScheduler.getStatus()
        
        if (newStatus.isRunning) {
          console.log('✅ Email scheduler started successfully')
        } else {
          throw new Error('Failed to start scheduler')
        }
      }
      
      resolve()
    } catch (error) {
      console.error('❌ Failed to initialize scheduler:', error)
      reject(error)
    }
  })

  return initializationPromise
}

/**
 * 获取初始化状态
 */
export function getInitializationStatus() {
  return {
    attempted: initializationAttempted,
    isRunning: emailScheduler.getStatus().isRunning,
    shouldEnable: process.env.ENABLE_SCHEDULER !== 'false'
  }
}

// 自动初始化（仅在服务器端）
if (typeof window === 'undefined') {
  // 使用 setImmediate 确保在事件循环的下一次迭代中运行
  setImmediate(() => {
    initializeScheduler().catch(error => {
      console.error('Auto-initialization failed:', error)
    })
  })
} 