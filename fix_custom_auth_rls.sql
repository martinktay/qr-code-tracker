-- Fix RLS Policies for Custom Authentication System
-- This allows our custom authentication to work without Supabase Auth

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON customers;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON customers;
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON boxes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON boxes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON boxes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON boxes;
DROP POLICY IF EXISTS "Allow all operations on boxes" ON boxes;

DROP POLICY IF EXISTS "Enable read access for all users" ON sacks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sacks;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON sacks;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON sacks;
DROP POLICY IF EXISTS "Allow all operations on sacks" ON sacks;

DROP POLICY IF EXISTS "Enable read access for all users" ON scan_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON scan_history;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON scan_history;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON scan_history;
DROP POLICY IF EXISTS "Allow all operations on scan_history" ON scan_history;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_accounts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_accounts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_accounts;
DROP POLICY IF EXISTS "Allow all operations on user_accounts" ON user_accounts;

DROP POLICY IF EXISTS "Enable read access for all users" ON company_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON company_settings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON company_settings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON company_settings;
DROP POLICY IF EXISTS "Allow all operations on company_settings" ON company_settings;

DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON messages;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON messages;
DROP POLICY IF EXISTS "Allow all operations on messages" ON messages;

-- Drop any other existing policies that might conflict
DROP POLICY IF EXISTS "Allow sender, recipient, admin to read messages" ON messages;
DROP POLICY IF EXISTS "Allow sender to insert message" ON messages;
DROP POLICY IF EXISTS "Allow sender to update own message" ON messages;

-- Create new policies that allow all operations for our custom auth system
-- These policies are more permissive to allow our custom authentication to work

-- User Accounts table - Allow all operations for authentication
CREATE POLICY "Allow all operations on user_accounts" ON user_accounts FOR ALL USING (true) WITH CHECK (true);

-- Customers table - Allow all operations
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);

-- Boxes table - Allow all operations
CREATE POLICY "Allow all operations on boxes" ON boxes FOR ALL USING (true) WITH CHECK (true);

-- Sacks table - Allow all operations
CREATE POLICY "Allow all operations on sacks" ON sacks FOR ALL USING (true) WITH CHECK (true);

-- Scan History table - Allow all operations
CREATE POLICY "Allow all operations on scan_history" ON scan_history FOR ALL USING (true) WITH CHECK (true);

-- Company Settings table - Allow all operations
CREATE POLICY "Allow all operations on company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);

-- Messages table - Allow all operations
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Insert a default admin user if it doesn't exist
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES (
    'admin',
    'admin@smartexporters.com',
    'YWRtaW4xMjM=', -- base64 encoded 'admin123'
    'admin',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert a default warehouse staff user if it doesn't exist
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES (
    'warehouse_staff',
    'warehouse@smartexporters.com',
    'd2FyZWhvdXNlMTIz', -- base64 encoded 'warehouse123'
    'warehouse_staff',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert a default customer user if it doesn't exist
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES (
    'customer',
    'customer@example.com',
    'Y3VzdG9tZXIxMjM=', -- base64 encoded 'customer123'
    'customer',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT user_id, username, email, role, created_at FROM user_accounts ORDER BY role, username;