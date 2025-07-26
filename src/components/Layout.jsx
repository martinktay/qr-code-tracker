import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Package, 
  Package2, 
  Scan, 
  Map, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Building,
  Users,
  BarChart3,
  MessageSquare,
  Search
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userRole, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      allowedRoles: ['admin', 'warehouse_staff', 'customer'],
      description: 'Overview and statistics'
    },
    { 
      name: 'Register Box', 
      href: '/register-box', 
      icon: Package, 
      allowedRoles: ['admin', 'warehouse_staff'],
      description: 'Add new box parcels'
    },
    { 
      name: 'Register Sack', 
      href: '/register-sack', 
      icon: Package2, 
      allowedRoles: ['admin', 'warehouse_staff'],
      description: 'Add new sack parcels'
    },
    { 
      name: 'Scan & Log', 
      href: '/scan-log', 
      icon: Scan, 
      allowedRoles: ['admin', 'warehouse_staff'],
      description: 'Update parcel status'
    },
    { 
      name: 'Map Tracker', 
      href: '/map', 
      icon: Map, 
      allowedRoles: ['admin', 'warehouse_staff'],
      description: 'View parcels on map'
    },
    { 
      name: 'Track Package', 
      href: '/portal', 
      icon: Search, 
      allowedRoles: ['admin', 'warehouse_staff', 'customer'],
      description: 'Search and track parcels'
    },
    { 
      name: 'User Management', 
      href: '/admin', 
      icon: Users, 
      allowedRoles: ['admin'],
      description: 'Manage users and roles'
    },
    { 
      name: 'System Settings', 
      href: '/admin', 
      icon: Settings, 
      allowedRoles: ['admin'],
      description: 'Company settings and branding'
    },
    { 
      name: 'Analytics', 
      href: '/admin', 
      icon: BarChart3, 
      allowedRoles: ['admin'],
      description: 'System analytics and reports'
    },
    { 
      name: 'Messaging', 
      href: '/admin', 
      icon: MessageSquare, 
      allowedRoles: ['admin'],
      description: 'Communication settings'
    }
  ]

  const filteredNavigation = navigation.filter(item => 
    item.allowedRoles.includes(userRole)
  )

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator'
      case 'warehouse_staff':
        return 'Warehouse Staff'
      case 'customer':
        return 'Customer'
      default:
        return role?.replace('_', ' ')
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50'
      case 'warehouse_staff':
        return 'text-blue-600 bg-blue-50'
      case 'customer':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-xl font-bold text-primary-600">SmartTrack</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                  title={item.description}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <Building className="h-8 w-8 text-primary-600 mr-2" />
            <h1 className="text-xl font-bold text-primary-600">SmartTrack</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  title={item.description}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(userRole)}`}>
                  {getRoleDisplayName(userRole)}
                </span>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="mt-3 flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1">
              <div className="flex items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  {filteredNavigation.find(item => item.href === location.pathname)?.name || 'SmartTrack'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <p className={`text-xs ${getRoleColor(userRole)}`}>
                    {getRoleDisplayName(userRole)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout 