import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, db } from '../lib/supabase'
import { Search, Package, Package2, MapPin, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const CustomerPortal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a tracking number or phone number')
      return
    }

    setLoading(true)

    try {
      const results = await db.searchParcel(searchTerm)
      setSearchResults(results)
      
      if (results.boxes.length === 0 && results.sacks.length === 0) {
        toast.error('No parcels found with the provided information')
      } else {
        toast.success(`Found ${results.boxes.length + results.sacks.length} parcel(s)`)
      }
    } catch (error) {
      console.error('Error searching parcels:', error)
      toast.error('Failed to search parcels')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'packed': return 'status-packed'
      case 'in_transit': return 'status-in-transit'
      case 'out_for_delivery': return 'status-out-for-delivery'
      case 'delivered': return 'status-delivered'
      case 'returned': return 'status-returned'
      default: return 'status-packed'
    }
  }

  const getStatusText = (status) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SmartExporters</h1>
            </div>
            <div className="text-sm text-gray-500">
              Track your packages easily
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Track Your Package
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Enter your tracking number, parcel ID, or phone number to find your package
          </p>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter tracking number, parcel ID, or phone number..."
                className="flex-1 input-field"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="btn-primary px-8"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-6">
            {/* Boxes */}
            {searchResults.boxes.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  Boxes ({searchResults.boxes.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.boxes.map((box) => (
                    <div key={box.box_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Package className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              Box ID: {box.box_id}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <strong>Customer:</strong> {box.customers?.first_name} {box.customers?.last_name}
                              </p>
                              <p className="text-gray-600">
                                <strong>Phone:</strong> {box.customers?.phone}
                              </p>
                              <p className="text-gray-600">
                                <strong>Content:</strong> {box.content}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <strong>Destination:</strong> {box.destination}
                              </p>
                              <p className="text-gray-600">
                                <strong>Quantity:</strong> {box.quantity}
                              </p>
                              <p className="text-gray-600">
                                <strong>Date Packed:</strong> {formatDate(box.date_packed)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`status-badge ${getStatusColor(box.status)}`}>
                              {getStatusText(box.status)}
                            </span>
                            <Link
                              to={`/track/box/${box.box_id}`}
                              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                            >
                              View Timeline →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sacks */}
            {searchResults.sacks.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package2 className="h-5 w-5 text-green-600 mr-2" />
                  Sacks ({searchResults.sacks.length})
                </h3>
                <div className="space-y-4">
                  {searchResults.sacks.map((sack) => (
                    <div key={sack.sack_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <Package2 className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              Sack ID: {sack.sack_id}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <strong>Customer:</strong> {sack.customers?.first_name} {sack.customers?.last_name}
                              </p>
                              <p className="text-gray-600">
                                <strong>Phone:</strong> {sack.customers?.phone}
                              </p>
                              <p className="text-gray-600">
                                <strong>Content:</strong> {sack.content}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                <strong>Destination:</strong> {sack.destination}
                              </p>
                              <p className="text-gray-600">
                                <strong>Quantity:</strong> {sack.quantity}
                              </p>
                              <p className="text-gray-600">
                                <strong>Date Packed:</strong> {formatDate(sack.date_packed)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <span className={`status-badge ${getStatusColor(sack.status)}`}>
                              {getStatusText(sack.status)}
                            </span>
                            <Link
                              to={`/track/sack/${sack.sack_id}`}
                              className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                            >
                              View Timeline →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchResults.boxes.length === 0 && searchResults.sacks.length === 0 && (
              <div className="card">
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No parcels found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try searching with a different tracking number or phone number.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card text-center">
            <Search className="mx-auto h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track by ID</h3>
            <p className="text-sm text-gray-500">
              Enter your parcel ID or tracking number to find your package
            </p>
          </div>
          <div className="card text-center">
            <MapPin className="mx-auto h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-500">
              Get live updates on your package location and status
            </p>
          </div>
          <div className="card text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Confirmation</h3>
            <p className="text-sm text-gray-500">
              Receive notifications when your package is delivered
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>© 2024 The Smart Exporters. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/terms" className="hover:text-gray-700">Terms of Use</Link>
            <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerPortal 