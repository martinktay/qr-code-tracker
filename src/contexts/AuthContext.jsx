import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  // Debug user role changes
  useEffect(() => {
    console.log('User role changed to:', userRole)
    console.log('Current user state:', user)
  }, [userRole, user])

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchUserRole(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(error => {
      console.error('Session check error:', error)
      setLoading(false)
    })

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.warn('Auth loading timeout - forcing loading to false')
      setLoading(false)
    }, 15000)

    return () => clearTimeout(fallbackTimeout)

    // Listen for changes on auth state (signed in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchUserRole(session.user.id)
      } else {
        setUserRole(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserRole = async (userId) => {
    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );
      
      const rolePromise = db.getUserRole(userId);
      const role = await Promise.race([rolePromise, timeoutPromise]);
      
      setUserRole(role)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('customer') // Default to customer role
    } finally {
      setLoading(false)
    }
  }

  // Simple authentication for testing with user_accounts table
  const simpleSignIn = async (email, password) => {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .eq('email', email)
        .eq('hashed_password', password)
        .single()
      
      if (error || !data) {
        throw new Error('Invalid email or password')
      }

      // Create a mock user object for the session
      const mockUser = {
        id: data.user_id,
        email: data.email,
        user_metadata: {
          name: data.username,
          role: data.role
        }
      }

      console.log('Simple sign in successful:', { user: mockUser, role: data.role })
      console.log('Setting user role to:', data.role)
      setUser(mockUser)
      setUserRole(data.role)
      setLoading(false)

      return { user: mockUser }
    } catch (error) {
      console.error('Simple sign in error:', error)
      throw error
    }
  }

  const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    // Create user account record
    if (data.user) {
      await supabase
        .from('user_accounts')
        .insert([{
          user_id: data.user.id,
          username: userData.username,
          hashed_password: password, // In production, this should be hashed
          role: userData.role || 'customer',
          email: email,
          phone: userData.phone
        }])
    }
    
    return data
  }

  const signIn = async (email, password) => {
    console.log('Sign in attempt for:', email)
    // Try Supabase Auth first, then fall back to simple auth for testing
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // If Supabase Auth fails, try simple auth with user_accounts table
        console.log('Supabase Auth failed, trying simple auth...')
        return await simpleSignIn(email, password)
      }
      
      console.log('Supabase Auth successful:', data)
      
      // After successful Supabase Auth, fetch user role from user_accounts table
      if (data.user) {
        try {
          const { data: userAccount, error: roleError } = await supabase
            .from('user_accounts')
            .select('role')
            .eq('user_id', data.user.id)
            .single()
          
          if (!roleError && userAccount) {
            console.log('Setting user role to:', userAccount.role)
            setUser(data.user)
            setUserRole(userAccount.role)
            setLoading(false)
          } else {
            console.log('No user account found, using simple auth...')
            return await simpleSignIn(email, password)
          }
        } catch (roleError) {
          console.log('Error fetching user role, using simple auth...')
          return await simpleSignIn(email, password)
        }
      }
      
      return data
    } catch (error) {
      // If Supabase Auth throws an error, try simple auth
      console.log('Supabase Auth error, trying simple auth...')
      return await simpleSignIn(email, password)
    }
  }

  const signOut = async () => {
    setUser(null)
    setUserRole(null)
    setLoading(false)
    // Try to sign out from Supabase Auth as well
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Supabase sign out error:', error)
    }
  }

  const forceLogout = async () => {
    console.log('Force logout called')
    setUser(null)
    setUserRole(null)
    setLoading(false)
    // Clear any stored session data
    localStorage.removeItem('supabase.auth.token')
    sessionStorage.clear()
    // Try to sign out from Supabase Auth
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Supabase sign out error:', error)
    }
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) throw error
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    })
    if (error) throw error
  }

  const value = {
    user,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    forceLogout,
    resetPassword,
    updatePassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 