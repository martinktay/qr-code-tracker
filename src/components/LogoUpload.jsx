import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Upload, X, Image } from 'lucide-react'
import toast from 'react-hot-toast'

const LogoUpload = () => {
  const [logoUrl, setLogoUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    fetchCurrentLogo()
  }, [])

  const fetchCurrentLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('logo_url')
        .single()

      if (error) throw error
      setLogoUrl(data.logo_url)
    } catch (error) {
      console.error('Error fetching logo:', error)
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(true)

    try {
      const fileName = `logos/${Date.now()}_${file.name}`
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('company-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(fileName)

      // Update company settings
      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: publicUrl })
        .eq('company_id', (await supabase.from('company_settings').select('company_id').single()).data.company_id)

      if (updateError) throw updateError

      setLogoUrl(publicUrl)
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeLogo = async () => {
    try {
      const { error } = await supabase
        .from('company_settings')
        .update({ logo_url: null })
        .eq('company_id', (await supabase.from('company_settings').select('company_id').single()).data.company_id)

      if (error) throw error

      setLogoUrl(null)
      toast.success('Logo removed successfully!')
    } catch (error) {
      console.error('Error removing logo:', error)
      toast.error('Failed to remove logo')
    }
  }

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {logoUrl && (
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={logoUrl}
              alt="Company Logo"
              className="w-24 h-24 object-contain border border-gray-200 rounded-lg"
            />
            <button
              onClick={removeLogo}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Current Logo</p>
            <p className="text-xs text-gray-500">Click the X to remove</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            ) : (
              <Image className="h-12 w-12 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Upload Company Logo'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Drag and drop an image here, or click to select
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>

          {!uploading && (
            <div>
              <label className="btn-secondary cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Logo Guidelines</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Recommended size: 200x200 pixels or larger</li>
          <li>• Supported formats: PNG, JPG, GIF</li>
          <li>• Maximum file size: 5MB</li>
          <li>• Transparent background recommended for best results</li>
        </ul>
      </div>
    </div>
  )
}

export default LogoUpload 