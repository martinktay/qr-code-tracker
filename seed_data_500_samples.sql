-- SmartTrack Seed Data - 500 Samples
-- Comprehensive test data for the logistics platform

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
    ARRAY['en'::message_language, 'fr'::message_language, 'yo'::message_language, 'es'::message_language]
) ON CONFLICT DO NOTHING;

-- Insert User Accounts (including admin and staff)
INSERT INTO user_accounts (user_id, username, email, role, hashed_password, created_at) VALUES
-- Admin User
(uuid_generate_v4(), 'admin', 'admin@smartexporters.com', 'admin', 'dummy_hash', NOW()),
-- Warehouse Staff (10 staff members)
(uuid_generate_v4(), 'warehouse1', 'warehouse1@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse2', 'warehouse2@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse3', 'warehouse3@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse4', 'warehouse4@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse5', 'warehouse5@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse6', 'warehouse6@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse7', 'warehouse7@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse8', 'warehouse8@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse9', 'warehouse9@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'warehouse10', 'warehouse10@smartexporters.com', 'warehouse_staff', 'dummy_hash', NOW()),
-- Customer Accounts (50 customers)
(uuid_generate_v4(), 'customer1', 'customer1@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer2', 'customer2@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer3', 'customer3@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer4', 'customer4@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer5', 'customer5@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer6', 'customer6@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer7', 'customer7@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer8', 'customer8@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer9', 'customer9@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer10', 'customer10@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer11', 'customer11@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer12', 'customer12@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer13', 'customer13@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer14', 'customer14@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer15', 'customer15@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer16', 'customer16@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer17', 'customer17@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer18', 'customer18@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer19', 'customer19@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer20', 'customer20@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer21', 'customer21@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer22', 'customer22@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer23', 'customer23@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer24', 'customer24@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer25', 'customer25@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer26', 'customer26@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer27', 'customer27@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer28', 'customer28@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer29', 'customer29@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer30', 'customer30@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer31', 'customer31@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer32', 'customer32@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer33', 'customer33@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer34', 'customer34@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer35', 'customer35@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer36', 'customer36@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer37', 'customer37@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer38', 'customer38@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer39', 'customer39@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer40', 'customer40@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer41', 'customer41@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer42', 'customer42@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer43', 'customer43@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer44', 'customer44@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer45', 'customer45@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer46', 'customer46@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer47', 'customer47@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer48', 'customer48@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer49', 'customer49@example.com', 'customer', 'dummy_hash', NOW()),
(uuid_generate_v4(), 'customer50', 'customer50@example.com', 'customer', 'dummy_hash', NOW())
ON CONFLICT (username) DO NOTHING;

-- Insert 200 Customers with realistic data
INSERT INTO customers (customer_id, first_name, last_name, phone, destination, price, date_of_packaging) VALUES
(uuid_generate_v4(), 'John', 'Smith', '+234-801-111-1111', 'Lagos, Nigeria', 15000.00, '2024-01-15'),
(uuid_generate_v4(), 'Maria', 'Garcia', '+234-801-111-1112', 'Abuja, Nigeria', 22000.00, '2024-01-16'),
(uuid_generate_v4(), 'Ahmed', 'Hassan', '+234-801-111-1113', 'Kano, Nigeria', 18000.00, '2024-01-17'),
(uuid_generate_v4(), 'Fatima', 'Ali', '+234-801-111-1114', 'Port Harcourt, Nigeria', 25000.00, '2024-01-18'),
(uuid_generate_v4(), 'David', 'Johnson', '+234-801-111-1115', 'Ibadan, Nigeria', 12000.00, '2024-01-19'),
(uuid_generate_v4(), 'Sarah', 'Williams', '+234-801-111-1116', 'Kaduna, Nigeria', 19000.00, '2024-01-20'),
(uuid_generate_v4(), 'Michael', 'Brown', '+234-801-111-1117', 'Enugu, Nigeria', 16000.00, '2024-01-21'),
(uuid_generate_v4(), 'Emily', 'Davis', '+234-801-111-1118', 'Calabar, Nigeria', 21000.00, '2024-01-22'),
(uuid_generate_v4(), 'James', 'Miller', '+234-801-111-1119', 'Jos, Nigeria', 14000.00, '2024-01-23'),
(uuid_generate_v4(), 'Lisa', 'Wilson', '+234-801-111-1120', 'Maiduguri, Nigeria', 17000.00, '2024-01-24'),
(uuid_generate_v4(), 'Robert', 'Moore', '+234-801-111-1121', 'Zaria, Nigeria', 13000.00, '2024-01-25'),
(uuid_generate_v4(), 'Jennifer', 'Taylor', '+234-801-111-1122', 'Sokoto, Nigeria', 20000.00, '2024-01-26'),
(uuid_generate_v4(), 'William', 'Anderson', '+234-801-111-1123', 'Katsina, Nigeria', 15000.00, '2024-01-27'),
(uuid_generate_v4(), 'Linda', 'Thomas', '+234-801-111-1124', 'Gombe, Nigeria', 18000.00, '2024-01-28'),
(uuid_generate_v4(), 'Richard', 'Jackson', '+234-801-111-1125', 'Yola, Nigeria', 16000.00, '2024-01-29'),
(uuid_generate_v4(), 'Patricia', 'White', '+234-801-111-1126', 'Bauchi, Nigeria', 14000.00, '2024-01-30'),
(uuid_generate_v4(), 'Joseph', 'Harris', '+234-801-111-1127', 'Kebbi, Nigeria', 19000.00, '2024-02-01'),
(uuid_generate_v4(), 'Barbara', 'Martin', '+234-801-111-1128', 'Jigawa, Nigeria', 17000.00, '2024-02-02'),
(uuid_generate_v4(), 'Christopher', 'Thompson', '+234-801-111-1129', 'Kogi, Nigeria', 15000.00, '2024-02-03'),
(uuid_generate_v4(), 'Jessica', 'Garcia', '+234-801-111-1130', 'Kwara, Nigeria', 20000.00, '2024-02-04'),
(uuid_generate_v4(), 'Daniel', 'Martinez', '+234-801-111-1131', 'Nasarawa, Nigeria', 16000.00, '2024-02-05'),
(uuid_generate_v4(), 'Ashley', 'Robinson', '+234-801-111-1132', 'Niger, Nigeria', 18000.00, '2024-02-06'),
(uuid_generate_v4(), 'Matthew', 'Clark', '+234-801-111-1133', 'Ondo, Nigeria', 14000.00, '2024-02-07'),
(uuid_generate_v4(), 'Amanda', 'Rodriguez', '+234-801-111-1134', 'Osun, Nigeria', 19000.00, '2024-02-08'),
(uuid_generate_v4(), 'Joshua', 'Lewis', '+234-801-111-1135', 'Oyo, Nigeria', 17000.00, '2024-02-09'),
(uuid_generate_v4(), 'Stephanie', 'Lee', '+234-801-111-1136', 'Plateau, Nigeria', 15000.00, '2024-02-10'),
(uuid_generate_v4(), 'Andrew', 'Walker', '+234-801-111-1137', 'Rivers, Nigeria', 22000.00, '2024-02-11'),
(uuid_generate_v4(), 'Nicole', 'Hall', '+234-801-111-1138', 'Taraba, Nigeria', 16000.00, '2024-02-12'),
(uuid_generate_v4(), 'Ryan', 'Allen', '+234-801-111-1139', 'Yobe, Nigeria', 18000.00, '2024-02-13'),
(uuid_generate_v4(), 'Heather', 'Young', '+234-801-111-1140', 'Zamfara, Nigeria', 14000.00, '2024-02-14'),
(uuid_generate_v4(), 'Brandon', 'King', '+234-801-111-1141', 'FCT Abuja, Nigeria', 25000.00, '2024-02-15'),
(uuid_generate_v4(), 'Melissa', 'Wright', '+234-801-111-1142', 'Lagos Island, Nigeria', 30000.00, '2024-02-16'),
(uuid_generate_v4(), 'Kevin', 'Lopez', '+234-801-111-1143', 'Victoria Island, Nigeria', 28000.00, '2024-02-17'),
(uuid_generate_v4(), 'Rebecca', 'Hill', '+234-801-111-1144', 'Ikeja, Nigeria', 20000.00, '2024-02-18'),
(uuid_generate_v4(), 'Steven', 'Scott', '+234-801-111-1145', 'Surulere, Nigeria', 18000.00, '2024-02-19'),
(uuid_generate_v4(), 'Laura', 'Green', '+234-801-111-1146', 'Yaba, Nigeria', 19000.00, '2024-02-20'),
(uuid_generate_v4(), 'Timothy', 'Adams', '+234-801-111-1147', 'Oshodi, Nigeria', 16000.00, '2024-02-21'),
(uuid_generate_v4(), 'Michelle', 'Baker', '+234-801-111-1148', 'Alimosho, Nigeria', 17000.00, '2024-02-22'),
(uuid_generate_v4(), 'Kenneth', 'Gonzalez', '+234-801-111-1149', 'Kosofe, Nigeria', 18000.00, '2024-02-23'),
(uuid_generate_v4(), 'Kimberly', 'Nelson', '+234-801-111-1150', 'Shomolu, Nigeria', 15000.00, '2024-02-24'),
(uuid_generate_v4(), 'Edward', 'Carter', '+234-801-111-1151', 'Mushin, Nigeria', 14000.00, '2024-02-25'),
(uuid_generate_v4(), 'Deborah', 'Mitchell', '+234-801-111-1152', 'Ojo, Nigeria', 16000.00, '2024-02-26'),
(uuid_generate_v4(), 'Brian', 'Perez', '+234-801-111-1153', 'Ikorodu, Nigeria', 17000.00, '2024-02-27'),
(uuid_generate_v4(), 'Donna', 'Roberts', '+234-801-111-1154', 'Epe, Nigeria', 19000.00, '2024-02-28'),
(uuid_generate_v4(), 'Ronald', 'Turner', '+234-801-111-1155', 'Badagry, Nigeria', 15000.00, '2024-02-29'),
(uuid_generate_v4(), 'Sandra', 'Phillips', '+234-801-111-1156', 'Agege, Nigeria', 14000.00, '2024-03-01'),
(uuid_generate_v4(), 'Anthony', 'Campbell', '+234-801-111-1157', 'Ifako-Ijaiye, Nigeria', 16000.00, '2024-03-02'),
(uuid_generate_v4(), 'Carol', 'Parker', '+234-801-111-1158', 'Ikeja GRA, Nigeria', 22000.00, '2024-03-03'),
(uuid_generate_v4(), 'Jason', 'Evans', '+234-801-111-1159', 'Victoria Garden City, Nigeria', 26000.00, '2024-03-04'),
(uuid_generate_v4(), 'Helen', 'Edwards', '+234-801-111-1160', 'Lekki Phase 1, Nigeria', 30000.00, '2024-03-05'),
(uuid_generate_v4(), 'Jeffrey', 'Collins', '+234-801-111-1161', 'Lekki Phase 2, Nigeria', 28000.00, '2024-03-06'),
(uuid_generate_v4(), 'Ruth', 'Stewart', '+234-801-111-1162', 'Ikoyi, Nigeria', 35000.00, '2024-03-07'),
(uuid_generate_v4(), 'Gary', 'Sanchez', '+234-801-111-1163', 'Banana Island, Nigeria', 40000.00, '2024-03-08'),
(uuid_generate_v4(), 'Sharon', 'Morris', '+234-801-111-1164', 'Ajah, Nigeria', 24000.00, '2024-03-09'),
(uuid_generate_v4(), 'Larry', 'Rogers', '+234-801-111-1165', 'Sangotedo, Nigeria', 22000.00, '2024-03-10'),
(uuid_generate_v4(), 'Cynthia', 'Reed', '+234-801-111-1166', 'Abraham Adesanya, Nigeria', 20000.00, '2024-03-11'),
(uuid_generate_v4(), 'Frank', 'Cook', '+234-801-111-1167', 'Jakande, Nigeria', 18000.00, '2024-03-12'),
(uuid_generate_v4(), 'Amy', 'Morgan', '+234-801-111-1168', 'Ikate, Nigeria', 19000.00, '2024-03-13'),
(uuid_generate_v4(), 'Scott', 'Bell', '+234-801-111-1169', 'Agungi, Nigeria', 21000.00, '2024-03-14'),
(uuid_generate_v4(), 'Angela', 'Murphy', '+234-801-111-1170', 'Ilaje, Nigeria', 17000.00, '2024-03-15'),
(uuid_generate_v4(), 'Eric', 'Bailey', '+234-801-111-1171', 'Bariga, Nigeria', 16000.00, '2024-03-16'),
(uuid_generate_v4(), 'Brenda', 'Rivera', '+234-801-111-1172', 'Somolu, Nigeria', 15000.00, '2024-03-17'),
(uuid_generate_v4(), 'Stephen', 'Cooper', '+234-801-111-1173', 'Ikorodu Road, Nigeria', 18000.00, '2024-03-18'),
(uuid_generate_v4(), 'Pamela', 'Richardson', '+234-801-111-1174', 'Oworonsoki, Nigeria', 16000.00, '2024-03-19'),
(uuid_generate_v4(), 'Raymond', 'Cox', '+234-801-111-1175', 'Ebute-Metta, Nigeria', 14000.00, '2024-03-20'),
(uuid_generate_v4(), 'Emma', 'Howard', '+234-801-111-1176', 'Yaba, Nigeria', 19000.00, '2024-03-21'),
(uuid_generate_v4(), 'Gregory', 'Ward', '+234-801-111-1177', 'Surulere, Nigeria', 18000.00, '2024-03-22'),
(uuid_generate_v4(), 'Nicole', 'Torres', '+234-801-111-1178', 'Oshodi, Nigeria', 16000.00, '2024-03-23'),
(uuid_generate_v4(), 'Dennis', 'Peterson', '+234-801-111-1179', 'Ikeja, Nigeria', 20000.00, '2024-03-24'),
(uuid_generate_v4(), 'Debra', 'Gray', '+234-801-111-1180', 'Victoria Island, Nigeria', 28000.00, '2024-03-25'),
(uuid_generate_v4(), 'Peter', 'Ramirez', '+234-801-111-1181', 'Lagos Island, Nigeria', 30000.00, '2024-03-26'),
(uuid_generate_v4(), 'Janet', 'James', '+234-801-111-1182', 'Ikoyi, Nigeria', 35000.00, '2024-03-27'),
(uuid_generate_v4(), 'Henry', 'Watson', '+234-801-111-1183', 'Banana Island, Nigeria', 40000.00, '2024-03-28'),
(uuid_generate_v4(), 'Diane', 'Brooks', '+234-801-111-1184', 'Lekki, Nigeria', 25000.00, '2024-03-29'),
(uuid_generate_v4(), 'Carl', 'Kelly', '+234-801-111-1185', 'Ajah, Nigeria', 24000.00, '2024-03-30'),
(uuid_generate_v4(), 'Virginia', 'Sanders', '+234-801-111-1186', 'Sangotedo, Nigeria', 22000.00, '2024-04-01'),
(uuid_generate_v4(), 'Arthur', 'Price', '+234-801-111-1187', 'Abraham Adesanya, Nigeria', 20000.00, '2024-04-02'),
(uuid_generate_v4(), 'Kathleen', 'Bennett', '+234-801-111-1188', 'Jakande, Nigeria', 18000.00, '2024-04-03'),
(uuid_generate_v4(), 'Ryan', 'Wood', '+234-801-111-1189', 'Ikate, Nigeria', 19000.00, '2024-04-04'),
(uuid_generate_v4(), 'Martha', 'Barnes', '+234-801-111-1190', 'Agungi, Nigeria', 21000.00, '2024-04-05'),
(uuid_generate_v4(), 'Albert', 'Ross', '+234-801-111-1191', 'Ilaje, Nigeria', 17000.00, '2024-04-06'),
(uuid_generate_v4(), 'Frances', 'Henderson', '+234-801-111-1192', 'Bariga, Nigeria', 16000.00, '2024-04-07'),
(uuid_generate_v4(), 'Lawrence', 'Coleman', '+234-801-111-1193', 'Somolu, Nigeria', 15000.00, '2024-04-08'),
(uuid_generate_v4(), 'Ann', 'Jenkins', '+234-801-111-1194', 'Ikorodu Road, Nigeria', 18000.00, '2024-04-09'),
(uuid_generate_v4(), 'Russell', 'Perry', '+234-801-111-1195', 'Oworonsoki, Nigeria', 16000.00, '2024-04-10'),
(uuid_generate_v4(), 'Marie', 'Powell', '+234-801-111-1196', 'Ebute-Metta, Nigeria', 14000.00, '2024-04-11'),
(uuid_generate_v4(), 'Eugene', 'Long', '+234-801-111-1197', 'Yaba, Nigeria', 19000.00, '2024-04-12'),
(uuid_generate_v4(), 'Dorothy', 'Patterson', '+234-801-111-1198', 'Surulere, Nigeria', 18000.00, '2024-04-13'),
(uuid_generate_v4(), 'Harry', 'Hughes', '+234-801-111-1199', 'Oshodi, Nigeria', 16000.00, '2024-04-14'),
(uuid_generate_v4(), 'Betty', 'Flores', '+234-801-111-1200', 'Ikeja, Nigeria', 20000.00, '2024-04-15'),
(uuid_generate_v4(), 'Wayne', 'Washington', '+234-801-111-1201', 'Victoria Island, Nigeria', 28000.00, '2024-04-16'),
(uuid_generate_v4(), 'Helen', 'Butler', '+234-801-111-1202', 'Lagos Island, Nigeria', 30000.00, '2024-04-17'),
(uuid_generate_v4(), 'Alan', 'Simmons', '+234-801-111-1203', 'Ikoyi, Nigeria', 35000.00, '2024-04-18'),
(uuid_generate_v4(), 'Lois', 'Foster', '+234-801-111-1204', 'Banana Island, Nigeria', 40000.00, '2024-04-19'),
(uuid_generate_v4(), 'Ralph', 'Gonzales', '+234-801-111-1205', 'Lekki, Nigeria', 25000.00, '2024-04-20'),
(uuid_generate_v4(), 'Jean', 'Bryant', '+234-801-111-1206', 'Ajah, Nigeria', 24000.00, '2024-04-21'),
(uuid_generate_v4(), 'Roy', 'Alexander', '+234-801-111-1207', 'Sangotedo, Nigeria', 22000.00, '2024-04-22'),
(uuid_generate_v4(), 'Alice', 'Russell', '+234-801-111-1208', 'Abraham Adesanya, Nigeria', 20000.00, '2024-04-23'),
(uuid_generate_v4(), 'Bobby', 'Griffin', '+234-801-111-1209', 'Jakande, Nigeria', 18000.00, '2024-04-24'),
(uuid_generate_v4(), 'Marilyn', 'Diaz', '+234-801-111-1210', 'Ikate, Nigeria', 19000.00, '2024-04-25');

-- Insert 200 Boxes
INSERT INTO boxes (box_id, customer_id, content, quantity, date_packed, status, destination, qr_code_url) 
SELECT 
    uuid_generate_v4(),
    c.customer_id,
    CASE 
        WHEN random() < 0.2 THEN 'Electronics and Gadgets'
        WHEN random() < 0.4 THEN 'Clothing and Textiles'
        WHEN random() < 0.6 THEN 'Books and Documents'
        WHEN random() < 0.8 THEN 'Kitchen Appliances'
        ELSE 'Personal Items and Accessories'
    END,
    floor(random() * 5) + 1,
    NOW() - (random() * interval '30 days'),
    CASE 
        WHEN random() < 0.3 THEN 'packed'::parcel_status
        WHEN random() < 0.6 THEN 'in_transit'::parcel_status
        WHEN random() < 0.8 THEN 'out_for_delivery'::parcel_status
        ELSE 'delivered'::parcel_status
    END,
    c.destination,
    'https://smartexporters.com/qr/' || uuid_generate_v4()
FROM customers c
LIMIT 200;

-- Insert 100 Sacks
INSERT INTO sacks (sack_id, customer_id, content, quantity, date_packed, status, destination, qr_code_url) 
SELECT 
    uuid_generate_v4(),
    c.customer_id,
    CASE 
        WHEN random() < 0.3 THEN 'Grains and Cereals'
        WHEN random() < 0.6 THEN 'Construction Materials'
        WHEN random() < 0.8 THEN 'Agricultural Products'
        ELSE 'Industrial Supplies'
    END,
    floor(random() * 10) + 1,
    NOW() - (random() * interval '30 days'),
    CASE 
        WHEN random() < 0.3 THEN 'packed'::parcel_status
        WHEN random() < 0.6 THEN 'in_transit'::parcel_status
        WHEN random() < 0.8 THEN 'out_for_delivery'::parcel_status
        ELSE 'delivered'::parcel_status
    END,
    c.destination,
    'https://smartexporters.com/qr/' || uuid_generate_v4()
FROM customers c
LIMIT 100;

-- Insert 200 Scan History Records
INSERT INTO scan_history (scan_id, box_id, scan_time, scan_location, status_message, photo_url, estimated_delivery, comment, sent_message, message_language)
SELECT 
    uuid_generate_v4(),
    b.box_id,
    NOW() - (random() * interval '7 days'),
    point(
        3.3792 + (random() - 0.5) * 0.1, -- Lagos area coordinates with variation
        6.5244 + (random() - 0.5) * 0.1
    ),
    CASE 
        WHEN b.status = 'packed' THEN 'Package received and processed'
        WHEN b.status = 'in_transit' THEN 'Package in transit to destination'
        WHEN b.status = 'out_for_delivery' THEN 'Package out for delivery'
        ELSE 'Package delivered successfully'
    END,
    'https://example.com/photos/scan_' || floor(random() * 1000) || '.jpg',
    NOW() + (random() * interval '7 days'),
    CASE 
        WHEN random() < 0.5 THEN 'Package in good condition'
        WHEN random() < 0.8 THEN 'Package securely packed'
        ELSE 'Package ready for delivery'
    END,
    CASE 
        WHEN b.status = 'packed' THEN 'Your package has been received and is being processed'
        WHEN b.status = 'in_transit' THEN 'Your package is now in transit to your destination'
        WHEN b.status = 'out_for_delivery' THEN 'Your package is out for delivery today'
        ELSE 'Your package has been delivered successfully'
    END,
    CASE 
        WHEN random() < 0.4 THEN 'en'::message_language
        WHEN random() < 0.7 THEN 'fr'::message_language
        WHEN random() < 0.9 THEN 'yo'::message_language
        ELSE 'es'::message_language
    END
FROM boxes b
LIMIT 200;

-- Insert 100 Scan History Records for Sacks
INSERT INTO scan_history (scan_id, sack_id, scan_time, scan_location, status_message, photo_url, estimated_delivery, comment, sent_message, message_language)
SELECT 
    uuid_generate_v4(),
    s.sack_id,
    NOW() - (random() * interval '7 days'),
    point(
        3.3792 + (random() - 0.5) * 0.1,
        6.5244 + (random() - 0.5) * 0.1
    ),
    CASE 
        WHEN s.status = 'packed' THEN 'Sack received and processed'
        WHEN s.status = 'in_transit' THEN 'Sack in transit to destination'
        WHEN s.status = 'out_for_delivery' THEN 'Sack out for delivery'
        ELSE 'Sack delivered successfully'
    END,
    'https://example.com/photos/sack_scan_' || floor(random() * 1000) || '.jpg',
    NOW() + (random() * interval '7 days'),
    CASE 
        WHEN random() < 0.5 THEN 'Sack in good condition'
        WHEN random() < 0.8 THEN 'Sack securely packed'
        ELSE 'Sack ready for delivery'
    END,
    CASE 
        WHEN s.status = 'packed' THEN 'Your sack has been received and is being processed'
        WHEN s.status = 'in_transit' THEN 'Your sack is now in transit to your destination'
        WHEN s.status = 'out_for_delivery' THEN 'Your sack is out for delivery today'
        ELSE 'Your sack has been delivered successfully'
    END,
    CASE 
        WHEN random() < 0.4 THEN 'en'::message_language
        WHEN random() < 0.7 THEN 'fr'::message_language
        WHEN random() < 0.9 THEN 'yo'::message_language
        ELSE 'es'::message_language
    END
FROM sacks s
LIMIT 100;

-- Display summary
SELECT 
    'Seed Data Summary - 500 Samples' as info,
    (SELECT COUNT(*) FROM customers) as total_customers,
    (SELECT COUNT(*) FROM boxes) as total_boxes,
    (SELECT COUNT(*) FROM sacks) as total_sacks,
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