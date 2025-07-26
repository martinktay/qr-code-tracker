import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Package, 
  Truck, 
  User, 
  MapPin, 
  Clock, 
  FileText, 
  Image, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  Globe
} from 'lucide-react';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';

const InteractionTrail = ({ parcelId, parcelType, userRole }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchAllInteractions();
  }, [parcelId]);

  const fetchAllInteractions = async () => {
    try {
      setLoading(true);
      
      // Fetch scan history
      let scanHistory = [];
      try {
        scanHistory = await db.getScanHistory(parcelId, parcelType) || [];
      } catch (error) {
        console.log('No scan history found');
      }

      // Fetch messages
      let messages = [];
      try {
        messages = await db.getMessages(parcelId) || [];
      } catch (error) {
        console.log('No messages found');
      }

      // Combine and sort all interactions by timestamp
      const allInteractions = [
        ...scanHistory.map(scan => ({
          ...scan,
          type: 'scan',
          timestamp: scan.scan_time,
          interactionId: `scan-${scan.id}`
        })),
        ...messages.map(message => ({
          ...message,
          type: 'message',
          timestamp: message.createdat,
          interactionId: `message-${message.id}`
        }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setInteractions(allInteractions);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to load interaction history');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (interactionId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(interactionId)) {
      newExpanded.delete(interactionId);
    } else {
      newExpanded.add(interactionId);
    }
    setExpandedItems(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const day = date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    return `${time} - ${day}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'in_transit': return 'text-blue-600 bg-blue-50';
      case 'out_for_delivery': return 'text-yellow-600 bg-yellow-50';
      case 'packed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'packed': return 'Packed';
      case 'received': return 'Received';
      case 'processing': return 'Processing';
      default: return status;
    }
  };

  const getInteractionIcon = (interaction) => {
    if (interaction.type === 'scan') {
      switch (interaction.status) {
        case 'delivered': return <CheckCircle className="w-5 h-5 text-green-600" />;
        case 'in_transit': return <Truck className="w-5 h-5 text-blue-600" />;
        case 'out_for_delivery': return <Truck className="w-5 h-5 text-yellow-600" />;
        case 'packed': return <Package className="w-5 h-5 text-gray-600" />;
        default: return <Package className="w-5 h-5 text-gray-600" />;
      }
    } else if (interaction.type === 'message') {
      return <MessageSquare className="w-5 h-5 text-blue-600" />;
    }
  };

  const getInteractionTitle = (interaction) => {
    if (interaction.type === 'scan') {
      const location = interaction.location || 'Location not specified';
      const staffName = interaction.scanned_by || 'Warehouse Staff';
      return `${getStatusText(interaction.status)} by ${staffName} at ${location}`;
    } else if (interaction.type === 'message') {
      const isCustomerMessage = interaction.recipient_type === 'customer';
      return isCustomerMessage ? 'Customer Message' : 'Staff Message';
    }
  };

  const getInteractionDescription = (interaction) => {
    if (interaction.type === 'scan') {
      let description = `Parcel status updated to ${getStatusText(interaction.status).toLowerCase()}`;
      if (interaction.comments) {
        description += ` - ${interaction.comments}`;
      }
      return description;
    } else if (interaction.type === 'message') {
      return interaction.content.substring(0, 100) + (interaction.content.length > 100 ? '...' : '');
    }
  };

  const getPartyInfo = (interaction) => {
    if (interaction.type === 'scan') {
      return {
        name: interaction.scanned_by || 'Warehouse Staff',
        role: 'Warehouse Staff',
        icon: <User className="w-4 h-4" />
      };
    } else if (interaction.type === 'message') {
      const isCustomerMessage = interaction.recipient_type === 'customer';
      return {
        name: isCustomerMessage ? 'Customer' : 'Support Team',
        role: isCustomerMessage ? 'Customer' : 'Staff',
        icon: isCustomerMessage ? <User className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />
      };
    }
  };

  const isImportantInteraction = (interaction) => {
    if (interaction.type === 'scan') {
      return ['delivered', 'out_for_delivery', 'in_transit'].includes(interaction.status);
    }
    return false;
  };

  const getKeyMilestones = () => {
    const milestones = [];
    
    // Find first scan
    const firstScan = interactions.find(i => i.type === 'scan');
    if (firstScan) {
      milestones.push({
        title: 'First Scan',
        description: `Received at ${firstScan.location || 'warehouse'}`,
        timestamp: firstScan.timestamp,
        status: 'completed'
      });
    }

    // Find in transit
    const inTransit = interactions.find(i => i.type === 'scan' && i.status === 'in_transit');
    if (inTransit) {
      milestones.push({
        title: 'In Transit',
        description: `Shipped to destination`,
        timestamp: inTransit.timestamp,
        status: 'completed'
      });
    }

    // Find out for delivery
    const outForDelivery = interactions.find(i => i.type === 'scan' && i.status === 'out_for_delivery');
    if (outForDelivery) {
      milestones.push({
        title: 'Out for Delivery',
        description: `On final delivery route`,
        timestamp: outForDelivery.timestamp,
        status: 'completed'
      });
    }

    // Find delivered
    const delivered = interactions.find(i => i.type === 'scan' && i.status === 'delivered');
    if (delivered) {
      milestones.push({
        title: 'Delivered',
        description: `Successfully delivered`,
        timestamp: delivered.timestamp,
        status: 'completed'
      });
    }

    return milestones;
  };

  const renderScanDetails = (scan) => (
    <div className="space-y-3">
      {/* Location */}
      {scan.location && (
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Location</p>
            <p className="text-sm text-gray-600">{scan.location}</p>
          </div>
        </div>
      )}

      {/* Comments */}
      {scan.comments && (
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Staff Notes</p>
            <p className="text-sm text-gray-600">{scan.comments}</p>
          </div>
        </div>
      )}

      {/* Estimated delivery */}
      {scan.estimated_delivery && (
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
            <p className="text-sm text-gray-600">
              {formatTimestamp(scan.estimated_delivery)}
            </p>
          </div>
        </div>
      )}

      {/* Photo */}
      {scan.photo_url && (
        <div className="flex items-start space-x-2">
          <Image className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Photo Evidence</p>
            <div className="mt-2">
              <img 
                src={scan.photo_url} 
                alt="Scan photo" 
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          </div>
        </div>
      )}

      {/* GPS Coordinates */}
      {scan.gps_coordinates && (
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900">GPS Coordinates</p>
            <p className="text-sm text-gray-600">{scan.gps_coordinates}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMessageDetails = (message) => (
    <div className="space-y-3">
      {/* Message content */}
      <div className="flex items-start space-x-2">
        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Message</p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>

      {/* Language */}
      {message.language && (
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Language: {message.language.toUpperCase()}
          </span>
        </div>
      )}

      {/* Delivery status */}
      {message.delivery_status && (
        <div className="flex items-center space-x-2">
          {message.delivery_status === 'delivered' ? (
            <CheckCircle className="w-4 h-4 text-green-500" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-sm text-gray-600">
            {message.delivery_status === 'delivered' ? 'Delivered' : 'Pending'}
          </span>
        </div>
      )}

      {/* File attachment */}
      {message.file_url && (
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">Attachment</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-600">{message.file_name}</span>
              <button 
                onClick={() => window.open(message.file_url, '_blank')}
                className="text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = message.file_url;
                  link.download = message.file_name;
                  link.click();
                }}
                className="text-green-600 hover:text-green-700"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery channel */}
      {message.delivery_channel && (
        <div className="flex items-center space-x-2">
          {message.delivery_channel === 'whatsapp' ? (
            <Phone className="w-4 h-4 text-green-500" />
          ) : message.delivery_channel === 'email' ? (
            <Mail className="w-4 h-4 text-blue-500" />
          ) : (
            <MessageSquare className="w-4 h-4 text-gray-500" />
          )}
          <span className="text-sm text-gray-600">
            Sent via {message.delivery_channel}
          </span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interaction history...</p>
        </div>
      </div>
    );
  }

  if (interactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Interactions Yet</h3>
          <p className="text-gray-600">
            No scan history or messages have been recorded for this parcel.
          </p>
        </div>
      </div>
    );
  }

  const keyMilestones = getKeyMilestones();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Interaction Trail
        </h3>
        <span className="text-sm text-gray-500">
          {interactions.length} interactions
        </span>
      </div>

      {/* Key Milestones */}
      {keyMilestones.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-3">Key Milestones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {keyMilestones.map((milestone, index) => (
              <div key={index} className="text-center">
                <div className="text-xs font-medium text-blue-700">{milestone.title}</div>
                <div className="text-xs text-blue-600">{milestone.description}</div>
                <div className="text-xs text-blue-500 mt-1">
                  {formatTimestamp(milestone.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {interactions.map((interaction, index) => {
          const isExpanded = expandedItems.has(interaction.interactionId);
          const partyInfo = getPartyInfo(interaction);
          
          return (
            <div key={interaction.interactionId} className="relative">
              {/* Timeline line */}
              {index < interactions.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200" />
              )}

                             <div className="flex items-start space-x-4">
                 {/* Icon */}
                 <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                   isImportantInteraction(interaction) ? 'bg-blue-100 ring-2 ring-blue-200' : 'bg-gray-100'
                 }`}>
                   {getInteractionIcon(interaction)}
                 </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {getInteractionTitle(interaction)}
                        </h4>
                        {interaction.type === 'scan' && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interaction.status)}`}>
                            {getStatusText(interaction.status)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        {getInteractionDescription(interaction)}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          {partyInfo.icon}
                          <span>{partyInfo.name}</span>
                        </div>
                        <span>•</span>
                        <span>{formatTimestamp(interaction.timestamp)}</span>
                      </div>
                    </div>

                    {/* Expand/collapse button */}
                    <button
                      onClick={() => toggleExpanded(interaction.interactionId)}
                      className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      {interaction.type === 'scan' 
                        ? renderScanDetails(interaction)
                        : renderMessageDetails(interaction)
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {interactions.filter(i => i.type === 'scan').length}
            </div>
            <div className="text-gray-600">Status Updates</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {interactions.filter(i => i.type === 'message').length}
            </div>
            <div className="text-gray-600">Messages</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-900">
              {interactions.filter(i => i.type === 'scan' && i.status === 'delivered').length > 0 ? 'Yes' : 'No'}
            </div>
            <div className="text-gray-600">Delivered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionTrail; 