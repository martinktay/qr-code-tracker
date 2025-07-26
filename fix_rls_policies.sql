-- Fix RLS Policies for Authentication and Data Access
-- This ensures the app can work properly with Supabase Auth

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON customers;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON customers;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON customers;

DROP POLICY IF EXISTS "Enable read access for all users" ON boxes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON boxes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON boxes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON boxes;

DROP POLICY IF EXISTS "Enable read access for all users" ON sacks;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON sacks;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON sacks;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON sacks;

DROP POLICY IF EXISTS "Enable read access for all users" ON scan_history;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON scan_history;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON scan_history;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON scan_history;

DROP POLICY IF EXISTS "Enable read access for all users" ON user_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_accounts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_accounts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_accounts;

DROP POLICY IF EXISTS "Enable read access for all users" ON company_settings;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON company_settings;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON company_settings;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON company_settings;

-- Create policies for customers table
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for boxes table
CREATE POLICY "Enable read access for all users" ON boxes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON boxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON boxes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON boxes FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for sacks table
CREATE POLICY "Enable read access for all users" ON sacks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sacks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON sacks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON sacks FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for scan_history table
CREATE POLICY "Enable read access for all users" ON scan_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON scan_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON scan_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON scan_history FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for user_accounts table
CREATE POLICY "Enable read access for all users" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON user_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON user_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON user_accounts FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for company_settings table
CREATE POLICY "Enable read access for all users" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON company_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON company_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON company_settings FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for messages table
CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname; 