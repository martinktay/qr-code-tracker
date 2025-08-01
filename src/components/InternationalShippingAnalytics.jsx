import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  MapPin, 
  Plane, 
  Ship, 
  Truck, 
  Package, 
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const InternationalShippingAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalShipments: 0,
    totalWeight: 0,
    totalRevenue: 0,
    shipmentsByRegion: {},
    shipmentsByStatus: {},
    shipmentsByMethod: {},
    topDestinations: [],
    recentShipments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternationalAnalytics();
  }, []);

  const fetchInternationalAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch all boxes and sacks with enhanced data
      const { data: boxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone,
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
            phone,
            destination,
            price
          )
        `);

      const allShipments = [
        ...(boxes || []).map(box => ({ ...box, type: 'box' })),
        ...(sacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ];

      // Process analytics
      const processedAnalytics = processShipmentData(allShipments);
      setAnalytics(processedAnalytics);
      
    } catch (error) {
      console.error('Error fetching international analytics:', error);
      toast.error('Failed to load shipping analytics');
    } finally {
      setLoading(false);
    }
  };

  const processShipmentData = (shipments) => {
    const regions = {
      'Africa': ['Ghana', 'Kenya', 'South Africa', 'Nigeria', 'Egypt', 'Morocco', 'Ethiopia', 'Uganda', 'Tanzania'],
      'Europe': ['UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria'],
      'North America': ['USA', 'Canada', 'Mexico'],
      'Asia': ['China', 'India', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand'],
      'Oceania': ['Australia', 'New Zealand']
    };

    const shippingMethods = {
      'Air': ['USA', 'UK', 'Canada', 'Australia', 'Germany', 'France'],
      'Sea': ['Ghana', 'Kenya', 'South Africa', 'China', 'India'],
      'Land': ['Nigeria', 'Ghana', 'Togo', 'Benin', 'Cameroon']
    };

    let totalWeight = 0;
    let totalRevenue = 0;
    const shipmentsByRegion = {};
    const shipmentsByStatus = {};
    const shipmentsByMethod = {};
    const destinationCounts = {};
    const recentShipments = [];

    shipments.forEach(shipment => {
      const destination = shipment.customers?.destination || 'Unknown';
      const weight = shipment.weight_kg || 0;
      const price = shipment.customers?.price || 0;

      totalWeight += weight;
      totalRevenue += price;

      // Count by destination
      destinationCounts[destination] = (destinationCounts[destination] || 0) + 1;

      // Categorize by region
      let region = 'Other';
      for (const [regionName, countries] of Object.entries(regions)) {
        if (countries.some(country => destination.toLowerCase().includes(country.toLowerCase()))) {
          region = regionName;
          break;
        }
      }
      shipmentsByRegion[region] = (shipmentsByRegion[region] || 0) + 1;

      // Count by status
      shipmentsByStatus[shipment.status] = (shipmentsByStatus[shipment.status] || 0) + 1;

      // Categorize by shipping method
      let method = 'Mixed';
      for (const [methodName, countries] of Object.entries(shippingMethods)) {
        if (countries.some(country => destination.toLowerCase().includes(country.toLowerCase()))) {
          method = methodName;
          break;
        }
      }
      shipmentsByMethod[method] = (shipmentsByMethod[method] || 0) + 1;

      // Add to recent shipments
      recentShipments.push({
        id: shipment.box_id || shipment.sack_id,
        type: shipment.type,
        destination,
        status: shipment.status,
        weight,
        price,
        customer: `${shipment.customers?.first_name} ${shipment.customers?.last_name}`,
        created_at: shipment.created_at
      });
    });

    // Sort recent shipments by date
    recentShipments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Get top destinations
    const topDestinations = Object.entries(destinationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([destination, count]) => ({ destination, count }));

    return {
      totalShipments: shipments.length,
      totalWeight,
      totalRevenue,
      shipmentsByRegion,
      shipmentsByStatus,
      shipmentsByMethod,
      topDestinations,
      recentShipments: recentShipments.slice(0, 10)
    };
  };

  const getRegionColor = (region) => {
    const colors = {
      'Africa': 'text-green-600 bg-green-50',
      'Europe': 'text-blue-600 bg-blue-50',
      'North America': 'text-purple-600 bg-purple-50',
      'Asia': 'text-orange-600 bg-orange-50',
      'Oceania': 'text-indigo-600 bg-indigo-50',
      'Other': 'text-gray-600 bg-gray-50'
    };
    return colors[region] || colors['Other'];
  };

  const getMethodColor = (method) => {
    const colors = {
      'Air': 'text-blue-600 bg-blue-50',
      'Sea': 'text-green-600 bg-green-50',
      'Land': 'text-orange-600 bg-orange-50',
      'Mixed': 'text-purple-600 bg-purple-50'
    };
    return colors[method] || colors['Mixed'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'packed': 'text-white bg-blue-600',
      'in_transit': 'text-white bg-yellow-600',
      'out_for_delivery': 'text-white bg-orange-600',
      'delivered': 'text-white bg-green-600',
      'returned': 'text-white bg-red-600'
    };
    return colors[status] || 'text-white bg-gray-600';
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
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading international shipping analytics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">International Shipping Analytics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Globe className="w-4 h-4" />
          <span>Nigeria → Global</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Total Shipments</p>
                <p className="text-2xl font-bold text-white">{analytics.totalShipments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Total Weight</p>
                <p className="text-2xl font-bold text-white">{analytics.totalWeight.toFixed(1)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(analytics.totalRevenue, 'NGN')}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  <span className="text-xs text-emerald-400 font-medium">{formatCurrency(analytics.totalRevenue, 'USD')}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-emerald-400 font-medium">{formatCurrency(analytics.totalRevenue, 'EUR')}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-emerald-400 font-medium">{formatCurrency(analytics.totalRevenue, 'GBP')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-indigo-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-400">Active Customers</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(analytics.recentShipments.map(s => s.customer)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments by Region */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Shipments by Region</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.shipmentsByRegion).map(([region, count]) => (
                <div key={region} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-white">{region}</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-700 border-gray-600 text-white">
                    {count}
                  </Badge>
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
              {Object.entries(analytics.shipmentsByMethod).map(([method, count]) => (
                <div key={method} className="flex items-center justify-between">
                  <div className="flex items-center">
                    {method === 'Air' && <Plane className="w-4 h-4 text-gray-400 mr-2" />}
                    {method === 'Sea' && <Ship className="w-4 h-4 text-gray-400 mr-2" />}
                    {method === 'Land' && <Truck className="w-4 h-4 text-gray-400 mr-2" />}
                    {method === 'Mixed' && <Package className="w-4 h-4 text-gray-400 mr-2" />}
                    <span className="text-sm font-medium text-white">{method}</span>
                  </div>
                  <Badge variant="outline" className="bg-gray-700 border-gray-600 text-white">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Destinations */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Top Destinations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topDestinations.map((dest, index) => (
                <div key={dest.destination} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-400 mr-2">#{index + 1}</span>
                    <span className="text-sm font-medium text-white">{dest.destination}</span>
                  </div>
                  <span className="text-sm text-gray-400">{dest.count} shipments</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shipments */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Recent International Shipments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Destination</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Weight</TableHead>
                <TableHead className="text-gray-300">Revenue</TableHead>
                <TableHead className="text-gray-300">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.recentShipments.map((shipment) => (
                <TableRow key={shipment.id} className="border-gray-700">
                  <TableCell>
                    <Badge variant="secondary" className="bg-gray-700 text-white">
                      {shipment.type === 'box' ? 'Box' : 'Sack'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-white">{shipment.customer}</TableCell>
                  <TableCell className="text-gray-300">{shipment.destination}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(shipment.status)}>
                      {getStatusText(shipment.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{shipment.weight} kg</TableCell>
                  <TableCell className="text-gray-300">{formatCurrency(shipment.price, 'NGN')}</TableCell>
                  <TableCell className="text-gray-300">{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternationalShippingAnalytics; 