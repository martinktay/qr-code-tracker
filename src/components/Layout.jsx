import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Menu, 
  X, 
  Home, 
  Package, 
  ShoppingBag, 
  QrCode, 
  MapPin, 
  User, 
  Database, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  LogOut,
  UserCircle,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-400', description: 'Overview and statistics' },
    { name: 'Register Box', href: '/register-box', icon: Package, color: 'text-blue-400', description: 'Register new box', roles: ['admin', 'warehouse_staff'] },
    { name: 'Register Sack', href: '/register-sack', icon: ShoppingBag, color: 'text-green-400', description: 'Register new sack', roles: ['admin', 'warehouse_staff'] },
    { name: 'Scan & Log', href: '/scan-and-log', icon: QrCode, color: 'text-purple-400', description: 'Scan and log activities', roles: ['admin', 'warehouse_staff'] },
    { name: 'Map Tracker', href: '/map-tracker', icon: MapPin, color: 'text-cyan-400', description: 'Track parcels on map' },
    { name: 'Communication Center', href: '/communication-center', icon: MessageSquare, color: 'text-orange-400', description: 'Communicate with staff and customers' },
    { name: 'Customer Portal', href: '/portal', icon: User, color: 'text-indigo-400', description: 'Customer tracking portal' },
    { name: 'Admin Panel', href: '/admin-panel', icon: Database, color: 'text-orange-400', description: 'Admin management', roles: ['admin'] },
    { name: 'Test Functionality', href: '/test', icon: Settings, color: 'text-gray-400', description: 'Test app functionality', roles: ['admin'] },
    { name: 'Help', href: '/help', icon: HelpCircle, color: 'text-gray-400', description: 'Get help and support' },
  ]

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true
    return item.roles.includes(userRole)
  })

  const handleSignOut = async () => {
    try {
      await signOut()
      // Add longer delay to prevent rapid navigation
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 500)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (href) => {
    console.log('Checking if active:', href, 'Current pathname:', location.pathname);
    return location.pathname === href
  }

  const handleHomeNavigation = () => {
    // Add longer delay to prevent rapid navigation
    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 border-r border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white">SmartExporters</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    console.log('Navigation clicked:', item.name, 'to:', item.href);
                    if (item.name === 'Communication Center') {
                      console.log('Communication Center link clicked!');
                    }
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-4 left-4 right-4">
            <Separator className="mb-4 bg-gray-700" />
            <div className="flex items-center space-x-3 px-3 py-2">
              <UserCircle className="h-5 w-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <Badge className="bg-gray-600 text-white text-xs capitalize">
                  {userRole}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 border-r border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button
              onClick={handleHomeNavigation}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
            >
              SmartExporters
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    console.log('Navigation clicked:', item.name, 'to:', item.href);
                    if (item.name === 'Communication Center') {
                      console.log('Communication Center link clicked!');
                    }
                  }}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={item.description}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            })}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <UserCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                  <Badge className="bg-gray-600 text-white text-xs capitalize">
                    {userRole}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-900 ml-2 flex-shrink-0"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <h1 className="text-lg font-semibold text-white">
                {filteredNavigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <UserCircle className="h-5 w-5 text-blue-400" />
                <span className="text-sm text-gray-300">{user?.email}</span>
                <Badge className="bg-gray-600 text-white text-xs capitalize">
                  {userRole}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-red-400 hover:text-red-300 hover:bg-red-900"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 bg-gray-900 min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 border-t border-gray-700 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">© 2024 Twools Ltd. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-6">
                <Link 
                  to="/terms" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Terms of Use
                </Link>
                <Link 
                  to="/privacy" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/help" 
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Help & Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout 