-- Quick Database State Check
-- Run this first to see what exists

SELECT '=== CURRENT TABLES ===' as info;
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

SELECT '=== CURRENT ENUM TYPES ===' as info;
SELECT typname FROM pg_type WHERE typname IN ('user_role', 'parcel_status', 'message_language');

SELECT '=== CURRENT FUNCTIONS ===' as info;
SELECT proname FROM pg_proc WHERE proname IN ('set_shipping_region', 'get_shipping_stats_by_region', 'get_shipping_stats_by_method', 'get_top_destinations', 'generate_qr_code_url', 'set_message_created_at', 'update_updated_at_column');

SELECT '=== CURRENT VIEWS ===' as info;
SELECT viewname FROM pg_views WHERE schemaname = 'public'; 