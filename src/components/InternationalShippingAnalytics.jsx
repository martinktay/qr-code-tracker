import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  MapPin, 
  Plane, 
  Ship, 
  Truck, 
  Package, 
  Package2,
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading international shipping analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">International Shipping Analytics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Globe className="w-4 h-4" />
          <span>Nigeria → Global</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Shipments</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalShipments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Weight</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalWeight.toFixed(1)} kg</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₦{analytics.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(analytics.recentShipments.map(s => s.customer)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments by Region */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipments by Region</h3>
          <div className="space-y-3">
            {Object.entries(analytics.shipmentsByRegion).map(([region, count]) => (
              <div key={region} className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{region}</span>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRegionColor(region)}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Methods */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Methods</h3>
          <div className="space-y-3">
            {Object.entries(analytics.shipmentsByMethod).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between">
                <div className="flex items-center">
                  {method === 'Air' && <Plane className="w-4 h-4 text-gray-500 mr-2" />}
                  {method === 'Sea' && <Ship className="w-4 h-4 text-gray-500 mr-2" />}
                  {method === 'Land' && <Truck className="w-4 h-4 text-gray-500 mr-2" />}
                  {method === 'Mixed' && <Package className="w-4 h-4 text-gray-500 mr-2" />}
                  <span className="text-sm font-medium text-gray-900">{method}</span>
                </div>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getMethodColor(method)}`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Destinations */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Destinations</h3>
          <div className="space-y-3">
            {analytics.topDestinations.map((dest, index) => (
              <div key={dest.destination} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                  <span className="text-sm font-medium text-gray-900">{dest.destination}</span>
                </div>
                <span className="text-sm text-gray-600">{dest.count} shipments</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent International Shipments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.recentShipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {shipment.type === 'box' ? 'Box' : 'Sack'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                      {getStatusText(shipment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {shipment.weight} kg
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₦{shipment.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shipment.created_at).toLocaleDateString()}
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

export default InternationalShippingAnalytics; 