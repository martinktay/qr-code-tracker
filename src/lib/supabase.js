import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please check your .env.local file')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database helper functions
export const db = {
  // Customer operations
  async createCustomer(customerData) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          ...customerData,
          // Enhanced schema fields with defaults
          user_id: customerData.user_id || null,
          origin_country: customerData.origin_country || 'Nigeria',
          destination_country: customerData.destination_country || null,
          destination_city: customerData.destination_city || null,
          shipping_region: customerData.shipping_region || null,
          customs_declaration: customerData.customs_declaration || null,
          special_instructions: customerData.special_instructions || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  },

  async getCustomerByPhone(phone) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting customers:', error)
      return []
    }
  },

  // Box operations
  async createBox(boxData) {
    try {
      const { data, error } = await supabase
        .from('boxes')
        .insert([{
          ...boxData,
          // Enhanced schema fields with defaults
          weight_kg: boxData.weight_kg || 0,
          origin_country: boxData.origin_country || 'Nigeria',
          destination_country: boxData.destination_country || null,
          destination_city: boxData.destination_city || null,
          shipping_region: boxData.shipping_region || null,
          shipping_method: boxData.shipping_method || null,
          customs_status: boxData.customs_status || null,
          international_tracking_number: boxData.international_tracking_number || null,
          customs_declaration: boxData.customs_declaration || null,
          special_instructions: boxData.special_instructions || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating box:', error)
      throw error
    }
  },

  async getBoxesByCustomer(customerId) {
    const { data, error } = await supabase
      .from('boxes')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateBoxStatus(boxId, status) {
    const { data, error } = await supabase
      .from('boxes')
      .update({ status })
      .eq('box_id', boxId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Sack operations
  async createSack(sackData) {
    try {
      const { data, error } = await supabase
        .from('sacks')
        .insert([{
          ...sackData,
          // Enhanced schema fields with defaults
          weight_kg: sackData.weight_kg || 0,
          origin_country: sackData.origin_country || 'Nigeria',
          destination_country: sackData.destination_country || null,
          destination_city: sackData.destination_city || null,
          shipping_region: sackData.shipping_region || null,
          shipping_method: sackData.shipping_method || null,
          customs_status: sackData.customs_status || null,
          international_tracking_number: sackData.international_tracking_number || null,
          customs_declaration: sackData.customs_declaration || null,
          special_instructions: sackData.special_instructions || null,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating sack:', error)
      throw error
    }
  },

  async getSacksByCustomer(customerId) {
    const { data, error } = await supabase
      .from('sacks')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateSackStatus(sackId, status) {
    const { data, error } = await supabase
      .from('sacks')
      .update({ status })
      .eq('sack_id', sackId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Scan history operations
  async createScanRecord(scanData) {
    const { data, error } = await supabase
      .from('scan_history')
      .insert([scanData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getScanHistory(parcelId, parcelType) {
    try {
      console.log('getScanHistory: Fetching scan history for', parcelType, parcelId);
      
      // If no parcelId provided, return empty array
      if (!parcelId) {
        console.log('getScanHistory: No parcelId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .eq(parcelType === 'box' ? 'box_id' : 'sack_id', parcelId)
        .order('scan_time', { ascending: true })
      
      if (error) {
        console.error('getScanHistory: Error:', error);
        throw error;
      }
      
      console.log('getScanHistory: Scan history fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getScanHistory: Error:', error);
      throw error;
    }
  },

  async getAllScanHistory() {
    try {
      console.log('getAllScanHistory: Fetching all scan history...');
      
      const { data, error } = await supabase
        .from('scan_history')
        .select('*')
        .order('scan_time', { ascending: false })
      
      if (error) {
        console.error('getAllScanHistory: Error:', error);
        throw error;
      }
      
      console.log('getAllScanHistory: Scan history fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getAllScanHistory: Error:', error);
      throw error;
    }
  },

  async getScanHistoryForParcel(parcelId, parcelType) {
    try {
      console.log('getScanHistoryForParcel: Fetching detailed scan history for', parcelType, parcelId);
      
      const { data, error } = await supabase
        .from('scan_history')
        .select(`
          *,
          box:boxes!scan_history_box_id_fkey(box_id, content, status, destination),
          sack:sacks!scan_history_sack_id_fkey(sack_id, content, status, destination)
        `)
        .eq(parcelType === 'box' ? 'box_id' : 'sack_id', parcelId)
        .order('scan_time', { ascending: true })
      
      if (error) {
        console.error('getScanHistoryForParcel: Error:', error);
        throw error;
      }
      
      console.log('getScanHistoryForParcel: Detailed scan history fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getScanHistoryForParcel: Error:', error);
      throw error;
    }
  },

  // Search operations
  async searchParcel(identifier) {
    // Check if identifier looks like a UUID (for exact ID matching)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    
    // Check if identifier looks like a phone number
    const isPhoneNumber = /^[\+]?[0-9\s\-\(\)]+$/.test(identifier)
    
    let boxes = []
    let sacks = []
    
    // Search in boxes
    try {
      let boxQuery = supabase
        .from('boxes')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone,
            destination
          )
        `)
      
      if (isUUID) {
        // If it's a UUID, try exact match first
        boxQuery = boxQuery.or(`box_id.eq.${identifier},qr_code_url.ilike.%${identifier}%`)
      } else {
        // If it's not a UUID, use ILIKE for partial matching
        boxQuery = boxQuery.or(`box_id.ilike.%${identifier}%,qr_code_url.ilike.%${identifier}%`)
      }
      
      const { data: boxData, error: boxError } = await boxQuery
      if (boxError) throw boxError
      boxes = boxData || []
    } catch (error) {
      console.error('Box search error:', error)
    }

    // Search in sacks
    try {
      let sackQuery = supabase
        .from('sacks')
        .select(`
          *,
          customers (
            first_name,
            last_name,
            phone,
            destination
          )
        `)
      
      if (isUUID) {
        // If it's a UUID, try exact match first
        sackQuery = sackQuery.or(`sack_id.eq.${identifier},qr_code_url.ilike.%${identifier}%`)
      } else {
        // If it's not a UUID, use ILIKE for partial matching
        sackQuery = sackQuery.or(`sack_id.ilike.%${identifier}%,qr_code_url.ilike.%${identifier}%`)
      }
      
      const { data: sackData, error: sackError } = await sackQuery
      if (sackError) throw sackError
      sacks = sackData || []
    } catch (error) {
      console.error('Sack search error:', error)
    }

    // If it looks like a phone number, also search by customer phone
    if (isPhoneNumber) {
      try {
        // Search boxes by customer phone
        const { data: phoneBoxes, error: phoneBoxError } = await supabase
          .from('boxes')
          .select(`
            *,
            customers (
              first_name,
              last_name,
              phone,
              destination
            )
          `)
          .ilike('customers.phone', `%${identifier}%`)
        
        if (!phoneBoxError && phoneBoxes) {
          boxes = [...boxes, ...phoneBoxes]
        }
        
        // Search sacks by customer phone
        const { data: phoneSacks, error: phoneSackError } = await supabase
          .from('sacks')
          .select(`
            *,
            customers (
              first_name,
              last_name,
              phone,
              destination
            )
          `)
          .ilike('customers.phone', `%${identifier}%`)
        
        if (!phoneSackError && phoneSacks) {
          sacks = [...sacks, ...phoneSacks]
        }
      } catch (error) {
        console.error('Phone search error:', error)
      }
    }

    return {
      boxes: boxes,
      sacks: sacks
    }
  },

  // Company settings
  async getCompanySettings() {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  async updateCompanySettings(settings) {
    // Use upsert to handle both insert and update cases
    const { data, error } = await supabase
      .from('company_settings')
      .upsert([{ id: 1, ...settings }], { onConflict: 'id' })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // User operations
  async getUserRole(userId) {
    try {
      console.log('getUserRole called with userId:', userId)
      
      if (!userId) {
        console.log('getUserRole: No userId provided, returning customer')
        return 'customer'
      }
      
      // Try to find user by user_id first
      let { data, error } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()
      
      // If not found by user_id, try by email (for auth users)
      if (!data && !error) {
        console.log('getUserRole: User not found by user_id, trying by email')
        const { data: userData } = await supabase.auth.getUser()
        if (userData?.user?.email) {
          const { data: emailData, error: emailError } = await supabase
            .from('user_accounts')
            .select('role')
            .eq('email', userData.user.email)
            .maybeSingle()
          
          if (!emailError && emailData) {
            data = emailData
            error = null
          }
        }
      }
      
      if (error) {
        console.error('getUserRole: Error fetching user role:', error)
        return 'customer' // Default role if error occurs
      }
      
      console.log('getUserRole result:', data)
      return data?.role || 'customer' // Return default role if no data found
    } catch (error) {
      console.error('getUserRole: Error in getUserRole:', error)
      return 'customer' // Default role on any error
    }
  },

  async getUsers() {
    try {
      console.log('getUsers: Starting to fetch users...');
      const { data, error } = await supabase
        .from('user_accounts')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('getUsers: Error:', error);
        throw error;
      }
      
      console.log('getUsers: Users fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getUsers: Error:', error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      console.log('createUser: Creating user with data:', userData);
      
      // Hash the password using a simple hash function
      // In production, you should use a proper password hashing library
      const hashedPassword = btoa(userData.password); // Simple base64 encoding for demo
      
      const userRecord = {
        username: userData.email,
        email: userData.email,
        phone: userData.phone || null,
        hashed_password: hashedPassword,
        role: userData.role || 'customer',
        created_at: new Date().toISOString()
      };
      
      console.log('createUser: Prepared user record:', userRecord);
      
      // Create user account record directly in the database
      const { data: accountData, error: accountError } = await supabase
        .from('user_accounts')
        .insert([userRecord])
        .select()
        .single();

      if (accountError) {
        console.error('createUser: Account creation error:', accountError);
        console.error('createUser: Error details:', {
          message: accountError.message,
          details: accountError.details,
          hint: accountError.hint,
          code: accountError.code
        });
        throw accountError;
      }

      console.log('createUser: User account created successfully:', accountData);
      return accountData;
    } catch (error) {
      console.error('createUser: Error creating user:', error);
      throw error;
    }
  },

  async deleteUser(userId) {
    try {
      // Delete from user_accounts table
      await supabase
        .from('user_accounts')
        .delete()
        .eq('user_id', userId);

      // Delete from auth (requires service role)
      await supabase.auth.admin.deleteUser(userId);

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  async updateUser(userId, userData) {
    try {
      // Update user in user_accounts table
      const { data, error } = await supabase
        .from('user_accounts')
        .update(userData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Parcel operations
  async getParcelById(parcelId, parcelType) {
    const { data, error } = await supabase
      .from(parcelType === 'box' ? 'boxes' : 'sacks')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          phone,
          destination
        )
      `)
      .eq(parcelType === 'box' ? 'box_id' : 'sack_id', parcelId)
      .single()
    
    if (error) throw error
    return data
  },

  async getAllParcels() {
    try {
      console.log('getAllParcels: Starting to fetch parcels...');
      
      // Get boxes with comprehensive customer data (enhanced schema)
      const { data: boxes, error: boxError } = await supabase
        .from('boxes')
        .select(`
          *,
          customers (
            customer_id,
            first_name,
            last_name,
            phone,
            destination,
            destination_country,
            destination_city,
            shipping_region,
            price
          )
        `)
        .order('created_at', { ascending: false })

      if (boxError) {
        console.error('getAllParcels: Box error:', boxError);
        throw boxError;
      }

      console.log('getAllParcels: Boxes fetched:', boxes?.length || 0);

      // Get sacks with comprehensive customer data (enhanced schema)
      const { data: sacks, error: sackError } = await supabase
        .from('sacks')
        .select(`
          *,
          customers (
            customer_id,
            first_name,
            last_name,
            phone,
            destination,
            destination_country,
            destination_city,
            shipping_region,
            price
          )
        `)
        .order('created_at', { ascending: false })

      if (sackError) {
        console.error('getAllParcels: Sack error:', sackError);
        throw sackError;
      }

      console.log('getAllParcels: Sacks fetched:', sacks?.length || 0);

      return {
        boxes: boxes || [],
        sacks: sacks || []
      }
    } catch (error) {
      console.error('getAllParcels: Error:', error);
      throw error;
    }
  },

  // Company settings field update
  async updateCompanySettingsField(field, value) {
    const { data, error } = await supabase
      .from('company_settings')
      .update({ [field]: value })
      .eq('company_id', 1)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Storage operations
  async uploadFile(bucket, path, file, options = {}) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, options)
    
    if (error) throw error
    return data
  },

  async getPublicUrl(bucket, path) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // Message operations
  async getMessages(parcelId) {
    try {
      console.log('getMessages: Fetching messages for parcel:', parcelId);
      
      // If no parcelId provided, return empty array
      if (!parcelId) {
        console.log('getMessages: No parcelId provided, returning empty array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('parcelid', parcelId)
        .order('createdat', { ascending: true })
      
      if (error) {
        console.error('getMessages: Error:', error);
        throw error;
      }
      
      console.log('getMessages: Messages fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getMessages: Error:', error);
      throw error;
    }
  },

  async getMessagesBetweenUsers(userId1, userId2) {
    try {
      console.log('getMessagesBetweenUsers: Fetching messages between users:', userId1, userId2);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('createdat', { ascending: true })
      
      if (error) {
        console.error('getMessagesBetweenUsers: Error:', error);
        throw error;
      }
      
      console.log('getMessagesBetweenUsers: Messages fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getMessagesBetweenUsers: Error:', error);
      throw error;
    }
  },

  async getAllMessages() {
    try {
      console.log('getAllMessages: Fetching all messages...');
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('createdat', { ascending: false })
      
      if (error) {
        console.error('getAllMessages: Error:', error);
        throw error;
      }
      
      console.log('getAllMessages: Messages fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getAllMessages: Error:', error);
      throw error;
    }
  },

  async getMessagesForParcel(parcelId, parcelType) {
    try {
      console.log('getMessagesForParcel: Fetching messages for', parcelType, parcelId);
      
      // Get messages for the specific parcel
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:user_accounts!messages_senderid_fkey(username, email, role),
          recipient:user_accounts!messages_recipientid_fkey(username, email, role)
        `)
        .eq('parcelid', parcelId)
        .order('createdat', { ascending: true })
      
      if (error) {
        console.error('getMessagesForParcel: Error:', error);
        throw error;
      }
      
      console.log('getMessagesForParcel: Messages fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getMessagesForParcel: Error:', error);
      throw error;
    }
  },

  async createMessage(messageData) {
    try {
      console.log('createMessage: Creating message:', messageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          parcelid: messageData.parcel_id || null,
          sender_id: messageData.sender_id,
          sender_role: messageData.sender_role || 'user',
          recipient_id: messageData.recipient_id || null,
          recipient_role: messageData.recipient_role || 'customer',
          message: messageData.message,
          message_type: messageData.message_type || 'text',
          delivery_channel: messageData.delivery_channel || 'platform',
          createdat: messageData.createdat || new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('createMessage: Error:', error);
        throw error;
      }
      
      console.log('createMessage: Message created:', data);
      return data;
    } catch (error) {
      console.error('createMessage: Error:', error);
      throw error;
    }
  },

  async sendMessage(messageData) {
    try {
      console.log('sendMessage: Sending message:', messageData);
      
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          parcelid: messageData.parcel_id || null,
          sender_id: messageData.sender_id,
          sender_role: messageData.sender_role || 'user',
          recipient_id: messageData.recipient_id || null,
          recipient_role: messageData.recipient_role || 'customer',
          message: messageData.message,
          message_type: messageData.message_type || 'text',
          delivery_channel: messageData.delivery_channel || 'platform',
          createdat: messageData.createdat || new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('sendMessage: Error:', error);
        throw error;
      }
      
      console.log('sendMessage: Message sent:', data);
      return data;
    } catch (error) {
      console.error('sendMessage: Error:', error);
      throw error;
    }
  },

  // Analytics functions
  async getDashboardStats() {
    try {
      console.log('getDashboardStats: Fetching dashboard statistics...');
      
      // Get counts for different statuses (enhanced schema with weight tracking)
      const [boxesData, sacksData, customersData, usersData] = await Promise.all([
        supabase.from('boxes').select('status, weight_kg'),
        supabase.from('sacks').select('status, weight_kg'),
        supabase.from('customers').select('customer_id'),
        supabase.from('user_accounts').select('user_id')
      ]);
      
      const boxes = boxesData.data || [];
      const sacks = sacksData.data || [];
      const customers = customersData.data || [];
      const users = usersData.data || [];
      
      // Calculate statistics (with weight tracking)
      const stats = {
        totalBoxes: boxes.length,
        totalSacks: sacks.length,
        totalCustomers: customers.length,
        totalUsers: users.length,
        totalWeight: boxes.reduce((sum, box) => sum + (box.weight_kg || 0), 0) + 
                    sacks.reduce((sum, sack) => sum + (sack.weight_kg || 0), 0),
        inTransit: boxes.filter(box => box.status === 'in_transit').length + 
                  sacks.filter(sack => sack.status === 'in_transit').length,
        delivered: boxes.filter(box => box.status === 'delivered').length + 
                  sacks.filter(sack => sack.status === 'delivered').length,
        pending: boxes.filter(box => box.status === 'packed').length + 
                sacks.filter(sack => sack.status === 'packed').length
      };
      
      console.log('getDashboardStats: Statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('getDashboardStats: Error:', error);
      throw error;
    }
  },

  async getRecentParcels(limit = 10) {
    try {
      console.log('getRecentParcels: Fetching recent parcels...');
      
      // Get recent boxes and sacks (enhanced schema with international shipping fields)
      const [boxesData, sacksData] = await Promise.all([
        supabase
          .from('boxes')
          .select(`
            *,
            customers (
              customer_id,
              first_name,
              last_name,
              phone,
              destination,
              destination_country,
              destination_city,
              shipping_region,
              price
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit),
        supabase
          .from('sacks')
          .select(`
            *,
            customers (
              customer_id,
              first_name,
              last_name,
              phone,
              destination,
              destination_country,
              destination_city,
              shipping_region,
              price
            )
          `)
          .order('created_at', { ascending: false })
          .limit(limit)
      ]);
      
      const boxes = (boxesData.data || []).map(box => ({ ...box, type: 'box', id: box.box_id }));
      const sacks = (sacksData.data || []).map(sack => ({ ...sack, type: 'sack', id: sack.sack_id }));
      
      // Combine and sort by creation date
      const allParcels = [...boxes, ...sacks]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit);
      
      console.log('getRecentParcels: Recent parcels fetched:', allParcels.length);
      return allParcels;
    } catch (error) {
      console.error('getRecentParcels: Error:', error);
      throw error;
    }
  },

  // International Shipping Analytics Functions
  async getInternationalShippingAnalytics() {
    try {
      console.log('getInternationalShippingAnalytics: Fetching international shipping data...');
      
      // Use the international_shipping_analytics view
      const { data, error } = await supabase
        .from('international_shipping_analytics')
        .select('*')
        .order('created_date', { ascending: false });
      
      if (error) {
        console.error('getInternationalShippingAnalytics: Error:', error);
        throw error;
      }
      
      console.log('getInternationalShippingAnalytics: Data fetched:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('getInternationalShippingAnalytics: Error:', error);
      throw error;
    }
  },

  async getShippingStatsByRegion() {
    try {
      console.log('getShippingStatsByRegion: Fetching regional statistics...');
      
      // Use a direct query instead of the function to avoid ambiguous column references
      const { data, error } = await supabase
        .from('international_shipping_analytics')
        .select('shipping_region, weight_kg, price');
      
      if (error) {
        console.error('getShippingStatsByRegion: Error:', error);
        throw error;
      }
      
      // Group by region and calculate statistics
      const regionStats = {};
      data?.forEach(item => {
        const region = item.shipping_region || 'Unknown';
        if (!regionStats[region]) {
          regionStats[region] = {
            region,
            total_shipments: 0,
            total_weight: 0,
            total_revenue: 0,
            weights: []
          };
        }
        regionStats[region].total_shipments++;
        regionStats[region].total_weight += (item.weight_kg || 0);
        regionStats[region].total_revenue += (item.price || 0);
        regionStats[region].weights.push(item.weight_kg || 0);
      });
      
      const result = Object.values(regionStats).map(stat => ({
        ...stat,
        avg_weight: stat.weights.length > 0 ? stat.total_weight / stat.weights.length : 0,
        avg_revenue: stat.total_shipments > 0 ? stat.total_revenue / stat.total_shipments : 0
      })).sort((a, b) => b.total_shipments - a.total_shipments);
      
      console.log('getShippingStatsByRegion: Statistics fetched:', result.length);
      return result;
    } catch (error) {
      console.error('getShippingStatsByRegion: Error:', error);
      throw error;
    }
  },

  async getShippingStatsByMethod() {
    try {
      console.log('getShippingStatsByMethod: Fetching method statistics...');
      
      // Use a direct query instead of the function to avoid ambiguous column references
      const { data, error } = await supabase
        .from('international_shipping_analytics')
        .select('shipping_method, weight_kg, price');
      
      if (error) {
        console.error('getShippingStatsByMethod: Error:', error);
        throw error;
      }
      
      // Group by method and calculate statistics
      const methodStats = {};
      data?.forEach(item => {
        const method = item.shipping_method || 'Unknown';
        if (!methodStats[method]) {
          methodStats[method] = {
            method,
            total_shipments: 0,
            total_weight: 0,
            total_revenue: 0,
            weights: []
          };
        }
        methodStats[method].total_shipments++;
        methodStats[method].total_weight += (item.weight_kg || 0);
        methodStats[method].total_revenue += (item.price || 0);
        methodStats[method].weights.push(item.weight_kg || 0);
      });
      
      const result = Object.values(methodStats).map(stat => ({
        ...stat,
        avg_weight: stat.weights.length > 0 ? stat.total_weight / stat.weights.length : 0,
        avg_revenue: stat.total_shipments > 0 ? stat.total_revenue / stat.total_shipments : 0
      })).sort((a, b) => b.total_shipments - a.total_shipments);
      
      console.log('getShippingStatsByMethod: Statistics fetched:', result.length);
      return result;
    } catch (error) {
      console.error('getShippingStatsByMethod: Error:', error);
      throw error;
    }
  },

  async getTopDestinations(limit = 10) {
    try {
      console.log('getTopDestinations: Fetching top destinations...');
      
      // Use a direct query instead of the function to avoid ambiguous column references
      const { data, error } = await supabase
        .from('international_shipping_analytics')
        .select('destination_country')
        .not('destination_country', 'is', null)
        .limit(limit);
      
      if (error) {
        console.error('getTopDestinations: Error:', error);
        throw error;
      }
      
      // Group by destination and count
      const destinationCounts = {};
      data?.forEach(item => {
        const country = item.destination_country;
        destinationCounts[country] = (destinationCounts[country] || 0) + 1;
      });
      
      const topDestinations = Object.entries(destinationCounts)
        .map(([destination, count]) => ({
          destination,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
      
      console.log('getTopDestinations: Destinations fetched:', topDestinations.length);
      return topDestinations;
    } catch (error) {
      console.error('getTopDestinations: Error:', error);
      throw error;
    }
  },

  // Expose the supabase client for direct access
  supabase
} 