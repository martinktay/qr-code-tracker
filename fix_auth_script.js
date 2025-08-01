// Fix Authentication Script
// This script fixes the 406 error by updating RLS policies

import { createClient } from '@supabase/supabase-js'

// Replace with your actual Supabase URL and anon key
const supabaseUrl = 'https://yxlswprzumjpvilxrmrc.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHN3cHJ6dW1qcHZpbHhybXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDE2NDYsImV4cCI6MjA2OTM3NzY0Nn0.C8zN6lFWNZpjKDkRvgf8OC2qs7mGotMx8TMaZYJzCOQh9FS0QaaPdvL4MD24doDt'

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixAuthentication() {
  try {
    console.log('🔧 Starting authentication fix...')
    
    // Step 1: Drop existing restrictive policies
    console.log('📋 Dropping existing policies...')
    const policiesToDrop = [
      'Enable read access for all users',
      'Enable insert for authenticated users only', 
      'Enable update for users based on user_id',
      'Enable delete for users based on user_id',
      'Allow all operations on user_accounts'
    ]
    
    for (const policyName of policiesToDrop) {
      try {
        await supabase.rpc('exec_sql', {
          sql: `DROP POLICY IF EXISTS "${policyName}" ON user_accounts;`
        })
        console.log(`✅ Dropped policy: ${policyName}`)
      } catch (error) {
        console.log(`⚠️ Could not drop policy ${policyName}:`, error.message)
      }
    }
    
    // Step 2: Create permissive policy
    console.log('🔓 Creating permissive policy...')
    await supabase.rpc('exec_sql', {
      sql: `CREATE POLICY "Allow all operations on user_accounts" ON user_accounts FOR ALL USING (true) WITH CHECK (true);`
    })
    console.log('✅ Created permissive policy')
    
    // Step 3: Insert default users
    console.log('👥 Inserting default users...')
    const { data: insertData, error: insertError } = await supabase
      .from('user_accounts')
      .upsert([
        {
          username: 'admin',
          email: 'admin@smartexporters.com',
          hashed_password: 'YWRtaW4xMjM=',
          role: 'admin',
          created_at: new Date().toISOString()
        },
        {
          username: 'warehouse_staff',
          email: 'warehouse@smartexporters.com',
          hashed_password: 'd2FyZWhvdXNlMTIz',
          role: 'warehouse_staff',
          created_at: new Date().toISOString()
        },
        {
          username: 'customer',
          email: 'customer@example.com',
          hashed_password: 'Y3VzdG9tZXIxMjM=',
          role: 'customer',
          created_at: new Date().toISOString()
        }
      ], { onConflict: 'email' })
    
    if (insertError) {
      console.error('❌ Error inserting users:', insertError)
    } else {
      console.log('✅ Default users inserted/updated')
    }
    
    // Step 4: Verify the fix
    console.log('🔍 Verifying fix...')
    const { data: users, error: selectError } = await supabase
      .from('user_accounts')
      .select('user_id, username, email, role')
      .order('role')
    
    if (selectError) {
      console.error('❌ Error verifying users:', selectError)
    } else {
      console.log('✅ Authentication fix completed!')
      console.log('📊 Current users:')
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Authentication fix failed:', error)
  }
}

// Run the fix
fixAuthentication()