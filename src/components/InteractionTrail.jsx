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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
      let interactionCounter = 0;
      const allInteractions = [
        ...scanHistory.map((scan, index) => {
          const key = `scan-${scan.scan_id || `fallback-${Date.now()}-${interactionCounter++}`}`;
          console.log('Scan interaction key:', key, 'scan_id:', scan.scan_id, 'index:', index);
          return {
            ...scan,
            type: 'scan',
            timestamp: scan.scan_time,
            interactionId: key
          };
        }),
        ...messages.map((message, index) => {
          const key = `message-${message.message_id || `fallback-${Date.now()}-${interactionCounter++}`}`;
          console.log('Message interaction key:', key, 'message_id:', message.message_id, 'index:', index);
          return {
            ...message,
            type: 'message',
            timestamp: message.createdat,
            interactionId: key
          };
        })
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log('All interactions with keys:', allInteractions.map(i => ({ type: i.type, id: i.interactionId })));

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
      case 'delivered': return 'text-white bg-green-600';
      case 'in_transit': return 'text-white bg-blue-600';
      case 'out_for_delivery': return 'text-white bg-yellow-600';
      case 'packed': return 'text-white bg-gray-600';
      default: return 'text-white bg-gray-600';
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
        case 'delivered': return <CheckCircle className="w-5 h-5 text-green-400" />;
        case 'in_transit': return <Truck className="w-5 h-5 text-blue-400" />;
        case 'out_for_delivery': return <Truck className="w-5 h-5 text-yellow-400" />;
        case 'packed': return <Package className="w-5 h-5 text-gray-400" />;
        default: return <Package className="w-5 h-5 text-gray-400" />;
      }
    } else if (interaction.type === 'message') {
      return <MessageSquare className="w-5 h-5 text-blue-400" />;
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
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Location</p>
            <p className="text-sm text-gray-400">{scan.location}</p>
          </div>
        </div>
      )}

      {/* Comments */}
      {scan.comments && (
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Staff Notes</p>
            <p className="text-sm text-gray-400">{scan.comments}</p>
          </div>
        </div>
      )}

      {/* Estimated delivery */}
      {scan.estimated_delivery && (
        <div className="flex items-start space-x-2">
          <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Estimated Delivery</p>
            <p className="text-sm text-gray-400">
              {formatTimestamp(scan.estimated_delivery)}
            </p>
          </div>
        </div>
      )}

      {/* Photo */}
      {scan.photo_url && (
        <div className="flex items-start space-x-2">
          <Image className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Photo Evidence</p>
            <div className="mt-2">
              <img 
                src={scan.photo_url} 
                alt="Scan photo" 
                className="w-32 h-32 object-cover rounded-lg border border-gray-600"
              />
            </div>
          </div>
        </div>
      )}

      {/* GPS Coordinates */}
      {scan.gps_coordinates && (
        <div className="flex items-start space-x-2">
          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">GPS Coordinates</p>
            <p className="text-sm text-gray-400">{scan.gps_coordinates}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderMessageDetails = (message) => (
    <div className="space-y-3">
      {/* Message content */}
      <div className="flex items-start space-x-2">
        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Message</p>
          <p className="text-sm text-gray-400 whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>

      {/* Language */}
      {message.language && (
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            Language: {message.language.toUpperCase()}
          </span>
        </div>
      )}

      {/* Delivery status */}
      {message.delivery_status && (
        <div className="flex items-center space-x-2">
          {message.delivery_status === 'delivered' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-yellow-400" />
          )}
          <span className="text-sm text-gray-400">
            {message.delivery_status === 'delivered' ? 'Delivered' : 'Pending'}
          </span>
        </div>
      )}

      {/* File attachment */}
      {message.file_url && (
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Attachment</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-sm text-gray-400">{message.file_name}</span>
              <button 
                onClick={() => window.open(message.file_url, '_blank')}
                className="text-blue-400 hover:text-blue-300"
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
                className="text-green-400 hover:text-green-300"
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
            <Phone className="w-4 h-4 text-green-400" />
          ) : message.delivery_channel === 'email' ? (
            <Mail className="w-4 h-4 text-blue-400" />
          ) : (
            <MessageSquare className="w-4 h-4 text-gray-400" />
          )}
          <span className="text-sm text-gray-400">
            Sent via {message.delivery_channel}
          </span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading interaction history...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interactions.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Interactions Yet</h3>
            <p className="text-gray-400">
              No scan history or messages have been recorded for this parcel.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const keyMilestones = getKeyMilestones();

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-white">
            Interaction Trail
          </CardTitle>
          <Badge variant="secondary" className="bg-gray-700 text-white">
            {interactions.length} interactions
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Milestones */}
        {keyMilestones.length > 0 && (
          <div className="p-4 bg-blue-900 rounded-lg border border-blue-700">
            <h4 className="text-sm font-medium text-blue-200 mb-3">Key Milestones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {keyMilestones.map((milestone, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs font-medium text-blue-300">{milestone.title}</div>
                  <div className="text-xs text-blue-200">{milestone.description}</div>
                  <div className="text-xs text-blue-100 mt-1">
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
                  <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-600" />
                )}

                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isImportantInteraction(interaction) ? 'bg-blue-900 ring-2 ring-blue-700' : 'bg-gray-700'
                  }`}>
                    {getInteractionIcon(interaction)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-white">
                            {getInteractionTitle(interaction)}
                          </h4>
                          {interaction.type === 'scan' && (
                            <Badge variant="outline" className={getStatusColor(interaction.status)}>
                              {getStatusText(interaction.status)}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2">
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(interaction.interactionId)}
                        className="ml-4 p-1 text-gray-400 hover:text-white hover:bg-gray-700"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
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
        <Separator className="bg-gray-600" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-white">
              {interactions.filter(i => i.type === 'scan').length}
            </div>
            <div className="text-gray-400">Status Updates</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-white">
              {interactions.filter(i => i.type === 'message').length}
            </div>
            <div className="text-gray-400">Messages</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-white">
              {interactions.filter(i => i.type === 'scan' && i.status === 'delivered').length > 0 ? 'Yes' : 'No'}
            </div>
            <div className="text-gray-400">Delivered</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractionTrail; 