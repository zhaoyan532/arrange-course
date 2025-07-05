"use client"

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X, Mail, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastProps {
  id: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type,
  duration = 4000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Entrance animation
    setIsVisible(true)
    
    // Auto close timer
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <Mail className="h-5 w-5 text-blue-500" />
      default:
        return <Sparkles className="h-5 w-5 text-pink-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200'
      case 'info':
        return 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'
      default:
        return 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200'
    }
  }

  return (
    <div
      className={cn(
        'fixed top-20 left-4 right-4 md:top-20 md:right-4 md:left-auto z-50 max-w-md w-full md:w-auto pointer-events-auto',
        'transform transition-all duration-300 ease-out',
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={cn(
          'backdrop-blur-sm rounded-xl border shadow-lg p-4',
          'flex items-start gap-3 relative overflow-hidden mx-auto md:mx-0',
          getBackgroundColor()
        )}
      >
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 w-32 h-full opacity-0 animate-pulse" />
        
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h4>
          )}
          <p className="text-sm text-gray-700 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors"
        >
          <X className="h-4 w-4 text-gray-500" />
        </button>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
          <div 
            className={cn(
              'h-full transition-all ease-linear',
              type === 'success' && 'bg-gradient-to-r from-green-400 to-emerald-500',
              type === 'error' && 'bg-gradient-to-r from-red-400 to-rose-500',
              type === 'warning' && 'bg-gradient-to-r from-yellow-400 to-amber-500',
              type === 'info' && 'bg-gradient-to-r from-blue-400 to-sky-500',
              type !== 'success' && type !== 'error' && type !== 'warning' && type !== 'info' && 'bg-gradient-to-r from-pink-400 to-purple-500'
            )}
            style={{
              width: isVisible ? '0%' : '100%',
              transition: `width ${duration}ms linear`
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Toast Container Component
export const ToastContainer: React.FC<{
  toasts: ToastProps[]
  removeToast: (id: string) => void
}> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-3">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          style={{ 
            transform: `translateY(${index * 8}px)`,
            zIndex: 50 - index 
          }}
        >
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  )
}

// Toast Hook
export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: removeToast
    }
    setToasts(prev => [...prev, newToast])
    return id
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const toast = {
    success: (message: string, title?: string) => 
      addToast({ type: 'success', message, title }),
    
    error: (message: string, title?: string) => 
      addToast({ type: 'error', message, title }),
    
    warning: (message: string, title?: string) => 
      addToast({ type: 'warning', message, title }),
    
    info: (message: string, title?: string) => 
      addToast({ type: 'info', message, title })
  }

  return {
    toast,
    toasts,
    removeToast
  }
}
