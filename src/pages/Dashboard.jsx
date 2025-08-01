import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, db } from '../lib/supabase'
import InternationalShippingAnalytics from '../components/InternationalShippingAnalytics'
import WarehouseStaffAnalytics from '../components/WarehouseStaffAnalytics'
import { 
  Package, 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin,
  Plus,
  Search,
  BarChart3,
  Users,
  AlertCircle,
  TrendingUp,
  Globe,
  Database,
  Scale,
  Activity,
  Shield,
  Bell,
  FileText,
  QrCode,
  Building2,
  UserCheck,
  PackageCheck,
  PackageX,
  PackageSearch,
  User,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, userRole } = useAuth()
  const [stats, setStats] = useState({
    totalBoxes: 0,
    totalSacks: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0,
    totalCustomers: 0,
    totalUsers: 0,
    alerts: 0,
    totalWeight: 0
  })
  const [recentParcels, setRecentParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    console.log('Dashboard useEffect triggered - userRole:', userRole, 'user:', user)
    fetchDashboardData()
  }, [userRole, user])

  // Add debugging for role changes
  useEffect(() => {
    console.log('User role changed to:', userRole)
  }, [userRole])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      console.log('Current user role:', userRole)
      console.log('Current user:', user)
      
      // Force fetch real data regardless of role for debugging
      await fetchRealData()
      
      // Also fetch role-specific data if needed
      if (userRole === 'admin') {
        console.log('Fetching admin dashboard...')
        await fetchAdminDashboard()
      } else if (userRole === 'warehouse' || userRole === 'warehouse_staff') {
        console.log('Fetching warehouse dashboard...')
        await fetchWarehouseDashboard()
      } else if (userRole === 'customer') {
        console.log('Fetching customer dashboard...')
        await fetchCustomerDashboard()
      } else {
        console.log('Unknown role, defaulting to customer dashboard...')
        await fetchCustomerDashboard()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  // Force fetch real data from database
  const fetchRealData = async () => {
    try {
      console.log('Dashboard: Fetching real data from database...');
      
      // Use the new database functions
      const [statsData, recentParcelsData] = await Promise.all([
        db.getDashboardStats(),
        db.getRecentParcels(10)
      ]);
      
      console.log('Dashboard: Stats data:', statsData);
      console.log('Dashboard: Recent parcels data:', recentParcelsData);
      
      setStats(statsData);
      setRecentParcels(recentParcelsData);
      
    } catch (error) {
      console.error('Dashboard: Error fetching real data:', error);
      // Set fallback data
      setStats({
        totalBoxes: 0,
        totalSacks: 0,
        inTransit: 0,
        delivered: 0,
        pending: 0,
        totalCustomers: 0,
        totalUsers: 0,
        alerts: 0,
        totalWeight: 0
      });
      setRecentParcels([]);
    }
  }

  const fetchAdminDashboard = async () => {
    // Admin-specific data fetching
    console.log('Admin dashboard data fetched')
  }

  const fetchWarehouseDashboard = async () => {
    // Warehouse-specific data fetching
    console.log('Warehouse dashboard data fetched')
  }

  const fetchCustomerDashboard = async () => {
    // Customer-specific data fetching
    console.log('Customer dashboard data fetched')
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed':
        return 'bg-blue-600 text-white'
      case 'in_transit':
        return 'bg-yellow-600 text-white'
      case 'out_for_delivery':
        return 'bg-orange-600 text-white'
      case 'delivered':
        return 'bg-green-600 text-white'
      case 'returned':
        return 'bg-red-600 text-white'
      default:
        return 'bg-gray-600 text-white'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'packed':
        return 'Packed'
      case 'in_transit':
        return 'In Transit'
      case 'out_for_delivery':
        return 'Out for Delivery'
      case 'delivered':
        return 'Delivered'
      case 'returned':
        return 'Returned'
      default:
        return status
    }
  }

  const StatCard = ({ title, value, icon: Icon, description, color = "blue" }) => {
    const colorClasses = {
      blue: "text-blue-400",
      green: "text-green-400", 
      red: "text-red-400",
      slate: "text-slate-400",
      indigo: "text-indigo-400",
      emerald: "text-emerald-400",
      amber: "text-amber-400"
    }

    const bgClasses = {
      blue: "bg-blue-900",
      green: "bg-green-900", 
      red: "bg-red-900",
      slate: "bg-slate-900",
      indigo: "bg-indigo-900",
      emerald: "bg-emerald-900",
      amber: "bg-amber-900"
    }

    return (
      <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="text-sm font-semibold text-gray-300">{title}</CardTitle>
          <div className={`p-3 ${bgClasses[color]} rounded-xl`}>
            <Icon className={cn("h-6 w-6", colorClasses[color] || colorClasses.blue)} />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-4xl font-bold text-white">{value}</div>
          {description && (
            <p className="text-sm text-gray-400 font-medium">{description}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderAdminDashboard = () => (
    <div className="space-y-12">
      {/* Header Section with Welcome Message */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-xl text-gray-400">
            Welcome back, <span className="text-purple-400 font-semibold">{user?.email}</span>. Here's what's happening with your logistics system.
          </p>
        </div>
      </div>

      {/* Primary Stats Grid - 4 columns on large screens */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
          color="blue"
          description="Registered customers"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UserCheck}
          color="green"
          description="System users"
        />
        <StatCard
          title="Pending Alerts"
          value={stats.alerts}
          icon={Bell}
          color="red"
          description="Requires attention"
        />
        <StatCard
          title="Total Weight"
          value={`${stats.totalWeight.toFixed(1)} kg`}
          icon={Scale}
          color="slate"
          description="Combined weight"
        />
      </div>

      {/* Secondary Stats Grid - 4 columns on large screens */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Boxes"
          value={stats.totalBoxes}
          icon={Package}
          color="indigo"
          description="Registered boxes"
        />
        <StatCard
          title="Total Sacks"
          value={stats.totalSacks}
          icon={ShoppingBag}
          color="emerald"
          description="Registered sacks"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          icon={Truck}
          color="amber"
          description="Currently shipping"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={PackageCheck}
          color="green"
          description="Successfully delivered"
        />
      </div>

      {/* Content Section - 2 columns with better spacing */}
      <div className="grid gap-12 lg:grid-cols-3">
        {/* Recent Activity - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 h-full shadow-xl">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-900 rounded-xl">
                  <Activity className="h-8 w-8 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white text-2xl">Recent Activity</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Latest parcels and system updates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {recentParcels.length > 0 ? (
                  recentParcels.map((parcel, index) => (
                    <div key={index} className="flex items-center gap-6 p-6 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-transparent hover:border-gray-600">
                      <div className="p-4 bg-gray-700 rounded-xl">
                        {parcel.type === 'box' ? (
                          <Package className="h-7 w-7 text-blue-400" />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-base font-semibold leading-none text-white">
                          {parcel.type === 'box' ? parcel.box_id : parcel.sack_id}
                        </p>
                        <p className="text-sm text-gray-400">
                          {parcel.type} • {parcel.content || 'No description'}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(parcel.status)} text-white font-medium px-4 py-2`}>
                        {getStatusText(parcel.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg">No recent activity</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 h-full shadow-xl">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-purple-900 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white text-2xl">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Common tasks and shortcuts
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/register-box">
                  <Package className="mr-4 h-6 w-6 text-blue-400" />
                  Register New Box
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/register-sack">
                  <ShoppingBag className="mr-4 h-6 w-6 text-green-400" />
                  Register New Sack
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/scan-and-log">
                  <QrCode className="mr-4 h-6 w-6 text-purple-400" />
                  Scan & Log Activity
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/admin-panel">
                  <Database className="mr-4 h-6 w-6 text-orange-400" />
                  Admin Panel
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/map-tracker">
                  <MapPin className="mr-4 h-6 w-6 text-cyan-400" />
                  Map Tracker
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderWarehouseDashboard = () => (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">Operations Overview</h2>
          <p className="text-gray-400 text-xl">
            Warehouse operations and package management
          </p>
        </div>
        <Button 
          className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
          onClick={() => window.location.href = '/scan-and-log'}
        >
          <Plus className="h-6 w-6" />
          Scan Package
        </Button>
      </div>

      {/* Alert Section */}
      {stats.alerts > 0 && (
        <Alert className="bg-red-900 border-red-700 shadow-lg">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <AlertDescription className="text-red-200 text-lg">
            You have <span className="font-bold">{stats.alerts}</span> pending items that require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Boxes to Process"
          value={stats.totalBoxes}
          icon={Package}
          color="blue"
          description="Awaiting processing"
        />
        <StatCard
          title="Sacks to Process"
          value={stats.totalSacks}
          icon={ShoppingBag}
          color="green"
          description="Awaiting processing"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          icon={Truck}
          color="amber"
          description="Currently shipping"
        />
        <StatCard
          title="Delivered Today"
          value={stats.delivered}
          icon={PackageCheck}
          color="green"
          description="Successfully delivered"
        />
      </div>

      {/* Content Section */}
      <div className="grid gap-10 lg:grid-cols-3">
        {/* Recent Scans - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 h-full shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-900 rounded-xl">
                  <QrCode className="h-7 w-7 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Recent Scans</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Latest package scans and updates
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {recentParcels.length > 0 ? (
                  recentParcels.map((parcel, index) => (
                    <div key={index} className="flex items-center gap-6 p-6 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-transparent hover:border-gray-600">
                      <div className="p-4 bg-gray-700 rounded-xl">
                        {parcel.type === 'box' ? (
                          <Package className="h-7 w-7 text-blue-400" />
                        ) : (
                          <ShoppingBag className="h-7 w-7 text-green-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <p className="text-base font-semibold leading-none text-white">
                          {parcel.type === 'box' ? parcel.box_id : parcel.sack_id}
                        </p>
                        <p className="text-sm text-gray-400">
                          Scanned at {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge className={`${getStatusColor(parcel.status)} text-white font-medium px-4 py-2`}>
                        {getStatusText(parcel.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <QrCode className="h-8 w-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-lg">No recent scans</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - Takes 1/3 of the space */}
        <div className="lg:col-span-1">
          <Card className="bg-gray-800 border-gray-700 h-full shadow-xl">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-orange-900 rounded-xl">
                  <Activity className="h-8 w-8 text-orange-400" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-white text-2xl">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Common warehouse tasks
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/scan-and-log">
                  <QrCode className="mr-4 h-6 w-6 text-purple-400" />
                  Scan Package
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/register-box">
                  <Package className="mr-4 h-6 w-6 text-blue-400" />
                  Register New Box
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/register-sack">
                  <ShoppingBag className="mr-4 h-6 w-6 text-green-400" />
                  Register New Sack
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start h-14 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500 text-base font-medium" asChild>
                <Link to="/map-tracker">
                  <MapPin className="mr-4 h-6 w-6 text-cyan-400" />
                  View Map Tracker
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )

  const renderCustomerDashboard = () => (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">My Packages</h2>
          <p className="text-gray-400 text-xl">
            Track your packages and view delivery status
          </p>
        </div>
        <Button 
          className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
          onClick={() => window.location.href = '/portal'}
        >
          <Search className="h-6 w-6" />
          Track Package
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Boxes"
          value={stats.totalBoxes}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="My Sacks"
          value={stats.totalSacks}
          icon={ShoppingBag}
          color="green"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          icon={Truck}
          color="amber"
        />
        <StatCard
          title="Delivered"
          value={stats.delivered}
          icon={PackageCheck}
          color="green"
        />
      </div>

      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-900 rounded-xl">
              <Package className="h-8 w-8 text-blue-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-white text-2xl">Recent Packages</CardTitle>
              <CardDescription className="text-gray-400 text-lg">Your latest package updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {recentParcels.length > 0 ? (
            recentParcels.map((parcel, index) => (
              <div key={index} className="flex items-center gap-6 p-6 rounded-xl hover:bg-gray-700 transition-all duration-300 border border-transparent hover:border-gray-600">
                <div className="p-4 bg-gray-700 rounded-xl">
                  {parcel.type === 'box' ? (
                    <Package className="h-7 w-7 text-blue-400" />
                  ) : (
                    <ShoppingBag className="h-7 w-7 text-green-400" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-base font-semibold leading-none text-white">
                    {parcel.type === 'box' ? parcel.box_id : parcel.sack_id}
                  </p>
                  <p className="text-sm text-gray-400">
                    {parcel.content || 'No description'}
                  </p>
                </div>
                <Badge className={`${getStatusColor(parcel.status)} text-white font-medium px-4 py-2`}>
                  {getStatusText(parcel.status)}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gray-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">No recent packages</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="flex items-center gap-8">
          <Skeleton className="h-12 w-64 bg-gray-700" />
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-6">
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-12 w-16 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-4">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </Button>
        {userRole === 'admin' && (
          <Button
            variant={activeTab === 'international' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('international')}
          >
            International Shipping
          </Button>
        )}
        {(userRole === 'warehouse' || userRole === 'warehouse_staff') && (
          <Button
            variant={activeTab === 'warehouse' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('warehouse')}
          >
            Warehouse Analytics
          </Button>
        )}
      </div>

      <Separator />

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          {userRole === 'admin' && renderAdminDashboard()}
          {(userRole === 'warehouse' || userRole === 'warehouse_staff') && renderWarehouseDashboard()}
          {userRole === 'customer' && renderCustomerDashboard()}
        </>
      )}
      
      {activeTab === 'international' && userRole === 'admin' && (
        <InternationalShippingAnalytics />
      )}
      
      {activeTab === 'warehouse' && (userRole === 'warehouse' || userRole === 'warehouse_staff') && (
        <WarehouseStaffAnalytics />
      )}
    </div>
  )
}

export default Dashboard 