-- Setup Test Users for SmartTrack Logistics
-- This script creates test users for Warehouse, Customer, and Admin roles

-- Add weight_kg columns to boxes and sacks tables if they don't exist
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2);
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2);

-- First, ensure the user_accounts table exists and has the correct structure
CREATE TABLE IF NOT EXISTS user_accounts (
    user_id UUID PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert test users
-- Note: These are test users with simple passwords for testing purposes
-- In production, passwords should be properly hashed

INSERT INTO user_accounts (user_id, username, hashed_password, role, email, phone) VALUES
    -- Warehouse User
    (
        gen_random_uuid(),
        'warehouse_user',
        'warehouse123', -- In production, this should be hashed
        'warehouse_staff',
        'warehouse@smartexporters.com',
        '+1234567890'
    ),
    -- Customer User
    (
        gen_random_uuid(),
        'customer_user',
        'customer123', -- In production, this should be hashed
        'customer',
        'customer@smartexporters.com',
        '+1987654321'
    )
ON CONFLICT (email) DO UPDATE SET
    username = EXCLUDED.username,
    hashed_password = EXCLUDED.hashed_password,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- Create test customers for parcel registration
INSERT INTO customers (first_name, last_name, phone, destination, price) VALUES
    ('John', 'Doe', '+1234567890', 'New York, USA', 150.00),
    ('Jane', 'Smith', '+1987654321', 'Los Angeles, USA', 200.00),
    ('Carlos', 'Rodriguez', '+1555123456', 'Miami, USA', 120.00),
    ('Sarah', 'Johnson', '+1444567890', 'Chicago, USA', 180.00)
ON CONFLICT (phone) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    destination = EXCLUDED.destination,
    price = EXCLUDED.price;

-- Create sample boxes for testing
INSERT INTO boxes (customer_id, content, destination, status, qr_code_url, weight_kg) 
SELECT 
    c.customer_id,
    'Electronics (Laptop, Phone, Accessories)',
    'New York, USA',
    'packed',
    'https://smartexporters.com/track/box/' || gen_random_uuid(),
    5.5
FROM customers c 
WHERE c.phone = '+1234567890'
ON CONFLICT DO NOTHING;

INSERT INTO boxes (customer_id, content, destination, status, qr_code_url, weight_kg)
SELECT 
    c.customer_id,
    'Clothing (Dresses, Shoes, Accessories)',
    'Los Angeles, USA',
    'in_transit',
    'https://smartexporters.com/track/box/' || gen_random_uuid(),
    3.2
FROM customers c 
WHERE c.phone = '+1987654321'
ON CONFLICT DO NOTHING;

-- Create sample sacks for testing
INSERT INTO sacks (customer_id, content, destination, status, qr_code_url, weight_kg)
SELECT 
    c.customer_id,
    'Documents (Contracts, Papers, Files)',
    'Miami, USA',
    'out_for_delivery',
    'https://smartexporters.com/track/sack/' || gen_random_uuid(),
    1.8
FROM customers c 
WHERE c.phone = '+1555123456'
ON CONFLICT DO NOTHING;

INSERT INTO sacks (customer_id, content, destination, status, qr_code_url, weight_kg)
SELECT 
    c.customer_id,
    'Books (Textbooks, Novels, Magazines)',
    'Chicago, USA',
    'delivered',
    'https://smartexporters.com/track/sack/' || gen_random_uuid(),
    4.1
FROM customers c 
WHERE c.phone = '+1444567890'
ON CONFLICT DO NOTHING;

-- Create sample scan history for testing
INSERT INTO scan_history (box_id, status, status_message, scan_location, comment, scan_time)
SELECT 
    b.box_id,
    'packed',
    'Package packed at warehouse',
    '(40.7128,-74.0060)',
    'Package in good condition',
    NOW() - INTERVAL '2 days'
FROM boxes b
JOIN customers c ON b.customer_id = c.customer_id
WHERE c.phone = '+1234567890'
ON CONFLICT DO NOTHING;

INSERT INTO scan_history (box_id, status, status_message, scan_location, comment, scan_time)
SELECT 
    b.box_id,
    'in_transit',
    'Package picked up by courier',
    '(40.7128,-74.0060)',
    'On route to destination',
    NOW() - INTERVAL '1 day'
FROM boxes b
JOIN customers c ON b.customer_id = c.customer_id
WHERE c.phone = '+1234567890'
ON CONFLICT DO NOTHING;

INSERT INTO scan_history (box_id, status, status_message, scan_location, comment, scan_time)
SELECT 
    b.box_id,
    'out_for_delivery',
    'Out for delivery',
    '(40.7128,-74.0060)',
    'Final delivery attempt',
    NOW()
FROM boxes b
JOIN customers c ON b.customer_id = c.customer_id
WHERE c.phone = '+1234567890'
ON CONFLICT DO NOTHING;

-- Verify the setup
SELECT 'Test Users Created:' as info;
SELECT username, email, role FROM user_accounts WHERE email LIKE '%@smartexporters.com';

SELECT 'Test Customers Created:' as info;
SELECT first_name, last_name, phone, destination FROM customers;

SELECT 'Test Parcels Created:' as info;
SELECT 
    'Box' as type,
    b.box_id,
    c.first_name || ' ' || c.last_name as customer,
    b.content,
    b.status
FROM boxes b
JOIN customers c ON b.customer_id = c.customer_id
UNION ALL
SELECT 
    'Sack' as type,
    s.sack_id,
    c.first_name || ' ' || c.last_name as customer,
    s.content,
    s.status
FROM sacks s
JOIN customers c ON s.customer_id = c.customer_id;

SELECT 'Test Scan History Created:' as info;
SELECT COUNT(*) as total_scans FROM scan_history;

-- Display login credentials
SELECT 'Login Credentials:' as info;
SELECT 
    'Warehouse User' as user_type,
    'warehouse@smartexporters.com' as email,
    'warehouse123' as password
UNION ALL
SELECT 
    'Customer User' as user_type,
    'customer@smartexporters.com' as email,
    'customer123' as password;

-- Success message
SELECT 'Test data setup completed successfully!' as status; 