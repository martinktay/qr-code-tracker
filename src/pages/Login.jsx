import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Building2, Eye, EyeOff, Package, User, Shield, QrCode, RefreshCw, Mail, Phone, Lock, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import toast from 'react-hot-toast'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'customer',
    phone: ''
  })

  const { signIn, signUp, forceLogout, user, resetPassword, loading } = useAuth()
  const navigate = useNavigate()

  // Debug logging to check if signIn function is available
  useEffect(() => {
    if (typeof signIn !== 'function') {
      console.error('Login component: signIn function is NOT available!')
    } else {
      console.log('Login component: signIn function is available')
    }
  }, [signIn])

  // Stable redirect if user is already authenticated
  useEffect(() => {
    if (user && !loading && !isSubmitting) {
      console.log('Login page: User already authenticated, redirecting...')
      // Add a longer delay to prevent rapid navigation
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, loading, isSubmitting, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (isLogin) {
        if (typeof signIn !== 'function') {
          throw new Error('signIn function is not available. Please refresh the page and try again.')
        }
        console.log('Calling signIn with:', formData.email, formData.password)
        await signIn(formData.email, formData.password)
        toast.success('Successfully signed in!')
      } else {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          toast.error('Passwords do not match')
          setIsSubmitting(false)
          return
        }
        
        if (formData.password.length < 6) {
          toast.error('Password must be at least 6 characters long')
          setIsSubmitting(false)
          return
        }

        if (typeof signUp !== 'function') {
          throw new Error('signUp function is not available. Please refresh the page and try again.')
        }
        await signUp(formData.email, formData.password, {
          username: formData.username,
          role: formData.role,
          phone: formData.phone
        })
        toast.success('Account created successfully! Please check your email to verify your account.')
      }
      // Add longer delay before navigation to prevent rapid redirects
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 1000)
    } catch (error) {
      console.error('Login/Register error:', error)
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast.error('Please enter your email address')
      return
    }

    setForgotPasswordLoading(true)
    try {
      await resetPassword(forgotPasswordEmail)
      toast.success('Password reset email sent! Please check your inbox.')
      setShowForgotPassword(false)
      setForgotPasswordEmail('')
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email')
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleChange = (value) => {
    setFormData({
      ...formData,
      role: value
    })
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      username: '',
      role: 'customer',
      phone: ''
    })
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center text-white">
            {isLogin ? 'Welcome to SmartExporters' : 'Join SmartExporters'}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {isLogin ? 'Sign in to access your logistics dashboard' : 'Create your account to get started'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <LoadingButton
              variant="ghost"
              size="sm"
              onClick={forceLogout}
              className="text-xs text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Clear Session & Refresh
            </LoadingButton>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                    autoComplete="username"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required={!isLogin}
                    autoComplete="tel"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-gray-300">Role</Label>
                  <Select value={formData.role} onValueChange={handleRoleChange}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
                autoComplete="email"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Only show on signup */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLogin}
                    autoComplete="new-password"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-400">Passwords do not match</p>
                )}
                {formData.password && formData.password.length < 6 && (
                  <p className="text-sm text-red-400">Password must be at least 6 characters long</p>
                )}
              </div>
            )}

            {/* Forgot Password Link - Only show on login */}
            {isLogin && (
              <div className="text-right">
                <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      Forgot your password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Reset Password</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-email" className="text-gray-300">Email</Label>
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="Enter your email address"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          autoComplete="email"
                          className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 focus:bg-gray-700 hover:bg-gray-700 [&:-webkit-autofill]:bg-gray-700 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[0_0_0_30px_rgb(55,65,81)_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setShowForgotPassword(false)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                        >
                          Cancel
                        </Button>
                        <LoadingButton
                          onClick={handleForgotPassword}
                          loading={forgotPasswordLoading}
                          loadingText="Sending..."
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Send Reset Link
                        </LoadingButton>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            <LoadingButton
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              loading={isSubmitting}
              loadingText={isLogin ? "Signing in..." : "Creating account..."}
            >
              {isLogin ? "Sign In" : "Create Account"}
            </LoadingButton>
          </form>

          <Separator className="bg-gray-700" />

          <div className="text-center">
            <p className="text-sm text-gray-400">
              {isLogin ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(false)
                      resetForm()
                    }}
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Create one now
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(true)
                      resetForm()
                    }}
                    className="font-semibold text-blue-400 hover:text-blue-300 transition-colors duration-200"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {!isLogin && (
            <Alert className="bg-gray-700 border-gray-600">
              <Shield className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-gray-300">
                By creating an account, you agree to our terms of service and privacy policy.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Login 