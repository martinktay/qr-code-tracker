import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { db } from '../lib/supabase'
import { ShoppingBag, User, MapPin, DollarSign, Camera, Download, Search } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import toast from 'react-hot-toast'
import QRCode from 'qrcode'
import ParcelLabelPDF from '../components/ParcelLabelPDF'

const RegisterSack = () => {
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
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

    setSearching(true)
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
    } finally {
      setSearching(false)
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
          destination_country: data.destinationCountry || null,
          destination_city: data.destinationCity || null,
          customs_declaration: data.customsDeclaration || null,
          special_instructions: data.specialInstructions || null,
          date_of_packaging: new Date().toISOString()
        })
        customerId = newCustomer.customer_id
        setCustomer(newCustomer)
      }

      // Generate QR code
      const sackId = crypto.randomUUID()
      const qrCodeUrl = `https://smartexporters.com/track/sack/${sackId}`
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl)

      // Create sack record with enhanced fields
      const sackRecord = {
        sack_id: sackId,
        customer_id: customerId,
        content: data.content,
        quantity: parseInt(data.quantity),
        weight_kg: parseFloat(data.weight),
        destination: data.destination,
        destination_country: data.destinationCountry || null,
        destination_city: data.destinationCity || null,
        customs_declaration: data.customsDeclaration || null,
        special_instructions: data.specialInstructions || null,
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
      ParcelLabelPDF.generatePDF(sackData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Register New Sack</h1>
        <p className="text-gray-400">
          Register a new sack for shipping and generate tracking QR code
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Registration Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ShoppingBag className="h-5 w-5" />
              Sack Registration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Enter sack details and customer information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Customer Search Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Customer Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phone"
                      {...register('phone', { required: 'Phone number is required' })}
                      placeholder="Enter customer phone number"
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    <LoadingButton
                      type="button"
                      onClick={searchCustomer}
                      loading={searching}
                      loadingText="Searching..."
                      disabled={!phone}
                    >
                      <Search className="h-4 w-4" />
                    </LoadingButton>
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-red-400 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                {customer && (
                  <Alert className="bg-green-900 border-green-700">
                    <User className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-200">
                      Customer found: <strong>{customer.first_name} {customer.last_name}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator className="bg-gray-600" />

              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      {...register('firstName', { required: 'First name is required' })}
                      placeholder="Enter first name"
                      defaultValue={customer?.first_name || ''}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-400 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      {...register('lastName', { required: 'Last name is required' })}
                      placeholder="Enter last name"
                      defaultValue={customer?.last_name || ''}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-400 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="destination" className="text-gray-300">Destination</Label>
                  <Input
                    id="destination"
                    {...register('destination', { required: 'Destination is required' })}
                    placeholder="Enter destination"
                    defaultValue={customer?.destination || ''}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  {errors.destination && (
                    <p className="text-sm text-red-400 mt-1">{errors.destination.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="price" className="text-gray-300">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { required: 'Price is required' })}
                    placeholder="Enter price"
                    defaultValue={customer?.price || ''}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-400 mt-1">{errors.price.message}</p>
                  )}
                </div>

                {/* International Shipping Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="destinationCountry" className="text-gray-300">Destination Country</Label>
                    <Input
                      id="destinationCountry"
                      {...register('destinationCountry')}
                      placeholder="e.g., USA, UK, Ghana"
                      defaultValue={customer?.destination_country || ''}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="destinationCity" className="text-gray-300">Destination City</Label>
                    <Input
                      id="destinationCity"
                      {...register('destinationCity')}
                      placeholder="e.g., New York, London"
                      defaultValue={customer?.destination_city || ''}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="customsDeclaration" className="text-gray-300">Customs Declaration</Label>
                  <Input
                    id="customsDeclaration"
                    {...register('customsDeclaration')}
                    placeholder="Customs declaration details"
                    defaultValue={customer?.customs_declaration || ''}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <Label htmlFor="specialInstructions" className="text-gray-300">Special Instructions</Label>
                  <Input
                    id="specialInstructions"
                    {...register('specialInstructions')}
                    placeholder="Any special handling instructions"
                    defaultValue={customer?.special_instructions || ''}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <Separator className="bg-gray-600" />

              {/* Sack Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Sack Information</h3>
                
                <div>
                  <Label htmlFor="content" className="text-gray-300">Contents</Label>
                  <Input
                    id="content"
                    {...register('content', { required: 'Contents are required' })}
                    placeholder="Describe sack contents"
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  />
                  {errors.content && (
                    <p className="text-sm text-red-400 mt-1">{errors.content.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      {...register('quantity', { required: 'Quantity is required' })}
                      placeholder="Enter quantity"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.quantity && (
                      <p className="text-sm text-red-400 mt-1">{errors.quantity.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="weight" className="text-gray-300">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      {...register('weight', { required: 'Weight is required' })}
                      placeholder="Enter weight"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors.weight && (
                      <p className="text-sm text-red-400 mt-1">{errors.weight.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <LoadingButton
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                loading={loading}
                loadingText="Registering Sack..."
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Register Sack
              </LoadingButton>
            </form>
          </CardContent>
        </Card>

        {/* QR Code and Results */}
        <div className="space-y-6">
          {generatedQR && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Camera className="h-5 w-5" />
                  Generated QR Code
                </CardTitle>
                <CardDescription className="text-gray-400">
                  QR code for tracking this sack
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <img src={generatedQR} alt="QR Code" className="w-48 h-48" />
                </div>
                
                {sackData && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Sack ID:</span>
                      <Badge variant="outline" className="font-mono bg-gray-700 border-gray-600 text-white">
                        {sackData.sack_id}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Status:</span>
                      <Badge variant="default" className="bg-green-600 text-white">
                        {sackData.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">Customer:</span>
                      <span className="text-sm text-gray-300">
                        {sackData.customer.first_name} {sackData.customer.last_name}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadLabel}
                    className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Label
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-400">
              <p>1. Enter customer phone number and search for existing customer</p>
              <p>2. Fill in customer details if not found</p>
              <p>3. Enter sack contents and specifications</p>
              <p>4. Submit to generate QR code and tracking label</p>
              <p>5. Print and attach the label to the sack</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default RegisterSack 