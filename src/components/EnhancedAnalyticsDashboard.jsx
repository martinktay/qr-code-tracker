import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  Truck, 
  Globe, 
  Users, 
  DollarSign,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Activity,
  MapPin,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const EnhancedAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalShipments: 0,
      totalRevenue: 0,
      totalWeight: 0,
      activeCustomers: 0,
      deliveryRate: 0,
      avgProcessingTime: 0
    },
    trends: {
      dailyShipments: [],
      weeklyRevenue: [],
      monthlyGrowth: 0
    },
    regional: {
      shipmentsByRegion: {},
      topDestinations: [],
      shippingMethods: {}
    },
    operational: {
      statusBreakdown: {},
      warehouseInventory: {},
      recentActivity: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');
  const [viewMode, setViewMode] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const { data: boxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            destination,
            price
          )
        `);
      
      const { data: sacks } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            destination,
            price
          )
        `);

      const allShipments = [
        ...(boxes || []).map(box => ({ ...box, type: 'box' })),
        ...(sacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ];

      // Process analytics
      const processedAnalytics = processAnalyticsData(allShipments);
      setAnalytics(processedAnalytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (shipments) => {
    const totalRevenue = shipments.reduce((sum, s) => sum + (s.customers?.price || 0), 0);
    const totalWeight = shipments.reduce((sum, s) => sum + (s.weight_kg || 0), 0);
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const deliveryRate = shipments.length > 0 ? (delivered / shipments.length) * 100 : 0;

    // Regional breakdown
    const regions = {
      'Africa': ['Ghana', 'Kenya', 'South Africa', 'Nigeria', 'Egypt', 'Morocco', 'Ethiopia', 'Uganda', 'Tanzania'],
      'Europe': ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria'],
      'North America': ['USA', 'Canada', 'Mexico'],
      'Asia': ['China', 'India', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand'],
      'Oceania': ['Australia', 'New Zealand']
    };

    const shipmentsByRegion = {};
    const destinationCounts = {};
    const statusBreakdown = {};
    const shippingMethods = {};

    shipments.forEach(shipment => {
      const destination = shipment.customers?.destination || 'Unknown';
      const status = shipment.status || 'unknown';
      const weight = shipment.weight_kg || 0;

      // Count by destination
      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;

      // Count by status
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      // Categorize by region
      let region = 'Other';
      for (const [regionName, countries] of Object.entries(regions)) {
        if (countries.some(country => destination.toLowerCase().includes(country.toLowerCase()))) {
          region = regionName;
          break;
        }
      }
      shipmentsByRegion[region] = (shipmentsByRegion[region] || 0) + 1;

      // Shipping methods (simplified)
      const method = weight > 10 ? 'Sea' : weight > 5 ? 'Air' : 'Land';
      shippingMethods[method] = (shippingMethods[method] || 0) + 1;
    });

    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));

    return {
      overview: {
        totalShipments: shipments.length,
        totalRevenue,
        totalWeight,
        activeCustomers: new Set(shipments.map(s => `${s.customers?.first_name} ${s.customers?.last_name}`)).size,
        deliveryRate,
        avgProcessingTime: 24 // Placeholder
      },
      trends: {
        dailyShipments: generateDailyData(shipments),
        weeklyRevenue: generateWeeklyRevenue(shipments),
        monthlyGrowth: 15.5 // Placeholder
      },
      regional: {
        shipmentsByRegion,
        topDestinations,
        shippingMethods
      },
      operational: {
        statusBreakdown,
        warehouseInventory: {
          boxesInWarehouse: shipments.filter(s => s.type === 'box' && s.status === 'packed').length,
          sacksInWarehouse: shipments.filter(s => s.type === 'sack' && s.status === 'packed').length,
          totalInventoryWeight: shipments.filter(s => s.status === 'packed').reduce((sum, s) => sum + (s.weight_kg || 0), 0)
        },
        recentActivity: shipments.slice(0, 10).map(s => ({
          id: s.box_id || s.sack_id,
          type: s.type,
          status: s.status,
          customer: `${s.customers?.first_name} ${s.customers?.last_name}`,
          destination: s.customers?.destination,
          created_at: s.created_at
        }))
      }
    };
  };

  const generateDailyData = (shipments) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date,
      shipments: shipments.filter(s => s.created_at?.startsWith(date)).length
    }));
  };

  const generateWeeklyRevenue = (shipments) => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      return date.toISOString().split('T')[0];
    }).reverse();

    return last4Weeks.map(date => ({
      week: `Week ${date.split('-')[1]}`,
      revenue: shipments
        .filter(s => s.created_at?.startsWith(date.substring(0, 7)))
        .reduce((sum, s) => sum + (s.customers?.price || 0), 0)
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'packed': 'text-blue-600 bg-blue-50',
      'in_transit': 'text-yellow-600 bg-yellow-50',
      'out_for_delivery': 'text-orange-600 bg-orange-50',
      'delivered': 'text-green-600 bg-green-50',
      'returned': 'text-red-600 bg-red-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusText = (status) => {
    const statusMap = {
      'packed': 'Packed',
      'in_transit': 'In Transit',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'returned': 'Returned'
    };
    return statusMap[status] || status;
  };

  // Currency conversion rates (example rates)
  const currencyRates = {
    NGN: 1,
    USD: 0.0022, // 1 NGN = 0.0022 USD
    EUR: 0.0020, // 1 NGN = 0.0020 EUR
    GBP: 0.0017  // 1 NGN = 0.0017 GBP
  };

  const formatCurrency = (amount, currency) => {
    const convertedAmount = amount * currencyRates[currency];
    const symbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return `${symbols[currency]}${convertedAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading enhanced analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enhanced Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into your logistics operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAnalytics}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalShipments}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mt-2">
                <Progress value={analytics.overview.deliveryRate} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{analytics.overview.deliveryRate.toFixed(1)}% delivered</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.overview.totalRevenue, 'NGN')}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="mt-2">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{analytics.trends.monthlyGrowth}%</span>
                  <span className="text-gray-500 ml-1">vs last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Weight</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.totalWeight.toFixed(1)} kg</p>
                </div>
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Avg: {(analytics.overview.totalWeight / analytics.overview.totalShipments).toFixed(1)} kg/shipment</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.overview.activeCustomers}</p>
                </div>
                <Users className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500">Avg: {(analytics.overview.totalShipments / analytics.overview.activeCustomers).toFixed(1)} shipments/customer</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
            <TabsTrigger value="operational">Operational</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipment Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.operational.statusBreakdown).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className={getStatusColor(status)}>
                            {getStatusText(status)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{count}</span>
                          <span className="text-sm text-gray-500">
                            ({((count / analytics.overview.totalShipments) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.operational.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{activity.customer}</p>
                            <p className="text-xs text-gray-500">{activity.destination}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={getStatusColor(activity.status)}>
                          {getStatusText(activity.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="regional" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Regional Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipments by Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.regional.shipmentsByRegion).map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{region}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Destinations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Top Destinations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.regional.topDestinations.map((dest, index) => (
                      <div key={dest.destination} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                          <span className="text-sm font-medium">{dest.destination}</span>
                        </div>
                        <span className="text-sm text-gray-600">{dest.count} shipments</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shipping Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analytics.regional.shippingMethods).map(([method, count]) => (
                      <div key={method} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Truck className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{method}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operational" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Warehouse Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Warehouse Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Boxes in Warehouse</span>
                      <span className="text-sm font-medium">{analytics.operational.warehouseInventory.boxesInWarehouse}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Sacks in Warehouse</span>
                      <span className="text-sm font-medium">{analytics.operational.warehouseInventory.sacksInWarehouse}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Inventory Weight</span>
                      <span className="text-sm font-medium">{analytics.operational.warehouseInventory.totalInventoryWeight.toFixed(1)} kg</span>
                    </div>
                    <div className="pt-2">
                      <Progress 
                        value={(analytics.operational.warehouseInventory.boxesInWarehouse + analytics.operational.warehouseInventory.sacksInWarehouse) / 100 * 100} 
                        className="h-2" 
                      />
                      <p className="text-xs text-gray-500 mt-1">Warehouse capacity utilization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <span className="text-sm font-medium">{analytics.overview.deliveryRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing Time</span>
                      <span className="text-sm font-medium">{analytics.overview.avgProcessingTime}h</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Satisfaction</span>
                      <span className="text-sm font-medium">4.8/5.0</span>
                    </div>
                    <div className="pt-2">
                      <Progress value={analytics.overview.deliveryRate} className="h-2" />
                      <p className="text-xs text-gray-500 mt-1">Overall performance score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Shipments Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Shipments (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.dailyShipments.map((day) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{day.shipments}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(day.shipments / Math.max(...analytics.trends.dailyShipments.map(d => d.shipments))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Weekly Revenue (Last 4 Weeks)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.trends.weeklyRevenue.map((week) => (
                      <div key={week.week} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium">{week.week}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{formatCurrency(week.revenue, 'NGN')}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(week.revenue / Math.max(...analytics.trends.weeklyRevenue.map(w => w.revenue))) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedAnalyticsDashboard; 