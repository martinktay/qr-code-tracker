import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Shield } from 'lucide-react'

const PrivacyPage = () => {
  const [privacy, setPrivacy] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrivacy()
  }, [])

  const fetchPrivacy = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('privacy_policy, company_name')
        .single()

      if (error) throw error

      setPrivacy(data.privacy_policy || getDefaultPrivacy(data.company_name))
    } catch (error) {
      console.error('Error fetching privacy policy:', error)
      setPrivacy(getDefaultPrivacy('The Smart Exporters'))
    } finally {
      setLoading(false)
    }
  }

  const getDefaultPrivacy = (companyName) => {
    return `Privacy Policy for ${companyName}

Last updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT
We collect information you provide directly to us, such as:
- Name, email address, and phone number
- Package details and tracking information
- Location data when scanning packages
- Photos uploaded during package scanning
- Communication preferences

2. HOW WE USE YOUR INFORMATION
We use the information we collect to:
- Provide and maintain the SmartTrack logistics service
- Process package registrations and updates
- Send tracking updates and notifications
- Improve our services and user experience
- Comply with legal obligations

3. INFORMATION SHARING
We do not sell, trade, or otherwise transfer your personal information to third parties except:
- With your explicit consent
- To comply with legal requirements
- To protect our rights and safety
- With service providers who assist in our operations

4. DATA SECURITY
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

5. DATA RETENTION
We retain your personal information for as long as necessary to provide our services and comply with legal obligations.

6. YOUR RIGHTS
You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of certain communications
- Withdraw consent where applicable

7. COOKIES AND TRACKING
We use cookies and similar technologies to enhance your experience and analyze usage patterns.

8. THIRD-PARTY SERVICES
Our service may integrate with third-party services (e.g., WhatsApp for notifications). These services have their own privacy policies.

9. INTERNATIONAL TRANSFERS
Your information may be transferred to and processed in countries other than your own, where privacy laws may be different.

10. CHILDREN'S PRIVACY
Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

11. CHANGES TO THIS POLICY
We may update this privacy policy from time to time. We will notify you of any material changes.

12. CONTACT US
For questions about this privacy policy, please contact us at:
Email: support@smartexporters.com
Phone: +2341234567890

13. GOVERNING LAW
This privacy policy is governed by the laws of Nigeria and applicable data protection regulations.`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link to="/portal" className="mr-4 text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-500">SmartTrack Logistics Platform</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
              {privacy}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 The Smart Exporters. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/portal" className="hover:text-gray-700">Back to Portal</Link>
            <Link to="/terms" className="hover:text-gray-700">Terms of Use</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage 