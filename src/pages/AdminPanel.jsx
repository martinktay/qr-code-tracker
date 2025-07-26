import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Users, 
  BarChart3, 
  Upload, 
  Save, 
  MessageSquare, 
  Bell, 
  Zap, 
  Shield, 
  Languages,
  UserPlus,
  Mail,
  Phone,
  UserCheck,
  Trash2,
  Printer,
  Package,
  Package2,
  Edit,
  X
} from 'lucide-react';
import { db } from '../lib/supabase';
import toast from 'react-hot-toast';
import ParcelLabelPDF from '../components/ParcelLabelPDF';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [companySettings, setCompanySettings] = useState({
    company_name: '',
    logo_url: '',
    terms_of_service: '',
    privacy_policy: '',
    enable_messaging: false,
    enable_whatsapp: false,
    enable_email: false
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    phone: '',
    role: 'customer',
    name: ''
  });
  const [editingUser, setEditingUser] = useState(null);
  const [parcels, setParcels] = useState({ boxes: [], sacks: [] });
  const [selectedParcels, setSelectedParcels] = useState({ boxes: [], sacks: [] });

  useEffect(() => {
    fetchCompanySettings();
    fetchUsers();
    fetchParcels();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const settings = await db.getCompanySettings();
      if (settings) {
        setCompanySettings(settings);
      }
    } catch (error) {
      console.error('Error fetching company settings:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await db.getUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchParcels = async () => {
    try {
      const parcelsData = await db.getAllParcels();
      setParcels(parcelsData || { boxes: [], sacks: [] });
    } catch (error) {
      console.error('Error fetching parcels:', error);
    }
  };

  const onSubmitSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await db.updateCompanySettings(1, companySettings);
      toast.success('Company settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await db.createUser(newUser);
      toast.success(`${newUser.role} account created successfully!`);
      setNewUser({ email: '', phone: '', role: 'customer', name: '' });
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user account');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

  const editUser = (user) => {
    setEditingUser({
      user_id: user.user_id,
      email: user.username,
      phone: user.phone || '',
      role: user.role,
      name: user.name || user.username
    });
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user in user_accounts table
      await db.updateUser(editingUser.user_id, {
        username: editingUser.email,
        role: editingUser.role,
        phone: editingUser.phone,
        name: editingUser.name,
        updated_at: new Date().toISOString()
      });

      toast.success('User updated successfully!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const printBulkLabels = async (parcelType) => {
    const selectedItems = selectedParcels[parcelType];
    if (selectedItems.length === 0) {
      toast.error('Please select parcels to print labels');
      return;
    }

    try {
      setLoading(true);
      await ParcelLabelPDF.generateBulkLabels(selectedItems, parcelType);
      toast.success(`Generated ${selectedItems.length} ${parcelType} labels`);
    } catch (error) {
      console.error('Error generating bulk labels:', error);
      toast.error('Failed to generate labels');
    } finally {
      setLoading(false);
    }
  };

  const toggleParcelSelection = (parcelId, parcelType) => {
    setSelectedParcels(prev => ({
      ...prev,
      [parcelType]: prev[parcelType].includes(parcelId)
        ? prev[parcelType].filter(id => id !== parcelId)
        : [...prev[parcelType], parcelId]
    }));
  };

    try {
      await db.deleteUser(userId);
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'warehouse': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'warehouse': return 'Warehouse Staff';
      case 'customer': return 'Customer';
      default: return role;
    }
  };

  const tabs = [
    { id: 'settings', label: 'Company Settings', icon: Settings },
    { id: 'users', label: 'User Management', icon: UserPlus },
    { id: 'messaging', label: 'Messaging & Notifications', icon: MessageSquare },
    { id: 'labels', label: 'Label Printing', icon: Printer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">Manage your logistics platform settings and users</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Company Settings
          </h2>
          
          <form onSubmit={onSubmitSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companySettings.company_name}
                  onChange={(e) => setCompanySettings({...companySettings, company_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={companySettings.logo_url}
                  onChange={(e) => setCompanySettings({...companySettings, logo_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms of Service
              </label>
              <textarea
                value={companySettings.terms_of_service}
                onChange={(e) => setCompanySettings({...companySettings, terms_of_service: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy Policy
              </label>
              <textarea
                value={companySettings.privacy_policy}
                onChange={(e) => setCompanySettings({...companySettings, privacy_policy: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Create New User */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Create New User
            </h2>
            
            <form onSubmit={createUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="user@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <UserCheck className="w-4 h-4 inline mr-1" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="customer">Customer</option>
                    <option value="warehouse">Warehouse Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Existing Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{user.username}</div>
                          {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editUser(user)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteUser(user.user_id)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="bg-white rounded-lg shadow p-6 mt-6 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-blue-600" />
                  Edit User: {editingUser.name}
                </h3>
                <button
                  onClick={cancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={updateUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="user@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <UserCheck className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="customer">Customer</option>
                      <option value="warehouse">Warehouse Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {activeTab === 'messaging' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Messaging & Notifications
          </h2>
          
          <div className="space-y-6">
            {/* In-App Messaging */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                In-App Messaging
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enable real-time messaging between customers and staff</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={companySettings.enable_messaging}
                    onChange={(e) => setCompanySettings({...companySettings, enable_messaging: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* WhatsApp Notifications */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-green-600" />
                WhatsApp Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Send status updates and messages via WhatsApp</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={companySettings.enable_whatsapp}
                    onChange={(e) => setCompanySettings({...companySettings, enable_whatsapp: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Email Notifications */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Mail className="w-5 h-5 mr-2 text-purple-600" />
                Email Notifications
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Send status updates and messages via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={companySettings.enable_email}
                    onChange={(e) => setCompanySettings({...companySettings, enable_email: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <button
              onClick={onSubmitSettings}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Notification Settings'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'labels' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Printer className="w-5 h-5 mr-2" />
            Label Printing
          </h2>
          
          <div className="space-y-6">
            {/* Box Labels */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Package className="w-5 h-5 mr-2 text-blue-600" />
                  Box Labels ({parcels.boxes.length} available)
                </h3>
                <button
                  onClick={() => printBulkLabels('box')}
                  disabled={loading || selectedParcels.boxes.length === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : `Print ${selectedParcels.boxes.length} Labels`}
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {parcels.boxes.length > 0 ? (
                  <div className="space-y-2">
                    {parcels.boxes.slice(0, 10).map((box) => (
                      <div key={box.box_id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={selectedParcels.boxes.includes(box.box_id)}
                          onChange={() => toggleParcelSelection(box.box_id, 'box')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{box.box_id}</p>
                          <p className="text-xs text-gray-500">{box.content}</p>
                        </div>
                        <span className="text-xs text-gray-400">{box.customers?.first_name} {box.customers?.last_name}</span>
                      </div>
                    ))}
                    {parcels.boxes.length > 10 && (
                      <p className="text-xs text-gray-500 text-center">Showing first 10 of {parcels.boxes.length} boxes</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No boxes available for printing</p>
                )}
              </div>
            </div>

            {/* Sack Labels */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Package2 className="w-5 h-5 mr-2 text-green-600" />
                  Sack Labels ({parcels.sacks.length} available)
                </h3>
                <button
                  onClick={() => printBulkLabels('sack')}
                  disabled={loading || selectedParcels.sacks.length === 0}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {loading ? 'Generating...' : `Print ${selectedParcels.sacks.length} Labels`}
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto">
                {parcels.sacks.length > 0 ? (
                  <div className="space-y-2">
                    {parcels.sacks.slice(0, 10).map((sack) => (
                      <div key={sack.sack_id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded">
                        <input
                          type="checkbox"
                          checked={selectedParcels.sacks.includes(sack.sack_id)}
                          onChange={() => toggleParcelSelection(sack.sack_id, 'sack')}
                          className="h-4 w-4 text-green-600"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{sack.sack_id}</p>
                          <p className="text-xs text-gray-500">{sack.content}</p>
                        </div>
                        <span className="text-xs text-gray-400">{sack.customers?.first_name} {sack.customers?.last_name}</span>
                      </div>
                    ))}
                    {parcels.sacks.length > 10 && (
                      <p className="text-xs text-gray-500 text-center">Showing first 10 of {parcels.sacks.length} sacks</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No sacks available for printing</p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Label Printing Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Select the parcels you want to print labels for</li>
                <li>• Click the "Print Labels" button to generate a PDF</li>
                <li>• Each label includes QR code, parcel info, and customer details</li>
                <li>• Labels are optimized for A4 paper printing</li>
                <li>• Use adhesive labels or print on regular paper and cut</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics Dashboard
          </h2>
          <p className="text-gray-600">Analytics features coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 