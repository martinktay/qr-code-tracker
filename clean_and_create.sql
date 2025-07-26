-- Clean and Create Schema
-- This script will clean up existing objects and create a fresh schema

-- Step 1: Clean up existing objects
SELECT '=== CLEANING UP EXISTING OBJECTS ===' as info;

-- Drop tables in dependency order
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS boxes CASCADE;
DROP TABLE IF EXISTS sacks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;

-- Drop views
DROP VIEW IF EXISTS international_shipping_analytics CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS set_shipping_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_method() CASCADE;
DROP FUNCTION IF EXISTS get_top_destinations(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_qr_code_url(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_message_created_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_customer_user_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS ensure_customer_user_account(UUID, TEXT, TEXT) CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS set_boxes_shipping_info ON boxes;
DROP TRIGGER IF EXISTS set_sacks_shipping_info ON sacks;
DROP TRIGGER IF EXISTS set_customers_shipping_info ON customers;
DROP TRIGGER IF EXISTS set_message_created_at_trigger ON messages;
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
DROP TRIGGER IF EXISTS update_boxes_updated_at ON boxes;
DROP TRIGGER IF EXISTS update_sacks_updated_at ON sacks;
DROP TRIGGER IF EXISTS update_user_accounts_updated_at ON user_accounts;
DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;

-- Drop enum types with CASCADE
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS parcel_status CASCADE;
DROP TYPE IF EXISTS message_language CASCADE;

SELECT '=== CLEANUP COMPLETED ===' as info;

-- Step 2: Create fresh schema
SELECT '=== CREATING FRESH SCHEMA ===' as info;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');

-- Create customers table
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_of_packaging TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Create boxes table
CREATE TABLE boxes (
    box_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    date_packed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    qr_code_url TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_kg DECIMAL(10,2) DEFAULT 0,
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    shipping_method VARCHAR(20),
    customs_status VARCHAR(50),
    international_tracking_number VARCHAR(100),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Create sacks table
CREATE TABLE sacks (
    sack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    date_packed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    qr_code_url TEXT,
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_kg DECIMAL(10,2) DEFAULT 0,
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    shipping_method VARCHAR(20),
    customs_status VARCHAR(50),
    international_tracking_number VARCHAR(100),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Create scan_history table
CREATE TABLE scan_history (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID REFERENCES boxes(box_id) ON DELETE CASCADE,
    sack_id UUID REFERENCES sacks(sack_id) ON DELETE CASCADE,
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_location POINT,
    status_message TEXT NOT NULL,
    photo_url TEXT,
    estimated_delivery TIMESTAMP WITH TIME ZONE,
    comment TEXT,
    sent_message TEXT,
    message_language message_language DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    customs_checkpoint VARCHAR(100),
    international_location VARCHAR(100),
    customs_notes TEXT,
    shipping_carrier VARCHAR(100),
    carrier_tracking_number VARCHAR(100)
);

-- Create user_accounts table
CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company_settings table
CREATE TABLE company_settings (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'The Smart Exporters',
    logo_url TEXT,
    contact_email VARCHAR(255),
    support_phone VARCHAR(20),
    terms_of_use TEXT,
    privacy_policy TEXT,
    enable_whatsapp BOOLEAN DEFAULT true,
    enable_messaging BOOLEAN DEFAULT true,
    enable_email BOOLEAN DEFAULT true,
    preferred_languages message_language[] DEFAULT ARRAY[
        'en'::message_language,
        'fr'::message_language,
        'yo'::message_language,
        'es'::message_language
    ],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senderid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    recipientid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    parcelid UUID,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    language message_language DEFAULT 'en',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_channel TEXT DEFAULT 'in-app',
    status TEXT DEFAULT 'sent',
    file_url TEXT,
    file_name TEXT,
    recipient_type VARCHAR(20) DEFAULT 'customer',
    customer_id UUID REFERENCES customers(customer_id)
);

-- Create indexes
CREATE INDEX idx_boxes_customer_id ON boxes(customer_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX idx_sacks_customer_id ON sacks(customer_id);
CREATE INDEX idx_sacks_status ON sacks(status);
CREATE INDEX idx_sacks_weight ON sacks(weight_kg);
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

-- Insert default company settings
INSERT INTO company_settings (
    company_name, contact_email, support_phone, terms_of_use, privacy_policy, enable_whatsapp, preferred_languages
) VALUES (
    'The Smart Exporters',
    'support@smartexporters.com',
    '+2341234567890',
    'Terms of Use for SmartTrack Logistics Platform...',
    'Privacy Policy for SmartTrack Logistics Platform...',
    true,
    ARRAY['en'::message_language, 'fr'::message_language, 'yo'::message_language, 'es'::message_language]
);

-- Verify creation
SELECT '=== VERIFICATION ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';

SELECT '=== SCHEMA CREATION COMPLETE ===' as info; 