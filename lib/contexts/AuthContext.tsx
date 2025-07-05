'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { authService, AuthUser } from '@/lib/services/auth'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  userProfile: AuthUser | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name?: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      setLoading(true)
      try {
        const session = await authService.getCurrentSession()
        const user = session?.user || null
        setUser(user)
        
        // Try to get user profile, but don't fail if it doesn't work
        if (user) {
          try {
            const profile = await authService.getUserProfile()
            setUserProfile(profile)
          } catch (profileError) {
            console.warn('Could not load user profile, but user can still use the app:', profileError)
            // Create a fallback profile from auth user data
            setUserProfile({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
              is_subscribed: false
            })
          }
        } else {
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // Don't set error state for session loading failures
        // User might still be able to use the app
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange(async (user) => {
      setUser(user)
      setError(null)
      
      if (user) {
        try {
          const profile = await authService.getUserProfile()
          setUserProfile(profile)
        } catch (profileError) {
          console.warn('Could not load user profile after auth change:', profileError)
          // Create user record if it doesn't exist
          try {
            await authService.createUserRecord(user)
            const retryProfile = await authService.getUserProfile()
            setUserProfile(retryProfile)
          } catch (createError) {
            console.warn('Could not create user record:', createError)
            // Fallback to auth user data
            setUserProfile({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.name || user.email?.split('@')[0] || '',
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
              is_subscribed: false
            })
          }
        }
      } else {
        setUserProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    const { user, error } = await authService.signIn({ email, password })
    
    if (user) {
      setUser(user)
      const profile = await authService.getUserProfile(user.id)
      setUserProfile(profile)
    }
    
    setLoading(false)
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    setLoading(true)
    try {
      const { user, error } = await authService.signUp({ email, password, name })
      
      if (error) {
        setLoading(false)
        return { error }
      }
      
      if (user) {
        setUser(user)
        // Don't try to get profile immediately after signup to avoid database errors
        // The profile will be created/loaded by the auth state change handler
        setUserProfile(null)
      }
      
      setLoading(false)
      return { error: null }
    } catch (err) {
      setLoading(false)
      return { error: err instanceof Error ? err.message : 'Registration failed' }
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await authService.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        setError(error)
      } else {
        setUser(null)
        setUserProfile(null)
        setError(null)
      }
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        // First refresh the user session to get updated metadata
        const { data: { user: refreshedUser } } = await supabase.auth.getUser()
        if (refreshedUser) {
          setUser(refreshedUser)
          
          // Then get the profile data with the refreshed user
          try {
            const profile = await authService.getUserProfile(refreshedUser.id)
            setUserProfile(profile)
          } catch (profileError) {
            console.warn('Could not load updated profile, using auth data:', profileError)
            // Fallback to refreshed auth user data
            setUserProfile({
              id: refreshedUser.id,
              email: refreshedUser.email,
              name: refreshedUser.user_metadata?.name || refreshedUser.email?.split('@')[0] || '',
              created_at: refreshedUser.created_at,
              updated_at: refreshedUser.updated_at || refreshedUser.created_at,
              is_subscribed: false
            })
          }
        }
      } catch (error) {
        console.error('Error refreshing profile:', error)
        // Don't fail completely - keep existing user state
      }
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 