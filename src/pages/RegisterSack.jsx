import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { db } from '../lib/supabase'
import { Package2, User, MapPin, DollarSign, Camera, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import ParcelLabelPDF from '../components/ParcelLabelPDF'

const RegisterSack = () => {
  const [loading, setLoading] = useState(false)
  const [generatedQR, setGeneratedQR] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [sackData, setSackData] = useState(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm()

  const phone = watch('phone')

  // Search for existing customer
  const searchCustomer = async () => {
    if (!phone) return

    try {
      const customerData = await db.getCustomerByPhone(phone)
      if (customerData) {
        setCustomer(customerData)
        toast.success('Customer found!')
      } else {
        setCustomer(null)
        toast.error('Customer not found. Please register customer first.')
      }
    } catch (error) {
      console.error('Error searching customer:', error)
      setCustomer(null)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)

    try {
      let customerId = customer?.customer_id

      // If no customer found, create new customer
      if (!customer) {
        const newCustomer = await db.createCustomer({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          destination: data.destination,
          price: parseFloat(data.price),
          date_of_packaging: new Date().toISOString()
        })
        customerId = newCustomer.customer_id
        setCustomer(newCustomer)
      }

      // Generate QR code
      const sackId = crypto.randomUUID()
      const qrCodeUrl = `https://smarttrack.com/track/sack/${sackId}`
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl)

      // Create sack record
      const sackRecord = {
        sack_id: sackId,
        customer_id: customerId,
        content: data.content,
        quantity: parseInt(data.quantity),
        destination: data.destination,
        qr_code_url: qrCodeUrl,
        status: 'packed'
      }

      const createdSack = await db.createSack(sackRecord)
      
      setGeneratedQR(qrCodeDataURL)
      setSackData({
        ...createdSack,
        customer: customer || {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone
        }
      })

      toast.success('Sack registered successfully!')
      reset()
      setCustomer(null)
    } catch (error) {
      console.error('Error registering sack:', error)
      toast.error('Failed to register sack')
    } finally {
      setLoading(false)
    }
  }

  const downloadLabel = () => {
    if (sackData) {
      ParcelLabelPDF.generateLabel(sackData, 'sack')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Register Sack</h1>
        <p className="mt-1 text-sm text-gray-500">
          Register a new sack with customer information and generate tracking QR code
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Form */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sack Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Customer Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone Number
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  className="input-field flex-1"
                  placeholder="+2341234567890"
                />
                <button
                  type="button"
                  onClick={searchCustomer}
                  className="btn-secondary"
                >
                  Search
                </button>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Customer Info */}
            {customer ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Customer Found</h3>
                <p className="text-sm text-green-700">
                  {customer.first_name} {customer.last_name} - {customer.phone}
                </p>
                <p className="text-sm text-green-700">Destination: {customer.destination}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      {...register('firstName', { required: 'First name is required' })}
                      className="input-field"
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="input-field"
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sack Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sack Content
              </label>
              <textarea
                {...register('content', { required: 'Content description is required' })}
                rows={3}
                className="input-field"
                placeholder="Describe the contents of the sack..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' }
                  })}
                  className="input-field"
                  placeholder="1"
                  min="1"
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₦)
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('price', { 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  className="input-field"
                  placeholder="0.00"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                {...register('destination', { required: 'Destination is required' })}
                className="input-field"
                placeholder="Lagos, Nigeria"
              />
              {errors.destination && (
                <p className="mt-1 text-sm text-red-600">{errors.destination.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Package2 className="h-5 w-5 mr-2" />
                  Register Sack
                </div>
              )}
            </button>
          </form>
        </div>

        {/* QR Code and Label */}
        <div className="space-y-6">
          {generatedQR && (
            <>
              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Generated QR Code</h2>
                <div className="flex flex-col items-center space-y-4">
                  <img 
                    src={generatedQR} 
                    alt="QR Code" 
                    className="w-48 h-48 border border-gray-200 rounded-lg"
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Sack ID: {sackData?.sack_id}</p>
                    <p className="text-sm text-gray-600">
                      {sackData?.customer?.first_name} {sackData?.customer?.last_name}
                    </p>
                  </div>
                  <button
                    onClick={downloadLabel}
                    className="btn-secondary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Label
                  </button>
                </div>
              </div>

              <div className="card">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sack Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Content:</span>
                    <span className="text-sm font-medium">{sackData?.content}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Quantity:</span>
                    <span className="text-sm font-medium">{sackData?.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Destination:</span>
                    <span className="text-sm font-medium">{sackData?.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className="status-badge status-packed">Packed</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!generatedQR && (
            <div className="card">
              <div className="text-center py-12">
                <Package2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No QR Code Generated</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Register a sack to generate a QR code and label.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterSack 