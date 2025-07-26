import React, { useState, useEffect } from 'react'
import { supabase, db } from '../lib/supabase'
import { MapPin, Package, Package2, Filter, Search } from 'lucide-react'
import toast from 'react-hot-toast'

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
      case 'packed': return 'bg-blue-500'
      case 'in_transit': return 'bg-yellow-500'
      case 'out_for_delivery': return 'bg-orange-500'
      case 'delivered': return 'bg-green-500'
      case 'returned': return 'bg-red-500'
      default: return 'bg-gray-500'
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Map Tracker</h1>
        <p className="mt-1 text-sm text-gray-500">
          View all parcels on a map with their current locations and status
        </p>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by parcel ID, customer name, or destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="packed">Packed</option>
              <option value="in_transit">In Transit</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="card">
        <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
            <p className="text-sm text-gray-500 mb-4">
              This would integrate with Leaflet or Google Maps to show parcel locations
            </p>
            <div className="text-xs text-gray-400">
              Map integration requires API keys and additional setup
            </div>
          </div>
        </div>
      </div>

      {/* Parcel List */}
      <div className="card">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Parcels ({filteredParcels.length})
        </h2>
        
        <div className="space-y-4">
          {filteredParcels.length > 0 ? (
            filteredParcels.map((parcel) => {
              const latestLocation = getLatestLocation(parcel)
              
              return (
                <div key={`${parcel.type}-${parcel[`${parcel.type}_id`]}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {parcel.type === 'box' ? (
                          <Package className="h-5 w-5 text-blue-600 mr-2" />
                        ) : (
                          <Package2 className="h-5 w-5 text-green-600 mr-2" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {parcel.type.charAt(0).toUpperCase() + parcel.type.slice(1)} ID: {parcel[`${parcel.type}_id`]}
                        </span>
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(parcel.status)} text-white`}>
                          {getStatusText(parcel.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">
                            <strong>Customer:</strong> {parcel.customers?.first_name} {parcel.customers?.last_name}
                          </p>
                          <p className="text-gray-600">
                            <strong>Phone:</strong> {parcel.customers?.phone}
                          </p>
                          <p className="text-gray-600">
                            <strong>Content:</strong> {parcel.content}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            <strong>Destination:</strong> {parcel.destination}
                          </p>
                          <p className="text-gray-600">
                            <strong>Quantity:</strong> {parcel.quantity}
                          </p>
                          {latestLocation && (
                            <p className="text-gray-600">
                              <strong>Last Location:</strong> {latestLocation}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-12">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No parcels found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Map Integration Instructions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Map Integration Setup</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">To enable interactive maps:</h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Install Leaflet: <code>npm install leaflet react-leaflet</code></li>
            <li>• Add map container and markers for each parcel</li>
            <li>• Parse GPS coordinates from scan_location data</li>
            <li>• Add popups with parcel information</li>
            <li>• Implement clustering for multiple parcels in same area</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default MapTracker 