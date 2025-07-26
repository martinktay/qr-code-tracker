import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import InternationalShippingAnalytics from '../components/InternationalShippingAnalytics'
import { 
  Package, 
  Package2, 
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
  Globe
} from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState('overview') // 'overview' or 'international'

  useEffect(() => {
    fetchDashboardData()
  }, [userRole, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (userRole === 'admin') {
        await fetchAdminDashboard()
      } else if (userRole === 'warehouse_staff') {
        await fetchWarehouseDashboard()
      } else if (userRole === 'customer') {
        await fetchCustomerDashboard()
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminDashboard = async () => {
    try {
      // Admin sees all data and system statistics
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('status, weight_kg, created_at')
      
      if (boxesError) {
        console.error('Error fetching boxes:', boxesError)
      }
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('status, weight_kg, created_at')
      
      if (sacksError) {
        console.error('Error fetching sacks:', sacksError)
      }
      
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('customer_id')
      
      if (customersError) {
        console.error('Error fetching customers:', customersError)
      }
      
      const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('user_id')
      
      if (usersError) {
        console.error('Error fetching users:', usersError)
      }
      
      const allParcels = [...(boxes || []), ...(sacks || [])]
      const totalWeight = allParcels.reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0)
      
      const stats = {
        totalBoxes: boxes?.length || 0,
        totalSacks: sacks?.length || 0,
        inTransit: allParcels.filter(p => p.status === 'in_transit').length,
        delivered: allParcels.filter(p => p.status === 'delivered').length,
        pending: allParcels.filter(p => p.status === 'packed').length,
        totalCustomers: customers?.length || 0,
        totalUsers: users?.length || 0,
        alerts: allParcels.filter(p => p.status === 'packed').length, // Pending deliveries as alerts
        totalWeight: totalWeight
      }
      
      setStats(stats)

      // Fetch recent parcels for admin
      const { data: recentBoxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentSacks } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)

      const recent = [
        ...(recentBoxes || []).map(box => ({ ...box, type: 'box' })),
        ...(recentSacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

      setRecentParcels(recent)
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error)
      toast.error('Failed to load admin dashboard data')
    }
  }

  const fetchWarehouseDashboard = async () => {
    try {
      // Warehouse staff sees operational data - parcels they need to handle
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('status, weight_kg')
        .in('status', ['packed', 'in_transit', 'out_for_delivery'])
      
      if (boxesError) {
        console.error('Error fetching boxes:', boxesError)
      }
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('status, weight_kg')
        .in('status', ['packed', 'in_transit', 'out_for_delivery'])
      
      if (sacksError) {
        console.error('Error fetching sacks:', sacksError)
      }
      
      const allParcels = [...(boxes || []), ...(sacks || [])]
      const totalWeight = allParcels.reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0)
      
      const stats = {
        totalBoxes: boxes?.length || 0,
        totalSacks: sacks?.length || 0,
        inTransit: allParcels.filter(p => p.status === 'in_transit').length,
        delivered: 0, // Warehouse staff don't see delivered items
        pending: allParcels.filter(p => p.status === 'packed').length,
        totalCustomers: 0,
        totalUsers: 0,
        alerts: allParcels.filter(p => p.status === 'packed').length, // Pending items to process
        totalWeight: totalWeight
      }
      
      setStats(stats)

      // Fetch parcels that need attention
      const { data: recentBoxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .in('status', ['packed', 'in_transit', 'out_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentSacks } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .in('status', ['packed', 'in_transit', 'out_for_delivery'])
        .order('created_at', { ascending: false })
        .limit(5)

      const recent = [
        ...(recentBoxes || []).map(box => ({ ...box, type: 'box' })),
        ...(recentSacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

      setRecentParcels(recent)
    } catch (error) {
      console.error('Error fetching warehouse dashboard data:', error)
      toast.error('Failed to load warehouse dashboard data')
    }
  }

  const fetchCustomerDashboard = async () => {
    try {
      // Customer sees only their own parcels
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('phone', user?.phone || '')
        .maybeSingle()

      if (customerError) {
        console.error('Error fetching customer:', customerError)
      }

      if (!customer) {
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
        })
        setRecentParcels([])
        return
      }

      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('status, weight_kg')
        .eq('customer_id', customer.customer_id)
      
      if (boxesError) {
        console.error('Error fetching customer boxes:', boxesError)
      }
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('status, weight_kg')
        .eq('customer_id', customer.customer_id)
      
      if (sacksError) {
        console.error('Error fetching customer sacks:', sacksError)
      }
      
      const allParcels = [...(boxes || []), ...(sacks || [])]
      const totalWeight = allParcels.reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0)
      
      const stats = {
        totalBoxes: boxes?.length || 0,
        totalSacks: sacks?.length || 0,
        inTransit: allParcels.filter(p => p.status === 'in_transit').length,
        delivered: allParcels.filter(p => p.status === 'delivered').length,
        pending: allParcels.filter(p => p.status === 'packed').length,
        totalCustomers: 0,
        totalUsers: 0,
        alerts: allParcels.filter(p => p.status === 'in_transit').length, // In-transit items as alerts
        totalWeight: totalWeight
      }
      
      setStats(stats)

      // Fetch customer's parcels
      const { data: recentBoxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('customer_id', customer.customer_id)
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: recentSacks } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('customer_id', customer.customer_id)
        .order('created_at', { ascending: false })
        .limit(5)

      const recent = [
        ...(recentBoxes || []).map(box => ({ ...box, type: 'box' })),
        ...(recentSacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)

      setRecentParcels(recent)
    } catch (error) {
      console.error('Error fetching customer dashboard data:', error)
      toast.error('Failed to load customer dashboard data')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed':
        return 'bg-blue-100 text-blue-800'
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800'
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'returned':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Boxes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoxes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package2 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Sacks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Parcels</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoxes + stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Weight</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWeight.toFixed(1)} kg</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWarehouseDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations Overview</h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-800">
              You have <strong>{stats.alerts}</strong> parcels that need attention
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Boxes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoxes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package2 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Sacks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Need Attention</p>
                <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCustomerDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Shipments</h2>
        {stats.totalBoxes + stats.totalSacks === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              You don't have any shipments yet. Contact us to get started!
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                You have <strong>{stats.totalBoxes + stats.totalSacks}</strong> active shipments
              </p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">My Boxes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoxes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Package2 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">My Sacks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBoxes + stats.totalSacks}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to SmartTrack Logistics Platform
          {userRole === 'admin' && ' - Administrative View'}
          {userRole === 'warehouse_staff' && ' - Operations View'}
          {userRole === 'customer' && ' - Customer View'}
        </p>
      </div>

      {/* Admin Dashboard with Tabs */}
      {userRole === 'admin' && (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-2" />
                System Overview
              </button>
              <button
                onClick={() => setActiveTab('international')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'international'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Globe className="w-4 h-4 inline mr-2" />
                International Shipping
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderAdminDashboard()}
          {activeTab === 'international' && <InternationalShippingAnalytics />}
        </div>
      )}

      {/* Other Role Dashboards */}
      {userRole === 'warehouse_staff' && renderWarehouseDashboard()}
      {userRole === 'customer' && renderCustomerDashboard()}

      {/* Track Package Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Search className="h-6 w-6 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Search for a package"
              className="border-0 outline-none text-lg placeholder-gray-400 flex-1"
            />
          </div>
          <button className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {userRole === 'admin' && 'Recent Parcels'}
              {userRole === 'warehouse_staff' && 'Parcels Needing Attention'}
              {userRole === 'customer' && 'My Recent Shipments'}
            </h3>
            <Link to="/map" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View all
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESTINATION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DATE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentParcels.map((parcel) => (
                <tr key={parcel.box_id || parcel.sack_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {parcel.type === 'box' ? 'Box' : 'Sack'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {parcel.customers?.first_name} {parcel.customers?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{parcel.customers?.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {parcel.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
                      {getStatusText(parcel.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(parcel.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recentParcels.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No parcels found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 