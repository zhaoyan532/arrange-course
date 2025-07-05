/**
 * 共享的重置代码存储服务
 * 在生产环境中，应该使用 Redis 或数据库
 */

interface ResetCodeData {
  code: string
  expires: number
}

class ResetCodeStore {
  private codes = new Map<string, ResetCodeData>()

  set(email: string, code: string, expiresInMs: number = 15 * 60 * 1000) {
    this.codes.set(email, {
      code,
      expires: Date.now() + expiresInMs
    })
  }

  get(email: string): ResetCodeData | undefined {
    const data = this.codes.get(email)
    
    // 自动清理过期代码
    if (data && Date.now() > data.expires) {
      this.codes.delete(email)
      return undefined
    }
    
    return data
  }

  verify(email: string, code: string): { success: boolean, error?: string } {
    const storedData = this.get(email)
    
    if (!storedData) {
      return { success: false, error: 'No reset code found. Please request a new one.' }
    }

    if (storedData.code !== code) {
      return { success: false, error: 'Invalid verification code' }
    }

    return { success: true }
  }

  delete(email: string) {
    this.codes.delete(email)
  }

  // 清理过期代码的方法
  cleanup() {
    const now = Date.now()
    for (const [email, data] of this.codes.entries()) {
      if (now > data.expires) {
        this.codes.delete(email)
      }
    }
  }
}

// 创建单例实例
export const resetCodeStore = new ResetCodeStore()

// 定期清理过期代码（每5分钟）
if (typeof window === 'undefined') {
  setInterval(() => {
    resetCodeStore.cleanup()
  }, 5 * 60 * 1000)
} 