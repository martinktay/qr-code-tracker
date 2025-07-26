import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Package2, 
  Truck, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  TrendingUp,
  MapPin,
  Users,
  BarChart3,
  Calendar,
  Scale,
  DollarSign,
  Activity,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const WarehouseStaffAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    operational: {
      totalParcels: 0,
      pendingProcessing: 0,
      inTransit: 0,
      outForDelivery: 0,
      totalWeight: 0,
      avgProcessingTime: 0
    },
    productivity: {
      parcelsProcessedToday: 0,
      parcelsProcessedThisWeek: 0,
      parcelsProcessedThisMonth: 0,
      efficiency: 0
    },
    inventory: {
      boxesInWarehouse: 0,
      sacksInWarehouse: 0,
      totalInventoryWeight: 0,
      lowStockAlerts: 0
    },
    destinations: {
      topDestinations: [],
      regionalBreakdown: {},
      shippingMethods: {}
    },
    recentActivity: [],
    alerts: []
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, month
  const [statusFilter, setStatusFilter] = useState('all'); // all, packed, in_transit, out_for_delivery

  useEffect(() => {
    fetchWarehouseAnalytics();
  }, [timeFilter, statusFilter]);

  const fetchWarehouseAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch operational data
      const operationalData = await fetchOperationalData();
      
      // Fetch productivity data
      const productivityData = await fetchProductivityData();
      
      // Fetch inventory data
      const inventoryData = await fetchInventoryData();
      
      // Fetch destination analytics
      const destinationData = await fetchDestinationData();
      
      // Fetch recent activity
      const recentActivity = await fetchRecentActivity();
      
      // Generate alerts
      const alerts = generateAlerts(operationalData, inventoryData);
      
      setAnalytics({
        operational: operationalData,
        productivity: productivityData,
        inventory: inventoryData,
        destinations: destinationData,
        recentActivity,
        alerts
      });
      
    } catch (error) {
      console.error('Error fetching warehouse analytics:', error);
      toast.error('Failed to load warehouse analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperationalData = async () => {
    const { data: boxes } = await supabase
      .from('boxes')
      .select('status, weight_kg, created_at, updated_at')
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const { data: sacks } = await supabase
      .from('sacks')
      .select('status, weight_kg, created_at, updated_at')
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const allParcels = [...(boxes || []), ...(sacks || [])];
    const totalWeight = allParcels.reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0);
    
    // Calculate average processing time (time from created to updated)
    const processingTimes = allParcels
      .filter(p => p.updated_at && p.created_at)
      .map(p => new Date(p.updated_at) - new Date(p.created_at));
    
    const avgProcessingTime = processingTimes.length > 0 
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length 
      : 0;
    
    return {
      totalParcels: allParcels.length,
      pendingProcessing: allParcels.filter(p => p.status === 'packed').length,
      inTransit: allParcels.filter(p => p.status === 'in_transit').length,
      outForDelivery: allParcels.filter(p => p.status === 'out_for_delivery').length,
      totalWeight,
      avgProcessingTime: avgProcessingTime / (1000 * 60 * 60) // Convert to hours
    };
  };

  const fetchProductivityData = async () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Fetch parcels processed in different time periods
    const { data: todayParcels } = await supabase
      .from('scan_history')
      .select('scan_time')
      .gte('scan_time', today.toISOString());
    
    const { data: weekParcels } = await supabase
      .from('scan_history')
      .select('scan_time')
      .gte('scan_time', weekAgo.toISOString());
    
    const { data: monthParcels } = await supabase
      .from('scan_history')
      .select('scan_time')
      .gte('scan_time', monthAgo.toISOString());
    
    // Calculate efficiency (parcels processed per day)
    const efficiency = monthParcels ? monthParcels.length / 30 : 0;
    
    return {
      parcelsProcessedToday: todayParcels?.length || 0,
      parcelsProcessedThisWeek: weekParcels?.length || 0,
      parcelsProcessedThisMonth: monthParcels?.length || 0,
      efficiency: Math.round(efficiency * 10) / 10
    };
  };

  const fetchInventoryData = async () => {
    const { data: boxes } = await supabase
      .from('boxes')
      .select('status, weight_kg')
      .eq('status', 'packed');
    
    const { data: sacks } = await supabase
      .from('sacks')
      .select('status, weight_kg')
      .eq('status', 'packed');
    
    const totalInventoryWeight = [...(boxes || []), ...(sacks || [])]
      .reduce((sum, parcel) => sum + (parcel.weight_kg || 0), 0);
    
    // Low stock alert if less than 10 items in warehouse
    const lowStockAlerts = (boxes?.length || 0) + (sacks?.length || 0) < 10 ? 1 : 0;
    
    return {
      boxesInWarehouse: boxes?.length || 0,
      sacksInWarehouse: sacks?.length || 0,
      totalInventoryWeight,
      lowStockAlerts
    };
  };

  const fetchDestinationData = async () => {
    const { data: boxes } = await supabase
      .from('boxes')
      .select(`
        destination,
        shipping_region,
        shipping_method,
        customers (
          destination
        )
      `)
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const { data: sacks } = await supabase
      .from('sacks')
      .select(`
        destination,
        shipping_region,
        shipping_method,
        customers (
          destination
        )
      `)
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const allParcels = [...(boxes || []), ...(sacks || [])];
    
    // Process destination data
    const destinationCounts = {};
    const regionalBreakdown = {};
    const shippingMethods = {};
    
    allParcels.forEach(parcel => {
      const destination = parcel.destination || parcel.customers?.destination || 'Unknown';
      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
      
      const region = parcel.shipping_region || 'Unknown';
      regionalBreakdown[region] = (regionalBreakdown[region] || 0) + 1;
      
      const method = parcel.shipping_method || 'Unknown';
      shippingMethods[method] = (shippingMethods[method] || 0) + 1;
    });
    
    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));
    
    return {
      topDestinations,
      regionalBreakdown,
      shippingMethods
    };
  };

  const fetchRecentActivity = async () => {
    const { data: recentScans } = await supabase
      .from('scan_history')
      .select(`
        scan_time,
        status_message,
        comment,
        boxes (
          box_id,
          content,
          customers (
            first_name,
            last_name
          )
        ),
        sacks (
          sack_id,
          content,
          customers (
            first_name,
            last_name
          )
        )
      `)
      .order('scan_time', { ascending: false })
      .limit(10);
    
    return (recentScans || []).map(scan => ({
      id: scan.scan_id,
      timestamp: scan.scan_time,
      status: scan.status_message,
      comment: scan.comment,
      parcelType: scan.boxes ? 'Box' : 'Sack',
      parcelId: scan.boxes?.box_id || scan.sacks?.sack_id,
      content: scan.boxes?.content || scan.sacks?.content,
      customer: scan.boxes?.customers 
        ? `${scan.boxes.customers.first_name} ${scan.boxes.customers.last_name}`
        : scan.sacks?.customers 
        ? `${scan.sacks.customers.first_name} ${scan.sacks.customers.last_name}`
        : 'Unknown'
    }));
  };

  const generateAlerts = (operational, inventory) => {
    const alerts = [];
    
    // High pending items alert
    if (operational.pendingProcessing > 20) {
      alerts.push({
        type: 'warning',
        message: `${operational.pendingProcessing} parcels pending processing`,
        icon: AlertCircle
      });
    }
    
    // Low inventory alert
    if (inventory.lowStockAlerts > 0) {
      alerts.push({
        type: 'error',
        message: 'Low inventory in warehouse',
        icon: AlertCircle
      });
    }
    
    // High processing time alert
    if (operational.avgProcessingTime > 48) {
      alerts.push({
        type: 'warning',
        message: 'Average processing time is high',
        icon: Clock
      });
    }
    
    return alerts;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed': return 'text-blue-600 bg-blue-50';
      case 'in_transit': return 'text-yellow-600 bg-yellow-50';
      case 'out_for_delivery': return 'text-orange-600 bg-orange-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'packed': return 'Packed';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      default: return status;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading warehouse analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Warehouse Operations Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select 
              value={timeFilter} 
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <button
            onClick={fetchWarehouseAnalytics}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <alert.icon className={`w-4 h-4 mr-2 ${
                  alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`} />
                <span className={`text-sm ${
                  alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {alert.message}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Parcels</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.operational.totalParcels}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Processing</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.operational.pendingProcessing}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.operational.inTransit}</p>
            </div>
          </div>
        </div>
        
                            <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="flex items-center">
                        <Scale className="h-8 w-8 text-purple-600" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-500">Total Weight</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.operational.totalWeight.toFixed(1)} kg</p>
                        </div>
                      </div>
                    </div>
      </div>

      {/* Productivity and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Productivity Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processed Today</span>
              <span className="text-sm font-medium text-gray-900">{analytics.productivity.parcelsProcessedToday}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processed This Week</span>
              <span className="text-sm font-medium text-gray-900">{analytics.productivity.parcelsProcessedThisWeek}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Processed This Month</span>
              <span className="text-sm font-medium text-gray-900">{analytics.productivity.parcelsProcessedThisMonth}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Efficiency</span>
              <span className="text-sm font-medium text-gray-900">{analytics.productivity.efficiency} parcels/day</span>
            </div>
          </div>
        </div>

        {/* Inventory */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Warehouse Inventory</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Boxes in Warehouse</span>
              <span className="text-sm font-medium text-gray-900">{analytics.inventory.boxesInWarehouse}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sacks in Warehouse</span>
              <span className="text-sm font-medium text-gray-900">{analytics.inventory.sacksInWarehouse}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Inventory Weight</span>
              <span className="text-sm font-medium text-gray-900">{analytics.inventory.totalInventoryWeight.toFixed(1)} kg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Stock Alerts</span>
              <span className="text-sm font-medium text-gray-900">{analytics.inventory.lowStockAlerts}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Destination Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destinations */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Destinations</h3>
          <div className="space-y-3">
            {analytics.destinations.topDestinations.map((dest, index) => (
              <div key={dest.destination} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{dest.destination}</span>
                </div>
                <span className="text-sm text-gray-600">{dest.count} parcels</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Regional Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(analytics.destinations.regionalBreakdown).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{region}</span>
                </div>
                <span className="text-sm text-gray-600">{count} parcels</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Methods</h3>
          <div className="space-y-3">
            {Object.entries(analytics.destinations.shippingMethods).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Truck className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{method}</span>
                </div>
                <span className="text-sm text-gray-600">{count} parcels</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parcel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentActivity.map((activity) => (
                <tr key={activity.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{activity.parcelType}</span>
                      <p className="text-sm text-gray-500">{activity.content}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      {getStatusText(activity.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.comment || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WarehouseStaffAnalytics; 