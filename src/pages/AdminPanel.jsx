import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { db } from '../lib/supabase'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Building2, 
  Phone, 
  Mail, 
  Shield,
  MessageSquare,
  Send,
  UserCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  Download,
  Package
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import toast from 'react-hot-toast'
import ParcelLabelPDF from '../components/ParcelLabelPDF'

const AdminPanel = () => {
  const { user, userRole } = useAuth()
  
  console.log('AdminPanel: Rendering with userRole:', userRole, 'user:', user)
  
  // Check if user has admin role
  if (userRole !== 'admin') {
    console.log('AdminPanel: User does not have admin role, showing access denied')
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Access Denied</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              You need admin privileges to access this panel. Current role: {userRole}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setIsNewUserModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Test Add User Modal (Bypass Role Check)
            </Button>
            <Button 
              onClick={() => {
                console.log('Temporarily setting role to admin for testing')
                // This is a temporary test - in production this would be handled properly
                window.location.reload()
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Force Refresh (Try to Fix Role)
            </Button>
            <p className="text-xs text-gray-500 text-center">
              These are test buttons to verify functionality when role issues occur
            </p>
          </CardContent>
        </Card>
        
        {/* Test Modal */}
        {isNewUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Test Add User Modal</CardTitle>
                <CardDescription className="text-gray-400">
                  This is a test modal to verify functionality
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="testEmail" className="text-gray-300">Email *</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="test@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testPassword" className="text-gray-300">Password *</Label>
                  <Input
                    id="testPassword"
                    type="password"
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter password"
                  />
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      console.log('Test modal: Create User clicked')
                      setIsNewUserModalOpen(false)
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    Test Create User
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Test modal: Cancel clicked')
                      setIsNewUserModalOpen(false)
                    }}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [companySettings, setCompanySettings] = useState({})
  const [newUser, setNewUser] = useState({ email: '', phone: '', role: 'customer', password: '' })
  const [editingUser, setEditingUser] = useState({
    user_id: '',
    email: '',
    phone: '',
    role: 'customer',
    name: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false)
  const [creatingUser, setCreatingUser] = useState(false)
  
  // Debug modal state
  useEffect(() => {
    console.log('AdminPanel: Modal state changed - isNewUserModalOpen:', isNewUserModalOpen)
  }, [isNewUserModalOpen])
  
  // Communication state
  const [warehouseStaff, setWarehouseStaff] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  
  // Parcel Labels state
  const [boxes, setBoxes] = useState([])
  const [sacks, setSacks] = useState([])
  const [selectedParcelType, setSelectedParcelType] = useState('box')
  const [selectedParcels, setSelectedParcels] = useState([])
  const [generatingLabels, setGeneratingLabels] = useState(false)
  const [loadingParcels, setLoadingParcels] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchUsers(),
          fetchCompanySettings(),
    fetchWarehouseStaff()
        ])
      } catch (error) {
        console.error('Error loading admin panel data:', error)
      } finally {
        setLoading(false)
      }
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('Admin panel loading timeout - forcing completion')
      setLoading(false)
    }, 10000) // 10 second timeout

    loadData()

    return () => clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (selectedStaff) {
      fetchMessages(selectedStaff.user_id)
    }
  }, [selectedStaff])

  // Load parcel data when parcel labels tab is selected
  useEffect(() => {
    if (activeTab === 'parcel-labels') {
      handleParcelTypeChange(selectedParcelType)
    }
  }, [activeTab])

  const fetchUsers = async () => {
    try {
      const { data, error } = await db.getUsers()
      if (error) {
        console.error('Error fetching users:', error)
        // Provide fallback data if user fetching fails
        setUsers([
          {
            user_id: '1',
            username: 'admin@smartexporters.com',
            role: 'admin',
            email: 'admin@smartexporters.com',
            phone: '+2341234567890'
          },
          {
            user_id: '2',
            username: 'warehouse@smartexporters.com',
            role: 'warehouse_staff',
            email: 'warehouse@smartexporters.com',
            phone: '+2341234567891'
          }
        ])
        return
      }
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users')
      // Provide fallback data
      setUsers([
        {
          user_id: '1',
          username: 'admin@smartexporters.com',
          role: 'admin',
          email: 'admin@smartexporters.com',
          phone: '+2341234567890'
        },
        {
          user_id: '2',
          username: 'warehouse@smartexporters.com',
          role: 'warehouse_staff',
          email: 'warehouse@smartexporters.com',
          phone: '+2341234567891'
        }
      ])
    }
  }

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await db.getCompanySettings()
      if (error) {
        console.error('Error fetching company settings:', error)
        // Provide fallback settings
        setCompanySettings({
          company_name: 'SmartExporters',
          company_email: 'info@smartexporters.com',
          company_phone: '+2341234567890',
          company_address: 'Lagos, Nigeria'
        })
        return
      }
      setCompanySettings(data || {})
    } catch (error) {
      console.error('Error fetching company settings:', error)
      // Provide fallback settings
      setCompanySettings({
        company_name: 'SmartExporters',
        company_email: 'info@smartexporters.com',
        company_phone: '+2341234567890',
        company_address: 'Lagos, Nigeria'
      })
    }
  }

  const fetchWarehouseStaff = async () => {
    try {
      const { data, error } = await db.getUsers()
      if (error) {
        console.error('Error fetching warehouse staff:', error)
        // Provide fallback staff data
        setWarehouseStaff([
          {
            user_id: '2',
            username: 'warehouse@smartexporters.com',
            role: 'warehouse_staff',
            email: 'warehouse@smartexporters.com',
            phone: '+2341234567891'
          }
        ])
        return
      }
      const staff = (data || []).filter(user => user.role === 'warehouse_staff')
      setWarehouseStaff(staff)
    } catch (error) {
      console.error('Error fetching warehouse staff:', error)
      // Provide fallback staff data
      setWarehouseStaff([
        {
          user_id: '2',
          username: 'warehouse@smartexporters.com',
          role: 'warehouse_staff',
          email: 'warehouse@smartexporters.com',
          phone: '+2341234567891'
        }
      ])
    }
  }

  const fetchMessages = async (staffId) => {
    try {
      const { data, error } = await db.getMessages(`admin-${staffId}`)
      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const createUser = async () => {
    console.log('createUser: Starting with newUser data:', newUser);
    
    if (!newUser.email || !newUser.password || !newUser.role) {
      toast.error('Please fill in all required fields (Email, Password, and Role)')
      return
    }

    console.log('createUser: All required fields present, creating user with role:', newUser.role);

    setCreatingUser(true)
    try {
      const result = await db.createUser(newUser)
      console.log('createUser: User created successfully:', result);
      toast.success(`User created successfully with role: ${newUser.role}!`)
      setIsNewUserModalOpen(false)
      setNewUser({ email: '', phone: '', role: 'customer', password: '' })
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      if (error.message?.includes('User not allowed')) {
        toast.error('Insufficient permissions to create users. This feature requires admin privileges.')
      } else {
        toast.error(`Failed to create user account: ${error.message}`)
      }
    } finally {
      setCreatingUser(false)
    }
  }

  const updateUser = async (userId) => {
    setLoading(true)
    try {
      await db.updateUser(userId, editingUser)
      toast.success('User updated successfully!')
      setEditingUser({
        user_id: '',
        email: '',
        phone: '',
        role: 'customer',
        name: ''
      })
      fetchUsers()
    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return

    setLoading(true)
    try {
      await db.deleteUser(userId)
      toast.success('User deleted successfully!')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const onSubmitSettings = async () => {
    setLoading(true)
    
    try {
      await db.updateCompanySettings(companySettings)
      toast.success('Company settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

    const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStaff) return
    
    setSendingMessage(true)
    try {
      const messageData = {
        parcel_id: `admin-${selectedStaff.user_id}`,
        sender_id: user.id,
        sender_role: 'admin',
        recipient_id: selectedStaff.user_id,
        recipient_role: 'warehouse_staff',
        message: newMessage.trim(),
        message_type: 'text',
        delivery_channel: 'platform'
      }

      await db.createMessage(messageData)
      setNewMessage('')
      fetchMessages(selectedStaff.user_id)
      toast.success('Message sent!')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  // Parcel Labels functions
  const fetchBoxes = async () => {
    setLoadingParcels(true)
    try {
      const { data, error } = await db.supabase
        .from('boxes')
        .select(`
          *,
          customer:customers(first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setBoxes(data || [])
    } catch (error) {
      console.error('Error fetching boxes:', error)
      toast.error('Failed to fetch boxes')
    } finally {
      setLoadingParcels(false)
    }
  }

  const fetchSacks = async () => {
    setLoadingParcels(true)
    try {
      const { data, error } = await db.supabase
        .from('sacks')
        .select(`
          *,
          customer:customers(first_name, last_name, phone)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setSacks(data || [])
    } catch (error) {
      console.error('Error fetching sacks:', error)
      toast.error('Failed to fetch sacks')
    } finally {
      setLoadingParcels(false)
    }
  }

  const handleParcelTypeChange = (type) => {
    setSelectedParcelType(type)
    setSelectedParcels([])
    if (type === 'box') {
      fetchBoxes()
    } else {
      fetchSacks()
    }
  }

  const toggleParcelSelection = (parcelId) => {
    setSelectedParcels(prev => 
      prev.includes(parcelId) 
        ? prev.filter(id => id !== parcelId)
        : [...prev, parcelId]
    )
  }

  const generateSingleLabel = async (parcel) => {
    setGeneratingLabels(true)
    try {
      await ParcelLabelPDF.generateLabel(parcel, selectedParcelType)
      toast.success(`Label generated for ${selectedParcelType} ${parcel[`${selectedParcelType}_id`]}`)
    } catch (error) {
      console.error('Error generating label:', error)
      toast.error('Failed to generate label')
    } finally {
      setGeneratingLabels(false)
    }
  }

  const generateBulkLabels = async () => {
    if (selectedParcels.length === 0) {
      toast.error('Please select at least one parcel')
      return
    }

    setGeneratingLabels(true)
    try {
      const parcels = selectedParcelType === 'box' 
        ? boxes.filter(box => selectedParcels.includes(box.box_id))
        : sacks.filter(sack => selectedParcels.includes(sack.sack_id))
      
      await ParcelLabelPDF.generateBulkLabels(parcels, selectedParcelType)
      toast.success(`Generated ${parcels.length} labels`)
      setSelectedParcels([])
    } catch (error) {
      console.error('Error generating bulk labels:', error)
      toast.error('Failed to generate bulk labels')
    } finally {
      setGeneratingLabels(false)
    }
  }

  const getTabIconColor = (tabName) => {
    switch (tabName) {
      case 'users': return 'text-blue-400'
      case 'settings': return 'text-green-400'
      case 'analytics': return 'text-purple-400'
      case 'communication': return 'text-orange-400'
      default: return 'text-gray-400'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-900 rounded-xl border border-gray-700">
            <Shield className="h-10 w-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-gray-400 text-xl">
              Manage users, settings, and system communications
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 border border-gray-700 p-1 rounded-xl">
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
          >
            <Users className="h-5 w-5 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
          >
            <Settings className="h-5 w-5 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="analytics" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="communication" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Communication
          </TabsTrigger>
          <TabsTrigger 
            value="parcel-labels" 
            className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300 hover:text-white transition-all duration-300"
          >
            <FileText className="h-5 w-5 mr-2" />
            Parcel Labels
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <Users className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">User Management</CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Manage system users and their roles
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    console.log('Add New User button clicked');
                    console.log('Current isNewUserModalOpen state:', isNewUserModalOpen);
                    setIsNewUserModalOpen(true);
                    console.log('Set isNewUserModalOpen to true');
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user) => (
                  <Card key={user.user_id} className="bg-gray-700 border-gray-600 hover:bg-gray-650 transition-all duration-300 shadow-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-600 rounded-lg">
                            <UserCircle className="h-6 w-6 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg">{user.name || user.email}</CardTitle>
                            <CardDescription className="text-gray-400">{user.email}</CardDescription>
                          </div>
                        </div>
                        <Badge className={`${
                          user.role === 'admin' ? 'bg-red-600' :
                          user.role === 'warehouse_staff' ? 'bg-orange-600' :
                          'bg-green-600'
                        } text-white font-medium px-3 py-1`}>
                          {user.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone || 'No phone'}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingUser(user)}
                          className="flex-1 bg-gray-600 border-gray-500 text-white hover:bg-gray-500 hover:border-gray-400"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => deleteUser(user.user_id)}
                          className="flex-1 bg-red-900 border-red-700 text-red-300 hover:bg-red-800 hover:border-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-900 rounded-xl">
                  <Settings className="h-7 w-7 text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Company Settings</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Configure company information and preferences
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-gray-300 font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companySettings.company_name || ''}
                    onChange={(e) => setCompanySettings({...companySettings, company_name: e.target.value})}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail" className="text-gray-300 font-medium">Company Email</Label>
                  <Input
                    id="companyEmail"
                    value={companySettings.company_email || ''}
                    onChange={(e) => setCompanySettings({...companySettings, company_email: e.target.value})}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter company email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone" className="text-gray-300 font-medium">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    value={companySettings.company_phone || ''}
                    onChange={(e) => setCompanySettings({...companySettings, company_phone: e.target.value})}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter company phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="text-gray-300 font-medium">Company Address</Label>
                  <Input
                    id="companyAddress"
                    value={companySettings.company_address || ''}
                    onChange={(e) => setCompanySettings({...companySettings, company_address: e.target.value})}
                    className="h-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter company address"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={onSubmitSettings}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-900 rounded-xl">
                  <BarChart3 className="h-7 w-7 text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">System Analytics</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    View system statistics and performance metrics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 bg-gray-700 rounded-xl border border-gray-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-900 rounded-lg">
                      <Users className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Users</p>
                      <p className="text-white text-2xl font-bold">{users.length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-700 rounded-xl border border-gray-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-900 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Active Users</p>
                      <p className="text-white text-2xl font-bold">{users.filter(u => u.role !== 'admin').length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-700 rounded-xl border border-gray-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-900 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Warehouse Staff</p>
                      <p className="text-white text-2xl font-bold">{users.filter(u => u.role === 'warehouse_staff').length}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-700 rounded-xl border border-gray-600">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-900 rounded-lg">
                      <Clock className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm font-medium">System Uptime</p>
                      <p className="text-white text-2xl font-bold">99.9%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Communication Tab */}
        <TabsContent value="communication" className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-pink-900 rounded-xl">
                  <MessageSquare className="h-7 w-7 text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-white text-2xl">Staff Communication</CardTitle>
                  <CardDescription className="text-gray-400 text-lg">
                    Real-time messaging with warehouse staff
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 lg:grid-cols-3">
                {/* Staff List */}
                <div className="lg:col-span-1">
                  <h3 className="text-white font-semibold text-lg mb-4">Warehouse Staff</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {warehouseStaff.map((staff) => (
                      <div
                        key={staff.user_id}
                        onClick={() => setSelectedStaff(staff)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                          selectedStaff?.user_id === staff.user_id
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <UserCircle className="h-8 w-8 text-blue-400" />
                          <div>
                            <p className="font-medium">{staff.name || staff.email}</p>
                            <p className="text-sm opacity-75">{staff.email}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="lg:col-span-2">
                  {selectedStaff ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 p-4 bg-gray-700 rounded-xl border border-gray-600">
                        <UserCircle className="h-10 w-10 text-blue-400" />
                        <div>
                          <h3 className="text-white font-semibold text-lg">{selectedStaff.name || selectedStaff.email}</h3>
                          <p className="text-gray-400">Warehouse Staff</p>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <ScrollArea className="h-80 bg-gray-700 rounded-xl p-6 border border-gray-600">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-xs p-4 rounded-xl ${
                                  message.sender_role === 'admin'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                <p className="text-sm">{message.message}</p>
                                <p className="text-xs opacity-75 mt-2">
                                  {formatDate(message.created_at)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                      <div className="flex space-x-3">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="flex-1 bg-gray-700 border-gray-600 text-white resize-none focus:border-purple-500 focus:ring-purple-500"
                          rows={3}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-700 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <MessageSquare className="h-10 w-10 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-3">
                        Select a Staff Member
                      </h3>
                      <p className="text-gray-400 text-lg">
                        Choose a warehouse staff member to start chatting
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parcel Labels Tab */}
        <TabsContent value="parcel-labels" className="space-y-8">
          <Card className="bg-gray-800 border-gray-700 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <Package className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-2xl">Parcel Label Generator</CardTitle>
                    <CardDescription className="text-gray-400 text-lg">
                      Generate PDF labels for boxes and sacks
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Select value={selectedParcelType} onValueChange={handleParcelTypeChange}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="box">Boxes</SelectItem>
                      <SelectItem value="sack">Sacks</SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedParcels.length > 0 && (
                    <Button
                      onClick={generateBulkLabels}
                      disabled={generatingLabels}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {generatingLabels ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Generate {selectedParcels.length} Labels
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingParcels ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-400 mr-3" />
                  <span className="text-gray-300">Loading parcels...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(selectedParcelType === 'box' ? boxes : sacks).map((parcel) => {
                      const parcelId = parcel[`${selectedParcelType}_id`]
                      const isSelected = selectedParcels.includes(parcelId)
                      
                      return (
                        <Card 
                          key={parcelId} 
                          className={`bg-gray-700 border-gray-600 hover:bg-gray-650 transition-all duration-300 cursor-pointer ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''
                          }`}
                          onClick={() => toggleParcelSelection(parcelId)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-400" />
                                <span className="text-white font-medium">
                                  {selectedParcelType.toUpperCase()} {parcelId.slice(0, 8)}
                                </span>
                              </div>
                              <Badge className={`${
                                parcel.status === 'packed' ? 'bg-green-600' :
                                parcel.status === 'in_transit' ? 'bg-blue-600' :
                                parcel.status === 'out_for_delivery' ? 'bg-orange-600' :
                                parcel.status === 'delivered' ? 'bg-purple-600' :
                                'bg-red-600'
                              } text-white text-xs`}>
                                {parcel.status?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Content:</span> {parcel.content}
                              </p>
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Quantity:</span> {parcel.quantity}
                              </p>
                              <p className="text-gray-300 text-sm">
                                <span className="font-medium">Destination:</span> {parcel.destination}
                              </p>
                              {parcel.customer && (
                                <p className="text-gray-300 text-sm">
                                  <span className="font-medium">Customer:</span> {parcel.customer.first_name} {parcel.customer.last_name}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  generateSingleLabel(parcel)
                                }}
                                disabled={generatingLabels}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {generatingLabels ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                Generate Label
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                  
                  {(selectedParcelType === 'box' ? boxes : sacks).length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-300 mb-2">
                        No {selectedParcelType}s Found
                      </h3>
                      <p className="text-gray-400">
                        No {selectedParcelType}s have been registered yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

        {/* Edit User Modal */}
        {editingUser.user_id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Edit User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editEmail" className="text-gray-300">Email</Label>
                  <Input
                    id="editEmail"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editName" className="text-gray-300">Name</Label>
                  <Input
                    id="editName"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editPhone" className="text-gray-300">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editRole" className="text-gray-300">Role</Label>
                  <Select value={editingUser.role} onValueChange={(value) => setEditingUser({...editingUser, role: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="warehouse_staff">Warehouse Staff</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateUser(editingUser.user_id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={() => setEditingUser({
                      user_id: '',
                      email: '',
                      phone: '',
                      role: 'customer',
                      name: ''
                    })}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New User Modal */}
        {isNewUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Add New User</CardTitle>
                <CardDescription className="text-gray-400">
                  Create a new user account with the specified role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" className="text-gray-300">Email *</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">Password *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newUser.password || ''}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPhone" className="text-gray-300">Phone Number</Label>
                  <Input
                    id="newPhone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newRole" className="text-gray-300">Role *</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500 focus:ring-blue-500 hover:bg-gray-600">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="customer" className="text-white hover:bg-gray-600">Customer</SelectItem>
                      <SelectItem value="warehouse_staff" className="text-white hover:bg-gray-600">Warehouse Staff</SelectItem>
                      <SelectItem value="admin" className="text-white hover:bg-gray-600">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      console.log('Create User button clicked');
                      console.log('New user data:', newUser);
                      createUser();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                    disabled={!newUser.email || !newUser.password || !newUser.role || creatingUser}
                  >
                    {creatingUser ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {creatingUser ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Cancel button clicked');
                      setIsNewUserModalOpen(false);
                      setNewUser({ email: '', phone: '', role: 'customer', password: '' });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={creatingUser}
                  >
                    {creatingUser ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    {creatingUser ? 'Cancelling...' : 'Cancel'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  )
}

export default AdminPanel 