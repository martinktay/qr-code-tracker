import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import { 
  MessageSquare, 
  Package, 
  ShoppingBag, 
  Search, 
  Activity, 
  Phone, 
  Mail, 
  QrCode,
  ArrowRight,
  Users,
  Clock,
  MapPin,
  FileText,
  Image,
  Download,
  Eye,
  MessageCircle,
  UserPlus,
  Headphones,
  UserCircle,
  Send
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InteractionTrail from '../components/InteractionTrail';
import ParcelTimelineComponent from '../components/ParcelTimeline';
import ChatWindow from '../components/ChatWindow';

const CommunicationCenter = () => {
  console.log('CommunicationCenter component rendering...');
  const { user, userRole } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [warehouseStaff, setWarehouseStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSection, setActiveSection] = useState('parcels');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]); // New state for all users
  const [selectedRole, setSelectedRole] = useState(null); // New state for role-based communication
  const [selectedUser, setSelectedUser] = useState(null); // New state for role-based communication
  const [roleMessages, setRoleMessages] = useState([]); // New state for role-based messages
  const [roleNewMessage, setRoleNewMessage] = useState(''); // New state for role-based messages

  useEffect(() => {
    console.log('CommunicationCenter component mounted');
    console.log('Current user:', user);
    console.log('Current userRole:', userRole);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('CommunicationCenter: Fetching data...');
      setLoading(true);
      
      // Use the new database functions with better error handling
      const [parcelsData, staffData, customersData] = await Promise.all([
        db.getAllParcels().catch(error => {
          console.error('CommunicationCenter: Error fetching parcels:', error);
          return { boxes: [], sacks: [] };
        }),
        db.getUsers().catch(error => {
          console.error('CommunicationCenter: Error fetching users:', error);
          return [];
        }),
        db.getCustomers().catch(error => {
          console.error('CommunicationCenter: Error fetching customers:', error);
          return [];
        })
      ]);
      
      console.log('CommunicationCenter: Parcels data:', parcelsData);
      console.log('CommunicationCenter: Staff data:', staffData);
      console.log('CommunicationCenter: Customers data:', customersData);
      
      // Combine boxes and sacks
      const allParcels = [
        ...(parcelsData.boxes || []).map(box => ({ ...box, type: 'box', id: box.box_id })),
        ...(parcelsData.sacks || []).map(sack => ({ ...sack, type: 'sack', id: sack.sack_id }))
      ];
      
      console.log('CommunicationCenter: Combined parcels:', allParcels);
      setParcels(allParcels);
      
      // Filter users by role for communication
      const staff = (staffData || []).filter(user => user.role === 'warehouse_staff');
      const customers = (staffData || []).filter(user => user.role === 'customer');
      const admins = (staffData || []).filter(user => user.role === 'admin');
      
      console.log('CommunicationCenter: Filtered users:', { staff, customers, admins });
      setWarehouseStaff(staff);
      
      // Store all users for role-based communication
      setAllUsers(staffData || []);
    } catch (error) {
      console.error('CommunicationCenter: Error fetching data:', error);
      toast.error('Failed to load data');
      // Set fallback data
      setParcels([]);
      setWarehouseStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // Computed properties
  const filteredParcels = parcels.filter(parcel => {
    const searchLower = searchTerm.toLowerCase();
    const parcelId = parcel.type === 'box' ? parcel.box_id : parcel.sack_id;
    const customerName = parcel.customers ? `${parcel.customers.first_name} ${parcel.customers.last_name}` : '';
    const destination = parcel.destination || '';
    
    return parcelId.toLowerCase().includes(searchLower) ||
           customerName.toLowerCase().includes(searchLower) ||
           destination.toLowerCase().includes(searchLower);
  });

  // Filter users by selected role
  const filteredUsers = allUsers.filter(user => {
    if (!selectedRole) return true;
    return user.role === selectedRole;
  });

  // Role-based message functions
  const sendRoleMessage = async () => {
    if (!roleNewMessage.trim() || !selectedUser) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: selectedUser.user_id,
      message: roleNewMessage,
      createdat: new Date().toISOString(),
    };

    try {
      await db.sendMessage(messageData);
      setRoleMessages(prev => [...prev, messageData]);
      setRoleNewMessage('');
    } catch (error) {
      console.error('Error sending role message:', error);
      toast.error('Failed to send message');
    }
  };

  // Fetch messages for role-based communication
  useEffect(() => {
    const fetchRoleMessages = async () => {
      if (selectedUser) {
        try {
          const messagesData = await db.getMessagesBetweenUsers(user.id, selectedUser.user_id);
          setRoleMessages(messagesData);
        } catch (error) {
          console.error('Error fetching role messages:', error);
          setRoleMessages([]);
        }
      }
    };

    fetchRoleMessages();
    const interval = setInterval(fetchRoleMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedUser, user.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-600 text-white';
      case 'in_transit': return 'bg-blue-600 text-white';
      case 'out_for_delivery': return 'bg-yellow-600 text-white';
      case 'packed': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString; // Fallback if date is invalid
    }
  };

  const handleParcelSelect = (parcel) => {
    setSelectedParcel(parcel);
    setSelectedStaff(null);
    setActiveTab('overview');
    setActiveSection('parcels');
  };

  const handleStaffSelect = (staff) => {
    setSelectedStaff(staff);
    setSelectedParcel(null);
    setActiveTab('overview');
    setActiveSection('staff');
  };

  const handleWhatsAppChat = (phone, name) => {
    if (!phone) {
      toast.error('No phone number available for WhatsApp chat');
      return;
    }
    
    // Format phone number for WhatsApp (remove + and add country code if needed)
    let formattedPhone = phone.replace(/\s+/g, '').replace(/[^\d]/g, '');
    if (!formattedPhone.startsWith('234')) {
      formattedPhone = '234' + formattedPhone.replace(/^0+/, '');
    }
    
    const message = `Hello ${name}, I'm contacting you regarding your parcel with SmartExporters. How can I help you today?`;
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleTrackParcel = (parcel) => {
    const route = parcel.type === 'box' ? `/track/box/${parcel.id}` : `/track/sack/${parcel.id}`;
    window.open(route, '_blank');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStaff) return;

    const messageData = {
      sender_id: user.id,
      recipient_id: selectedStaff.user_id,
      message: newMessage,
      createdat: new Date().toISOString(),
    };

    try {
      await db.sendMessage(messageData);
      setMessages(prev => [...prev, messageData]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedStaff) {
        try {
          const messagesData = await db.getMessagesBetweenUsers(user.id, selectedStaff.user_id);
          setMessages(messagesData);
        } catch (error) {
          console.error('Error fetching messages:', error);
          setMessages([]);
        }
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds instead of 1
    return () => clearInterval(interval);
  }, [selectedStaff, user.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading communication center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Communication Center</h1>
            <p className="text-gray-400 mt-2">
              Track parcels, communicate with staff and customers, and manage interactions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize bg-gray-700 border-gray-600 text-white">
              {userRole}
            </Badge>
            <Button 
              onClick={() => setShowChat(!showChat)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquare className="w-4 h-4" />
              {showChat ? 'Hide Chat' : 'Live Chat'}
            </Button>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="mb-6">
        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700 p-1 rounded-xl">
            <TabsTrigger 
              value="parcels" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
            >
              <Package className="w-4 h-4 mr-2" />
              Parcel Communication
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Staff Communication
            </TabsTrigger>
            <TabsTrigger 
              value="warehouse" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
            >
              <Headphones className="w-4 h-4 mr-2" />
              Warehouse Support
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Role Communication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="parcels" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Parcel List */}
              <div className="lg:col-span-1">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Package className="w-5 h-5" />
                      Available Parcels
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Select a parcel to view its timeline and interaction history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search */}
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search parcels..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>

                    {/* Parcel List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredParcels.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Package className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                          <p>No parcels found</p>
                          {searchTerm && (
                            <Button 
                              variant="link" 
                              onClick={() => setSearchTerm('')}
                              className="mt-2 text-blue-400 hover:text-blue-300"
                            >
                              Clear search
                            </Button>
                          )}
                        </div>
                      ) : (
                        filteredParcels.map((parcel) => (
                          <div
                            key={parcel.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedParcel?.id === parcel.id
                                ? 'border-blue-500 bg-blue-900 text-white'
                                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-300'
                            }`}
                            onClick={() => handleParcelSelect(parcel)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {parcel.type === 'box' ? (
                                  <Package className="w-4 h-4 text-blue-400" />
                                ) : (
                                  <ShoppingBag className="w-4 h-4 text-green-400" />
                                )}
                                <span className="font-medium">
                                  {parcel.type === 'box' ? `Box ${parcel.box_id}` : `Sack ${parcel.sack_id}`}
                                </span>
                              </div>
                              <Badge className={getStatusColor(parcel.status)}>
                                {getStatusText(parcel.status)}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-gray-400 space-y-1">
                              {parcel.destination && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {parcel.destination}
                                </div>
                              )}
                              {parcel.customers && (
                                <div className="flex items-center gap-1">
                                  <UserCircle className="w-3 h-3" />
                                  {parcel.customers.first_name} {parcel.customers.last_name}
                                </div>
                              )}
                              {parcel.date_packed && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(parcel.date_packed)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Timeline and Interactions */}
              <div className="lg:col-span-2">
                {selectedParcel ? (
                  <div className="space-y-6">
                    {/* Parcel Details */}
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-white">
                              {selectedParcel.type === 'box' ? (
                                <Package className="w-5 h-5 text-blue-400" />
                              ) : (
                                <ShoppingBag className="w-5 h-5 text-green-400" />
                              )}
                              {selectedParcel.type === 'box' ? `Box ${selectedParcel.box_id}` : `Sack ${selectedParcel.sack_id}`}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              Status: {getStatusText(selectedParcel.status)} • Destination: {selectedParcel.destination || 'Not specified'}
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => handleTrackParcel(selectedParcel)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Track Parcel
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Timeline and Interactions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Timeline</CardTitle>
                          <CardDescription className="text-gray-400">
                            Parcel tracking timeline
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ParcelTimelineComponent 
                            parcelId={selectedParcel.id} 
                            parcelType={selectedParcel.type} 
                          />
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader>
                          <CardTitle className="text-white">Interaction Trail</CardTitle>
                          <CardDescription className="text-gray-400">
                            Communication and interaction history
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <InteractionTrail 
                            parcelId={selectedParcel.id} 
                            parcelType={selectedParcel.type} 
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Select a parcel to view its details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Staff Communication
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Communicate with warehouse staff members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Staff List */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-semibold text-white mb-4">Available Staff</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {warehouseStaff.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          <Users className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                          <p>No warehouse staff found</p>
                        </div>
                      ) : (
                        warehouseStaff.map((staff) => (
                          <div
                            key={staff.user_id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedStaff?.user_id === staff.user_id
                                ? 'border-blue-500 bg-blue-900 text-white'
                                : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-300'
                            }`}
                            onClick={() => handleStaffSelect(staff)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <UserCircle className="w-5 h-5 text-blue-400" />
                                <div>
                                  <p className="font-medium">{staff.name || staff.email}</p>
                                  <p className="text-sm text-gray-400">{staff.email}</p>
                                </div>
                              </div>
                              {staff.phone && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWhatsAppChat(staff.phone, staff.name || staff.email);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2">
                    {selectedStaff ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            Chat with {selectedStaff.name || selectedStaff.email}
                          </h3>
                          <Badge className="bg-green-600 text-white">
                            Online
                          </Badge>
                        </div>
                        
                        <div className="border border-gray-600 rounded-lg p-4 h-96 overflow-y-auto bg-gray-700">
                          {messages.map((message, index) => (
                            <div
                              key={index}
                              className={`mb-4 ${
                                message.sender_id === user.id ? 'text-right' : 'text-left'
                              }`}
                            >
                              <div
                                className={`inline-block p-3 rounded-lg max-w-xs ${
                                  message.sender_id === user.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.createdat).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-700 border-gray-600 text-white"
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          />
                          <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Select a staff member to start chatting</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warehouse" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Headphones className="w-5 h-5" />
                  Warehouse Support
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get support from warehouse staff for customer inquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Headphones className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Warehouse Support</h3>
                  <p className="text-gray-400 mb-6">
                    As a warehouse staff member, you can provide support to customers regarding their parcels.
                  </p>
                  <div className="space-y-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Available Actions:</h4>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Respond to customer inquiries about parcel status</li>
                        <li>• Provide tracking information and updates</li>
                        <li>• Handle delivery issues and concerns</li>
                        <li>• Coordinate with other staff members</li>
                      </ul>
                    </div>
                    <p className="text-sm text-gray-500">
                      Use the Staff Communication tab to chat with other warehouse staff members.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  Role-Based Communication
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Communicate with users based on their roles - Admin, Warehouse Staff, or Customer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* User List by Role */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      {/* Role Filter */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Filter by Role</h3>
                        <div className="flex flex-wrap gap-2">
                          {['admin', 'warehouse_staff', 'customer'].map((role) => (
                            <Button
                              key={role}
                              variant={selectedRole === role ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedRole(role)}
                              className={`${
                                selectedRole === role 
                                  ? 'bg-blue-600 text-white' 
                                  : 'border-gray-600 text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              {role === 'warehouse_staff' ? 'Warehouse Staff' : role.charAt(0).toUpperCase() + role.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* User List */}
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-3">
                          {selectedRole ? `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}s` : 'All Users'}
                        </h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {filteredUsers.length === 0 ? (
                            <div className="text-center py-8 text-gray-400">
                              <Users className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                              <p>No users found</p>
                            </div>
                          ) : (
                            filteredUsers.map((user) => (
                              <div
                                key={user.user_id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedUser?.user_id === user.user_id
                                    ? 'border-blue-500 bg-blue-900 text-white'
                                    : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700 text-gray-300'
                                }`}
                                onClick={() => setSelectedUser(user)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <UserCircle className="w-5 h-5 text-blue-400" />
                                    <div>
                                      <p className="font-medium">{user.name || user.email}</p>
                                      <p className="text-sm text-gray-400">{user.email}</p>
                                      <Badge className={`text-xs ${
                                        user.role === 'admin' ? 'bg-red-600' :
                                        user.role === 'warehouse_staff' ? 'bg-blue-600' :
                                        'bg-green-600'
                                      }`}>
                                        {user.role === 'warehouse_staff' ? 'Warehouse Staff' : user.role}
                                      </Badge>
                                    </div>
                                  </div>
                                  {user.phone && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleWhatsAppChat(user.phone, user.name || user.email);
                                      }}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="lg:col-span-2">
                    {selectedUser ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">
                            Chat with {selectedUser.name || selectedUser.email}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge className={`${
                              selectedUser.role === 'admin' ? 'bg-red-600' :
                              selectedUser.role === 'warehouse_staff' ? 'bg-blue-600' :
                              'bg-green-600'
                            } text-white`}>
                              {selectedUser.role === 'warehouse_staff' ? 'Warehouse Staff' : selectedUser.role}
                            </Badge>
                            <Badge className="bg-green-600 text-white">
                              Online
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="border border-gray-600 rounded-lg p-4 h-96 overflow-y-auto bg-gray-700">
                          {roleMessages.map((message, index) => (
                            <div
                              key={index}
                              className={`mb-4 ${
                                message.sender_id === user.id ? 'text-right' : 'text-left'
                              }`}
                            >
                              <div className={`inline-block max-w-xs lg:max-w-md p-3 rounded-lg ${
                                message.sender_id === user.id 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-600 text-white'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {new Date(message.createdat).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
                          <Input
                            value={roleNewMessage}
                            onChange={(e) => setRoleNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-700 border-gray-600 text-white"
                            onKeyPress={(e) => e.key === 'Enter' && sendRoleMessage()}
                          />
                          <Button
                            onClick={sendRoleMessage}
                            disabled={!roleNewMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                        <p className="text-gray-400">Select a user to start chatting</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-96 h-96 z-50">
          <Card className="h-full bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Live Chat Support</CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-full">
              <ChatWindow
                parcelId={selectedParcel?.id || 'general'}
                parcelType={selectedParcel?.type || 'general'}
                recipientId="customer"
                recipientPhone={selectedParcel?.customers?.phone}
                recipientEmail={selectedParcel?.customers?.username}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter; 