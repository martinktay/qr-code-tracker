import React, { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { supabase, db } from '../lib/supabase'
import { 
  Scan, 
  Camera, 
  MapPin, 
  Package, 
  Package2, 
  CheckCircle,
  AlertCircle,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Html5QrcodeScanner } from 'html5-qrcode'

const ScanAndLog = () => {
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [parcelData, setParcelData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const scannerRef = useRef(null)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const status = watch('status')

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Unable to get location. Please enable location services.')
        }
      )
    }
  }, [])

  const startScanner = () => {
    setScanning(true)
    setScannedData(null)
    setParcelData(null)

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    )

    scanner.render((decodedText) => {
      handleQRCodeScanned(decodedText)
      scanner.clear()
      setScanning(false)
    }, (error) => {
      // Handle scan error
    })

    scannerRef.current = scanner
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setScanning(false)
  }

  const handleQRCodeScanned = async (qrCodeData) => {
    setScannedData(qrCodeData)
    
    try {
      // Extract parcel ID from QR code URL
      const urlParts = qrCodeData.split('/')
      const parcelId = urlParts[urlParts.length - 1]
      const parcelType = urlParts[urlParts.length - 2] // 'box' or 'sack'

      // Fetch parcel data
      const { data, error } = await supabase
        .from(parcelType === 'box' ? 'boxes' : 'sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone,
            destination
          )
        `)
        .eq(`${parcelType}_id`, parcelId)
        .single()

      if (error) throw error

      setParcelData({
        ...data,
        type: parcelType
      })

      toast.success(`${parcelType.charAt(0).toUpperCase() + parcelType.slice(1)} found!`)
    } catch (error) {
      console.error('Error fetching parcel data:', error)
      toast.error('Parcel not found in database')
    }
  }

  const handlePhotoCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas')
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoRef.current, 0, 0)
      
      canvas.toBlob((blob) => {
        setPhoto(blob)
        setPhotoPreview(URL.createObjectURL(blob))
      }, 'image/jpeg', 0.8)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPhoto(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const uploadPhoto = async (file) => {
    try {
      const fileName = `scan_photos/${Date.now()}_${file.name}`
      
      // Upload file using helper function
      await db.uploadFile('parcel-photos', fileName, file)
      
      // Get public URL using helper function
      const publicUrl = await db.getPublicUrl('parcel-photos', fileName)
      
      return publicUrl
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  }

  const onSubmit = async (data) => {
    if (!parcelData) {
      toast.error('Please scan a QR code first')
      return
    }

    setLoading(true)

    try {
      let photoUrl = null
      if (photo) {
        photoUrl = await uploadPhoto(photo)
      }

      // Create scan record
      const scanRecord = {
        [parcelData.type === 'box' ? 'box_id' : 'sack_id']: parcelData[`${parcelData.type}_id`],
        scan_location: location ? `(${location.lat},${location.lng})` : null,
        status_message: data.statusMessage,
        photo_url: photoUrl,
        estimated_delivery: data.estimatedDelivery ? new Date(data.estimatedDelivery).toISOString() : null,
        comment: data.comment,
        message_language: data.messageLanguage || 'en'
      }

      await db.createScanRecord(scanRecord)

      // Update parcel status
      if (parcelData.type === 'box') {
        await db.updateBoxStatus(parcelData.box_id, data.status)
      } else {
        await db.updateSackStatus(parcelData.sack_id, data.status)
      }

      // Send WhatsApp notification if enabled
      if (data.sendWhatsApp && parcelData.customers?.phone) {
        await sendWhatsAppNotification(parcelData, data.status, data.messageLanguage)
      }

      toast.success('Scan logged successfully!')
      reset()
      setScannedData(null)
      setParcelData(null)
      setPhoto(null)
      setPhotoPreview(null)
      stopScanner()
    } catch (error) {
      console.error('Error logging scan:', error)
      toast.error('Failed to log scan')
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsAppNotification = async (parcel, status, language) => {
    try {
      const messageTemplates = {
        en: `Your package is now marked as "${status.replace('_', ' ')}" and is expected to arrive by ${new Date().toLocaleDateString()}.`,
        fr: `Votre colis est maintenant "${status.replace('_', ' ')}" et devrait arriver d'ici ${new Date().toLocaleDateString()}.`,
        yo: `Apoti rẹ ti jẹ́ pé "${status.replace('_', ' ')}" bayii. Ó ṣeé ṣe kí ó dé ní ${new Date().toLocaleDateString()}.`,
        es: `Su paquete está marcado como "${status.replace('_', ' ')}" y se espera que llegue antes del ${new Date().toLocaleDateString()}.`
      }

      const message = messageTemplates[language] || messageTemplates.en

      // This would integrate with Twilio WhatsApp API
      console.log('WhatsApp notification:', {
        to: parcel.customers.phone,
        message: message
      })

      toast.success('WhatsApp notification sent!')
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error)
      toast.error('Failed to send WhatsApp notification')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scan & Log</h1>
        <p className="mt-1 text-sm text-gray-500">
          Scan QR codes and update parcel status with location and photos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">QR Code Scanner</h2>
            
            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full btn-primary"
              >
                <Scan className="h-5 w-5 mr-2" />
                Start Scanner
              </button>
            ) : (
              <div className="space-y-4">
                <div id="qr-reader" className="w-full"></div>
                <button
                  onClick={stopScanner}
                  className="w-full btn-secondary"
                >
                  Stop Scanner
                </button>
              </div>
            )}
          </div>

          {/* Manual Entry */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manual Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code URL or Parcel ID
                </label>
                <input
                  type="text"
                  placeholder="https://smarttrack.com/track/box/..."
                  className="input-field"
                  onChange={(e) => setScannedData(e.target.value)}
                />
              </div>
              <button
                onClick={() => scannedData && handleQRCodeScanned(scannedData)}
                className="w-full btn-secondary"
                disabled={!scannedData}
              >
                Search Parcel
              </button>
            </div>
          </div>

          {/* Photo Capture */}
          <div className="card">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Photo Capture</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 btn-secondary"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </button>
                <button
                  onClick={handlePhotoCapture}
                  className="flex-1 btn-secondary"
                  disabled={!videoRef.current}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </button>
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
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scan Form */}
        <div className="space-y-6">
          {/* Parcel Info */}
          {parcelData && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Parcel Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  {parcelData.type === 'box' ? (
                    <Package className="h-5 w-5 text-blue-600 mr-2" />
                  ) : (
                    <Package2 className="h-5 w-5 text-green-600 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {parcelData.type} - {parcelData[`${parcelData.type}_id`]}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer: {parcelData.customers?.first_name} {parcelData.customers?.last_name}</p>
                  <p className="text-sm text-gray-600">Phone: {parcelData.customers?.phone}</p>
                  <p className="text-sm text-gray-600">Content: {parcelData.content}</p>
                  <p className="text-sm text-gray-600">Destination: {parcelData.destination}</p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">Current Status:</span>
                  <span className={`status-badge ${getStatusColor(parcelData.status)}`}>
                    {parcelData.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scan Form */}
          {parcelData && (
            <div className="card">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Update Status</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="packed">Packed</option>
                    <option value="in_transit">In Transit</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="returned">Returned</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Message
                  </label>
                  <textarea
                    {...register('statusMessage', { required: 'Status message is required' })}
                    rows={3}
                    className="input-field"
                    placeholder="Describe the current status..."
                  />
                  {errors.statusMessage && (
                    <p className="mt-1 text-sm text-red-600">{errors.statusMessage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery
                  </label>
                  <input
                    type="datetime-local"
                    {...register('estimatedDelivery')}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                  </label>
                  <textarea
                    {...register('comment')}
                    rows={2}
                    className="input-field"
                    placeholder="Additional notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message Language
                  </label>
                  <select
                    {...register('messageLanguage')}
                    className="input-field"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="yo">Yoruba</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('sendWhatsApp')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Send WhatsApp notification
                  </label>
                </div>

                {location && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-green-800">
                        Location captured: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Logging Scan...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Log Scan
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}

          {!parcelData && (
            <div className="card">
              <div className="text-center py-12">
                <Scan className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Parcel Selected</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Scan a QR code or enter parcel ID to update status.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScanAndLog 