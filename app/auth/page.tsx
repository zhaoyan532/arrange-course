'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BeautifulBackground } from "@/components/beautiful-background"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Eye, EyeOff, ArrowLeft, Mail, Lock, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/contexts/AuthContext"
import { authService } from "@/lib/services/auth"

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, loading } = useAuth()
  
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'signin')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetCode, setResetCode] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [isCodeVerified, setIsCodeVerified] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Auto-clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])



  const validateForm = (isSignUp: boolean = false) => {
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.email) {
      newErrors.email = 'Please enter your email address'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }
    
    if (!formData.password) {
      newErrors.password = 'Please enter your password'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Please enter your name'
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(false)) return
    
    setIsSubmitting(true)
    const { error } = await signIn(formData.email, formData.password)
    
    if (error) {
      setErrors({ general: error })
    } else {
      const returnUrl = searchParams.get('returnUrl') || '/'
      router.push(returnUrl)
    }
    
    setIsSubmitting(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm(true)) return
    
    setIsSubmitting(true)
    const { error } = await signUp(formData.email, formData.password, formData.name)
    
    if (error) {
      setErrors({ general: error })
      // If user already exists, suggest switching to sign in
      if (error.includes('already registered')) {
        setTimeout(() => {
          // setActiveTab('signin')
          setErrors({})
        }, 3000) // Auto switch after 3 seconds
      }
    } else {
      setRegistrationSuccess(true)
      setRegisteredEmail(formData.email)
    }
    
    setIsSubmitting(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const handleContinueWithoutVerification = () => {
    const returnUrl = searchParams.get('returnUrl') || '/'
    router.push(returnUrl)
  }

  const handleBackToLogin = () => {
    setRegistrationSuccess(false)
    setActiveTab('signin')
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
  }

  const handleResendEmail = async () => {
    try {
      const { error } = await authService.resendVerificationEmail(registeredEmail)
      if (error) {
        alert(`Failed to resend email: ${error}`)
      } else {
        alert('Verification email sent! Please check your inbox.')
      }
    } catch (error) {
      alert('Failed to resend email. Please try again later.')
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' })
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResetEmailSent(true)
        setRegisteredEmail(formData.email)
        setSuccessMessage('Reset code sent to your email!')
      } else {
        setErrors({ general: data.error || 'Failed to send reset code' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to send reset code. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!registeredEmail) {
      setErrors({ general: 'Email address not found. Please try again.' })
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSuccessMessage('New reset code sent to your email!')
        setErrors({})
      } else {
        setErrors({ general: data.error || 'Failed to resend reset code' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to resend reset code. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resetCode) {
      setErrors({ resetCode: 'Please enter the verification code' })
      return
    }
    
    setIsVerifyingCode(true)
    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registeredEmail, 
          code: resetCode 
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setIsCodeVerified(true)
        setErrors({})
      } else {
        setErrors({ resetCode: data.error || 'Invalid verification code' })
      }
    } catch (error) {
      setErrors({ resetCode: 'Failed to verify code. Please try again.' })
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.password) {
      setErrors({ password: 'Please enter your new password' })
      return
    }
    
    if (formData.password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' })
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      return
    }
    
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: registeredEmail, 
          code: resetCode,
          newPassword: formData.password
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Reset successful, switch to sign in
        setActiveTab('signin')
        setFormData({ email: registeredEmail, password: '', name: '', confirmPassword: '' })
        setResetEmailSent(false)
        setIsCodeVerified(false)
        setResetCode('')
        setErrors({})
        setSuccessMessage('Password reset successful! Please sign in with your new password.')
      } else {
        setErrors({ general: data.error || 'Failed to reset password' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to reset password. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // If registration was successful, show verification prompt
  if (registrationSuccess) {
    return (
      <BeautifulBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Registration Successful! 🎉
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We've sent a verification email to:
                  <br />
                  <strong className="text-pink-600">{registeredEmail}</strong>
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                    <strong>📧 Check your email</strong> and click the verification link to unlock all features
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg text-sm text-green-800">
                    <strong>✨ No need to wait!</strong> You can start using the app right away
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    onClick={handleContinueWithoutVerification}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    Continue to App
                  </Button>
                  
                  <Button 
                    onClick={handleBackToLogin}
                    variant="outline"
                    className="w-full"
                  >
                    I'll verify first, then sign in
                  </Button>
                  
                  <Button 
                    onClick={handleResendEmail}
                    variant="ghost"
                    className="w-full text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                  >
                    Resend verification email
                  </Button>
                </div>
                
                <p className="text-xs text-gray-500 mt-4">
                  Can't find the email? Check your spam folder or contact support
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BeautifulBackground>
    )
  }

  return (
    <BeautifulBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <div className="mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                Hare
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Discover Your Unique Beauty
              </p>
            </CardHeader>
            
            <CardContent className="px-6 pb-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full mb-6 ${activeTab === 'forgot-password' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  {activeTab === 'forgot-password' && (
                    <TabsTrigger value="forgot-password" className="text-xs">Reset</TabsTrigger>
                  )}
                </TabsList>
                
                {/* Success message */}
                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                    {successMessage}
                  </div>
                )}
                
                {/* General error message */}
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {errors.general}
                    {errors.general.includes('already registered') && (
                      <div className="mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab('signin')
                            setErrors({})
                          }}
                          className="text-xs border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Switch to Sign In
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs">{errors.password}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-11"
                    >
                      {isSubmitting ? 'Signing In...' : 'Sign In'}
                    </Button>
                    
                    <div className="text-center mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveTab('forgot-password')}
                        className="text-pink-600 hover:text-pink-700 hover:bg-pink-50 text-sm"
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-red-500 text-xs">{errors.name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs">{errors.email}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                      {errors.password && (
                        <p className="text-red-500 text-xs">{errors.password}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Enter your password again"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                      )}
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-11"
                    >
                      {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="forgot-password">
                  {!resetEmailSent ? (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Reset Password</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Enter your email to receive a verification code
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-xs">{errors.email}</p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-11"
                      >
                        {isSubmitting ? 'Sending...' : 'Send Reset Code'}
                      </Button>
                      
                      <div className="text-center mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveTab('signin')}
                          className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Back to Sign In
                        </Button>
                      </div>
                    </form>
                  ) : !isCodeVerified ? (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Check Your Email</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          We sent a verification code to:
                          <br />
                          <strong className="text-pink-600">{registeredEmail}</strong>
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reset-code">Verification Code</Label>
                        <Input
                          id="reset-code"
                          type="text"
                          placeholder="Enter 6-digit code"
                          value={resetCode}
                          onChange={(e) => setResetCode(e.target.value)}
                          className={`text-center text-lg tracking-widest ${errors.resetCode ? 'border-red-500' : ''}`}
                          maxLength={6}
                        />
                        {errors.resetCode && (
                          <p className="text-red-500 text-xs">{errors.resetCode}</p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isVerifyingCode}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-11"
                      >
                        {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                      </Button>
                      
                      <div className="text-center mt-3">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResendCode}
                          disabled={isSubmitting}
                          className="text-pink-600 hover:text-pink-700 text-sm"
                        >
                          {isSubmitting ? 'Sending...' : 'Resend Code'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <div className="mx-auto mb-3 w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Set New Password</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Create a strong password for your account
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="new-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <p className="text-red-500 text-xs">{errors.password}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-red-500 text-xs">{errors.confirmPassword}</p>
                        )}
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-11"
                      >
                        {isSubmitting ? 'Resetting...' : 'Reset Password'}
                      </Button>
                    </form>
                  )}
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 text-center text-sm text-gray-500">
                <p>By signing up, you agree to our</p>
                <p>
                  <Link href="/privacy" className="text-pink-500 hover:underline">Privacy Policy</Link>
                  {' '}and{' '}
                  <Link href="/terms" className="text-pink-500 hover:underline">Terms of Service</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </BeautifulBackground>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <BeautifulBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white animate-spin" />
                </div>
                <p className="text-gray-600">Loading...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </BeautifulBackground>
    }>
      <AuthContent />
    </Suspense>
  )
} 