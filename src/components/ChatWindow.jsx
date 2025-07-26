import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, db } from '../lib/supabase'
import { 
  Send, 
  Paperclip, 
  Image, 
  File, 
  Check, 
  CheckCheck,
  MessageSquare,
  Globe,
  Phone,
  Mail
} from 'lucide-react'
import toast from 'react-hot-toast'

const ChatWindow = ({ parcelId, parcelType, recipientId, recipientPhone, recipientEmail }) => {
  const { user, userRole } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' }
  ]

  useEffect(() => {
    fetchMessages()
    subscribeToMessages()
    return () => {
      // Cleanup subscription
      supabase.removeAllSubscriptions()
    }
  }, [parcelId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const data = await db.getMessages(parcelId)
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `parcelid=eq.${parcelId}`
        }, 
        (payload) => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()

    return subscription
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('application/')) {
        toast.error('Please select an image or document file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }

      setSelectedFile(file)
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => setFilePreview(e.target.result)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const uploadFile = async (file) => {
    try {
      const fileName = `chat_files/${Date.now()}_${file.name}`
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return

    setSending(true)

    try {
      let fileUrl = null
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile)
      }

      // Determine if this is a customer message or user-to-user message
      const isCustomerMessage = !recipientId || recipientId === 'customer'
      
      const messageData = {
        senderid: user.id,
        recipientid: isCustomerMessage ? null : recipientId,
        parcelid: parcelId,
        content: newMessage,
        message_type: selectedFile ? 'image' : 'text',
        language: language,
        delivery_channel: 'in-app',
        file_url: fileUrl,
        file_name: selectedFile ? selectedFile.name : null,
        recipient_type: isCustomerMessage ? 'customer' : 'user',
        customer_id: isCustomerMessage ? parcelId : null // Using parcelId as customer_id for customer messages
      }

      const newMessageRecord = await db.createMessage(messageData)
      setMessages(prev => [...prev, newMessageRecord])
      setNewMessage('')
      setSelectedFile(null)
      setFilePreview(null)

      // Send notifications if enabled
      if (recipientPhone) {
        await sendWhatsAppNotification(newMessageRecord)
      }
      if (recipientEmail) {
        await sendEmailNotification(newMessageRecord)
      }

      toast.success('Message sent!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const sendWhatsAppNotification = async (messageData) => {
    try {
      const response = await fetch('/.netlify/functions/sendWhatsApp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientPhone,
          message: messageData.content,
          language: language,
          template: 'newMessage'
        })
      })

      if (!response.ok) throw new Error('WhatsApp notification failed')
    } catch (error) {
      console.error('WhatsApp notification error:', error)
    }
  }

  const sendEmailNotification = async (messageData) => {
    try {
      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipientEmail,
          message: messageData.content,
          language: language,
          template: 'newMessage',
          subject: 'New Message from SmartExporters'
        })
      })

      if (!response.ok) throw new Error('Email notification failed')
    } catch (error) {
      console.error('Email notification error:', error)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDeliveryIcon = (status, deliveryChannel) => {
    if (status === 'read') {
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    } else if (status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-gray-400" />
    } else {
      return <Check className="h-4 w-4 text-gray-400" />
    }
  }

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return <Phone className="h-3 w-3 text-green-500" />
      case 'email':
        return <Mail className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">
            Chat - {parcelType.charAt(0).toUpperCase() + parcelType.slice(1)} {parcelId}
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start a conversation about this {parcelType}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`flex ${message.senderid === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderid === user.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Message content */}
                {message.content && (
                  <p className="text-sm mb-2">{message.content}</p>
                )}

                {/* File attachment */}
                {message.file_url && (
                  <div className="mb-2">
                    {message.message_type === 'image' ? (
                      <img
                        src={message.file_url}
                        alt="Attachment"
                        className="max-w-full h-32 object-cover rounded"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded p-2">
                        <File className="h-4 w-4" />
                        <span className="text-xs">{message.file_name}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Message metadata */}
                <div className={`flex items-center justify-between text-xs ${
                  message.senderid === user.id ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  <span>{formatTime(message.createdat)}</span>
                  <div className="flex items-center space-x-1">
                    {getDeliveryIcon(message.status, message.delivery_channel)}
                    {getChannelIcon(message.delivery_channel)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* File preview */}
      {filePreview && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Image className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Preview:</span>
            <img
              src={filePreview}
              alt="Preview"
              className="h-12 w-12 object-cover rounded"
            />
            <button
              onClick={() => {
                setSelectedFile(null)
                setFilePreview(null)
                if (fileInputRef.current) fileInputRef.current.value = ''
              }}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={2}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            
            <button
              onClick={sendMessage}
              disabled={sending || (!newMessage.trim() && !selectedFile)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send message"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatWindow 