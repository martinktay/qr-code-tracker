-- Minimal Schema Test
-- Run this step by step to identify the issue

-- Step 1: Test extension
SELECT 'Testing extension...' as step;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT 'Extension created successfully' as result;

-- Step 2: Test enum creation
SELECT 'Testing enum creation...' as step;
CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');
SELECT 'Enums created successfully' as result;

-- Step 3: Test customers table
SELECT 'Testing customers table...' as step;
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Customers table created successfully' as result;

-- Step 4: Test boxes table
SELECT 'Testing boxes table...' as step;
CREATE TABLE boxes (
    box_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    weight_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Boxes table created successfully' as result;

-- Step 5: Test sacks table
SELECT 'Testing sacks table...' as step;
CREATE TABLE sacks (
    sack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    weight_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Sacks table created successfully' as result;

-- Step 6: Test scan_history table
SELECT 'Testing scan_history table...' as step;
CREATE TABLE scan_history (
    scan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    box_id UUID REFERENCES boxes(box_id) ON DELETE CASCADE,
    sack_id UUID REFERENCES sacks(sack_id) ON DELETE CASCADE,
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Scan_history table created successfully' as result;

-- Step 7: Test user_accounts table
SELECT 'Testing user_accounts table...' as step;
CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'User_accounts table created successfully' as result;

-- Step 8: Test company_settings table
SELECT 'Testing company_settings table...' as step;
CREATE TABLE company_settings (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'The Smart Exporters',
    contact_email VARCHAR(255),
    enable_whatsapp BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Company_settings table created successfully' as result;

-- Step 9: Test messages table
SELECT 'Testing messages table...' as step;
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senderid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    recipientid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    language message_language DEFAULT 'en',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Messages table created successfully' as result;

-- Step 10: Verify all tables exist
SELECT '=== VERIFICATION ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT '=== SCHEMA CREATION COMPLETE ===' as info; 