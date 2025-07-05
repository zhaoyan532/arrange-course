import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/contexts/AuthContext"

const inter = Inter({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap"
})

export const metadata: Metadata = {
  title: "Hare - AI Beauty Analysis",
  description: "Discover your perfect beauty routine with AI-powered facial analysis and personalized product recommendations.",
  generator: 'v0.dev'
}

// 初始化调度器（仅在服务器端）
if (typeof window === 'undefined') {
  // 导入初始化服务，它会自动处理调度器启动
  import('@/lib/services/init-scheduler').catch(error => {
    console.error('Failed to load scheduler initialization:', error)
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
