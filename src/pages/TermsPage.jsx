import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const TermsPage = () => {
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
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Use</h1>
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
                Welcome to SmartExporters QR Code Tracker ("the Service"), developed and operated by Twools Ltd ("we," "us," or "our"). 
                These Terms of Use govern your use of our QR code tracking and logistics management platform.
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, 
                then you may not access the Service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">2. Service Description</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                SmartExporters QR Code Tracker is a comprehensive logistics and parcel tracking platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>QR code generation and management for parcels and sacks</li>
                <li>Real-time tracking and status updates</li>
                <li>International shipping analytics and reporting</li>
                <li>Communication tools between customers, warehouse staff, and administrators</li>
                <li>Warehouse management and inventory tracking</li>
                <li>Customer portal for parcel inquiries</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate and current</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms or are used for fraudulent purposes.
              </p>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with the proper functioning of the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Create multiple accounts for fraudulent purposes</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">5. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference.
              </p>
              <p>
                By using the Service, you consent to the collection, use, and disclosure of your information as described in our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">6. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by Twools Ltd and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You may not copy, modify, distribute, sell, or lease any part of our Service without our prior written consent.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                In no event shall Twools Ltd, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any 
                indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, 
                goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p>
                Our total liability to you for any claims arising from your use of the Service shall not exceed the amount you paid us 
                for the Service in the twelve (12) months preceding the claim.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">8. Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis. Twools Ltd makes no warranties, expressed or implied, 
                and hereby disclaims all warranties, including without limitation:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that the Service will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of tracking information</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">9. Termination</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, 
                for any reason whatsoever, including without limitation if you breach the Terms.
              </p>
              <p>
                Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, 
                you may simply discontinue using the Service or contact us to delete your account.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">10. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide 
                at least 30 days notice prior to any new terms taking effect.
              </p>
              <p>
                Your continued use of the Service after any changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">11. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="bg-gray-700 p-4 rounded-lg">
                <p><strong>Twools Ltd</strong></p>
                <p>Email: legal@twools.com</p>
                <p>Phone: +44 (0) 20 1234 5678</p>
                <p>Address: 123 Business Street, London, UK, SW1A 1AA</p>
              </div>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">12. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                These Terms shall be interpreted and governed by the laws of the United Kingdom, without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction 
                of the courts of the United Kingdom.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TermsPage 