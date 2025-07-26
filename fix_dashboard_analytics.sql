-- Fix Dashboard Analytics Issues
-- This ensures all necessary columns exist and RLS policies are properly configured

-- Add weight_kg column to boxes table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'boxes' AND column_name = 'weight_kg') THEN
        ALTER TABLE boxes ADD COLUMN weight_kg DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add weight_kg column to sacks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'sacks' AND column_name = 'weight_kg') THEN
        ALTER TABLE sacks ADD COLUMN weight_kg DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Add user_id column to customers table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'user_id') THEN
        ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Add missing columns to user_accounts table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_accounts' AND column_name = 'phone') THEN
        ALTER TABLE user_accounts ADD COLUMN phone VARCHAR(20);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_accounts' AND column_name = 'name') THEN
        ALTER TABLE user_accounts ADD COLUMN name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_accounts' AND column_name = 'updated_at') THEN
        ALTER TABLE user_accounts ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add missing columns to messages table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'recipient_type') THEN
        ALTER TABLE messages ADD COLUMN recipient_type VARCHAR(20) DEFAULT 'customer';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'messages' AND column_name = 'customer_id') THEN
        ALTER TABLE messages ADD COLUMN customer_id UUID REFERENCES customers(customer_id);
    END IF;
END $$;

-- Drop existing RLS policies to recreate them properly
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

DROP POLICY IF EXISTS "Enable read access for all users" ON messages;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON messages;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON messages;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON messages;

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boxes_status ON boxes(status);
CREATE INDEX IF NOT EXISTS idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX IF NOT EXISTS idx_sacks_status ON sacks(status);
CREATE INDEX IF NOT EXISTS idx_sacks_weight ON sacks(weight_kg);
CREATE INDEX IF NOT EXISTS idx_user_accounts_role ON user_accounts(role);

-- Update existing records to have default weight values
UPDATE boxes SET weight_kg = 0 WHERE weight_kg IS NULL;
UPDATE sacks SET weight_kg = 0 WHERE weight_kg IS NULL;

-- Verify the schema
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name IN ('boxes', 'sacks', 'customers', 'user_accounts', 'messages')
ORDER BY table_name, ordinal_position; 