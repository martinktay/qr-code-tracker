import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import InternationalShippingAnalytics from '../components/InternationalShippingAnalytics'
import WarehouseStaffAnalytics from '../components/WarehouseStaffAnalytics'
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
  User
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
  const [activeTab, setActiveTab] = useState('overview') // 'overview', 'international', or 'warehouse'

  useEffect(() => {
    console.log('Dashboard useEffect triggered - userRole:', userRole, 'user:', user)
    fetchDashboardData()
  }, [userRole, user])

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
      console.log('Fetching real database data...')
      
      // Fetch all data with detailed logging
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('*')
      
      console.log('Boxes fetched:', boxes?.length || 0, 'Error:', boxesError)
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('*')
      
      console.log('Sacks fetched:', sacks?.length || 0, 'Error:', sacksError)
      
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
      
      console.log('Customers fetched:', customers?.length || 0, 'Error:', customersError)
      
      const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('*')
      
      console.log('Users fetched:', users?.length || 0, 'Error:', usersError)
      
      const allParcels = [...(boxes || []), ...(sacks || [])]
      const totalWeight = allParcels.reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0)
      
      const realStats = {
        totalBoxes: boxes?.length || 0,
        totalSacks: sacks?.length || 0,
        inTransit: allParcels.filter(p => p.status === 'in_transit').length,
        delivered: allParcels.filter(p => p.status === 'delivered').length,
        pending: allParcels.filter(p => p.status === 'packed').length,
        totalCustomers: customers?.length || 0,
        totalUsers: users?.length || 0,
        alerts: allParcels.filter(p => p.status === 'packed').length,
        totalWeight: totalWeight
      }
      
      console.log('Real stats calculated:', realStats)
      console.log('All parcels:', allParcels)
      
      // Update stats with real data
      setStats(realStats)
      
    } catch (error) {
      console.error('Error fetching real data:', error)
    }
  }

  const fetchAdminDashboard = async () => {
    try {
      console.log('Fetching admin dashboard data...')
      
      // Admin sees all data and system statistics
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('status, weight_kg, created_at')
      
      console.log('Boxes data:', boxes)
      console.log('Boxes error:', boxesError)
      
      if (boxesError) {
        console.error('Error fetching boxes:', boxesError)
      }
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('status, weight_kg, created_at')
      
      console.log('Sacks data:', sacks)
      console.log('Sacks error:', sacksError)
      
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
      
      console.log('Calculated stats:', stats)
      console.log('All parcels:', allParcels)
      
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Database className="h-6 w-6 text-blue-600 mr-2" />
          System Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Customers</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Users</p>
                <p className="text-3xl font-bold text-green-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-lg">
                <Bell className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Pending Alerts</p>
                <p className="text-3xl font-bold text-red-900">{stats.alerts}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl shadow-sm border border-indigo-200">
            <div className="flex items-center">
              <div className="p-3 bg-indigo-500 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-indigo-600">Total Boxes</p>
                <p className="text-3xl font-bold text-indigo-900">{stats.totalBoxes}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Package2 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Total Sacks</p>
                <p className="text-3xl font-bold text-emerald-900">{stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl shadow-sm border border-purple-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500 rounded-lg">
                <PackageSearch className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Total Parcels</p>
                <p className="text-3xl font-bold text-purple-900">{stats.totalBoxes + stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500 rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-600">In Transit</p>
                <p className="text-3xl font-bold text-amber-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <PackageCheck className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Delivered</p>
                <p className="text-3xl font-bold text-green-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center">
              <div className="p-3 bg-slate-500 rounded-lg">
                <Scale className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-600">Total Weight</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalWeight.toFixed(1)} kg</p>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="h-6 w-6 text-blue-600 mr-2" />
          Operations Overview
        </h2>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
          <div className="flex items-center">
            <div className="p-3 bg-amber-500 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-amber-800">
                You have <span className="text-2xl font-bold text-amber-900">{stats.alerts}</span> parcels that need attention
              </p>
              <p className="text-sm text-amber-700 mt-1">These parcels require immediate processing or status updates</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Boxes</p>
                <p className="text-3xl font-bold text-blue-900">{stats.totalBoxes}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl shadow-sm border border-emerald-200">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-500 rounded-lg">
                <Package2 className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-emerald-600">Total Sacks</p>
                <p className="text-3xl font-bold text-emerald-900">{stats.totalSacks}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-500 rounded-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-amber-600">In Transit</p>
                <p className="text-3xl font-bold text-amber-900">{stats.inTransit}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-500 rounded-lg">
                <PackageCheck className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Delivered</p>
                <p className="text-3xl font-bold text-green-900">{stats.delivered}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl shadow-sm border border-red-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-500 rounded-lg">
                <PackageX className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-red-600">Need Attention</p>
                <p className="text-3xl font-bold text-red-900">{stats.alerts}</p>
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

  console.log('Dashboard render - loading:', loading, 'userRole:', userRole, 'user:', user)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Debug Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>User Role:</strong> {userRole || 'undefined'}
          </div>
          <div>
            <strong>User ID:</strong> {user?.id || 'undefined'}
          </div>
          <div>
            <strong>Loading:</strong> {loading ? 'true' : 'false'}
          </div>
          <div>
            <strong>Stats Total Boxes:</strong> {stats.totalBoxes}
          </div>
        </div>
      </div>

      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to SmartExporters Logistics Platform
            {userRole === 'admin' && ' - Administrative View'}
            {userRole === 'warehouse_staff' && ' - Operations View'}
            {userRole === 'customer' && ' - Customer View'}
          </p>
        </div>
        <button
          onClick={fetchRealData}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      {/* Admin Dashboard with Tabs */}
      {userRole === 'admin' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Admin Dashboard Debug</h3>
            <p className="text-green-700">Admin dashboard is rendering correctly!</p>
            <p className="text-green-700">User Role: {userRole}</p>
            <p className="text-green-700">User ID: {user?.id}</p>
          </div>
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
        </div>
      )}

      {/* Other Role Dashboards */}
      {userRole === 'warehouse_staff' && (
        <div className="space-y-6">
          {/* Tab Navigation for Warehouse Staff */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <nav className="flex space-x-8 px-6 py-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Operations Overview
              </button>
              <button
                onClick={() => setActiveTab('warehouse')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'warehouse'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Detailed Analytics
              </button>
            </nav>
          </div>

          {/* Tab Content for Warehouse Staff */}
          {activeTab === 'overview' && renderWarehouseDashboard()}
          {activeTab === 'warehouse' && <WarehouseStaffAnalytics />}
        </div>
      )}
      
      {/* Fallback for unknown roles or debugging */}
      {!userRole && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">No User Role Detected</h3>
          <p className="text-red-700">Please check your authentication status. Current user: {JSON.stringify(user)}</p>
        </div>
      )}
      
      {/* Debug: Show what role is detected */}
      {userRole && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Role Detection Debug</h3>
          <p className="text-blue-700">Detected Role: <strong>{userRole}</strong></p>
          <p className="text-blue-700">User ID: {user?.id}</p>
          <p className="text-blue-700">User Email: {user?.email}</p>
        </div>
      )}
      
      {userRole === 'customer' && renderCustomerDashboard()}

      {/* Fallback: If no specific dashboard is rendered, show a generic one */}
      {userRole && userRole !== 'admin' && userRole !== 'warehouse_staff' && userRole !== 'customer' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Generic Dashboard</h3>
          <p className="text-yellow-700">No specific dashboard found for role: <strong>{userRole}</strong></p>
          <p className="text-yellow-700">Showing generic dashboard...</p>
          {renderCustomerDashboard()}
        </div>
      )}

      {/* Track Package Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="p-3 bg-blue-500 rounded-lg mr-4">
              <Search className="h-6 w-6 text-white" />
            </div>
            <input
              type="text"
              placeholder="Search for a package by ID, customer, or destination..."
              className="border-0 outline-none text-lg placeholder-gray-500 flex-1 bg-transparent"
            />
          </div>
          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                {userRole === 'admin' && 'Recent Parcels'}
                {userRole === 'warehouse_staff' && 'Parcels Needing Attention'}
                {userRole === 'customer' && 'My Recent Shipments'}
              </h3>
            </div>
            <Link to="/map" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
              View all
              <MapPin className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">TYPE</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CUSTOMER</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DESTINATION</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DATE</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {recentParcels.map((parcel) => (
                <tr key={parcel.box_id || parcel.sack_id} className="hover:bg-blue-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      parcel.type === 'box' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {parcel.type === 'box' ? '📦 Box' : '📦 Sack'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {parcel.customers?.first_name} {parcel.customers?.last_name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {parcel.customers?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    {parcel.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)}`}>
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
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg font-medium">No parcels found</p>
            <p className="text-gray-400 text-sm mt-1">Start by registering a new parcel or check your filters</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard 