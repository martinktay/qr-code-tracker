import React from 'react';
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
  Package2
} from 'lucide-react';

const ParcelTimeline = ({ parcelId, scanHistory = [], parcelData = {} }) => {
  const [expandedStages, setExpandedStages] = React.useState(new Set());

  // Detect parcel type from parcelData
  const getParcelType = () => {
    if (parcelData.box_id) return 'box';
    if (parcelData.sack_id) return 'sack';
    // Fallback: check if parcelId contains box or sack indicators
    if (parcelId && typeof parcelId === 'string') {
      if (parcelId.toLowerCase().includes('box')) return 'box';
      if (parcelId.toLowerCase().includes('sack')) return 'sack';
    }
    return 'parcel'; // generic fallback
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
      icon: isBox ? Box : isSack ? Package2 : Package,
      color: 'text-gray-400'
    },
    {
      id: 'received',
      title: "We've got it",
      description: `We're processing your ${isBox ? 'box' : isSack ? 'sack' : 'parcel'} at our hub`,
      icon: isBox ? Box : isSack ? Package2 : Package,
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
    
    // Get the most recent scan for this stage
    const latestScan = relevantScans.sort((a, b) => 
      new Date(b.scan_time) - new Date(a.scan_time)
    )[0];

    return { completed: true, scan: latestScan };
  };

  // Get current stage index
  const getCurrentStageIndex = () => {
    for (let i = deliveryStages.length - 1; i >= 0; i--) {
      const stage = deliveryStages[i];
      const status = getStageStatus(stage.id);
      if (status.completed) return i;
    }
    return -1; // No stages completed yet
  };

  const currentStageIndex = getCurrentStageIndex();

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
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const day = date.toLocaleDateString('en-US', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
    return `${time} - ${day}`;
  };

  const getStatusColor = (stageId, index) => {
    if (index <= currentStageIndex) {
      return 'text-blue-600';
    }
    return 'text-gray-400';
  };

  // Get parcel identifier
  const getParcelIdentifier = () => {
    if (parcelData.tracking_number) return parcelData.tracking_number;
    if (parcelData.box_id) return `Box ID: ${parcelData.box_id}`;
    if (parcelData.sack_id) return `Sack ID: ${parcelData.sack_id}`;
    return `Parcel ID: ${parcelId}`;
  };

  // Get parcel details for display
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

  const parcelDetails = getParcelDetails();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Track my {isBox ? 'box' : isSack ? 'sack' : 'parcel'}
          </h2>
          <div className="flex items-center space-x-2">
            {isBox && <Box className="w-5 h-5 text-blue-600" />}
            {isSack && <Package2 className="w-5 h-5 text-green-600" />}
            {!isBox && !isSack && <Package className="w-5 h-5 text-gray-600" />}
            <span className="text-sm font-medium text-gray-600 capitalize">
              {parcelType}
            </span>
          </div>
        </div>
        
        <p className="text-lg font-mono text-gray-700 bg-gray-50 px-3 py-2 rounded">
          {getParcelIdentifier()}
        </p>

        {/* Parcel Details */}
        {parcelDetails.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parcelDetails.map((detail, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-gray-900">{detail.label}: </span>
                <span className="text-gray-600">{detail.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-4">
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
                <div className={`absolute left-6 top-12 w-0.5 h-16 ${
                  index <= currentStageIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}

              {/* Stage content */}
              <div className="flex items-start space-x-4">
                {/* Status icon */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Circle className={`w-6 h-6 ${getStatusColor(stage.id, index)}`} />
                  )}
                </div>

                {/* Stage details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium ${
                        isCompleted || isCurrentStage ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.title}
                      </h3>
                      
                      {status.scan && (
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimestamp(status.scan.scan_time)}
                        </p>
                      )}
                    </div>

                    {/* Expand/collapse button */}
                    {isCompleted && (
                      <button
                        onClick={() => toggleStage(stage.id)}
                        className="ml-4 p-1 text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Stage description */}
                  <p className={`text-sm mt-2 ${
                    isCompleted || isCurrentStage ? 'text-gray-700' : 'text-gray-500'
                  }`}>
                    {stage.description}
                  </p>

                  {/* Additional details when expanded */}
                  {isCompleted && isExpanded && status.scan && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-3">
                        {/* Location */}
                        {status.scan.location && (
                          <div className="flex items-start space-x-2">
                            <Icon className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Location</p>
                              <p className="text-sm text-gray-600">{status.scan.location}</p>
                            </div>
                          </div>
                        )}

                        {/* Comments */}
                        {status.scan.comments && (
                          <div className="flex items-start space-x-2">
                            <User className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Notes</p>
                              <p className="text-sm text-gray-600">{status.scan.comments}</p>
                            </div>
                          </div>
                        )}

                        {/* Estimated delivery */}
                        {status.scan.estimated_delivery && (
                          <div className="flex items-start space-x-2">
                            <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Estimated Delivery</p>
                              <p className="text-sm text-gray-600">
                                {formatTimestamp(status.scan.estimated_delivery)}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Special delivery instructions */}
                        {stage.id === 'out_for_delivery' && status.scan && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-sm text-blue-800">
                              Your courier estimates they'll deliver between 16:00 and 17:00 today. 
                              As this is an estimate, we'll let you know about any changes during the day.
                            </p>
                          </div>
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

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            {isBox ? <Box className="w-4 h-4" /> : isSack ? <Package2 className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            <span>Tracking provided by SmartTrack</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelTimeline; 