import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingBag, 
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        destination_country,
        destination_city,
        shipping_region,
        shipping_method,
        customers (
          destination,
          destination_country,
          destination_city
        )
      `)
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const { data: sacks } = await supabase
      .from('sacks')
      .select(`
        destination,
        destination_country,
        destination_city,
        shipping_region,
        shipping_method,
        customers (
          destination,
          destination_country,
          destination_city
        )
      `)
      .in('status', ['packed', 'in_transit', 'out_for_delivery']);
    
    const allParcels = [...(boxes || []), ...(sacks || [])];
    
    // Process destination data with better fallback logic
    const destinationCounts = {};
    const regionalBreakdown = {};
    const shippingMethods = {};
    
    allParcels.forEach(parcel => {
      // Better destination fallback logic
      const destination = parcel.destination || 
                        parcel.destination_city || 
                        parcel.destination_country || 
                        parcel.customers?.destination ||
                        parcel.customers?.destination_city ||
                        parcel.customers?.destination_country ||
                        'Unknown Location';
      
      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;
      
      // Better region fallback logic
      const region = parcel.shipping_region || 
                    parcel.destination_country || 
                    parcel.customers?.destination_country ||
                    'Unknown Region';
      
      regionalBreakdown[region] = (regionalBreakdown[region] || 0) + 1;
      
      // Better shipping method fallback logic
      const method = parcel.shipping_method || 'Standard Shipping';
      shippingMethods[method] = (shippingMethods[method] || 0) + 1;
    });
    
    // Filter out "Unknown" entries if they're a small percentage
    const totalParcels = allParcels.length;
    const unknownThreshold = totalParcels * 0.1; // 10% threshold
    
    // Clean up destination counts
    Object.keys(destinationCounts).forEach(key => {
      if (key.includes('Unknown') && destinationCounts[key] < unknownThreshold) {
        delete destinationCounts[key];
      }
    });
    
    // Clean up regional breakdown
    Object.keys(regionalBreakdown).forEach(key => {
      if (key.includes('Unknown') && regionalBreakdown[key] < unknownThreshold) {
        delete regionalBreakdown[key];
      }
    });
    
    // Clean up shipping methods
    Object.keys(shippingMethods).forEach(key => {
      if (key.includes('Unknown') && shippingMethods[key] < unknownThreshold) {
        delete shippingMethods[key];
      }
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
    const statusLower = status.toLowerCase();
    
    // Handle various status messages
    if (statusLower.includes('packed') || statusLower.includes('received and processed')) {
      return 'text-blue-400 bg-blue-900/20 border border-blue-500/20';
    }
    if (statusLower.includes('in transit') || statusLower.includes('transit')) {
      return 'text-yellow-400 bg-yellow-900/20 border border-yellow-500/20';
    }
    if (statusLower.includes('out for delivery') || statusLower.includes('delivery')) {
      return 'text-orange-400 bg-orange-900/20 border border-orange-500/20';
    }
    if (statusLower.includes('delivered') || statusLower.includes('delivery successful')) {
      return 'text-green-400 bg-green-900/20 border border-green-500/20';
    }
    if (statusLower.includes('returned') || statusLower.includes('return')) {
      return 'text-red-400 bg-red-900/20 border border-red-500/20';
    }
    
    // Default case
    return 'text-gray-400 bg-gray-900/20 border border-gray-500/20';
  };

  const getStatusText = (status) => {
    const statusLower = status.toLowerCase();
    
    // Handle various status messages
    if (statusLower.includes('packed') || statusLower.includes('received and processed')) {
      return 'Packed';
    }
    if (statusLower.includes('in transit') || statusLower.includes('transit')) {
      return 'In Transit';
    }
    if (statusLower.includes('out for delivery') || statusLower.includes('delivery')) {
      return 'Out for Delivery';
    }
    if (statusLower.includes('delivered') || statusLower.includes('delivery successful')) {
      return 'Delivered';
    }
    if (statusLower.includes('returned') || statusLower.includes('return')) {
      return 'Returned';
    }
    
    // Return original status if no match
    return status;
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
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading warehouse analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Warehouse Operations Analytics</h2>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchWarehouseAnalytics}
            className="flex items-center space-x-1 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {analytics.alerts.length > 0 && (
        <div className="space-y-2">
          {analytics.alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'} className="bg-gray-800 border-gray-700">
              <alert.icon className="h-4 w-4" />
              <AlertDescription className="text-gray-300">{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Total Parcels</p>
                <p className="text-2xl font-bold text-white">{analytics.operational.totalParcels}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Pending Processing</p>
                <p className="text-2xl font-bold text-white">{analytics.operational.pendingProcessing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">In Transit</p>
                <p className="text-2xl font-bold text-white">{analytics.operational.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Scale className="h-8 w-8 text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Total Weight</p>
                <p className="text-2xl font-bold text-white">{analytics.operational.totalWeight.toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Productivity and Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Productivity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Processed Today</span>
                <span className="text-sm font-medium text-white">{analytics.productivity.parcelsProcessedToday}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Processed This Week</span>
                <span className="text-sm font-medium text-white">{analytics.productivity.parcelsProcessedThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Processed This Month</span>
                <span className="text-sm font-medium text-white">{analytics.productivity.parcelsProcessedThisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Daily Efficiency</span>
                <span className="text-sm font-medium text-white">{analytics.productivity.efficiency} parcels/day</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Warehouse Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Boxes in Warehouse</span>
                <span className="text-sm font-medium text-white">{analytics.inventory.boxesInWarehouse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Sacks in Warehouse</span>
                <span className="text-sm font-medium text-white">{analytics.inventory.sacksInWarehouse}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Total Inventory Weight</span>
                <span className="text-sm font-medium text-white">{analytics.inventory.totalInventoryWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Low Stock Alerts</span>
                <span className="text-sm font-medium text-white">{analytics.inventory.lowStockAlerts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Destination Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Destinations */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Top Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.destinations.topDestinations.map((dest, index) => (
                <div key={dest.destination} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-400 mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium text-white">{dest.destination}</span>
                  </div>
                  <span className="text-sm text-gray-400">{dest.count} parcels</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Regional Breakdown */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Regional Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.destinations.regionalBreakdown).map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-white">{region}</span>
                  </div>
                  <span className="text-sm text-gray-400">{count} parcels</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Methods */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Shipping Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.destinations.shippingMethods).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Truck className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-white">{method}</span>
                  </div>
                  <span className="text-sm text-gray-400">{count} parcels</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Time</TableHead>
                <TableHead className="text-gray-300">Parcel</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentActivity.map((activity) => (
                <TableRow key={activity.id} className="border-gray-700">
                  <TableCell className="text-sm text-gray-400">
                    {formatTimestamp(activity.timestamp)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm font-medium text-white">{activity.parcelType}</span>
                      <p className="text-sm text-gray-400">{activity.content}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-white">{activity.customer}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(activity.status)}>
                      {getStatusText(activity.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {activity.comment || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseStaffAnalytics; 