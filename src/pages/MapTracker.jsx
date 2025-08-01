import React, { useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'
import { MapPin, Package, ShoppingBag, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const MapTracker = () => {
  const [parcels, setParcels] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchParcels()
  }, [])

  const fetchParcels = async () => {
    try {
      setLoading(true)

      // Fetch all parcels using helper function
      const { boxes, sacks } = await db.getAllParcels()

      // Combine and process data
      const allParcels = [
        ...(boxes || []).map(box => ({ ...box, type: 'box' })),
        ...(sacks || []).map(sack => ({ ...sack, type: 'sack' }))
      ]

      setParcels(allParcels)
    } catch (error) {
      console.error('Error fetching parcels:', error)
      toast.error('Failed to load parcel data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed': return 'bg-blue-600 text-white'
      case 'in_transit': return 'bg-yellow-600 text-white'
      case 'out_for_delivery': return 'bg-orange-600 text-white'
      case 'delivered': return 'bg-green-600 text-white'
      case 'returned': return 'bg-red-600 text-white'
      default: return 'bg-gray-600 text-white'
    }
  }

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredParcels = parcels.filter(parcel => {
    const matchesFilter = filter === 'all' || parcel.status === filter
    const matchesSearch = searchTerm === '' || 
      parcel[`${parcel.type}_id`].toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parcel.destination?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getLatestLocation = (parcel) => {
    if (!parcel.scan_history || parcel.scan_history.length === 0) {
      return null
    }
    
    // Get the most recent scan with location
    const scansWithLocation = parcel.scan_history
      .filter(scan => scan.scan_location)
      .sort((a, b) => new Date(b.scan_time) - new Date(a.scan_time))
    
    return scansWithLocation[0]?.scan_location
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gray-800 rounded-xl border border-gray-700">
            <MapPin className="h-10 w-10 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Map Tracker</h1>
            <p className="text-gray-400 text-xl">
              View all parcels on a map with their current locations and status
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-purple-900 rounded-xl">
              <Filter className="h-8 w-8 text-purple-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-white text-2xl">Filters & Search</CardTitle>
              <p className="text-gray-400 text-lg">Refine your parcel search and filtering options</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Search Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Search Parcels</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search parcels, customers, or destinations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Filter by Status</label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="h-12 bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500">
                  <SelectValue placeholder="Select status filter" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white hover:bg-gray-600">All Statuses</SelectItem>
                  <SelectItem value="packed" className="text-white hover:bg-gray-600">Packed</SelectItem>
                  <SelectItem value="in_transit" className="text-white hover:bg-gray-600">In Transit</SelectItem>
                  <SelectItem value="out_for_delivery" className="text-white hover:bg-gray-600">Out for Delivery</SelectItem>
                  <SelectItem value="delivered" className="text-white hover:bg-gray-600">Delivered</SelectItem>
                  <SelectItem value="returned" className="text-white hover:bg-gray-600">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Results</label>
              <div className="flex items-center justify-center h-12 p-4 bg-gray-700 rounded-lg border border-gray-600">
                <span className="text-white font-semibold">
                  {filteredParcels.length} parcel{filteredParcels.length !== 1 ? 's' : ''} found
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Map Section */}
      <Card className="bg-gray-800 border-gray-700 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-cyan-900 rounded-xl">
              <MapPin className="h-8 w-8 text-cyan-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-white text-2xl">Interactive Map</CardTitle>
              <p className="text-gray-400 text-lg">View all parcels on an interactive map with real-time locations</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-700 rounded-xl border-2 border-dashed border-gray-600 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="p-6 bg-gray-600 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <MapPin className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-3">
              Interactive Map Coming Soon
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto mb-6">
              This section will display an interactive map showing all parcels with their current locations, 
              status indicators, and real-time tracking information.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Packed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                <span>In Transit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span>Returned</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parcels Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">Parcel Overview</h2>
          <div className="text-gray-400 text-lg">
            Showing {filteredParcels.length} of {parcels.length} total parcels
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredParcels.map((parcel, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-700 rounded-xl">
                      {parcel.type === 'box' ? (
                        <Package className="h-7 w-7 text-blue-400" />
                      ) : (
                        <ShoppingBag className="h-7 w-7 text-green-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-base font-medium text-gray-300">
                        {parcel.type === 'box' ? 'Box' : 'Sack'}
                      </span>
                      <p className="text-sm text-gray-500">
                        ID: {parcel[`${parcel.type}_id`]?.slice(-8)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(parcel.status)} text-white font-medium px-4 py-2`}>
                    {getStatusText(parcel.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Customer</p>
                  </div>
                  <p className="text-base font-semibold text-white">
                    {parcel.customers?.first_name} {parcel.customers?.last_name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {parcel.customers?.phone || 'No phone'}
                  </p>
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Content</p>
                  </div>
                  <p className="text-base text-white">
                    {parcel.content || 'No description'}
                  </p>
                </div>

                {/* Destination */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Destination</p>
                  </div>
                  <p className="text-base text-white">
                    {parcel.destination || 'Not specified'}
                  </p>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Quantity</p>
                  </div>
                  <p className="text-base text-white">
                    {parcel.quantity || 1}
                  </p>
                </div>

                {/* Latest Location */}
                {getLatestLocation(parcel) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Last Location</p>
                    </div>
                    <p className="text-base text-cyan-400 font-medium">
                      {getLatestLocation(parcel)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredParcels.length === 0 && (
        <Card className="bg-gray-800 border-gray-700 shadow-xl">
          <CardContent className="text-center py-20">
            <div className="p-6 bg-gray-700 rounded-full w-24 h-24 mx-auto mb-8 flex items-center justify-center">
              <Package className="h-12 w-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-4">
              No parcels found
            </h3>
            <p className="text-gray-400 text-lg max-w-md mx-auto">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria to find matching parcels.'
                : 'No parcels are currently in the system. Start by registering some parcels.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MapTracker 