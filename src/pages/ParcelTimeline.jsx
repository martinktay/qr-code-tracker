import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import ChatWindow from '../components/ChatWindow';
import ParcelTimelineComponent from '../components/ParcelTimeline';
import InteractionTrail from '../components/InteractionTrail';
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ParcelTimeline = () => {
  const { id } = useParams();
  const { user, userRole } = useAuth();
  const [parcel, setParcel] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline' or 'trail'

  useEffect(() => {
    fetchParcelData();
  }, [id]);

  const fetchParcelData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch as box first
      let parcelData = null;
      try {
        parcelData = await db.getParcelById(id, 'box');
      } catch (error) {
        // If not found as box, try as sack
        try {
          parcelData = await db.getParcelById(id, 'sack');
        } catch (sackError) {
          // If neither found, try generic search
          const searchResults = await db.searchParcel(id);
          if (searchResults.boxes && searchResults.boxes.length > 0) {
            parcelData = searchResults.boxes[0];
          } else if (searchResults.sacks && searchResults.sacks.length > 0) {
            parcelData = searchResults.sacks[0];
          }
        }
      }

      if (parcelData) {
        setParcel(parcelData);
      }

      // Fetch scan history for both box and sack
      let history = [];
      try {
        history = await db.getScanHistory(id, 'box') || [];
      } catch (error) {
        try {
          history = await db.getScanHistory(id, 'sack') || [];
        } catch (sackError) {
          console.log('No scan history found');
        }
      }
      
      setScanHistory(history);
    } catch (error) {
      console.error('Error fetching parcel data:', error);
      toast.error('Failed to load parcel information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800';
      case 'packed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'in_transit': return 'In Transit';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'packed': return 'Packed';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading parcel information...</p>
        </div>
      </div>
    );
  }

  if (!parcel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Parcel Not Found</h2>
          <p className="text-gray-600 mb-4">The parcel you're looking for doesn't exist.</p>
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/dashboard" 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Parcel Details
              </h1>
              <p className="text-gray-600">
                Tracking ID: {parcel.tracking_number || id}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(parcel.status)}`}>
                {getStatusText(parcel.status)}
              </span>
              

              
              {/* Chat button for customers */}
              {userRole === 'customer' && (
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {showChat ? 'Hide Chat' : 'Chat with Support'}
                </button>
              )}
            </div>
          </div>

          {/* Parcel information grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Parcel Type</p>
                <p className="text-sm text-gray-600">
                  {parcel.parcel_type === 'box' ? 'Box' : 'Sack'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <User className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Customer</p>
                <p className="text-sm text-gray-600">
                  {parcel.customer_name || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Destination</p>
                <p className="text-sm text-gray-600">
                  {parcel.destination_address || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">
                  {new Date(parcel.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {parcel.weight && (
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Weight</p>
                  <p className="text-sm text-gray-600">
                    {parcel.weight} kg
                  </p>
                </div>
              </div>
            )}

            {parcel.dimensions && (
              <div className="flex items-start space-x-3">
                <Package className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dimensions</p>
                  <p className="text-sm text-gray-600">
                    {parcel.dimensions}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              Delivery Timeline
            </button>
            <button
              onClick={() => setActiveTab('trail')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trail'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Interaction Trail
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'timeline' && (
        <div className="mb-6">
          <ParcelTimelineComponent 
            parcelId={id}
            scanHistory={scanHistory}
            parcelData={parcel}
          />
        </div>
      )}

      {activeTab === 'trail' && (
        <div className="mb-6">
          <InteractionTrail 
            parcelId={id}
            parcelType={parcel.box_id ? 'box' : 'sack'}
            userRole={userRole}
          />
        </div>
      )}

      {/* Chat Window */}
      {showChat && userRole === 'customer' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <ChatWindow 
            parcelId={id}
            parcelType={parcel.box_id ? 'box' : 'sack'}
            recipientId="customer" // This indicates it's a customer message
            recipientPhone={parcel.customers?.phone}
            recipientEmail={parcel.customers?.username}
          />
        </div>
      )}

      {/* Detailed Scan History (for staff) */}
      {userRole !== 'customer' && scanHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Detailed Scan History
          </h3>
          <div className="space-y-4">
            {scanHistory.map((scan, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {getStatusText(scan.status)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(scan.scan_time).toLocaleString()}
                    </p>
                    {scan.location && (
                      <p className="text-sm text-gray-600">
                        Location: {scan.location}
                      </p>
                    )}
                    {scan.comments && (
                      <p className="text-sm text-gray-600">
                        Notes: {scan.comments}
                      </p>
                    )}
                  </div>
                  {scan.photo_url && (
                    <img 
                      src={scan.photo_url} 
                      alt="Scan photo" 
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParcelTimeline; 