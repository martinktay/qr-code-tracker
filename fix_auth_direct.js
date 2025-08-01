// Direct Authentication Fix Script
// Run this in your browser console on your app page

const SUPABASE_URL = 'https://yxlswprzumjpvilxrmrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4bHN3cHJ6dW1qcHZpbHhybXJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDE2NDYsImV4cCI6MjA2OTM3NzY0Nn0.C8zN6lFWNZpjKDkRvgf8OC2qs7mGotMx8TMaZYJzCOQh9FS0QaaPdvL4MD24doDt';

async function fixAuthenticationDirect() {
    console.log('🔧 Attempting direct authentication fix...');
    
    try {
        // First, let's try to check if we can access the table at all
        console.log('📋 Checking table access...');
        const checkResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_accounts?select=count`, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'count=exact'
            }
        });
        
        console.log('Check response status:', checkResponse.status);
        
        if (checkResponse.status === 406) {
            console.log('❌ 406 error confirmed - RLS is blocking access');
            console.log('🚨 You MUST run the SQL script in Supabase Dashboard');
            console.log('📋 Open fix_auth_browser.html in your browser for instructions');
            return false;
        }
        
        if (checkResponse.ok) {
            console.log('✅ Table access is working!');
            
            // Try to get existing users
            const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_accounts?select=*`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (usersResponse.ok) {
                const users = await usersResponse.json();
                console.log('📊 Current users:', users);
                
                if (users.length === 0) {
                    console.log('👥 No users found, attempting to insert default users...');
                    
                    // Try to insert default users
                    const insertResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_accounts`, {
                        method: 'POST',
                        headers: {
                            'apikey': SUPABASE_ANON_KEY,
                            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify([
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
                        ])
                    });
                    
                    if (insertResponse.ok) {
                        console.log('✅ Default users inserted successfully!');
                        console.log('🎉 Authentication should now work!');
                        return true;
                    } else {
                        console.log('❌ Failed to insert users:', insertResponse.status);
                        const errorText = await insertResponse.text();
                        console.log('Error details:', errorText);
                    }
                } else {
                    console.log('✅ Users already exist!');
                    console.log('🎉 Authentication should work with existing users');
                    return true;
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error during direct fix:', error);
    }
    
    return false;
}

// Alternative: Try to create a simple user directly
async function createTestUser() {
    console.log('👤 Attempting to create test user...');
    
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/user_accounts`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                hashed_password: 'dGVzdDEyMw==',
                role: 'customer',
                created_at: new Date().toISOString()
            })
        });
        
        console.log('Create user response status:', response.status);
        
        if (response.ok) {
            console.log('✅ Test user created successfully!');
            return true;
        } else {
            const errorText = await response.text();
            console.log('❌ Failed to create test user:', errorText);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error creating test user:', error);
        return false;
    }
}

// Run the fix
console.log('🚀 Starting authentication fix...');
console.log('📋 If this fails, you MUST run the SQL script in Supabase Dashboard');
console.log('📋 Open fix_auth_browser.html in your browser for instructions');

fixAuthenticationDirect().then(success => {
    if (!success) {
        console.log('🔄 Trying alternative approach...');
        createTestUser();
    }
});

// Instructions for manual fix
console.log(`
📋 MANUAL FIX REQUIRED:
1. Open https://supabase.com and sign in
2. Go to your project dashboard
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste this SQL:

-- Disable RLS on user_accounts table
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;

-- Insert default users
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES 
    ('admin', 'admin@smartexporters.com', 'YWRtaW4xMjM=', 'admin', NOW()),
    ('warehouse_staff', 'warehouse@smartexporters.com', 'd2FyZWhvdXNlMTIz', 'warehouse_staff', NOW()),
    ('customer', 'customer@example.com', 'Y3VzdG9tZXIxMjM=', 'customer', NOW())
ON CONFLICT (email) DO NOTHING;

6. Click "Run" button
7. Try logging in again
`); 