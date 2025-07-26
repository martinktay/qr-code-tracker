-- Step by Step Schema Fix
-- Run each section separately to identify the exact failure point

-- SECTION 1: Clean up and create basics
SELECT '=== SECTION 1: CLEANUP AND BASICS ===' as info;

-- Drop everything first
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS boxes CASCADE;
DROP TABLE IF EXISTS sacks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS parcel_status CASCADE;
DROP TYPE IF EXISTS message_language CASCADE;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');

SELECT 'Section 1 completed successfully' as result;

-- SECTION 2: Create customers table
SELECT '=== SECTION 2: CUSTOMERS TABLE ===' as info;

CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 2 completed successfully' as result;

-- SECTION 3: Create boxes table
SELECT '=== SECTION 3: BOXES TABLE ===' as info;

CREATE TABLE boxes (
    box_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    weight_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 3 completed successfully' as result;

-- SECTION 4: Create sacks table
SELECT '=== SECTION 4: SACKS TABLE ===' as info;

CREATE TABLE sacks (
    sack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    weight_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 4 completed successfully' as result;

-- SECTION 5: Create scan_history table
SELECT '=== SECTION 5: SCAN_HISTORY TABLE ===' as info;

CREATE TABLE scan_history (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID REFERENCES boxes(box_id) ON DELETE CASCADE,
    sack_id UUID REFERENCES sacks(sack_id) ON DELETE CASCADE,
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 5 completed successfully' as result;

-- SECTION 6: Create user_accounts table
SELECT '=== SECTION 6: USER_ACCOUNTS TABLE ===' as info;

CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 6 completed successfully' as result;

-- SECTION 7: Create company_settings table
SELECT '=== SECTION 7: COMPANY_SETTINGS TABLE ===' as info;

CREATE TABLE company_settings (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'The Smart Exporters',
    contact_email VARCHAR(255),
    enable_whatsapp BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 7 completed successfully' as result;

-- SECTION 8: Create messages table
SELECT '=== SECTION 8: MESSAGES TABLE ===' as info;

CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senderid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    recipientid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    language message_language DEFAULT 'en',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

SELECT 'Section 8 completed successfully' as result;

-- SECTION 9: Create indexes and enable RLS
SELECT '=== SECTION 9: INDEXES AND RLS ===' as info;

-- Create indexes
CREATE INDEX idx_boxes_customer_id ON boxes(customer_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_sacks_customer_id ON sacks(customer_id);
CREATE INDEX idx_sacks_status ON sacks(status);
CREATE INDEX idx_scan_history_box_id ON scan_history(box_id);
CREATE INDEX idx_scan_history_sack_id ON scan_history(sack_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_user_accounts_role ON user_accounts(role);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

SELECT 'Section 9 completed successfully' as result;

-- SECTION 10: Create RLS policies
SELECT '=== SECTION 10: RLS POLICIES ===' as info;

-- Create basic RLS policies
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON boxes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON boxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON sacks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sacks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON scan_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON scan_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON user_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON company_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

SELECT 'Section 10 completed successfully' as result;

-- SECTION 11: Insert default data
SELECT '=== SECTION 11: DEFAULT DATA ===' as info;

-- Insert default company settings
INSERT INTO company_settings (
    company_name, contact_email, enable_whatsapp
) VALUES (
    'The Smart Exporters',
    'support@smartexporters.com',
    true
);

SELECT 'Section 11 completed successfully' as result;

-- SECTION 12: Final verification
SELECT '=== SECTION 12: FINAL VERIFICATION ===' as info;

SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';

SELECT '=== ALL SECTIONS COMPLETED SUCCESSFULLY ===' as info; 