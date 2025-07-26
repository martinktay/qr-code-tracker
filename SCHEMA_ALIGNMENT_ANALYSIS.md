# Supabase Schema Alignment Analysis

## Overview

This document analyzes the alignment between the original `supabase_schema.sql` and all subsequent updates, including the international shipping features and dashboard analytics fixes.

## Original Schema vs. Current State

### 1. Core Tables Comparison

#### Customers Table

**Original Schema:**

```sql
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_of_packaging TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from updates:

-- From fix_dashboard_analytics.sql:
user_id UUID REFERENCES auth.users(id)

-- From international_shipping_schema.sql:
origin_country VARCHAR(100) DEFAULT 'Nigeria'
destination_country VARCHAR(100)
destination_city VARCHAR(100)
shipping_region VARCHAR(50)
customs_declaration TEXT
special_instructions TEXT
```

#### Boxes Table

**Original Schema:**

```sql
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from updates:

-- From fix_dashboard_analytics.sql:
weight_kg DECIMAL(10,2) DEFAULT 0

-- From international_shipping_schema.sql:
origin_country VARCHAR(100) DEFAULT 'Nigeria'
destination_country VARCHAR(100)
destination_city VARCHAR(100)
shipping_region VARCHAR(50)
shipping_method VARCHAR(20)
customs_status VARCHAR(50)
international_tracking_number VARCHAR(100)
customs_declaration TEXT
special_instructions TEXT
```

#### Sacks Table

**Original Schema:**

```sql
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from updates:

-- From fix_dashboard_analytics.sql:
weight_kg DECIMAL(10,2) DEFAULT 0

-- From international_shipping_schema.sql:
origin_country VARCHAR(100) DEFAULT 'Nigeria'
destination_country VARCHAR(100)
destination_city VARCHAR(100)
shipping_region VARCHAR(50)
shipping_method VARCHAR(20)
customs_status VARCHAR(50)
international_tracking_number VARCHAR(100)
customs_declaration TEXT
special_instructions TEXT
```

#### Scan History Table

**Original Schema:**

```sql
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from international_shipping_schema.sql:
customs_checkpoint VARCHAR(100)
international_location VARCHAR(100)
customs_notes TEXT
shipping_carrier VARCHAR(100)
carrier_tracking_number VARCHAR(100)
```

#### User Accounts Table

**Original Schema:**

```sql
CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from fix_dashboard_analytics.sql:
name VARCHAR(255)
-- Note: phone and updated_at were already in original schema
```

#### Messages Table

**Original Schema:**

```sql
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
    file_name TEXT
);
```

**Current Schema (After Updates):**

```sql
-- Original fields remain the same
-- PLUS additional fields from fix_dashboard_analytics.sql:
recipient_type VARCHAR(20) DEFAULT 'customer'
customer_id UUID REFERENCES customers(customer_id)
```

### 2. New Database Objects Added

#### Views

- `international_shipping_analytics` - Combined view of boxes and sacks with customer data

#### Functions

- `set_shipping_region()` - Automatically sets shipping region and method based on destination
- `get_shipping_stats_by_region()` - Returns shipping statistics grouped by region
- `get_shipping_stats_by_method()` - Returns shipping statistics grouped by shipping method
- `get_top_destinations(limit_count)` - Returns top destinations with shipment counts

#### Triggers

- `set_boxes_shipping_info` - Automatically populates shipping region and method for boxes
- `set_sacks_shipping_info` - Automatically populates shipping region and method for sacks
- `set_customers_shipping_info` - Automatically populates shipping region for customers

#### Indexes Added

- `idx_boxes_destination_country`
- `idx_boxes_shipping_region`
- `idx_boxes_shipping_method`
- `idx_boxes_customs_status`
- `idx_sacks_destination_country`
- `idx_sacks_shipping_region`
- `idx_sacks_shipping_method`
- `idx_sacks_customs_status`
- `idx_customers_destination_country`
- `idx_customers_shipping_region`
- `idx_boxes_weight`
- `idx_sacks_weight`
- `idx_user_accounts_role`

### 3. RLS Policy Changes

**Original Schema:** Had basic RLS policies for messages only

**Current Schema:** Comprehensive RLS policies for all tables:

- `customers` - Read access for all, write access for authenticated users
- `boxes` - Read access for all, write access for authenticated users
- `sacks` - Read access for all, write access for authenticated users
- `scan_history` - Read access for all, write access for authenticated users
- `user_accounts` - Read access for all, write access for authenticated users
- `company_settings` - Read access for all, write access for authenticated users
- `messages` - Read access for all, write access for authenticated users

### 4. Data Integrity and Constraints

#### Weight Tracking

- Added `weight_kg` field to both `boxes` and `sacks` tables
- Default value of 0 for existing records
- Indexes created for performance

#### International Shipping

- Comprehensive country and region mapping
- Automatic shipping method determination
- Customs status tracking
- International tracking number support

#### User Management

- Enhanced user account fields
- Better customer-user relationship tracking
- Improved messaging system with recipient types

## Recommendations

### 1. Schema Consolidation

Create a single, comprehensive schema file that includes all current fields and objects:

```sql
-- Create a new file: complete_schema.sql
-- Include all original tables with all added fields
-- Include all new views, functions, triggers, and indexes
-- Include all RLS policies
```

### 2. Migration Script

Create a migration script to update existing databases:

```sql
-- Create a new file: migration_to_complete_schema.sql
-- Use IF NOT EXISTS clauses for all ALTER TABLE statements
-- Include all new database objects
-- Handle data migration for new fields
```

### 3. Validation Queries

Create validation queries to ensure schema integrity:

```sql
-- Verify all required columns exist
-- Check that all indexes are created
-- Validate RLS policies are active
-- Test function and trigger functionality
```

### 4. Documentation Updates

- Update API documentation to reflect new fields
- Update frontend form validation
- Update data models in application code

## Current Status: ✅ ALIGNED

The schema is currently well-aligned with all updates properly integrated. The main recommendation is to create a consolidated schema file for easier deployment and maintenance.
