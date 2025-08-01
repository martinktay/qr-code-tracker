import React, { useState } from 'react';
import { 
  CheckCircle, 
  Circle, 
  ChevronUp, 
  ChevronDown,
  Clock,
  Package,
  Truck,
  Home,
  User,
  Box,
  ShoppingBag,
  MessageSquare,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const ParcelTimeline = ({ parcelId, scanHistory = [], parcelData = {} }) => {
  const [expandedStages, setExpandedStages] = useState(new Set());
  const [showConversation, setShowConversation] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState([
    {
      id: 1,
      sender: 'Warehouse Staff',
      message: `Your ${parcelData.box_id ? 'box' : parcelData.sack_id ? 'sack' : 'parcel'} has been received and is being processed.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'staff'
    },
    {
      id: 2,
      sender: 'Customer',
      message: 'Thank you! When can I expect delivery?',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'customer'
    },
    {
      id: 3,
      sender: 'Delivery Team',
      message: 'We estimate delivery within 2-3 business days. We\'ll update you with tracking details.',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'staff'
    }
  ]);

  // Detect parcel type from parcelData
  const getParcelType = () => {
    if (parcelData.box_id) return 'box';
    if (parcelData.sack_id) return 'sack';
    if (parcelId && typeof parcelId === 'string') {
      if (parcelId.toLowerCase().includes('box')) return 'box';
      if (parcelId.toLowerCase().includes('sack')) return 'sack';
    }
    return 'parcel';
  };

  const parcelType = getParcelType();
  const isBox = parcelType === 'box';
  const isSack = parcelType === 'sack';

  // Define the delivery stages in order
  const deliveryStages = [
    {
      id: 'expecting',
      title: "We're expecting it",
      description: `We're expecting your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} to arrive with us soon and we'll update your tracking once we've received it`,
      icon: isBox ? Box : isSack ? ShoppingBag : Package,
      color: 'text-gray-400'
    },
    {
      id: 'received',
      title: "We've got it",
      description: `We're processing your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} at our hub`,
      icon: isBox ? Box : isSack ? ShoppingBag : Package,
      color: 'text-blue-600'
    },
    {
      id: 'in_transit',
      title: "On its way",
      description: `Your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} is at the delivery depot and we'll let you know when it's out for delivery`,
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      id: 'out_for_delivery',
      title: "Out for delivery",
      description: `Your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} is on its way to you today`,
      icon: Truck,
      color: 'text-blue-600'
    },
    {
      id: 'delivered',
      title: "Delivered",
      description: `Your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} has been successfully delivered`,
      icon: Home,
      color: 'text-green-600'
    }
  ];

  // Map scan history to stages
  const getStageStatus = (stageId) => {
    const relevantScans = scanHistory.filter(scan => {
      switch (stageId) {
        case 'expecting':
          return scan.status === 'packed' || scan.status === 'registered';
        case 'received':
          return scan.status === 'received' || scan.status === 'processing';
        case 'in_transit':
          return scan.status === 'in_transit' || scan.status === 'departed';
        case 'out_for_delivery':
          return scan.status === 'out_for_delivery';
        case 'delivered':
          return scan.status === 'delivered';
        default:
          return false;
      }
    });

    if (relevantScans.length === 0) return { completed: false, scan: null };
    
    const latestScan = relevantScans.sort((a, b) => 
      new Date(b.scan_time) - new Date(a.scan_time)
    )[0];

    return { completed: true, scan: latestScan };
  };

  const currentStageIndex = deliveryStages.findIndex(stage => {
    const status = getStageStatus(stage.id);
    return status.completed;
  });

  const toggleStage = (stageId) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (stageId, index) => {
    if (index <= currentStageIndex) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getParcelIdentifier = () => {
    if (parcelData.box_id) return `Box ID: ${parcelData.box_id}`;
    if (parcelData.sack_id) return `Sack ID: ${parcelData.sack_id}`;
    return `Parcel ID: ${parcelId}`;
  };

  const getParcelDetails = () => {
    const details = [];
    
    if (parcelData.content) {
      details.push({ label: 'Contents', value: parcelData.content });
    }
    
    if (parcelData.quantity) {
      details.push({ label: 'Quantity', value: parcelData.quantity });
    }
    
    if (parcelData.weight_kg) {
      details.push({ label: 'Weight', value: `${parcelData.weight_kg} kg` });
    }
    
    if (parcelData.dimensions) {
      details.push({ label: 'Dimensions', value: parcelData.dimensions });
    }
    
    if (parcelData.customers) {
      const customer = parcelData.customers;
      details.push({ 
        label: 'Customer', 
        value: `${customer.first_name} ${customer.last_name}` 
      });
      details.push({ label: 'Phone', value: customer.phone });
      if (customer.destination) {
        details.push({ label: 'Destination', value: customer.destination });
      }
    }
    
    return details;
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: conversationMessages.length + 1,
        sender: 'Customer',
        message: newMessage.trim(),
        timestamp: new Date().toISOString(),
        type: 'customer'
      };
      setConversationMessages([...conversationMessages, message]);
      setNewMessage('');
    }
  };

  const parcelDetails = getParcelDetails();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white">
                Track my {isBox ? 'box' : isSack ? 'sack' : 'parcel'}
              </CardTitle>
              <CardDescription className="text-lg font-mono bg-gray-700 text-gray-300 px-3 py-2 rounded mt-2">
                {getParcelIdentifier()}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {isBox && <Box className="w-6 h-6 text-blue-400" />}
              {isSack && <ShoppingBag className="w-6 h-6 text-green-400" />}
              {!isBox && !isSack && <Package className="w-6 h-6 text-gray-400" />}
              <Badge variant="outline" className="capitalize bg-gray-700 border-gray-600 text-white">
                {parcelType}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Parcel Details */}
          {parcelDetails.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {parcelDetails.map((detail, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-300">{detail.label}: </span>
                  <span className="text-gray-400">{detail.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Dialog open={showConversation} onOpenChange={setShowConversation}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  Contact Support
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-800 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Package Support Conversation</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Chat with our support team about your {parcelType}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="flex flex-col h-[500px]">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 border border-gray-600 rounded-lg bg-gray-700">
                    {conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.type === 'customer' ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] p-3 rounded-lg",
                            msg.type === 'customer'
                              ? "bg-blue-600 text-white"
                              : "bg-gray-600 text-gray-300"
                          )}
                        >
                          <div className="text-xs font-medium mb-1">
                            {msg.sender}
                          </div>
                          <div className="text-sm">{msg.message}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {formatTimestamp(msg.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="flex items-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500">
              <Phone className="w-4 h-4" />
              Call Support
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2 bg-gray-700 border-gray-600 text-white hover:bg-gray-600 hover:border-gray-500">
              <Mail className="w-4 h-4" />
              Email Support
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Delivery Timeline</CardTitle>
          <CardDescription className="text-gray-400">
            Track the progress of your {parcelType} through our delivery network
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-6">
            {deliveryStages.map((stage, index) => {
              const status = getStageStatus(stage.id);
              const isCompleted = status.completed;
              const isCurrentStage = index === currentStageIndex + 1;
              const isExpanded = expandedStages.has(stage.id);
              const Icon = stage.icon;
              
              return (
                <div key={stage.id} className="relative">
                  {/* Timeline line */}
                  {index < deliveryStages.length - 1 && (
                    <div className={cn(
                      "absolute left-6 top-12 w-0.5 h-16",
                      index <= currentStageIndex ? "bg-blue-600" : "bg-gray-600"
                    )} />
                  )}

                  {/* Stage content */}
                  <div className="flex items-start space-x-4">
                    {/* Status icon */}
                    <div className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center",
                      isCompleted ? "bg-blue-600" : "bg-gray-700"
                    )}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <Circle className={cn("w-6 h-6", getStatusColor(stage.id, index))} />
                      )}
                    </div>

                    {/* Stage details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className={cn(
                            "text-lg font-medium",
                            isCompleted || isCurrentStage ? "text-white" : "text-gray-400"
                          )}>
                            {stage.title}
                          </h3>
                          
                          {status.scan && (
                            <p className="text-sm text-gray-400 mt-1">
                              {formatTimestamp(status.scan.scan_time)}
                            </p>
                          )}
                        </div>

                        {/* Expand/collapse button */}
                        {isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleStage(stage.id)}
                            className="ml-4 text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                      </div>

                      {/* Stage description */}
                      <p className={cn(
                        "text-sm mt-2",
                        isCompleted || isCurrentStage ? "text-white" : "text-gray-400"
                      )}>
                        {stage.description}
                      </p>

                      {/* Additional details when expanded */}
                      {isCompleted && isExpanded && status.scan && (
                        <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                          <div className="space-y-3">
                            {/* Location */}
                            {status.scan.location && (
                              <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-white">Location</p>
                                  <p className="text-sm text-gray-400">{status.scan.location}</p>
                                </div>
                              </div>
                            )}

                            {/* Comments */}
                            {status.scan.comments && (
                              <div className="flex items-start space-x-2">
                                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-white">Notes</p>
                                  <p className="text-sm text-gray-400">{status.scan.comments}</p>
                                </div>
                              </div>
                            )}

                            {/* Estimated delivery */}
                            {status.scan.estimated_delivery && (
                              <div className="flex items-start space-x-2">
                                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-white">Estimated Delivery</p>
                                  <p className="text-sm text-gray-400">
                                    {formatTimestamp(status.scan.estimated_delivery)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Special delivery instructions */}
                            {stage.id === 'out_for_delivery' && status.scan && (
                              <Alert className="bg-yellow-900 border-yellow-700">
                                <AlertCircle className="h-4 w-4 text-yellow-400" />
                                <AlertDescription className="text-yellow-200">
                                  Your courier estimates they'll deliver between 16:00 and 17:00 today. 
                                  As this is an estimate, we'll let you know about any changes during the day.
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              {isBox ? <Box className="w-4 h-4" /> : isSack ? <ShoppingBag className="w-4 h-4" /> : <Package className="w-4 h-4" />}
              <span>Tracking provided by SmartExporters</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ParcelTimeline; 