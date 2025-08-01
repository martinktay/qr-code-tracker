import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { ArrowLeft, ChevronDown, ChevronUp, Mail, Phone, MessageCircle, FileText, Shield, QrCode, Truck, Users, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HelpPage = () => {
  const navigate = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I register a new parcel or sack?",
      answer: "To register a new parcel or sack, navigate to the 'Register Box' or 'Register Sack' section from the main dashboard. Fill in the required information including sender details, recipient information, parcel dimensions, and any special instructions. The system will automatically generate a unique QR code for tracking."
    },
    {
      question: "How can I track my parcel?",
      answer: "You can track your parcel in several ways: 1) Use the Map Tracker feature to see real-time location updates, 2) Scan the QR code on your parcel using the Scan & Log feature, 3) Check the Communication Center for status updates and messages, 4) Use the Customer Portal to search for your parcel using tracking number or QR code."
    },
    {
      question: "What do the different status indicators mean?",
      answer: "The status indicators show the current state of your parcel: Blue (Packed) - Parcel has been registered and is ready for shipping, Yellow (In Transit) - Parcel is currently being transported, Green (Delivered) - Parcel has been successfully delivered, Orange (Returned) - Parcel has been returned to sender."
    },
    {
      question: "How do I communicate with warehouse staff or admin?",
      answer: "Use the Communication Center feature to send messages to warehouse staff or administrators. You can also use the WhatsApp integration feature to directly message customer service. For urgent matters, contact the support team using the contact information provided in this help section."
    },
    {
      question: "Can I register international shipments?",
      answer: "Yes, the platform supports international shipping. When registering a parcel, you can specify the destination country and city, provide customs declarations, and add special instructions for international handling. The system will track your parcel throughout the international shipping process."
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login page and click on 'Forgot Password'. Enter your email address and you will receive a password reset link. Follow the instructions in the email to create a new password. If you continue to have issues, contact our support team."
    },
    {
      question: "What should I do if my parcel is lost or damaged?",
      answer: "If your parcel is lost or damaged, immediately contact our support team through the Communication Center or by phone. Provide your tracking number and detailed information about the issue. Our team will investigate and work to resolve the situation as quickly as possible."
    },
    {
      question: "How do I access analytics and reports?",
      answer: "Analytics and reports are available in the dashboard. Admins can access comprehensive analytics including shipping statistics, revenue reports, and regional breakdowns. Warehouse staff can view warehouse-specific analytics and inventory reports. Use the filtering options to customize your view."
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help via email",
      contact: "support@twools.com",
      action: "Send Email"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call our support team",
      contact: "+44 (0) 20 1234 5678",
      action: "Call Now"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with our team",
      contact: "Available 24/7",
      action: "Start Chat"
    }
  ]

  const quickGuides = [
    {
      icon: QrCode,
      title: "QR Code Scanning",
      description: "Learn how to scan and track parcels using QR codes"
    },
    {
      icon: Truck,
      title: "Shipping Process",
      description: "Understanding the complete shipping workflow"
    },
    {
      icon: Users,
      title: "User Management",
      description: "Managing user accounts and permissions"
    },
    {
      icon: BarChart3,
      title: "Analytics Guide",
      description: "How to interpret and use analytics data"
    }
  ]

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
          <h1 className="text-4xl font-bold text-white mb-2">Help & Support</h1>
          <p className="text-gray-400">Get help with SmartExporters QR Code Tracker</p>
        </div>

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Quick Start Guide */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickGuides.map((guide, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer">
                    <guide.icon className="h-8 w-8 text-blue-400 mb-3" />
                    <h3 className="font-semibold text-white mb-2">{guide.title}</h3>
                    <p className="text-sm text-gray-400">{guide.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid md:grid-cols-3 gap-6">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-gray-700 p-6 rounded-lg text-center">
                    <method.icon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-white mb-2">{method.title}</h3>
                    <p className="text-gray-400 mb-3">{method.description}</p>
                    <p className="text-blue-400 font-medium mb-4">{method.contact}</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      {method.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-700 rounded-lg">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-700 transition-colors"
                    >
                      <span className="font-medium text-white">{faq.question}</span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4 text-gray-300">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Guides */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Feature Guides</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4">Parcel Registration</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Navigate to Register Box or Register Sack</li>
                    <li>Fill in sender and recipient details</li>
                    <li>Enter parcel dimensions and weight</li>
                    <li>Add any special instructions</li>
                    <li>Submit to generate QR code</li>
                  </ol>
                </div>
                
                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4">Tracking Your Parcel</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Use Map Tracker for real-time location</li>
                    <li>Scan QR code with Scan & Log feature</li>
                    <li>Check Communication Center for updates</li>
                    <li>Use Customer Portal for detailed tracking</li>
                    <li>Contact support for assistance</li>
                  </ol>
                </div>

                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4">Communication</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Access Communication Center</li>
                    <li>Select the appropriate contact</li>
                    <li>Send messages or use WhatsApp</li>
                    <li>Check message history</li>
                    <li>Receive real-time notifications</li>
                  </ol>
                </div>

                <div className="bg-gray-700 p-6 rounded-lg">
                  <h3 className="font-semibold text-white mb-4">Analytics & Reports</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Access dashboard analytics</li>
                    <li>View shipping statistics</li>
                    <li>Check revenue reports</li>
                    <li>Analyze regional data</li>
                    <li>Export reports as needed</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Troubleshooting</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-white">Common Issues</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium text-white mb-2">Can't Login?</h5>
                      <p className="text-sm">Try resetting your password or contact support if the issue persists.</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium text-white mb-2">QR Code Not Scanning?</h5>
                      <p className="text-sm">Ensure good lighting and try cleaning the QR code surface.</p>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h5 className="font-medium text-white mb-2">No Tracking Updates?</h5>
                      <p className="text-sm">Check your internet connection and refresh the page.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-white">System Requirements</h4>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <ul className="space-y-2 text-sm">
                      <li>• Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                      <li>• Stable internet connection</li>
                      <li>• Camera access for QR code scanning</li>
                      <li>• JavaScript enabled</li>
                      <li>• Mobile responsive design</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">About Twools Ltd</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Company Details</h4>
                  <div className="space-y-2">
                    <p><strong>Company:</strong> Twools Ltd</p>
                    <p><strong>Product:</strong> SmartExporters QR Code Tracker</p>
                    <p><strong>Address:</strong> 123 Business Street, London, UK, SW1A 1AA</p>
                    <p><strong>Phone:</strong> +44 (0) 20 1234 5678</p>
                    <p><strong>Email:</strong> info@twools.com</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Support Hours</h4>
                  <div className="space-y-2">
                    <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM GMT</p>
                    <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM GMT</p>
                    <p><strong>Sunday:</strong> Closed</p>
                    <p><strong>Emergency:</strong> 24/7 via email</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HelpPage