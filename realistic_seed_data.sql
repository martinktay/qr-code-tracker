-- Realistic Seed Data for SmartTrack Application
-- This script creates comprehensive test data with Nigerian names and international destinations

-- Clear existing data (if any)
TRUNCATE TABLE scan_history CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE boxes CASCADE;
TRUNCATE TABLE sacks CASCADE;
TRUNCATE TABLE customers CASCADE;
TRUNCATE TABLE user_accounts CASCADE;
TRUNCATE TABLE company_settings CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS customers_customer_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS boxes_box_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS sacks_sack_id_seq RESTART WITH 1;

-- Insert realistic Nigerian customers
INSERT INTO customers (first_name, last_name, phone, destination, price, origin_country, destination_country, destination_city, shipping_region, shipping_method) VALUES
-- African Destinations
('Adebayo', 'Okechukwu', '+2348012345678', 'Lagos, Nigeria', 15000.00, 'Nigeria', 'Nigeria', 'Lagos', 'Africa', 'Land'),
('Fatima', 'Bello', '+2348023456789', 'Accra, Ghana', 25000.00, 'Nigeria', 'Ghana', 'Accra', 'Africa', 'Sea'),
('Chukwudi', 'Eze', '+2348034567890', 'Nairobi, Kenya', 35000.00, 'Nigeria', 'Kenya', 'Nairobi', 'Africa', 'Sea'),
('Aisha', 'Mohammed', '+2348045678901', 'Cairo, Egypt', 45000.00, 'Nigeria', 'Egypt', 'Cairo', 'Africa', 'Sea'),
('Emeka', 'Nwankwo', '+2348056789012', 'Johannesburg, South Africa', 55000.00, 'Nigeria', 'South Africa', 'Johannesburg', 'Africa', 'Sea'),

-- European Destinations
('Chioma', 'Okonkwo', '+2348067890123', 'London, UK', 75000.00, 'Nigeria', 'UK', 'London', 'Europe', 'Air'),
('Hassan', 'Yusuf', '+2348078901234', 'Berlin, Germany', 85000.00, 'Nigeria', 'Germany', 'Berlin', 'Europe', 'Air'),
('Blessing', 'Adebayo', '+2348089012345', 'Paris, France', 95000.00, 'Nigeria', 'France', 'Paris', 'Europe', 'Air'),
('Kemi', 'Adeleke', '+2348090123456', 'Madrid, Spain', 65000.00, 'Nigeria', 'Spain', 'Madrid', 'Europe', 'Air'),
('Tunde', 'Oluwaseun', '+2348101234567', 'Amsterdam, Netherlands', 70000.00, 'Nigeria', 'Netherlands', 'Amsterdam', 'Europe', 'Air'),

-- North American Destinations
('Zainab', 'Abdullahi', '+2348112345678', 'New York, USA', 120000.00, 'Nigeria', 'USA', 'New York', 'North America', 'Air'),
('Oluwaseun', 'Adebisi', '+2348123456789', 'Toronto, Canada', 110000.00, 'Nigeria', 'Canada', 'Toronto', 'North America', 'Air'),
('Amina', 'Hassan', '+2348134567890', 'Los Angeles, USA', 130000.00, 'Nigeria', 'USA', 'Los Angeles', 'North America', 'Air'),
('Kemi', 'Oluwaseun', '+2348145678901', 'Chicago, USA', 125000.00, 'Nigeria', 'USA', 'Chicago', 'North America', 'Air'),
('Tunde', 'Adebayo', '+2348156789012', 'Vancouver, Canada', 115000.00, 'Nigeria', 'Canada', 'Vancouver', 'North America', 'Air'),

-- Asian Destinations
('Chioma', 'Eze', '+2348167890123', 'Dubai, UAE', 80000.00, 'Nigeria', 'UAE', 'Dubai', 'Asia', 'Air'),
('Adebayo', 'Mohammed', '+2348178901234', 'Singapore', 90000.00, 'Nigeria', 'Singapore', 'Singapore', 'Asia', 'Air'),
('Fatima', 'Okechukwu', '+2348189012345', 'Hong Kong', 95000.00, 'Nigeria', 'Hong Kong', 'Hong Kong', 'Asia', 'Air'),
('Chukwudi', 'Bello', '+2348190123456', 'Tokyo, Japan', 140000.00, 'Nigeria', 'Japan', 'Tokyo', 'Asia', 'Air'),
('Aisha', 'Nwankwo', '+2348201234567', 'Seoul, South Korea', 135000.00, 'Nigeria', 'South Korea', 'Seoul', 'Asia', 'Air'),

-- Oceania Destinations
('Emeka', 'Adebisi', '+2348212345678', 'Sydney, Australia', 160000.00, 'Nigeria', 'Australia', 'Sydney', 'Oceania', 'Air'),
('Blessing', 'Hassan', '+2348223456789', 'Melbourne, Australia', 155000.00, 'Nigeria', 'Australia', 'Melbourne', 'Oceania', 'Air'),
('Kemi', 'Yusuf', '+2348234567890', 'Auckland, New Zealand', 145000.00, 'Nigeria', 'New Zealand', 'Auckland', 'Oceania', 'Air'),

-- Additional African Destinations
('Hassan', 'Okonkwo', '+2348245678901', 'Dakar, Senegal', 20000.00, 'Nigeria', 'Senegal', 'Dakar', 'Africa', 'Sea'),
('Chioma', 'Abdullahi', '+2348256789012', 'Casablanca, Morocco', 30000.00, 'Nigeria', 'Morocco', 'Casablanca', 'Africa', 'Sea'),
('Tunde', 'Eze', '+2348267890123', 'Addis Ababa, Ethiopia', 40000.00, 'Nigeria', 'Ethiopia', 'Addis Ababa', 'Africa', 'Sea');

-- Insert user accounts for staff and admin
INSERT INTO user_accounts (username, hashed_password, role, email, phone, name) VALUES
-- Admin users
('admin@smartexporters.com', crypt('admin123', gen_salt('bf')), 'admin', 'admin@smartexporters.com', '+2348000000001', 'Admin Manager'),
('supervisor@smartexporters.com', crypt('super123', gen_salt('bf')), 'admin', 'supervisor@smartexporters.com', '+2348000000002', 'Supervisor Admin'),

-- Warehouse staff
('warehouse1@smartexporters.com', crypt('ware123', gen_salt('bf')), 'warehouse_staff', 'warehouse1@smartexporters.com', '+2348000000003', 'Warehouse Staff 1'),
('warehouse2@smartexporters.com', crypt('ware123', gen_salt('bf')), 'warehouse_staff', 'warehouse2@smartexporters.com', '+2348000000004', 'Warehouse Staff 2'),
('warehouse3@smartexporters.com', crypt('ware123', gen_salt('bf')), 'warehouse_staff', 'warehouse3@smartexporters.com', '+2348000000005', 'Warehouse Staff 3'),

-- Customer accounts (linked to customers)
('adebayo.okechukwu@email.com', crypt('customer123', gen_salt('bf')), 'customer', 'adebayo.okechukwu@email.com', '+2348012345678', 'Adebayo Okechukwu'),
('fatima.bello@email.com', crypt('customer123', gen_salt('bf')), 'customer', 'fatima.bello@email.com', '+2348023456789', 'Fatima Bello'),
('chukwudi.eze@email.com', crypt('customer123', gen_salt('bf')), 'customer', 'chukwudi.eze@email.com', '+2348034567890', 'Chukwudi Eze'),
('aisha.mohammed@email.com', crypt('customer123', gen_salt('bf')), 'customer', 'aisha.mohammed@email.com', '+2348045678901', 'Aisha Mohammed'),
('emeka.nwankwo@email.com', crypt('customer123', gen_salt('bf')), 'customer', 'emeka.nwankwo@email.com', '+2348056789012', 'Emeka Nwankwo');

-- Update customers with user_id references
UPDATE customers SET user_id = (SELECT user_id FROM user_accounts WHERE email = 'adebayo.okechukwu@email.com') WHERE phone = '+2348012345678';
UPDATE customers SET user_id = (SELECT user_id FROM user_accounts WHERE email = 'fatima.bello@email.com') WHERE phone = '+2348023456789';
UPDATE customers SET user_id = (SELECT user_id FROM user_accounts WHERE email = 'chukwudi.eze@email.com') WHERE phone = '+2348034567890';
UPDATE customers SET user_id = (SELECT user_id FROM user_accounts WHERE email = 'aisha.mohammed@email.com') WHERE phone = '+2348045678901';
UPDATE customers SET user_id = (SELECT user_id FROM user_accounts WHERE email = 'emeka.nwankwo@email.com') WHERE phone = '+2348056789012';

-- Insert realistic boxes with varied content and weights
INSERT INTO boxes (customer_id, content, quantity, status, destination, weight_kg, qr_code_url, photo_url, origin_country, destination_country, destination_city, shipping_region, shipping_method, customs_status, international_tracking_number) VALUES
-- Packed boxes
((SELECT customer_id FROM customers WHERE phone = '+2348012345678'), 'Traditional Nigerian fabrics and clothing', 5, 'packed', 'Lagos, Nigeria', 12.5, 'https://qr-code.com/box/001', 'https://photos.com/box/001.jpg', 'Nigeria', 'Nigeria', 'Lagos', 'Africa', 'Land', 'pending', 'NG-LAG-001'),
((SELECT customer_id FROM customers WHERE phone = '+2348023456789'), 'Handcrafted jewelry and accessories', 3, 'packed', 'Accra, Ghana', 8.2, 'https://qr-code.com/box/002', 'https://photos.com/box/002.jpg', 'Nigeria', 'Ghana', 'Accra', 'Africa', 'Sea', 'pending', 'NG-ACC-002'),
((SELECT customer_id FROM customers WHERE phone = '+2348034567890'), 'Traditional spices and seasonings', 10, 'packed', 'Nairobi, Kenya', 15.8, 'https://qr-code.com/box/003', 'https://photos.com/box/003.jpg', 'Nigeria', 'Kenya', 'Nairobi', 'Africa', 'Sea', 'pending', 'NG-NAI-003'),
((SELECT customer_id FROM customers WHERE phone = '+2348045678901'), 'Artisan crafts and sculptures', 2, 'packed', 'Cairo, Egypt', 22.1, 'https://qr-code.com/box/004', 'https://photos.com/box/004.jpg', 'Nigeria', 'Egypt', 'Cairo', 'Africa', 'Sea', 'pending', 'NG-CAI-004'),
((SELECT customer_id FROM customers WHERE phone = '+2348056789012'), 'Traditional musical instruments', 4, 'packed', 'Johannesburg, South Africa', 18.7, 'https://qr-code.com/box/005', 'https://photos.com/box/005.jpg', 'Nigeria', 'South Africa', 'Johannesburg', 'Africa', 'Sea', 'pending', 'NG-JHB-005'),

-- In Transit boxes
((SELECT customer_id FROM customers WHERE phone = '+2348067890123'), 'Premium Nigerian coffee beans', 8, 'in_transit', 'London, UK', 25.3, 'https://qr-code.com/box/006', 'https://photos.com/box/006.jpg', 'Nigeria', 'UK', 'London', 'Europe', 'Air', 'cleared', 'NG-LON-006'),
((SELECT customer_id FROM customers WHERE phone = '+2348078901234'), 'Traditional herbal medicines', 6, 'in_transit', 'Berlin, Germany', 19.8, 'https://qr-code.com/box/007', 'https://photos.com/box/007.jpg', 'Nigeria', 'Germany', 'Berlin', 'Europe', 'Air', 'cleared', 'NG-BER-007'),
((SELECT customer_id FROM customers WHERE phone = '+2348089012345'), 'Handwoven textiles and rugs', 7, 'in_transit', 'Paris, France', 31.2, 'https://qr-code.com/box/008', 'https://photos.com/box/008.jpg', 'Nigeria', 'France', 'Paris', 'Europe', 'Air', 'cleared', 'NG-PAR-008'),
((SELECT customer_id FROM customers WHERE phone = '+2348090123456'), 'Traditional pottery and ceramics', 3, 'in_transit', 'Madrid, Spain', 14.6, 'https://qr-code.com/box/009', 'https://photos.com/box/009.jpg', 'Nigeria', 'Spain', 'Madrid', 'Europe', 'Air', 'cleared', 'NG-MAD-009'),
((SELECT customer_id FROM customers WHERE phone = '+2348101234567'), 'Organic cocoa products', 12, 'in_transit', 'Amsterdam, Netherlands', 28.9, 'https://qr-code.com/box/010', 'https://photos.com/box/010.jpg', 'Nigeria', 'Netherlands', 'Amsterdam', 'Europe', 'Air', 'cleared', 'NG-AMS-010'),

-- Out for Delivery boxes
((SELECT customer_id FROM customers WHERE phone = '+2348112345678'), 'Premium leather goods and bags', 5, 'out_for_delivery', 'New York, USA', 16.4, 'https://qr-code.com/box/011', 'https://photos.com/box/011.jpg', 'Nigeria', 'USA', 'New York', 'North America', 'Air', 'cleared', 'NG-NYC-011'),
((SELECT customer_id FROM customers WHERE phone = '+2348123456789'), 'Traditional beadwork and jewelry', 9, 'out_for_delivery', 'Toronto, Canada', 11.7, 'https://qr-code.com/box/012', 'https://photos.com/box/012.jpg', 'Nigeria', 'Canada', 'Toronto', 'North America', 'Air', 'cleared', 'NG-TOR-012'),
((SELECT customer_id FROM customers WHERE phone = '+2348134567890'), 'Artisan wood carvings', 2, 'out_for_delivery', 'Los Angeles, USA', 35.8, 'https://qr-code.com/box/013', 'https://photos.com/box/013.jpg', 'Nigeria', 'USA', 'Los Angeles', 'North America', 'Air', 'cleared', 'NG-LAX-013'),

-- Delivered boxes
((SELECT customer_id FROM customers WHERE phone = '+2348145678901'), 'Traditional masks and artifacts', 4, 'delivered', 'Chicago, USA', 13.2, 'https://qr-code.com/box/014', 'https://photos.com/box/014.jpg', 'Nigeria', 'USA', 'Chicago', 'North America', 'Air', 'cleared', 'NG-CHI-014'),
((SELECT customer_id FROM customers WHERE phone = '+2348156789012'), 'Handcrafted furniture pieces', 1, 'delivered', 'Vancouver, Canada', 45.6, 'https://qr-code.com/box/015', 'https://photos.com/box/015.jpg', 'Nigeria', 'Canada', 'Vancouver', 'North America', 'Air', 'cleared', 'NG-VAN-015');

-- Insert realistic sacks with varied content and weights
INSERT INTO sacks (customer_id, content, quantity, status, destination, weight_kg, qr_code_url, photo_url, origin_country, destination_country, destination_city, shipping_region, shipping_method, customs_status, international_tracking_number) VALUES
-- Packed sacks
((SELECT customer_id FROM customers WHERE phone = '+2348167890123'), 'Bulk traditional spices and herbs', 20, 'packed', 'Dubai, UAE', 45.2, 'https://qr-code.com/sack/001', 'https://photos.com/sack/001.jpg', 'Nigeria', 'UAE', 'Dubai', 'Asia', 'Air', 'pending', 'NG-DXB-001'),
((SELECT customer_id FROM customers WHERE phone = '+2348178901234'), 'Raw cocoa beans and coffee', 15, 'packed', 'Singapore', 38.7, 'https://qr-code.com/sack/002', 'https://photos.com/sack/002.jpg', 'Nigeria', 'Singapore', 'Singapore', 'Asia', 'Air', 'pending', 'NG-SIN-002'),
((SELECT customer_id FROM customers WHERE phone = '+2348189012345'), 'Traditional grains and cereals', 25, 'packed', 'Hong Kong', 52.1, 'https://qr-code.com/sack/003', 'https://photos.com/sack/003.jpg', 'Nigeria', 'Hong Kong', 'Hong Kong', 'Asia', 'Air', 'pending', 'NG-HKG-003'),
((SELECT customer_id FROM customers WHERE phone = '+2348190123456'), 'Organic cotton and textiles', 12, 'packed', 'Tokyo, Japan', 28.9, 'https://qr-code.com/sack/004', 'https://photos.com/box/004.jpg', 'Nigeria', 'Japan', 'Tokyo', 'Asia', 'Air', 'pending', 'NG-TYO-004'),
((SELECT customer_id FROM customers WHERE phone = '+2348201234567'), 'Traditional medicinal herbs', 18, 'packed', 'Seoul, South Korea', 33.4, 'https://qr-code.com/sack/005', 'https://photos.com/sack/005.jpg', 'Nigeria', 'South Korea', 'Seoul', 'Asia', 'Air', 'pending', 'NG-SEL-005'),

-- In Transit sacks
((SELECT customer_id FROM customers WHERE phone = '+2348212345678'), 'Premium agricultural products', 30, 'in_transit', 'Sydney, Australia', 67.8, 'https://qr-code.com/sack/006', 'https://photos.com/sack/006.jpg', 'Nigeria', 'Australia', 'Sydney', 'Oceania', 'Air', 'cleared', 'NG-SYD-006'),
((SELECT customer_id FROM customers WHERE phone = '+2348223456789'), 'Traditional crafts and artifacts', 8, 'in_transit', 'Melbourne, Australia', 22.3, 'https://qr-code.com/sack/007', 'https://photos.com/sack/007.jpg', 'Nigeria', 'Australia', 'Melbourne', 'Oceania', 'Air', 'cleared', 'NG-MEL-007'),
((SELECT customer_id FROM customers WHERE phone = '+2348234567890'), 'Organic food products', 22, 'in_transit', 'Auckland, New Zealand', 41.5, 'https://qr-code.com/sack/008', 'https://photos.com/sack/008.jpg', 'Nigeria', 'New Zealand', 'Auckland', 'Oceania', 'Air', 'cleared', 'NG-AKL-008'),

-- Out for Delivery sacks
((SELECT customer_id FROM customers WHERE phone = '+2348245678901'), 'Traditional clothing and fabrics', 16, 'out_for_delivery', 'Dakar, Senegal', 35.7, 'https://qr-code.com/sack/009', 'https://photos.com/sack/009.jpg', 'Nigeria', 'Senegal', 'Dakar', 'Africa', 'Sea', 'cleared', 'NG-DKR-009'),
((SELECT customer_id FROM customers WHERE phone = '+2348256789012'), 'Handcrafted leather goods', 10, 'out_for_delivery', 'Casablanca, Morocco', 24.8, 'https://qr-code.com/sack/010', 'https://photos.com/sack/010.jpg', 'Nigeria', 'Morocco', 'Casablanca', 'Africa', 'Sea', 'cleared', 'NG-CAS-010'),

-- Delivered sacks
((SELECT customer_id FROM customers WHERE phone = '+2348267890123'), 'Traditional musical instruments', 6, 'delivered', 'Addis Ababa, Ethiopia', 18.9, 'https://qr-code.com/sack/011', 'https://photos.com/sack/011.jpg', 'Nigeria', 'Ethiopia', 'Addis Ababa', 'Africa', 'Sea', 'cleared', 'NG-ADD-011');

-- Insert scan history with realistic timestamps and locations
INSERT INTO scan_history (box_id, sack_id, scan_time, status_message, comment, photo_url, estimated_delivery, sent_message, message_language) VALUES
-- Box scan history
((SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-LAG-001'), NULL, NOW() - INTERVAL '2 days', 'Packed', 'Box packed and ready for local delivery', 'https://photos.com/scan/001.jpg', NOW() + INTERVAL '1 day', 'Your package has been packed and is ready for delivery', 'en'),
((SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-ACC-002'), NULL, NOW() - INTERVAL '5 days', 'Packed', 'International shipment prepared for Ghana', 'https://photos.com/scan/002.jpg', NOW() + INTERVAL '7 days', 'Your international package has been packed and will be shipped to Ghana', 'en'),
((SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-LON-006'), NULL, NOW() - INTERVAL '3 days', 'In Transit', 'Package cleared customs and in transit to UK', 'https://photos.com/scan/006.jpg', NOW() + INTERVAL '2 days', 'Your package has cleared customs and is in transit to London', 'en'),
((SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-NYC-011'), NULL, NOW() - INTERVAL '1 day', 'Out for Delivery', 'Package out for final delivery in New York', 'https://photos.com/scan/011.jpg', NOW() + INTERVAL '6 hours', 'Your package is out for delivery in New York', 'en'),
((SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-CHI-014'), NULL, NOW() - INTERVAL '1 week', 'Delivered', 'Package successfully delivered to customer', 'https://photos.com/scan/014.jpg', NOW() - INTERVAL '1 day', 'Your package has been successfully delivered', 'en'),

-- Sack scan history
((SELECT sack_id FROM sacks WHERE international_tracking_number = 'NG-DXB-001'), NULL, NOW() - INTERVAL '4 days', 'Packed', 'Bulk spices packed for UAE shipment', 'https://photos.com/scan/sack001.jpg', NOW() + INTERVAL '5 days', 'Your bulk shipment has been packed for Dubai', 'en'),
((SELECT sack_id FROM sacks WHERE international_tracking_number = 'NG-SYD-006'), NULL, NOW() - INTERVAL '2 days', 'In Transit', 'Agricultural products in transit to Australia', 'https://photos.com/scan/sack006.jpg', NOW() + INTERVAL '3 days', 'Your agricultural products are in transit to Sydney', 'en'),
((SELECT sack_id FROM sacks WHERE international_tracking_number = 'NG-DKR-009'), NULL, NOW() - INTERVAL '1 day', 'Out for Delivery', 'Traditional clothing out for delivery in Dakar', 'https://photos.com/scan/sack009.jpg', NOW() + INTERVAL '12 hours', 'Your traditional clothing is out for delivery in Dakar', 'en'),
((SELECT sack_id FROM sacks WHERE international_tracking_number = 'NG-ADD-011'), NULL, NOW() - INTERVAL '3 days', 'Delivered', 'Musical instruments delivered to Ethiopia', 'https://photos.com/scan/sack011.jpg', NOW() - INTERVAL '2 days', 'Your musical instruments have been delivered to Addis Ababa', 'en');

-- Insert sample messages between users
INSERT INTO messages (senderid, recipientid, parcelid, content, message_type, language, delivery_channel, status, file_url, file_name, recipient_type, customer_id) VALUES
-- Admin to Warehouse Staff
((SELECT user_id FROM user_accounts WHERE email = 'admin@smartexporters.com'), 
 (SELECT user_id FROM user_accounts WHERE email = 'warehouse1@smartexporters.com'), 
 NULL, 'Please prioritize the UK shipments today', 'text', 'en', 'in-app', 'sent', NULL, NULL, 'user', NULL),

-- Warehouse Staff to Admin
((SELECT user_id FROM user_accounts WHERE email = 'warehouse1@smartexporters.com'), 
 (SELECT user_id FROM user_accounts WHERE email = 'admin@smartexporters.com'), 
 NULL, 'UK shipments processed and ready for pickup', 'text', 'en', 'in-app', 'sent', NULL, NULL, 'user', NULL),

-- Customer to Admin
((SELECT user_id FROM user_accounts WHERE email = 'adebayo.okechukwu@email.com'), 
 (SELECT user_id FROM user_accounts WHERE email = 'admin@smartexporters.com'), 
 (SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-LAG-001'), 
 'When will my package be delivered?', 'text', 'en', 'in-app', 'sent', NULL, NULL, 'user', 
 (SELECT customer_id FROM customers WHERE phone = '+2348012345678')),

-- Admin to Customer
((SELECT user_id FROM user_accounts WHERE email = 'admin@smartexporters.com'), 
 (SELECT user_id FROM user_accounts WHERE email = 'adebayo.okechukwu@email.com'), 
 (SELECT box_id FROM boxes WHERE international_tracking_number = 'NG-LAG-001'), 
 'Your package will be delivered tomorrow between 9 AM and 2 PM', 'text', 'en', 'in-app', 'sent', NULL, NULL, 'user', 
 (SELECT customer_id FROM customers WHERE phone = '+2348012345678'));

-- Update company settings with realistic information
UPDATE company_settings SET 
    company_name = 'The Smart Exporters',
    contact_email = 'support@smartexporters.com',
    support_phone = '+2341234567890',
    terms_of_use = 'Terms of Use for SmartTrack Logistics Platform. By using our services, you agree to our terms and conditions...',
    privacy_policy = 'Privacy Policy for SmartTrack Logistics Platform. We are committed to protecting your personal information...',
    enable_whatsapp = true,
    enable_messaging = true,
    enable_email = true,
    preferred_languages = ARRAY['en'::message_language, 'fr'::message_language, 'yo'::message_language, 'es'::message_language]
WHERE company_id = (SELECT company_id FROM company_settings LIMIT 1);

-- Verify data insertion
SELECT 'Seed data insertion completed successfully!' as status;
SELECT COUNT(*) as total_customers FROM customers;
SELECT COUNT(*) as total_boxes FROM boxes;
SELECT COUNT(*) as total_sacks FROM sacks;
SELECT COUNT(*) as total_users FROM user_accounts;
SELECT COUNT(*) as total_scans FROM scan_history;
SELECT COUNT(*) as total_messages FROM messages; 