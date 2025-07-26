# SmartTrack Implementation Guide

## Overview

This guide provides step-by-step instructions to implement the messaging functionality and weight tracking features for the SmartTrack logistics platform.

## Changes Implemented

### 1. Database Schema Updates

- **Weight Fields**: Added `weight_kg` column to both `boxes` and `sacks` tables
- **Messaging Schema**: Enhanced messaging system to support customer-user communication
- **Customer-User Linking**: Added `user_id` to customers table for login capabilities

### 2. Frontend Updates

- **Registration Forms**: Added weight input fields to Box and Sack registration
- **PDF Labels**: Updated to include weight information
- **Timeline Display**: Enhanced to show weight in parcel details
- **Dashboard**: Added total weight statistics for admin view

## Implementation Steps

### Step 1: Execute Database Schema Changes

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor

2. **Execute the Schema Update**
   - Copy the contents of `add_weight_fields.sql`
   - Paste and execute in the SQL Editor
   - This will:
     - Add `weight_kg` columns to boxes and sacks tables
     - Add `user_id` column to customers table
     - Add `recipient_type` and `customer_id` columns to messages table
     - Create necessary indexes for performance
     - Update RLS policies for messaging
     - Add helper functions for customer-user management

### Step 2: Verify Database Changes

Run these queries to verify the changes:

```sql
-- Check if weight columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('boxes', 'sacks')
AND column_name = 'weight_kg';

-- Check if messaging columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'messages'
AND column_name IN ('recipient_type', 'customer_id');

-- Check if customer user_id was added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'user_id';
```

### Step 3: Test the Application

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

2. **Test Weight Registration**

   - Go to Register Box page
   - Fill in all required fields including weight
   - Submit the form
   - Verify weight appears in the generated label and details

3. **Test Sack Registration**

   - Go to Register Sack page
   - Fill in all required fields including weight
   - Submit the form
   - Verify weight appears in the generated label and details

4. **Test Dashboard Weight Statistics**

   - Login as admin
   - Check dashboard for "Total Weight" card
   - Verify the weight calculation is correct

5. **Test Parcel Timeline**
   - Go to a parcel timeline page
   - Verify weight information is displayed in parcel details

### Step 4: Test Messaging Functionality

1. **Verify Messaging Navigation**

   - Login as admin
   - Click on "Messaging" in the sidebar
   - Should navigate to admin panel messaging section

2. **Test Customer-User Linking**

   - Register a new customer through box/sack registration
   - Check if a user account is automatically created
   - Verify the customer can now access the platform

3. **Test In-App Messaging**
   - Go to a parcel timeline
   - Try sending a message (if customer role)
   - Verify message appears in chat window

## Key Features Added

### Weight Tracking

- **Input Validation**: Weight must be greater than 0.01 kg
- **Display**: Weight shown in kg with 2 decimal places
- **PDF Labels**: Weight included in generated labels
- **Dashboard**: Total weight statistics for admin
- **Timeline**: Weight displayed in parcel details

### Enhanced Messaging

- **Customer Accounts**: Customers can now have login credentials
- **Flexible Recipients**: Messages can be sent to users or customers
- **Real-time Chat**: In-app messaging with real-time updates
- **Notification Integration**: WhatsApp and email notifications
- **Admin Controls**: Enable/disable messaging features

## Database Schema Changes Summary

### New Columns Added

```sql
-- Boxes table
ALTER TABLE boxes ADD COLUMN weight_kg DECIMAL(8,2);

-- Sacks table
ALTER TABLE sacks ADD COLUMN weight_kg DECIMAL(8,2);

-- Customers table
ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES user_accounts(user_id);

-- Messages table
ALTER TABLE messages ADD COLUMN recipient_type TEXT DEFAULT 'user';
ALTER TABLE messages ADD COLUMN customer_id UUID REFERENCES customers(customer_id);
```

### New Indexes

```sql
CREATE INDEX idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX idx_sacks_weight ON sacks(weight_kg);
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_messages_customer_id ON messages(customer_id);
```

### Helper Functions

- `get_customer_user_id(customer_uuid)`: Get customer's user account ID
- `ensure_customer_user_account(customer_uuid, email, phone)`: Create user account for customer

## Troubleshooting

### Common Issues

1. **Weight Field Not Appearing**

   - Ensure the SQL script was executed successfully
   - Check browser console for any JavaScript errors
   - Verify the form validation is working

2. **Messaging Not Working**

   - Check if RLS policies were updated correctly
   - Verify Netlify functions are deployed and configured
   - Check environment variables for Twilio and SMTP settings

3. **Database Connection Issues**
   - Verify Supabase URL and API key in `.env.local`
   - Check if the database is accessible
   - Ensure RLS policies allow the required operations

### Verification Queries

```sql
-- Check if weight data is being saved
SELECT box_id, content, weight_kg FROM boxes WHERE weight_kg IS NOT NULL LIMIT 5;

-- Check if customer-user linking is working
SELECT c.customer_id, c.first_name, c.user_id, u.username
FROM customers c
LEFT JOIN user_accounts u ON c.user_id = u.user_id
LIMIT 5;

-- Check messaging table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;
```

## Next Steps

1. **Deploy to Production**

   - Execute schema changes on production database
   - Deploy updated frontend code
   - Configure production environment variables

2. **User Training**

   - Train warehouse staff on weight recording
   - Educate customers on new messaging features
   - Update admin documentation

3. **Monitoring**
   - Monitor weight data quality
   - Track messaging usage and performance
   - Gather user feedback for improvements

## Support

If you encounter any issues during implementation:

1. Check the troubleshooting section above
2. Review the console logs for error messages
3. Verify all environment variables are set correctly
4. Test with a fresh database if needed

For additional support, refer to the main README.md and other documentation files in the project.
