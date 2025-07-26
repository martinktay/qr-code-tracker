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
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()
    
    if (error) throw error
    return data
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

  // Box operations
  async createBox(boxData) {
    const { data, error } = await supabase
      .from('boxes')
      .insert([boxData])
      .select()
      .single()
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('sacks')
      .insert([sackData])
      .select()
      .single()
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq(parcelType === 'box' ? 'box_id' : 'sack_id', parcelId)
      .order('scan_time', { ascending: true })
    
    if (error) throw error
    return data
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
    const { data, error } = await supabase
      .from('company_settings')
      .update(settings)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // User operations
  async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from('user_accounts')
        .select('role')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        throw error
      }
      
      return data.role
    } catch (error) {
      throw error
    }
  },

  async getUsers() {
    const { data, error } = await supabase
      .from('user_accounts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createUser(userData) {
    try {
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        phone: userData.phone,
        password: userData.password || 'tempPassword123!',
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });

      if (authError) throw authError;

      // Create user account record
      const { error: accountError } = await supabase
        .from('user_accounts')
        .insert([
          {
            user_id: authData.user.id,
            username: userData.email,
            role: userData.role,
            created_at: new Date().toISOString()
          }
        ]);

      if (accountError) throw accountError;

      return authData.user;
    } catch (error) {
      console.error('Error creating user:', error);
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
    // Get boxes
    const { data: boxes, error: boxError } = await supabase
      .from('boxes')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (boxError) throw boxError

    // Get sacks
    const { data: sacks, error: sackError } = await supabase
      .from('sacks')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          phone
        )
      `)
      .order('created_at', { ascending: false })

    if (sackError) throw sackError

    return {
      boxes: boxes || [],
      sacks: sacks || []
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
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('parcelid', parcelId)
      .order('createdat', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createMessage(messageData) {
    const { data, error } = await supabase
      .from('messages')
      .insert([messageData])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
} 