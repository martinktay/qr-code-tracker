-- Debug Schema Creation
-- This script will help identify what went wrong

-- Step 1: Check current state
SELECT '=== CURRENT DATABASE STATE ===' as info;

-- Check if tables exist
SELECT 
    tablename,
    CASE WHEN tablename IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'boxes', 'sacks', 'scan_history', 'user_accounts', 'company_settings', 'messages')
ORDER BY tablename;

-- Check if enum types exist
SELECT 
    typname,
    CASE WHEN typname IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_type 
WHERE typname IN ('user_role', 'parcel_status', 'message_language');

-- Check if extension exists
SELECT 
    extname,
    CASE WHEN extname IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- Step 2: Check for any errors in recent logs
SELECT '=== RECENT ERRORS ===' as info;
SELECT 
    log_time,
    message
FROM pg_stat_activity 
WHERE state = 'active' 
AND query LIKE '%ERROR%'
ORDER BY log_time DESC
LIMIT 10;

-- Step 3: Test basic operations
SELECT '=== TESTING BASIC OPERATIONS ===' as info;

-- Test extension creation
SELECT 'Testing uuid-ossp extension...' as test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SELECT 'Extension test passed' as result;

-- Test enum creation
SELECT 'Testing enum creation...' as test;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
        RAISE NOTICE 'user_role enum created successfully';
    ELSE
        RAISE NOTICE 'user_role enum already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'parcel_status') THEN
        CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
        RAISE NOTICE 'parcel_status enum created successfully';
    ELSE
        RAISE NOTICE 'parcel_status enum already exists';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_language') THEN
        CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');
        RAISE NOTICE 'message_language enum created successfully';
    ELSE
        RAISE NOTICE 'message_language enum already exists';
    END IF;
END $$;

-- Test customers table creation
SELECT 'Testing customers table creation...' as test;
CREATE TABLE IF NOT EXISTS customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Customers table test passed' as result;

-- Test boxes table creation
SELECT 'Testing boxes table creation...' as test;
CREATE TABLE IF NOT EXISTS boxes (
    box_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status parcel_status DEFAULT 'packed',
    destination TEXT NOT NULL,
    weight_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
SELECT 'Boxes table test passed' as result;

-- Step 4: Final verification
SELECT '=== FINAL VERIFICATION ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public';

SELECT '=== DEBUG COMPLETE ===' as info; 