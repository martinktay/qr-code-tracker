-- SmartTrack Seed Data
-- Simple test data for the logistics platform

-- Insert Company Settings
INSERT INTO company_settings (
    company_name,
    contact_email,
    support_phone,
    terms_of_use,
    privacy_policy,
    enable_whatsapp,
    enable_messaging,
    enable_email,
    preferred_languages
) VALUES (
    'The Smart Exporters',
    'info@smartexporters.com',
    '+234-801-234-5678',
    'Terms of Service for Smart Exporters Logistics Platform...',
    'Privacy Policy for Smart Exporters Logistics Platform...',
    true,
    true,
    true,
    ARRAY['en', 'fr', 'yo', 'es']
) ON CONFLICT DO NOTHING;

-- Insert User Accounts (including admin)
INSERT INTO user_accounts (user_id, username, email, role, hashed_password, created_at) VALUES
-- Admin User (for testing)
(uuid_generate_v4(), 'admin', 'admin@smartexporters.com', 'admin', 'dummy_hash', NOW()),
-- Warehouse Staff
(uuid_generate_v4(), 'warehouse1', 'warehouse1@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
-- Customers
(uuid_generate_v4(), 'customer1', 'customer1@example.com', 'customer', 'dummy_hash', NOW());

-- Insert Customers
INSERT INTO customers (customer_id, first_name, last_name, phone, destination, price, date_of_packaging) VALUES
(uuid_generate_v4(), 'John', 'Smith', '+234-801-111-1111', 'Lagos, Nigeria', 15000.00, '2024-01-15'),
(uuid_generate_v4(), 'Maria', 'Garcia', '+234-801-111-1112', 'Abuja, Nigeria', 22000.00, '2024-01-16'),
(uuid_generate_v4(), 'Ahmed', 'Hassan', '+234-801-111-1113', 'Kano, Nigeria', 18000.00, '2024-01-17');

-- Insert Boxes
INSERT INTO boxes (box_id, customer_id, content, quantity, date_packed, status, destination, qr_code_url) 
SELECT 
    uuid_generate_v4(),
    c.customer_id,
    'Electronics and Gadgets',
    2,
    NOW() - INTERVAL '1 day',
    'packed',
    c.destination,
    'https://smartexporters.com/qr/' || uuid_generate_v4()
FROM customers c
LIMIT 3;

-- Insert Scan History
INSERT INTO scan_history (scan_id, box_id, scan_time, scan_location, status_message, photo_url, estimated_delivery, comment, sent_message, message_language)
SELECT 
    uuid_generate_v4(),
    b.box_id,
    NOW() - INTERVAL '1 hour',
    point(3.3792, 6.5244), -- Lagos coordinates
    'Package received and processed',
    'https://example.com/photos/scan_1.jpg',
    NOW() + INTERVAL '3 days',
    'Package in good condition',
    'Your package has been received and is being processed',
    'en'
FROM boxes b
LIMIT 3;

-- Display summary
SELECT 
    'Seed Data Summary' as info,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM boxes) as total_boxes,
    (SELECT COUNT(*) FROM scan_history) as total_scans,
    (SELECT COUNT(*) FROM user_accounts) as total_users;

-- Display admin credentials
SELECT 
    'ADMIN LOGIN CREDENTIALS' as info,
    username,
    email,
    role
FROM user_accounts 
WHERE role = 'admin'; 