-- SmartTrack Database Setup Troubleshooting Script
-- This script will help diagnose and fix setup issues

-- Step 1: Check what currently exists in the database
SELECT '=== CURRENT DATABASE STATE ===' as info;

-- Check if tables exist
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check if enum types exist
SELECT 
    typname,
    typtype
FROM pg_type 
WHERE typname IN ('user_role', 'parcel_status', 'message_language');

-- Check if functions exist
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname IN ('set_shipping_region', 'get_shipping_stats_by_region', 'get_shipping_stats_by_method', 'get_top_destinations', 'generate_qr_code_url', 'set_message_created_at', 'update_updated_at_column');

-- Check if views exist
SELECT 
    schemaname,
    viewname,
    viewowner
FROM pg_views 
WHERE schemaname = 'public';

-- Step 2: Clean up everything (if needed)
SELECT '=== CLEANUP SECTION ===' as info;

-- Drop all tables if they exist
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS boxes CASCADE;
DROP TABLE IF EXISTS sacks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;

-- Drop all views
DROP VIEW IF EXISTS international_shipping_analytics CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS set_shipping_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_method() CASCADE;
DROP FUNCTION IF EXISTS get_top_destinations(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_qr_code_url(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_message_created_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_customer_user_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS ensure_customer_user_account(UUID, TEXT, TEXT) CASCADE;

-- Drop all triggers (if they exist)
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

-- Step 3: Verify cleanup
SELECT '=== VERIFICATION AFTER CLEANUP ===' as info;

-- Check if anything remains
SELECT 
    schemaname,
    tablename
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('customers', 'boxes', 'sacks', 'scan_history', 'user_accounts', 'company_settings', 'messages');

SELECT 
    typname
FROM pg_type 
WHERE typname IN ('user_role', 'parcel_status', 'message_language');

SELECT '=== READY FOR SCHEMA CREATION ===' as info; 