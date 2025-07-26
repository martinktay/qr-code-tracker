# SmartTrack Database Setup Guide

## Overview

This guide will help you set up the complete SmartTrack database with all features including weight tracking, international shipping analytics, enhanced messaging, and warehouse staff analytics.

## Prerequisites

- Access to your Supabase project
- Supabase CLI installed (optional but recommended)
- Basic knowledge of SQL

## Step 1: Flush Existing Database

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following commands to clear existing data:

```sql
-- Drop all tables (this will remove all data)
DROP TABLE IF EXISTS scan_history CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS boxes CASCADE;
DROP TABLE IF EXISTS sacks CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS company_settings CASCADE;

-- Drop any existing views and functions
DROP VIEW IF EXISTS international_shipping_analytics CASCADE;
DROP FUNCTION IF EXISTS set_shipping_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_region() CASCADE;
DROP FUNCTION IF EXISTS get_shipping_stats_by_method() CASCADE;
DROP FUNCTION IF EXISTS get_top_destinations(INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_qr_code_url(UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_message_created_at() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_customer_user_id(UUID) CASCADE;
DROP FUNCTION IF EXISTS ensure_customer_user_account(UUID, TEXT, TEXT) CASCADE;

-- Drop enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS parcel_status CASCADE;
DROP TYPE IF EXISTS message_language CASCADE;
```

### Option B: Using Supabase CLI

```bash
# Reset the entire database (WARNING: This will delete ALL data)
supabase db reset
```

## Step 2: Apply Complete Schema

1. In your Supabase SQL Editor, copy and paste the entire contents of `complete_schema.sql`
2. Execute the script
3. Verify the schema was created successfully

**Expected Output:**

```
Schema created successfully
```

## Step 3: Seed Database with Realistic Data

1. Copy and paste the entire contents of `realistic_seed_data.sql`
2. Execute the script
3. Verify the data was inserted successfully

**Expected Output:**

```
Seed data insertion completed successfully!
total_customers: 23
total_boxes: 15
total_sacks: 11
total_users: 10
total_scans: 9
total_messages: 4
```

## Step 4: Test User Accounts

The seed data includes the following test accounts:

### Admin Accounts

- **Email:** admin@smartexporters.com
- **Password:** admin123
- **Role:** Admin

- **Email:** supervisor@smartexporters.com
- **Password:** super123
- **Role:** Admin

### Warehouse Staff Accounts

- **Email:** warehouse1@smartexporters.com
- **Password:** ware123
- **Role:** Warehouse Staff

- **Email:** warehouse2@smartexporters.com
- **Password:** ware123
- **Role:** Warehouse Staff

- **Email:** warehouse3@smartexporters.com
- **Password:** ware123
- **Role:** Warehouse Staff

### Customer Accounts

- **Email:** adebayo.okechukwu@email.com
- **Password:** customer123
- **Role:** Customer

- **Email:** fatima.bello@email.com
- **Password:** customer123
- **Role:** Customer

- **Email:** chukwudi.eze@email.com
- **Password:** customer123
- **Role:** Customer

- **Email:** aisha.mohammed@email.com
- **Password:** customer123
- **Role:** Customer

- **Email:** emeka.nwankwo@email.com
- **Password:** customer123
- **Role:** Customer

## Step 5: Verify Features

### 1. Dashboard Analytics

- Login as admin and check the dashboard
- Verify international shipping analytics tab
- Check that all counts are accurate

### 2. Warehouse Staff Analytics

- Login as warehouse staff
- Check the "Detailed Analytics" tab
- Verify operational metrics and productivity data

### 3. Weight Tracking

- Register a new box or sack
- Verify the weight field is available
- Check that weight appears in analytics

### 4. International Shipping

- Check that shipping regions are automatically populated
- Verify international tracking numbers
- Test the international shipping analytics

### 5. Messaging System

- Test messaging between admin and warehouse staff
- Test customer messaging functionality
- Verify message history and attachments

### 6. Parcel Tracking

- Use the tracking numbers from seed data
- Test QR code scanning functionality
- Verify timeline and interaction trail

## Step 6: Test Real-World Scenarios

### Scenario 1: International Shipment

1. Register a new box with destination "London, UK"
2. Verify shipping region is set to "Europe"
3. Verify shipping method is set to "Air"
4. Check international shipping analytics

### Scenario 2: Weight-Based Analytics

1. Register boxes with different weights
2. Check warehouse staff analytics
3. Verify weight appears in operational metrics

### Scenario 3: Customer Communication

1. Login as a customer
2. Send a message to admin
3. Check message appears in interaction trail
4. Verify notification system

## Troubleshooting

### Common Issues

**Issue:** "Schema already exists" errors
**Solution:** Make sure you've completely flushed the database first

**Issue:** Foreign key constraint errors
**Solution:** Ensure you're running the scripts in the correct order (schema first, then seed data)

**Issue:** RLS policy errors
**Solution:** The complete schema includes all necessary RLS policies. If you still get errors, check that you're authenticated.

**Issue:** Analytics showing 0 values
**Solution:** Make sure the seed data was inserted successfully and check that weight_kg values are not NULL

### Verification Queries

Run these queries to verify your setup:

```sql
-- Check table structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Check data counts
SELECT 'customers' as table_name, COUNT(*) as count FROM customers
UNION ALL
SELECT 'boxes', COUNT(*) FROM boxes
UNION ALL
SELECT 'sacks', COUNT(*) FROM sacks
UNION ALL
SELECT 'user_accounts', COUNT(*) FROM user_accounts
UNION ALL
SELECT 'scan_history', COUNT(*) FROM scan_history
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- Check international shipping data
SELECT shipping_region, COUNT(*) as shipments
FROM international_shipping_analytics
GROUP BY shipping_region
ORDER BY shipments DESC;
```

## Next Steps

1. **Customize the application** for your specific needs
2. **Set up Netlify functions** for WhatsApp and email notifications
3. **Configure environment variables** for external services
4. **Deploy to production** when ready

## Support

If you encounter any issues during setup:

1. Check the troubleshooting section above
2. Verify all SQL scripts executed successfully
3. Check the Supabase logs for detailed error messages
4. Ensure your Supabase project has the necessary permissions

---

**Note:** This setup provides a complete, production-ready database with realistic test data. All features including weight tracking, international shipping analytics, enhanced messaging, and warehouse staff analytics are fully functional.
