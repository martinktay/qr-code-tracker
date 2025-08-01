# Database Migration Guide - Adding Missing Fields

## Overview

This guide will help you upgrade your database from the original schema to the enhanced schema with international shipping features.

## Prerequisites

- Access to your Supabase database
- Supabase CLI or direct database access
- Backup of your current database (recommended)

## Step 1: Backup Your Database (Recommended)

Before running any migration, it's recommended to backup your current database:

```bash
# If using Supabase CLI
supabase db dump --data-only > backup_$(date +%Y%m%d_%H%M%S).sql

# Or create a backup through Supabase Dashboard
# Go to Database → Backups → Create a new backup
```

## Step 2: Run the Migration Script

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `add_missing_fields_to_original_schema.sql`
4. Paste and run the script

### Option B: Using Supabase CLI

```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the migration script
supabase db reset --linked
# Then run the migration script through the dashboard
```

### Option C: Using psql (if you have direct database access)

```bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f add_missing_fields_to_original_schema.sql
```

## Step 3: Verify the Migration

After running the migration, verify that all fields were added successfully:

```sql
-- Check if new fields were added to customers table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name IN ('user_id', 'origin_country', 'destination_country', 'destination_city', 'shipping_region');

-- Check if new fields were added to boxes table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'boxes'
AND column_name IN ('weight_kg', 'destination_country', 'shipping_method', 'customs_status');

-- Check if new fields were added to sacks table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'sacks'
AND column_name IN ('weight_kg', 'destination_country', 'shipping_method', 'customs_status');

-- Check if the analytics view was created
SELECT * FROM international_shipping_analytics LIMIT 1;

-- Check if the functions were created
SELECT routine_name FROM information_schema.routines
WHERE routine_name IN ('get_shipping_stats_by_region', 'get_shipping_stats_by_method', 'get_top_destinations');
```

## Step 4: Test the Application

After the migration, test your application to ensure everything works:

1. **Test Communication Center**: Should now load without errors
2. **Test Dashboard**: Should show weight calculations
3. **Test International Shipping Analytics**: Should display data
4. **Test all other components**: Ensure no database errors

## Step 5: Add Sample Data (Optional)

If you want to test the international shipping features, you can add sample data:

```sql
-- Add sample international customers
INSERT INTO customers (first_name, last_name, phone, destination, destination_country, destination_city, price) VALUES
('John', 'Doe', '+1234567890', 'New York', 'USA', 'New York', 150.00),
('Jane', 'Smith', '+44123456789', 'London', 'UK', 'London', 200.00),
('Ahmed', 'Hassan', '+20123456789', 'Cairo', 'Egypt', 'Cairo', 120.00);

-- Update existing parcels with international shipping data
UPDATE boxes SET
  destination_country = 'USA',
  destination_city = 'New York',
  weight_kg = 5.5,
  shipping_method = 'Air'
WHERE box_id IN (SELECT box_id FROM boxes LIMIT 1);

UPDATE sacks SET
  destination_country = 'UK',
  destination_city = 'London',
  weight_kg = 3.2,
  shipping_method = 'Air'
WHERE sack_id IN (SELECT sack_id FROM sacks LIMIT 1);
```

## Troubleshooting

### Common Issues:

1. **Permission Errors**: Make sure you have the necessary permissions to alter tables
2. **Column Already Exists**: The script uses `IF NOT EXISTS`, so it's safe to run multiple times
3. **Function Already Exists**: The script uses `CREATE OR REPLACE`, so it will update existing functions

### If Something Goes Wrong:

1. **Restore from backup**: Use your backup to restore the database
2. **Check logs**: Look at the Supabase logs for any error messages
3. **Run manually**: Execute the migration script in smaller chunks

## What the Migration Adds

### New Fields:

- **Weight tracking**: `weight_kg` for boxes and sacks
- **International shipping**: `destination_country`, `destination_city`, `shipping_region`
- **Shipping methods**: `shipping_method`, `customs_status`
- **Enhanced messaging**: `recipient_type`, `customer_id` in messages
- **User linking**: `user_id` in customers table

### New Functions:

- **Analytics functions**: Regional and method-based statistics
- **Auto-detection**: Automatic shipping region and method detection
- **Enhanced views**: International shipping analytics view

### New Indexes:

- Performance indexes for all new fields
- Optimized queries for international shipping data

## Post-Migration Checklist

- [ ] Migration script executed successfully
- [ ] All new fields are present in the database
- [ ] Analytics functions are working
- [ ] Application loads without errors
- [ ] Communication Center works properly
- [ ] Dashboard shows weight calculations
- [ ] International shipping analytics display data
- [ ] All existing functionality still works

## Support

If you encounter any issues during the migration:

1. Check the Supabase logs for error messages
2. Verify your database permissions
3. Ensure you're running the script on the correct database
4. Contact support if needed

---

**Note**: This migration is designed to be safe and non-destructive. It only adds new fields and doesn't modify existing data.
