# Database Schema Connections - SmartTrack Logistics

## Overview

This document ensures all data points in the application are properly linked to the **ENHANCED** database schema with international shipping features.

## Core Tables and Relationships (Enhanced Schema)

### 1. **Customers Table** (`customers`)

- **Primary Key**: `customer_id` (UUID)
- **Foreign Keys**:
  - `user_id` → `auth.users(id)` (for user account linking)
- **Key Fields**:
  - `first_name`, `last_name`, `phone` (unique)
  - `destination`, `price`
  - **International Shipping Fields**:
    - `origin_country` (default: 'Nigeria')
    - `destination_country`, `destination_city`
    - `shipping_region`, `customs_declaration`
    - `special_instructions`
  - `date_of_packaging`, `created_at`, `updated_at`

### 2. **Boxes Table** (`boxes`)

- **Primary Key**: `box_id` (UUID)
- **Foreign Keys**:
  - `customer_id` → `customers(customer_id)` ON DELETE CASCADE
- **Key Fields**:
  - `content`, `quantity`, `status` (parcel_status enum)
  - `destination`, `qr_code_url`, `photo_url`
  - **Weight Tracking**: `weight_kg` (decimal)
  - **International Shipping Fields**:
    - `origin_country` (default: 'Nigeria')
    - `destination_country`, `destination_city`
    - `shipping_region`, `shipping_method`
    - `customs_status`, `international_tracking_number`
    - `customs_declaration`, `special_instructions`
  - `date_packed`, `created_at`, `updated_at`

### 3. **Sacks Table** (`sacks`)

- **Primary Key**: `sack_id` (UUID)
- **Foreign Keys**:
  - `customer_id` → `customers(customer_id)` ON DELETE CASCADE
- **Key Fields**:
  - `content`, `quantity`, `status` (parcel_status enum)
  - `destination`, `qr_code_url`, `photo_url`
  - **Weight Tracking**: `weight_kg` (decimal)
  - **International Shipping Fields**:
    - `origin_country` (default: 'Nigeria')
    - `destination_country`, `destination_city`
    - `shipping_region`, `shipping_method`
    - `customs_status`, `international_tracking_number`
    - `customs_declaration`, `special_instructions`
  - `date_packed`, `created_at`, `updated_at`

### 4. **Scan History Table** (`scan_history`)

- **Primary Key**: `scan_id` (UUID)
- **Foreign Keys**:
  - `box_id` → `boxes(box_id)` ON DELETE CASCADE
  - `sack_id` → `sacks(sack_id)` ON DELETE CASCADE
- **Key Fields**:
  - `scan_time`, `scan_location` (POINT)
  - `status_message`, `photo_url`
  - `estimated_delivery`, `comment`
  - `sent_message`, `message_language`

### 5. **User Accounts Table** (`user_accounts`)

- **Primary Key**: `user_id` (UUID)
- **Key Fields**:
  - `username` (unique), `hashed_password`
  - `role` (user_role enum: 'admin', 'warehouse_staff', 'customer')
  - `email` (unique), `phone`, `name`
  - `created_at`, `updated_at`

### 6. **Messages Table** (`messages`)

- **Primary Key**: `message_id` (UUID)
- **Foreign Keys**:
  - `senderid` → `user_accounts(user_id)` ON DELETE CASCADE
  - `recipientid` → `user_accounts(user_id)` ON DELETE CASCADE
  - `customer_id` → `customers(customer_id)`
- **Key Fields**:
  - `parcelid` (UUID - references either box_id or sack_id)
  - `content`, `message_type`, `language`
  - `delivery_channel`, `status`
  - `file_url`, `file_name`
  - `recipient_type` (default: 'customer')
  - `createdat`, `updatedat`

### 7. **Company Settings Table** (`company_settings`)

- **Primary Key**: `company_id` (UUID)
- **Key Fields**:
  - `company_name`, `logo_url`
  - `contact_email`, `support_phone`
  - `terms_of_use`, `privacy_policy`
  - Communication settings: `enable_whatsapp`, `enable_messaging`, `enable_email`
  - `preferred_languages` (array)

## Application Component Connections

### 1. **Dashboard Component**

- **Data Sources**:
  - `getDashboardStats()` → Aggregates data from `boxes`, `sacks`, `customers`, `user_accounts`
  - `getRecentParcels()` → Fetches recent `boxes` and `sacks` with customer data
- **Key Relationships**:
  - Parcel status tracking via `status` field
  - Customer information via `customer_id` foreign key
  - **Weight calculations** via `weight_kg` field
  - **International shipping data** via enhanced fields

### 2. **Communication Center Component**

- **Data Sources**:
  - `getAllParcels()` → Fetches `boxes` and `sacks` with comprehensive customer data
  - `getUsers()` → Fetches `user_accounts` for staff communication
  - `getMessagesForParcel()` → Fetches `messages` for specific parcels
  - `getScanHistoryForParcel()` → Fetches `scan_history` for parcel timeline
- **Key Relationships**:
  - Staff filtering via `role = 'warehouse_staff'`
  - Message threading via `parcelid` and `senderid`/`recipientid`
  - Customer contact via `customers.phone`
  - **International shipping information** via enhanced fields

### 3. **Admin Panel Component**

- **Data Sources**:
  - `getUsers()` → Fetches `user_accounts` for user management
  - `getCompanySettings()` → Fetches `company_settings`
- **Key Relationships**:
  - User role management via `role` field
  - Company configuration via `company_settings`

### 4. **Scan & Log Component**

- **Data Sources**:
  - `createScanRecord()` → Inserts into `scan_history`
  - `updateBoxStatus()` / `updateSackStatus()` → Updates parcel status
- **Key Relationships**:
  - Scan tracking via `box_id`/`sack_id` foreign keys
  - Status updates via `status` field

### 5. **Map Tracker Component**

- **Data Sources**:
  - `getAllParcels()` → Fetches parcels with location data
  - `getScanHistory()` → Fetches scan locations
- **Key Relationships**:
  - Location tracking via `scan_location` (POINT)
  - Status visualization via `status` field

### 6. **International Shipping Analytics Component**

- **Data Sources**:
  - `getInternationalShippingAnalytics()` → Uses `international_shipping_analytics` view
  - `getShippingStatsByRegion()` → Regional shipping statistics
  - `getShippingStatsByMethod()` → Shipping method statistics
  - `getTopDestinations()` → Popular destination analysis
- **Key Relationships**:
  - **International shipping data** via enhanced fields
  - **Regional analysis** via `shipping_region`
  - **Method analysis** via `shipping_method`
  - **Destination tracking** via `destination_country`/`destination_city`

## Database Functions and Views

### 1. **Analytics Views**

- `international_shipping_analytics` → Aggregates shipping data from boxes and sacks
- `get_shipping_stats_by_region()` → Regional shipping statistics
- `get_shipping_stats_by_method()` → Shipping method statistics
- `get_top_destinations()` → Popular destination analysis

### 2. **Utility Functions**

- `set_shipping_region()` → Automatically sets shipping region and method based on destination
- `generate_qr_code_url()` → Generates QR codes for parcels
- `update_updated_at_column()` → Maintains `updated_at` timestamps
- `set_message_created_at()` → Sets message creation timestamps

### 3. **Triggers**

- `set_boxes_shipping_info` → Auto-sets shipping info for boxes
- `set_sacks_shipping_info` → Auto-sets shipping info for sacks
- `set_customers_shipping_info` → Auto-sets shipping info for customers
- `update_updated_at_column()` → Updates timestamps on all tables
- `set_message_created_at_trigger()` → Sets message creation time

## Data Integrity and Constraints

### 1. **Foreign Key Constraints**

- All parcel tables reference `customers(customer_id)`
- Scan history references both `boxes` and `sacks`
- Messages reference both `user_accounts` and `customers`
- Customers can link to `auth.users` via `user_id`

### 2. **Unique Constraints**

- `customers.phone` → Unique phone numbers
- `user_accounts.username` → Unique usernames
- `user_accounts.email` → Unique email addresses

### 3. **Enum Constraints**

- `parcel_status` → 'packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned'
- `user_role` → 'admin', 'warehouse_staff', 'customer'
- `message_language` → 'en', 'fr', 'yo', 'es'

## Row Level Security (RLS)

- All tables have RLS enabled
- Policies ensure authenticated access
- Role-based access control implemented
- Special message policies for sender/recipient access

## Indexes for Performance

- Foreign key indexes on all relationship fields
- Status indexes for quick filtering
- **Weight indexes** for analytics (`weight_kg`)
- **Destination indexes** for international shipping (`destination_country`, `shipping_region`)
- **Shipping method indexes** for analytics (`shipping_method`, `customs_status`)
- Phone and email indexes for user lookup
- Scan time indexes for history queries

## Recent Updates Applied

1. ✅ **MIGRATION**: Created `add_missing_fields_to_original_schema.sql` migration script
2. ✅ **ENHANCED**: Updated `getAllParcels()` to include international shipping fields
3. ✅ **ENHANCED**: Updated `getDashboardStats()` to include weight calculations
4. ✅ **ENHANCED**: Updated `getRecentParcels()` to include enhanced fields
5. ✅ **ADDED**: `getInternationalShippingAnalytics()` function
6. ✅ **ADDED**: `getShippingStatsByRegion()` function
7. ✅ **ADDED**: `getShippingStatsByMethod()` function
8. ✅ **ADDED**: `getTopDestinations()` function
9. ✅ Enhanced `getUsers()` with better error handling
10. ✅ Added `getMessagesForParcel()` for communication features
11. ✅ Added `getScanHistoryForParcel()` for timeline features
12. ✅ Improved error handling across all database functions
13. ✅ Added comprehensive logging for debugging

## Schema Enhancement Features

### **New Fields Added:**

#### **Customers Table:**

- `user_id` → Links to Supabase Auth users
- `origin_country` → Default: 'Nigeria'
- `destination_country` → International destination
- `destination_city` → Specific city
- `shipping_region` → Auto-calculated region
- `customs_declaration` → Customs information
- `special_instructions` → Special handling notes

#### **Boxes & Sacks Tables:**

- `weight_kg` → Weight tracking (decimal)
- `origin_country` → Default: 'Nigeria'
- `destination_country` → International destination
- `destination_city` → Specific city
- `shipping_region` → Auto-calculated region
- `shipping_method` → Auto-determined method (Air/Sea/Mixed)
- `customs_status` → Customs clearance status
- `international_tracking_number` → International tracking
- `customs_declaration` → Customs information
- `special_instructions` → Special handling notes

#### **User Accounts Table:**

- `name` → Full name field

#### **Messages Table:**

- `recipient_type` → Type of recipient
- `customer_id` → Direct customer reference

### **Automatic Features:**

- **Auto Region Detection**: Based on destination country
- **Auto Shipping Method**: Air for developed countries, Sea for others
- **Weight Tracking**: Comprehensive weight calculations
- **International Analytics**: Regional and method-based statistics

## Migration Instructions

1. **Run the migration script**: `add_missing_fields_to_original_schema.sql`
2. **Verify the migration**: Check that all new fields are added
3. **Test the functionality**: All components should now work with enhanced features
4. **Optional**: Add sample international shipping data for testing

## Verification Checklist

- [x] All component data sources mapped to **ENHANCED** database tables
- [x] Foreign key relationships properly established
- [x] Enum types match application expectations
- [x] Indexes created for performance (including new fields)
- [x] RLS policies configured
- [x] Error handling implemented
- [x] Logging added for debugging
- [x] **ENHANCED**: International shipping analytics functions created
- [x] **ENHANCED**: Weight tracking functionality added
- [x] **ENHANCED**: Regional and method-based analytics
- [x] Communication features linked to database
- [x] Timeline features linked to scan history
- [x] User management linked to user_accounts
- [x] Company settings linked to configuration
- [x] **MIGRATION**: Schema upgrade script created and ready
