import React, { useEffect, useRef, useMemo } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, userRole } = useAuth()
  const location = useLocation()
  const redirectCountRef = useRef(0)
  const lastRedirectTimeRef = useRef(0)
  const navigationBlockedRef = useRef(false)

  // Memoize the redirect decision to prevent unnecessary re-renders
  const shouldRedirect = useMemo(() => {
    if (loading) return false
    if (!user) return true
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) return true
    return false
  }, [loading, user, userRole, allowedRoles])

  const getRedirectPath = useMemo(() => {
    if (!user) return '/login'
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) return '/dashboard'
    return null
  }, [user, userRole, allowedRoles])

  // Prevent rapid redirects
  useEffect(() => {
    if (shouldRedirect && !navigationBlockedRef.current) {
      const now = Date.now()
      if (now - lastRedirectTimeRef.current < 1000) {
        redirectCountRef.current++
        if (redirectCountRef.current > 3) {
          console.error('Too many redirects detected, blocking navigation')
          navigationBlockedRef.current = true
          return
        }
      } else {
        redirectCountRef.current = 0
      }
      lastRedirectTimeRef.current = now
    }
  }, [shouldRedirect])

  // Reset navigation block after a delay
  useEffect(() => {
    if (navigationBlockedRef.current) {
      const timer = setTimeout(() => {
        navigationBlockedRef.current = false
        redirectCountRef.current = 0
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [navigationBlockedRef.current])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (navigationBlockedRef.current) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-gray-300">Navigation temporarily blocked due to rapid redirects</p>
          <p className="text-gray-400 text-sm mt-2">Please wait a moment...</p>
        </div>
      </div>
    )
  }

  if (shouldRedirect && getRedirectPath) {
    return <Navigate to={getRedirectPath} replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute 