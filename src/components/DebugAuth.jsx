import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const DebugAuth = () => {
  const { user, userRole, loading, forceLogout } = useAuth()
  const [dbStats, setDbStats] = useState({})
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    fetchDatabaseStats()
  }, [])

  const fetchDatabaseStats = async () => {
    try {
      setLoadingStats(true)
      
      // Fetch actual counts from database
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('customer_id')
      
      const { data: users, error: usersError } = await supabase
        .from('user_accounts')
        .select('user_id, role')
      
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('box_id, status, weight_kg')
      
      const { data: sacks, error: sacksError } = await supabase
        .from('sacks')
        .select('sack_id, status, weight_kg')
      
      const { data: scanHistory, error: scanError } = await supabase
        .from('scan_history')
        .select('scan_id')
      
      const totalWeight = [...(boxes || []), ...(sacks || [])]
        .reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0)
      
      const stats = {
        customers: customers?.length || 0,
        users: users?.length || 0,
        boxes: boxes?.length || 0,
        sacks: sacks?.length || 0,
        totalParcels: (boxes?.length || 0) + (sacks?.length || 0),
        totalWeight: totalWeight,
        scanHistory: scanHistory?.length || 0,
        userRoles: users?.map(u => u.role) || [],
        boxStatuses: boxes?.map(b => b.status) || [],
        sackStatuses: sacks?.map(s => s.status) || []
      }
      
      setDbStats(stats)
      
      console.log('Database Stats:', stats)
      console.log('Errors:', { customersError, usersError, boxesError, sacksError, scanError })
      
    } catch (error) {
      console.error('Error fetching database stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const handleForceLogout = async () => {
    await forceLogout()
    window.location.href = '/login'
  }

  if (loadingStats) {
    return <div className="p-4">Loading database stats...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Authentication Status</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
            <p><strong>User:</strong> {user ? 'Logged In' : 'Not Logged In'}</p>
            <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
            <p><strong>User Email:</strong> {user?.email || 'N/A'}</p>
            <p><strong>User Role:</strong> {userRole || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Database Counts</h2>
          <div className="space-y-2">
            <p><strong>Customers:</strong> {dbStats.customers}</p>
            <p><strong>Users:</strong> {dbStats.users}</p>
            <p><strong>Boxes:</strong> {dbStats.boxes}</p>
            <p><strong>Sacks:</strong> {dbStats.sacks}</p>
            <p><strong>Total Parcels:</strong> {dbStats.totalParcels}</p>
            <p><strong>Total Weight:</strong> {dbStats.totalWeight.toFixed(1)} kg</p>
            <p><strong>Scan History:</strong> {dbStats.scanHistory}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">User Roles</h2>
          <div className="space-y-1">
            {dbStats.userRoles.map((role, index) => (
              <p key={index}><strong>{role}</strong></p>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Parcel Statuses</h2>
          <div className="space-y-2">
            <div>
              <strong>Box Statuses:</strong>
              <ul className="ml-4">
                {dbStats.boxStatuses.map((status, index) => (
                  <li key={index}>{status}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Sack Statuses:</strong>
              <ul className="ml-4">
                {dbStats.sackStatuses.map((status, index) => (
                  <li key={index}>{status}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        <button 
          onClick={fetchDatabaseStats}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Refresh Database Stats
        </button>
        <button 
          onClick={handleForceLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Force Logout & Go to Login
        </button>
      </div>
    </div>
  )
}

export default DebugAuth 