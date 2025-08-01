import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const PrivacyPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Introduction */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Twools Ltd ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our SmartExporters QR Code Tracker platform.
              </p>
              <p>
                By using our Service, you consent to the data practices described in this policy. If you do not agree with our policies 
                and practices, please do not use our Service.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <h4 className="text-white font-semibold mb-2">Personal Information</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and contact information (email, phone number)</li>
                <li>Account credentials and authentication data</li>
                <li>User role and permissions (customer, warehouse staff, admin)</li>
                <li>Profile information and preferences</li>
              </ul>

              <h4 className="text-white font-semibold mb-2 mt-4">Parcel and Shipping Information</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Parcel details (dimensions, weight, contents)</li>
                <li>Shipping addresses and destination information</li>
                <li>Tracking numbers and QR codes</li>
                <li>Customs declarations and special instructions</li>
                <li>Shipping history and status updates</li>
              </ul>

              <h4 className="text-white font-semibold mb-2 mt-4">Usage Data</h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Log data and analytics information</li>
                <li>Device information and IP addresses</li>
                <li>Usage patterns and feature interactions</li>
                <li>Communication logs and messages</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain the QR code tracking service</li>
                <li>Process parcel registrations and tracking requests</li>
                <li>Send notifications and status updates</li>
                <li>Facilitate communication between users</li>
                <li>Generate analytics and reports</li>
                <li>Improve our services and user experience</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
                <li>Provide customer support</li>
              </ul>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">4. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
              
              <h4 className="text-white font-semibold mb-2">Service Providers</h4>
              <p>We may share information with trusted third-party service providers who assist us in operating our platform, such as:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cloud hosting and database services</li>
                <li>Payment processing services</li>
                <li>Communication and notification services</li>
                <li>Analytics and monitoring tools</li>
              </ul>

              <h4 className="text-white font-semibold mb-2 mt-4">Legal Requirements</h4>
              <p>We may disclose your information if required by law or in response to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Legal process or court orders</li>
                <li>Government requests or investigations</li>
                <li>Protection of our rights and property</li>
                <li>Emergency situations involving public safety</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">5. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We implement appropriate technical and organizational measures to protect your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">6. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">7. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Twools Ltd</strong></p>
                <p>Email: privacy@twools.com</p>
                <p>Phone: +44 (0) 20 1234 5678</p>
                <p>Address: 123 Business Street, London, UK, SW1A 1AA</p>
                <p>Data Protection Officer: dpo@twools.com</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPage 