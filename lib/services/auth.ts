import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email?: string
  name?: string
  created_at: string
  updated_at?: string
  is_subscribed?: boolean
}

export interface SignUpData {
  email: string
  password: string
  name?: string
}

export interface SignInData {
  email: string
  password: string
}

export const authService = {
  // Check if email already exists using admin API
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.exists
      }
      
      console.error('Error checking email:', data.error)
      return false // Assume email doesn't exist if we can't check
    } catch (error) {
      console.error('Error checking email existence:', error)
      return false // Assume email doesn't exist if we can't check
    }
  },

  // Register user
  async signUp({ email, password, name }: SignUpData): Promise<{ user: User | null, error: string | null }> {
    try {
      // First check if email already exists
      const emailExists = await this.checkEmailExists(email)
      if (emailExists) {
        return { user: null, error: 'This email is already registered. Please sign in instead.' }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split('@')[0]
          }
        }
      })

      if (error) {
        // Additional check for any other user already registered errors
        if (error.message.includes('User already registered') || 
            error.message.includes('already been registered') ||
            error.code === 'user_already_exists') {
          return { user: null, error: 'This email is already registered. Please sign in instead.' }
        }
        return { user: null, error: error.message }
      }

      // Always create user record immediately after successful registration
      // This allows users to use the app right away, email verification is optional
      if (data.user) {
        // Temporary: Skip database operations if table doesn't exist
        const SKIP_DB_OPERATIONS = true // Set to true to skip database operations
        
        if (!SKIP_DB_OPERATIONS) {
          try {
            const { error: dbError } = await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                name: name || email.split('@')[0],
                is_subscribed: false,
                email_verified: !!data.user.email_confirmed_at
              }, {
                onConflict: 'id'
              })

            if (dbError) {
              console.error('Error creating user record (non-critical):', dbError)
              // Don't block registration flow - user can still use the app
              // The record will be created later when they access profile features
            } else {
              console.log('User record created successfully')
            }
          } catch (dbError) {
            console.error('Database operation failed (non-critical):', dbError)
            // Don't block registration - continue with auth-only user
          }
        } else {
          console.log('Database operations skipped (development mode)')
        }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Registration failed' }
    }
  },

  // Sign in user
  async signIn({ email, password }: SignInData): Promise<{ user: User | null, error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  },

  // Sign out user
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  // Get current session
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      console.error('Error getting current session:', error)
      return null
    }
  },

  // Reset password
  async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Password reset failed' }
    }
  },

  // Resend verification email
  async resendVerificationEmail(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to resend verification email' }
    }
  },

  // Update password
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Password update failed' }
    }
  },

  // Update user profile
  async updateProfile(updates: { name?: string; email?: string }): Promise<{ error: string | null }> {
    try {
      const user = await this.getCurrentUser()
      if (!user) {
        return { error: 'User not logged in' }
      }

      // Update auth user information
      const { error: authError } = await supabase.auth.updateUser({
        email: updates.email,
        data: {
          name: updates.name
        }
      })

      if (authError) {
        return { error: authError.message }
      }

      // Update information in users table
      const { error: dbError } = await supabase
        .from('users')
        .update({
          name: updates.name,
          email: updates.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (dbError) {
        console.error('Error updating user profile:', dbError)
        return { error: 'Failed to update profile' }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Update failed' }
    }
  },

  // Get user detailed information
  async getUserProfile(userId?: string): Promise<AuthUser | null> {
    try {
      const currentUser = await this.getCurrentUser()
      const targetUserId = userId || currentUser?.id
      
      if (!targetUserId) {
        return null
      }

      // First try to get from database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', targetUserId)
        .single()

      if (error) {
        // If error is due to non-existent record, try to create user record
        if (error.code === 'PGRST116' || error.details?.includes('0 rows')) {
          if (currentUser && currentUser.id === targetUserId) {
            console.log('User record not found, creating new record...')
            await this.createUserRecord(currentUser)
            
            // Retry getting user information
            const { data: retryData, error: retryError } = await supabase
              .from('users')
              .select('*')
              .eq('id', targetUserId)
              .single()
            
            if (retryError) {
              console.error('Error getting user profile after creation:', retryError)
              // Fallback to auth user metadata
              if (currentUser) {
                return {
                  id: currentUser.id,
                  email: currentUser.email,
                  name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '',
                  created_at: currentUser.created_at,
                  updated_at: currentUser.updated_at || currentUser.created_at,
                  is_subscribed: false
                }
              }
              return null
            }
            
            return retryData
          }
        }
        
        console.error('Error getting user profile:', error)
        // Fallback to auth user metadata if database fails
        if (currentUser && currentUser.id === targetUserId) {
          return {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '',
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at || currentUser.created_at,
            is_subscribed: false
          }
        }
        return null
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      // Fallback to auth user metadata
      try {
        const currentUser = await this.getCurrentUser()
        if (currentUser && (!userId || currentUser.id === userId)) {
          return {
            id: currentUser.id,
            email: currentUser.email,
            name: currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || '',
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at || currentUser.created_at,
            is_subscribed: false
          }
        }
      } catch (fallbackError) {
        console.error('Fallback auth user fetch failed:', fallbackError)
      }
      return null
    }
  },

  // Create user record (called after user confirmation)
  async createUserRecord(user: User): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0] || '',
          is_subscribed: false,
          email_verified: !!user.email_confirmed_at
        }, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Error creating user record:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create user record' }
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null
      
      // Create or update user record for any sign in
      if (event === 'SIGNED_IN' && user) {
        await this.createUserRecord(user)
      }
      
      // Update email verification status when user confirms email
      if (event === 'USER_UPDATED' && user && user.email_confirmed_at) {
        await supabase
          .from('users')
          .update({ email_verified: true })
          .eq('id', user.id)
      }
      
      callback(user)
    })
  }
} 