import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  loadingText?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  type?: "button" | "submit" | "reset"
}

export function LoadingButton({
  loading,
  children,
  loadingText,
  onClick,
  className,
  disabled,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={onClick}
      disabled={loading || disabled}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {loading ? (loadingText || '加载中...') : children}
    </Button>
  )
}
