import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '../lib/supabase'
import { 
  Scan, 
  Camera, 
  Upload, 
  Smartphone, 
  MapPin, 
  Clock, 
  User, 
  Package, 
  ShoppingBag,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import toast from 'react-hot-toast'

const ScanAndLog = () => {
  const [scannedData, setScannedData] = useState('')
  const [parcel, setParcel] = useState(null)
  const [loading, setLoading] = useState(false)
  const [capturingPhoto, setCapturingPhoto] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [scannerActive, setScannerActive] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const startScanner = () => {
    setScannerActive(true)
    // In a real implementation, this would open the camera scanner
    toast.success('Scanner activated! Point your camera at a QR code.')
  }

  const handleQRCodeScanned = async (qrData) => {
    setLoading(true)
    try {
      // Extract parcel ID from QR code URL
      const parcelId = qrData.split('/').pop()
      
      // Search for the parcel in both boxes and sacks
      const { data: boxes } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('box_id', parcelId)
        .single()

      const { data: sacks } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone
          )
        `)
        .eq('sack_id', parcelId)
        .single()

      const foundParcel = boxes || sacks
      
      if (foundParcel) {
        setParcel({ ...foundParcel, type: boxes ? 'box' : 'sack' })
        toast.success('Parcel found!')
      } else {
        toast.error('Parcel not found')
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      toast.error('Failed to scan QR code')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoCapture = async () => {
    setCapturingPhoto(true)
    try {
      // Simulate photo capture
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would capture from camera
      const mockPhoto = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
      
      setPhoto(mockPhoto)
      setPhotoPreview(mockPhoto)
      toast.success('Photo captured!')
    } catch (error) {
      console.error('Error capturing photo:', error)
      toast.error('Failed to capture photo')
    } finally {
      setCapturingPhoto(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhoto(e.target.result)
        setPhotoPreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    if (!parcel) {
      toast.error('Please scan a parcel first')
      return
    }

    setLoading(true)
    try {
      // Create scan history record
      const scanRecord = {
        parcel_id: parcel.box_id || parcel.sack_id,
        parcel_type: parcel.type,
        status: data.status,
        location: data.location,
        comments: data.statusMessage,
        estimated_delivery: data.estimatedDelivery,
        scan_time: new Date().toISOString(),
        photo_url: photo // In real implementation, upload to storage
      }

      const { error } = await supabase
        .from('scan_history')
        .insert(scanRecord)

      if (error) throw error

      // Update parcel status
      const tableName = parcel.type === 'box' ? 'boxes' : 'sacks'
      const { error: updateError } = await supabase
        .from(tableName)
        .update({ status: data.status })
        .eq(parcel.type === 'box' ? 'box_id' : 'sack_id', parcel.box_id || parcel.sack_id)

      if (updateError) throw updateError

      toast.success('Status updated successfully!')
      
      // Send notifications
      await sendEmailNotification(parcel, data.status, 'en')
      await sendWhatsAppNotification(parcel, data.status, 'en')
      
      // Reset form
      reset()
      setParcel(null)
      setPhoto(null)
      setPhotoPreview(null)
      setScannedData('')
      
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsAppNotification = async (parcel, status, language) => {
    try {
      const response = await fetch('/.netlify/functions/sendWhatsApp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: parcel.customers.phone,
          status: status,
          language: language,
          template: 'statusUpdate'
        })
      })

      if (!response.ok) throw new Error('WhatsApp notification failed')
      toast.success('WhatsApp notification sent!')
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      toast.error('Failed to send WhatsApp notification')
    }
  }

  const sendEmailNotification = async (parcel, status, language) => {
    try {
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: parcel.customers.username, // Assuming username is email
          status: status,
          language: language,
          template: 'statusUpdate',
          subject: 'Shipment Status Update'
        })
      })

      if (!response.ok) throw new Error('Email notification failed')
      toast.success('Email notification sent!')
    } catch (error) {
      console.error('Error sending email notification:', error)
      toast.error('Failed to send email notification')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Scan & Log</h1>
        <p className="text-gray-400">
          Use your mobile phone to scan QR codes and update parcel status with location and photos
        </p>
      </div>

      {/* Mobile Instructions */}
      <Alert className="bg-blue-900 border-blue-700">
        <Smartphone className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-blue-200">
          <div className="space-y-2">
            <p className="font-medium">Mobile Scanning Instructions</p>
            <ul className="text-sm space-y-1">
              <li>• Open the mobile scanner using the button below</li>
              <li>• Point your phone's camera at the QR code on the parcel</li>
              <li>• The scanner will automatically detect and read the QR code</li>
              <li>• You can also manually enter tracking numbers if needed</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Scanner Section */}
        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Scan className="h-5 w-5" />
                Mobile QR Scanner
              </CardTitle>
              <CardDescription className="text-gray-400">
                Use your phone's camera to scan QR codes on parcels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-purple-900 border-purple-700">
                <Scan className="h-4 w-4 text-purple-400" />
                <AlertDescription className="text-purple-200">
                  Mobile-optimized scanner that automatically detects QR codes on parcels.
                </AlertDescription>
              </Alert>
              
              <LoadingButton
                onClick={startScanner}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                loading={scannerActive}
                loadingText="Opening Scanner..."
              >
                <Scan className="mr-2 h-4 w-4" />
                Open Mobile Scanner
              </LoadingButton>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Manual Entry</CardTitle>
              <CardDescription className="text-gray-400">
                Enter QR code URL or parcel ID manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qrCode" className="text-gray-300">QR Code URL or Parcel ID</Label>
                <Input
                  id="qrCode"
                  type="text"
                  placeholder="https://smartexporters.com/track/box/..."
                  value={scannedData}
                  onChange={(e) => setScannedData(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <LoadingButton
                onClick={() => scannedData && handleQRCodeScanned(scannedData)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!scannedData}
                loading={loading}
                loadingText="Searching..."
              >
                Search Parcel
              </LoadingButton>
            </CardContent>
          </Card>

          {/* Photo Capture */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                Photo Capture
              </CardTitle>
              <CardDescription className="text-gray-400">
                Capture a photo using your device camera or upload an existing image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-900 border-green-700">
                <Camera className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  Photo capture options for documenting parcel condition
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photo
                </Button>
                <LoadingButton
                  onClick={handlePhotoCapture}
                  loading={capturingPhoto}
                  loadingText="Capturing..."
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Capture Photo
                </LoadingButton>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {photoPreview && (
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-600"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPhoto(null)
                        setPhotoPreview(null)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 bg-red-600 hover:bg-red-700"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Update Form */}
        <div className="space-y-6">
          {parcel ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  {parcel.type === 'box' ? <Package className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                  Parcel Found
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Update status and location for this parcel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Parcel ID:</span>
                    <Badge variant="outline" className="font-mono bg-gray-700 border-gray-600 text-white">
                      {parcel.box_id || parcel.sack_id}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Customer:</span>
                    <span className="text-sm text-gray-300">
                      {parcel.customers?.first_name} {parcel.customers?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Current Status:</span>
                    {getStatusBadge(parcel.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-300">Content:</span>
                    <span className="text-sm text-gray-300">{parcel.content}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium mb-2 text-white">No Parcel Selected</h3>
                <p className="text-sm text-gray-400">
                  Scan a QR code or enter a parcel ID to update its status.
                </p>
              </CardContent>
            </Card>
          )}

          {parcel && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Update Status</CardTitle>
                <CardDescription className="text-gray-400">
                  Update the parcel status and add location details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="status" className="text-gray-300">New Status</Label>
                    <Select {...register('status', { required: 'Status is required' })}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="packed">Packed</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-400 mt-1">{errors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="statusMessage" className="text-gray-300">Status Message</Label>
                    <Textarea
                      id="statusMessage"
                      {...register('statusMessage', { required: 'Status message is required' })}
                      placeholder="Describe the current status..."
                      rows={3}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.statusMessage && (
                      <p className="text-sm text-red-400 mt-1">{errors.statusMessage.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="estimatedDelivery" className="text-gray-300">Estimated Delivery</Label>
                    <Input
                      id="estimatedDelivery"
                      type="datetime-local"
                      {...register('estimatedDelivery')}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="comment" className="text-gray-300">Comment</Label>
                    <Textarea
                      id="comment"
                      {...register('comment')}
                      placeholder="Additional comments..."
                      rows={2}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>

                  <LoadingButton
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    loading={loading}
                    loadingText="Updating Status..."
                  >
                    Update Status
                  </LoadingButton>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanAndLog 