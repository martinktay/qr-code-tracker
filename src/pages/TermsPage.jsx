import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, FileText } from 'lucide-react'

const TermsPage = () => {
  const [terms, setTerms] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTerms()
  }, [])

  const fetchTerms = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('terms_of_use, company_name')
        .single()

      if (error) throw error

      setTerms(data.terms_of_use || getDefaultTerms(data.company_name))
    } catch (error) {
      console.error('Error fetching terms:', error)
      setTerms(getDefaultTerms('The Smart Exporters'))
    } finally {
      setLoading(false)
    }
  }

  const getDefaultTerms = (companyName) => {
    return `Terms of Use for ${companyName}

Last updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using the SmartExporters logistics platform, you accept and agree to be bound by the terms and provision of this agreement.

2. DESCRIPTION OF SERVICE
SmartExporters is a logistics tracking platform that allows users to:
- Register and track packages (boxes and sacks)
- Receive real-time updates on package status
- Access delivery timelines and location information
- Receive notifications via WhatsApp

3. USER RESPONSIBILITIES
Users are responsible for:
- Providing accurate information when registering packages
- Maintaining the security of their account credentials
- Notifying us of any unauthorized use of their account
- Complying with all applicable laws and regulations

4. PRIVACY AND DATA PROTECTION
We are committed to protecting your privacy. Please refer to our Privacy Policy for details on how we collect, use, and protect your personal information.

5. INTELLECTUAL PROPERTY
All content, features, and functionality of the SmartExporters platform are owned by ${companyName} and are protected by international copyright, trademark, and other intellectual property laws.

6. LIMITATION OF LIABILITY
${companyName} shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.

7. MODIFICATIONS TO TERMS
We reserve the right to modify these terms at any time. Users will be notified of any changes via email or through the platform.

8. CONTACT INFORMATION
For questions about these terms, please contact us at support@smartexporters.com

9. GOVERNING LAW
These terms shall be governed by and construed in accordance with the laws of Nigeria.

10. SEVERABILITY
If any provision of these terms is found to be unenforceable, the remaining provisions will continue in full force and effect.`
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
              <FileText className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Terms of Use</h1>
                <p className="text-sm text-gray-500">SmartExporters Logistics Platform</p>
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
              {terms}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 The Smart Exporters. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link to="/portal" className="hover:text-gray-700">Back to Portal</Link>
            <Link to="/privacy" className="hover:text-gray-700">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 