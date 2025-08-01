import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, db } from '../lib/supabase'
import { Search, Package, ShoppingBag, MapPin, Clock, CheckCircle, Loader2, Eye, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ParcelTimelineComponent from '../components/ParcelTimeline'
import InteractionTrail from '../components/InteractionTrail'
import toast from 'react-hot-toast'

const CustomerPortal = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [activeTab, setActiveTab] = useState('timeline')

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
        // Auto-select the first parcel if only one found
        if (results.boxes.length === 1 && results.sacks.length === 0) {
          setSelectedParcel({ ...results.boxes[0], type: 'box', id: results.boxes[0].box_id })
        } else if (results.sacks.length === 1 && results.boxes.length === 0) {
          setSelectedParcel({ ...results.sacks[0], type: 'sack', id: results.sacks[0].sack_id })
        }
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

  const getStatusBadge = (status) => {
    return <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
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

  const handleParcelSelect = (parcel) => {
    setSelectedParcel(parcel)
    setActiveTab('timeline')
  }

  const allParcels = [
    ...(searchResults?.boxes || []).map(box => ({ ...box, type: 'box', id: box.box_id })),
    ...(searchResults?.sacks || []).map(sack => ({ ...sack, type: 'sack', id: sack.sack_id }))
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link to="/dashboard" className="cursor-pointer">
                <h1 className="text-3xl font-bold text-white hover:text-blue-400 transition-colors">SmartExporters</h1>
              </Link>
              <p className="text-gray-400">Track your packages and shipments</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Track Your Package
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Enter your tracking number, parcel ID, or phone number to find your shipment
          </p>
          
          <Card className="max-w-2xl mx-auto bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Enter tracking number, parcel ID, or phone number..."
                  className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <LoadingButton
                  onClick={handleSearch}
                  loading={loading}
                  loadingText="Searching..."
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Search className="h-4 w-4" />
                </LoadingButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-white mb-2">
                Search Results
              </h3>
              <p className="text-gray-400">
                Found {searchResults.boxes.length + searchResults.sacks.length} parcel(s)
              </p>
            </div>

            {/* Parcel Selection and Timeline View */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Parcel List */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Package className="w-5 h-5" />
                      Available Parcels
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Select a parcel to view its timeline and tracking details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {allParcels.map((parcel) => (
                        <div
                          key={parcel.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedParcel?.id === parcel.id
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                          }`}
                          onClick={() => handleParcelSelect(parcel)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {parcel.type === 'box' ? (
                                <Package className="w-5 h-5 text-blue-400" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-green-400" />
                              )}
                              <div>
                                <p className="font-medium text-white">
                                  {parcel.type === 'box' ? `Box ${parcel.box_id}` : `Sack ${parcel.sack_id}`}
                                </p>
                                <p className="text-sm text-gray-400">
                                  {parcel.destination || 'No destination'}
                                </p>
                              </div>
                            </div>
                            {getStatusBadge(parcel.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Timeline and Details */}
              <div className="lg:col-span-2">
                {selectedParcel ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">
                        {selectedParcel.type === 'box' ? `Box ${selectedParcel.box_id}` : `Sack ${selectedParcel.sack_id}`}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Tracking details and timeline
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                          <TabsTrigger value="timeline" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                            Timeline
                          </TabsTrigger>
                          <TabsTrigger value="interactions" className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                            Interactions
                          </TabsTrigger>
                        </TabsList>
                        <TabsContent value="timeline" className="mt-6">
                          <ParcelTimelineComponent 
                            parcelId={selectedParcel.id} 
                            parcelType={selectedParcel.type} 
                          />
                        </TabsContent>
                        <TabsContent value="interactions" className="mt-6">
                          <InteractionTrail 
                            parcelId={selectedParcel.id} 
                            parcelType={selectedParcel.type} 
                          />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Select a parcel to view its details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerPortal 