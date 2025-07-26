import React, { useState } from 'react';
import { X, MessageSquare, Mail, Smartphone, Globe } from 'lucide-react';

const MessagePreviewModal = ({ isOpen, onClose, messageData, messageType = 'statusUpdate' }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  if (!isOpen) return null;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'yo', name: 'Yorùbá', flag: '🇳🇬' }
  ];

  const getMessagePreview = () => {
    const templates = {
      statusUpdate: {
        en: `Hi ${messageData?.customerName || 'Customer'}, your parcel ${messageData?.trackingNumber || 'TRK123'} has been updated to ${messageData?.status || 'In Transit'}. Track at: ${window.location.origin}/portal`,
        es: `Hola ${messageData?.customerName || 'Cliente'}, su paquete ${messageData?.trackingNumber || 'TRK123'} ha sido actualizado a ${messageData?.status || 'En Tránsito'}. Rastree en: ${window.location.origin}/portal`,
        fr: `Bonjour ${messageData?.customerName || 'Client'}, votre colis ${messageData?.trackingNumber || 'TRK123'} a été mis à jour vers ${messageData?.status || 'En Transit'}. Suivez à: ${window.location.origin}/portal`,
        yo: `Bawo ni ${messageData?.customerName || 'Alabara'}, ero re ${messageData?.trackingNumber || 'TRK123'} ti tun si ${messageData?.status || 'Ninu Irin'}. Tọpa ni: ${window.location.origin}/portal`
      },
      newMessage: {
        en: `Hi ${messageData?.customerName || 'Customer'}, you have a new message about your parcel ${messageData?.trackingNumber || 'TRK123'}. Check your inbox or visit: ${window.location.origin}/portal`,
        es: `Hola ${messageData?.customerName || 'Cliente'}, tiene un nuevo mensaje sobre su paquete ${messageData?.trackingNumber || 'TRK123'}. Revise su bandeja de entrada o visite: ${window.location.origin}/portal`,
        fr: `Bonjour ${messageData?.customerName || 'Client'}, vous avez un nouveau message concernant votre colis ${messageData?.trackingNumber || 'TRK123'}. Vérifiez votre boîte de réception ou visitez: ${window.location.origin}/portal`,
        yo: `Bawo ni ${messageData?.customerName || 'Alabara'}, o ni ifiranṣẹ tuntun nipa ero re ${messageData?.trackingNumber || 'TRK123'}. Ṣayẹwo inbox re tabi lọ si: ${window.location.origin}/portal`
      }
    };

    return templates[messageType]?.[selectedLanguage] || templates.statusUpdate.en;
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'email':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChannelName = (channel) => {
    switch (channel) {
      case 'whatsapp':
        return 'WhatsApp';
      case 'email':
        return 'Email';
      case 'sms':
        return 'SMS';
      default:
        return 'Web';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Message Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Language
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-lg">{lang.flag}</div>
                <div className="text-sm font-medium">{lang.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 whitespace-pre-wrap">
                {getMessagePreview()}
              </p>
            </div>
          </div>

          {/* Channel Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getChannelIcon('whatsapp')}
                <span className="ml-2 font-medium text-green-800">
                  {getChannelName('whatsapp')}
                </span>
              </div>
              <p className="text-sm text-green-700">
                Will be sent via WhatsApp Business API
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getChannelIcon('email')}
                <span className="ml-2 font-medium text-blue-800">
                  {getChannelName('email')}
                </span>
              </div>
              <p className="text-sm text-blue-700">
                Will be sent via SMTP
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getChannelIcon('sms')}
                <span className="ml-2 font-medium text-purple-800">
                  {getChannelName('sms')}
                </span>
              </div>
              <p className="text-sm text-purple-700">
                Will be sent via SMS
              </p>
            </div>
          </div>

          {/* Message Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Message Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Type:</span>
                <span className="ml-2 text-gray-600 capitalize">
                  {messageType.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Language:</span>
                <span className="ml-2 text-gray-600">
                  {languages.find(l => l.code === selectedLanguage)?.name}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <span className="ml-2 text-gray-600">
                  {messageData?.customerName || 'N/A'}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Tracking:</span>
                <span className="ml-2 text-gray-600">
                  {messageData?.trackingNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
          <button
            onClick={() => {
              // Here you would typically send the message
              console.log('Sending message:', getMessagePreview());
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePreviewModal; 