import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'
import { emailSubscriptionService } from './database'

// SendGrid配置
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Nodemailer配置（备用邮件服务）
const transporter = nodemailer.createTransport({
  service: 'gmail', // 可以更改为其他邮件服务
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

// Email Templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Hare Beauty!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">Welcome to Hare Beauty!</h1>
        <p>Thank you for subscribing to our beauty product recommendation service.</p>
        <p>You will regularly receive:</p>
        <ul>
          <li>Personalized product recommendations</li>
          <li>Latest beauty insights and tips</li>
          <li>Quarterly product update notifications</li>
        </ul>
        <p>If you wish to unsubscribe, please click <a href="{unsubscribe_url}">here</a>.</p>
      </div>
    `
  },
  
  recommendations: {
    subject: '为您推荐的美容产品 - Hare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">为您推荐的美容产品</h1>
        <p>基于您的面部特征分析，我们为您推荐以下产品：</p>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #333;">护发产品</h2>
          {hair_products}
        </div>
        
        <div style="margin: 20px 0;">
          <h2 style="color: #333;">护肤产品</h2>
          {skin_products}
        </div>
        
        <p style="font-size: 12px; color: #666;">
          如果您想取消订阅，请点击 <a href="{unsubscribe_url}">这里</a>。
        </p>
      </div>
    `
  },
  
  quarterly_update: {
    subject: '产品库季度更新 - Hare',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #e91e63;">产品库已更新！</h1>
        <p>我们刚刚完成了产品库的季度更新，新增了 {new_products_count} 款产品。</p>
        <p>现在就去 <a href="{website_url}" style="color: #e91e63;">Hare</a> 发现更多适合您的产品吧！</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
          <h3>更新统计</h3>
          <ul>
            <li>新增护发产品：{hair_care_count} 款</li>
            <li>新增护肤产品：{skin_care_count} 款</li>
            <li>清理过期产品：{expired_count} 款</li>
          </ul>
        </div>
        
        <p style="font-size: 12px; color: #666;">
          如果您想取消订阅，请点击 <a href="{unsubscribe_url}">这里</a>。
        </p>
      </div>
    `
  }
}

// 邮件服务
export const emailService = {
  // 发送欢迎邮件
  async sendWelcome(email: string): Promise<boolean> {
    try {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      
      const html = emailTemplates.welcome.html.replace('{unsubscribe_url}', unsubscribeUrl)
      
      await this.sendEmail(
        email,
        emailTemplates.welcome.subject,
        html
      )
      
      return true
    } catch (error: any) {
      console.error('Error sending welcome email:', error)
      if (error.response?.body?.errors) {
        console.log(error.response.body.errors);
      }
      
      return false
    }
  },

  // 发送推荐邮件
  async sendRecommendations(
    email: string, 
    recommendations: {
      hairProducts: Array<{ title: string, price: number, productUrl: string, imageUrl?: string }>
      skinProducts: Array<{ title: string, price: number, productUrl: string, imageUrl?: string }>
    }
  ): Promise<boolean> {
    try {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      
      // 生成产品HTML
      const hairProductsHtml = recommendations.hairProducts.map(product => `
        <div style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: cover; float: left; margin-right: 15px;">` : ''}
          <h4 style="margin: 0 0 10px 0;">${product.title}</h4>
          <p style="color: #e91e63; font-weight: bold; margin: 5px 0;">$${product.price}</p>
          <a href="${product.productUrl}" style="background-color: #e91e63; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block;">查看产品</a>
          <div style="clear: both;"></div>
        </div>
      `).join('')
      
      const skinProductsHtml = recommendations.skinProducts.map(product => `
        <div style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
          ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.title}" style="width: 100px; height: 100px; object-fit: cover; float: left; margin-right: 15px;">` : ''}
          <h4 style="margin: 0 0 10px 0;">${product.title}</h4>
          <p style="color: #e91e63; font-weight: bold; margin: 5px 0;">$${product.price}</p>
          <a href="${product.productUrl}" style="background-color: #e91e63; color: white; padding: 8px 16px; text-decoration: none; border-radius: 3px; display: inline-block;">查看产品</a>
          <div style="clear: both;"></div>
        </div>
      `).join('')
      
      const html = emailTemplates.recommendations.html
        .replace('{hair_products}', hairProductsHtml)
        .replace('{skin_products}', skinProductsHtml)
        .replace('{unsubscribe_url}', unsubscribeUrl)
      
      await this.sendEmail(
        email,
        emailTemplates.recommendations.subject,
        html
      )
      
      // 更新最后发送时间
      await emailSubscriptionService.updateLastSent(email)
      
      return true
    } catch (error) {
      console.error('Error sending recommendations email:', error)
      return false
    }
  },

  // 发送季度更新邮件
  async sendQuarterlyUpdate(
    email: string,
    updateStats: {
      hairCareCount: number
      skinCareCount: number
      expiredCount: number
    }
  ): Promise<boolean> {
    try {
      const unsubscribeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`
      const websiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beautysnap.com'
      
      const newProductsCount = updateStats.hairCareCount + updateStats.skinCareCount
      
      const html = emailTemplates.quarterly_update.html
        .replace('{new_products_count}', newProductsCount.toString())
        .replace('{website_url}', websiteUrl)
        .replace('{hair_care_count}', updateStats.hairCareCount.toString())
        .replace('{skin_care_count}', updateStats.skinCareCount.toString())
        .replace('{expired_count}', updateStats.expiredCount.toString())
        .replace('{unsubscribe_url}', unsubscribeUrl)
      
      await this.sendEmail(
        email,
        emailTemplates.quarterly_update.subject,
        html
      )
      
      // 更新最后发送时间
      await emailSubscriptionService.updateLastSent(email)
      
      return true
    } catch (error) {
      console.error('Error sending quarterly update email:', error)
      return false
    }
  },

  // 批量发送季度更新邮件
  async sendQuarterlyUpdateToAll(updateStats: {
    hairCareCount: number
    skinCareCount: number
    expiredCount: number
  }): Promise<{ sent: number, failed: number }> {
    const subscribers = await emailSubscriptionService.getActiveSubscribers()
    let sent = 0
    let failed = 0
    
    for (const subscriber of subscribers) {
      try {
        const success = await this.sendQuarterlyUpdate(subscriber.email, updateStats)
        if (success) {
          sent++
        } else {
          failed++
        }
        
        // 添加延迟以避免触发邮件服务的速率限制
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error)
        failed++
      }
    }
    
    return { sent, failed }
  },

  // 发送产品提醒邮件
  async sendProductReminder(email: string, data: {
    lastSearchQuery: any
    oldProducts: any[]
    newRecommendations: any[]
    reminderMonths: number
  }): Promise<boolean> {
    try {
      const { lastSearchQuery, oldProducts, newRecommendations, reminderMonths } = data
      
      // 构建邮件内容
      const lastSearchDate = lastSearchQuery?.created_at 
        ? new Date(lastSearchQuery.created_at).toLocaleDateString()
        : 'N/A'
      
      const subject = `🌟 Time to Refresh Your Beauty Routine! New Recommendations Inside`
      
      // 生成旧产品列表HTML (限制显示3个)
      const oldProductsHtml = oldProducts.length > 0 
        ? oldProducts.slice(0, 3).map(product => `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 16px;">
            <div style="flex-shrink: 0;">
              <img src="${product.image || 'https://via.placeholder.com/80x80/f1f5f9/64748b?text=Product'}" 
                   alt="${product.product_name || 'Product'}" 
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 600;">${product.product_name || 'Product'}</h4>
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.4;">${(product.product_description || '').substring(0, 80)}${(product.product_description || '').length > 80 ? '...' : ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="color: #dc2626; font-weight: bold; font-size: 18px;">${product.price || 'Price not available'}</span>
                <span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                  ${product.category || 'Beauty'}
                </span>
              </div>
              <a href="${product.amazon_url || '#'}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                Restock Now →
              </a>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                Click here to visit Amazon — this is an affiliate link
              </p>
            </div>
          </div>
        `).join('')
        : '<p style="color: #64748b; text-align: center; padding: 20px;">No previous products found.</p>'

      // 生成新推荐列表HTML (限制显示3个)
      const newProductsHtml = newRecommendations.length > 0 
        ? newRecommendations.slice(0, 3).map(product => `
          <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 16px; background: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.06); display: flex; align-items: center; gap: 16px;">
            <div style="flex-shrink: 0;">
              <img src="${product.image || 'https://via.placeholder.com/80x80/f1f5f9/64748b?text=Product'}" 
                   alt="${product.name || 'Product'}" 
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
            <div style="flex: 1;">
              <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: 600;">${product.name || 'Product'}</h4>
              <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.4;">${(product.description || '').substring(0, 80)}${(product.description || '').length > 80 ? '...' : ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="color: #dc2626; font-weight: bold; font-size: 18px;">${product.price || 'Price not available'}</span>
                <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: 500;">
                  ${product.category || 'Beauty'}
                </span>
              </div>
              ${product.features && product.features.length > 0 ? `
                <div style="margin-bottom: 12px;">
                  ${product.features.slice(0, 2).map((feature: string) => `
                    <span style="background: #fce7f3; color: #be185d; padding: 3px 8px; border-radius: 12px; font-size: 11px; margin-right: 6px; font-weight: 500;">
                      ${feature}
                    </span>
                  `).join('')}
                </div>
              ` : ''}
              <a href="${product.buyUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 500;">
                Shop Now →
              </a>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 11px; text-align: center;">
                Click here to visit Amazon — this is an affiliate link
              </p>
            </div>
          </div>
        `).join('')
        : '<p style="color: #64748b; text-align: center; padding: 20px;">No new recommendations available at this time.</p>'

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Beauty Routine Refresh</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f1f5f9;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">✨ Hare Beauty</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Time to refresh your beauty routine!</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 32px;">
                <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px;">🎯 It's Been ${reminderMonths} Months!</h2>
                <p style="color: #64748b; margin: 0; font-size: 16px; line-height: 1.6;">
                  Based on your last beauty analysis on <strong>${lastSearchDate}</strong>, 
                  it's time to refresh your routine with new products and restock your favorites!
                </p>
              </div>

              <!-- Previous Products Section -->
              ${oldProducts.length > 0 ? `
                <div style="margin-bottom: 40px;">
                  <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                    🔄 Restock Your Favorites
                  </h3>
                  <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">
                    These products were recommended for your beauty profile. Time to restock!
                  </p>
                  ${oldProductsHtml}
                  ${oldProducts.length > 3 ? `
                    <div style="text-align: center; margin-top: 20px;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}/send-reminder?email=${encodeURIComponent(email)}" 
                         style="display: inline-block; background: #f8fafc; border: 2px solid #e2e8f0; color: #64748b; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s;">
                        View All ${oldProducts.length} Previous Products →
                      </a>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- New Recommendations Section -->
              <div style="margin-bottom: 40px;">
                <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                  ✨ Fresh Recommendations For You
                </h3>
                <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">
                  Discover new products perfectly matched to your unique beauty profile.
                </p>
                ${newProductsHtml}
                ${newRecommendations.length > 3 ? `
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}/send-reminder?email=${encodeURIComponent(email)}" 
                       style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; box-shadow: 0 2px 4px rgba(236, 72, 153, 0.3);">
                      View All ${newRecommendations.length} New Recommendations →
                    </a>
                  </div>
                ` : ''}
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
                <h3 style="color: #1e293b; margin: 0 0 12px 0; font-size: 18px;">Want More Personalized Recommendations?</h3>
                <p style="color: #64748b; margin: 0 0 16px 0; font-size: 14px;">
                  Get a fresh beauty analysis with our AI-powered tool
                </p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}" 
                   style="display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                  Start New Analysis
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 20px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; margin: 0 0 8px 0; font-size: 12px;">
                You're receiving this because you subscribed to Hare Beauty updates.
              </p>
              <p style="color: #64748b; margin: 0; font-size: 12px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}" 
                   style="color: #64748b; text-decoration: underline;">Visit Hare</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `

      const textContent = `
🌟 Hare Beauty - Time to Refresh Your Routine!

Hi there!

It's been ${reminderMonths} months since your last beauty analysis on ${lastSearchDate}. 
Time to refresh your routine with new products and restock your favorites!

${oldProducts.length > 0 ? `
🔄 RESTOCK YOUR FAVORITES:
${oldProducts.map(p => `• ${p.product_name} - ${p.price} (${p.category})`).join('\n')}
` : ''}

✨ FRESH RECOMMENDATIONS FOR YOU:
${newRecommendations.length > 0 
  ? newRecommendations.map(p => `• ${p.name} - ${p.price} (${p.category})`).join('\n')
  : 'No new recommendations available at this time.'
}

Want more personalized recommendations? 
Get a fresh beauty analysis: ${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}

---
Unsubscribe: ${process.env.NEXT_PUBLIC_APP_URL || 'https://hare.beauty'}/unsubscribe?email=${encodeURIComponent(email)}
      `

      return await this.sendEmail(email, subject, htmlContent)
    } catch (error) {
      console.error('Error sending product reminder:', error)
      return false
    }
  },

  // 基础邮件发送方法
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const from = process.env.FROM_EMAIL || 'noreply@beautysnap.com'
      
      // 优先使用SendGrid
      if (process.env.SENDGRID_API_KEY) {
        await sgMail.send({
          to,
          from,
          subject,
          html
        })
      } else {
        // 使用Nodemailer作为备用
        await transporter.sendMail({
          from,
          to,
          subject,
          html
        })
      }
      
      return true
    } catch (error: any) {
      console.error('Error sending email:', error)
      if (error?.response?.body) {
        console.error('SendGrid error details:', error.response.body)
      }
      return false
    }
  }
} 