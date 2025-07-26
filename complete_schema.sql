-- Complete SmartTrack Database Schema
-- This file consolidates all original schema and subsequent updates
-- Includes international shipping features, weight tracking, and enhanced analytics

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');

-- Customers table (Enhanced with international shipping and user tracking)
CREATE TABLE customers (
    customer_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    destination TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_of_packaging TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enhanced fields for international shipping
    user_id UUID REFERENCES auth.users(id),
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Boxes table (Enhanced with weight tracking and international shipping)
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enhanced fields for weight tracking
    weight_kg DECIMAL(10,2) DEFAULT 0,
    -- Enhanced fields for international shipping
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    shipping_method VARCHAR(20),
    customs_status VARCHAR(50),
    international_tracking_number VARCHAR(100),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Sacks table (Enhanced with weight tracking and international shipping)
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enhanced fields for weight tracking
    weight_kg DECIMAL(10,2) DEFAULT 0,
    -- Enhanced fields for international shipping
    origin_country VARCHAR(100) DEFAULT 'Nigeria',
    destination_country VARCHAR(100),
    destination_city VARCHAR(100),
    shipping_region VARCHAR(50),
    shipping_method VARCHAR(20),
    customs_status VARCHAR(50),
    international_tracking_number VARCHAR(100),
    customs_declaration TEXT,
    special_instructions TEXT
);

-- Scan History table (Enhanced with international shipping tracking)
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Enhanced fields for international shipping
    customs_checkpoint VARCHAR(100),
    international_location VARCHAR(100),
    customs_notes TEXT,
    shipping_carrier VARCHAR(100),
    carrier_tracking_number VARCHAR(100)
);

-- User Accounts table (Enhanced with additional fields)
CREATE TABLE user_accounts (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company Settings table
CREATE TABLE company_settings (
    company_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL DEFAULT 'The Smart Exporters',
    logo_url TEXT,
    contact_email VARCHAR(255),
    support_phone VARCHAR(20),
    terms_of_use TEXT,
    privacy_policy TEXT,
    enable_whatsapp BOOLEAN DEFAULT true,
    enable_messaging BOOLEAN DEFAULT true,
    enable_email BOOLEAN DEFAULT true,
    preferred_languages message_language[] DEFAULT ARRAY[
        'en'::message_language,
        'fr'::message_language,
        'yo'::message_language,
        'es'::message_language
    ],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table (Enhanced with recipient types and customer tracking)
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
    file_name TEXT,
    -- Enhanced fields for better messaging
    recipient_type VARCHAR(20) DEFAULT 'customer',
    customer_id UUID REFERENCES customers(customer_id)
);

-- Create comprehensive indexes for better performance
CREATE INDEX idx_boxes_customer_id ON boxes(customer_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX idx_boxes_destination_country ON boxes(destination_country);
CREATE INDEX idx_boxes_shipping_region ON boxes(shipping_region);
CREATE INDEX idx_boxes_shipping_method ON boxes(shipping_method);
CREATE INDEX idx_boxes_customs_status ON boxes(customs_status);

CREATE INDEX idx_sacks_customer_id ON sacks(customer_id);
CREATE INDEX idx_sacks_status ON sacks(status);
CREATE INDEX idx_sacks_weight ON sacks(weight_kg);
CREATE INDEX idx_sacks_destination_country ON sacks(destination_country);
CREATE INDEX idx_sacks_shipping_region ON sacks(shipping_region);
CREATE INDEX idx_sacks_shipping_method ON sacks(shipping_method);
CREATE INDEX idx_sacks_customs_status ON sacks(customs_status);

CREATE INDEX idx_scan_history_box_id ON scan_history(box_id);
CREATE INDEX idx_scan_history_sack_id ON scan_history(sack_id);
CREATE INDEX idx_scan_history_scan_time ON scan_history(scan_time);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_destination_country ON customers(destination_country);
CREATE INDEX idx_customers_shipping_region ON customers(shipping_region);

CREATE INDEX idx_user_accounts_role ON user_accounts(role);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for all tables
-- Customers table policies
CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON customers FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON customers FOR DELETE USING (auth.role() = 'authenticated');

-- Boxes table policies
CREATE POLICY "Enable read access for all users" ON boxes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON boxes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON boxes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON boxes FOR DELETE USING (auth.role() = 'authenticated');

-- Sacks table policies
CREATE POLICY "Enable read access for all users" ON sacks FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON sacks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON sacks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON sacks FOR DELETE USING (auth.role() = 'authenticated');

-- Scan History table policies
CREATE POLICY "Enable read access for all users" ON scan_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON scan_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON scan_history FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON scan_history FOR DELETE USING (auth.role() = 'authenticated');

-- User Accounts table policies
CREATE POLICY "Enable read access for all users" ON user_accounts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON user_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON user_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON user_accounts FOR DELETE USING (auth.role() = 'authenticated');

-- Company Settings table policies
CREATE POLICY "Enable read access for all users" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON company_settings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON company_settings FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON company_settings FOR DELETE USING (auth.role() = 'authenticated');

-- Messages table policies
CREATE POLICY "Enable read access for all users" ON messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for users based on user_id" ON messages FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for users based on user_id" ON messages FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically set shipping region based on destination
CREATE OR REPLACE FUNCTION set_shipping_region()
RETURNS TRIGGER AS $$
BEGIN
  -- Set shipping region based on destination country
  IF NEW.destination_country IS NOT NULL THEN
    IF NEW.destination_country IN ('Ghana', 'Kenya', 'South Africa', 'Nigeria', 'Egypt', 'Morocco', 'Ethiopia', 'Uganda', 'Tanzania', 'Gambia', 'Senegal', 'Mali', 'Burkina Faso', 'Niger', 'Chad', 'Cameroon', 'Central African Republic', 'Gabon', 'Congo', 'DR Congo', 'Angola', 'Zambia', 'Zimbabwe', 'Botswana', 'Namibia', 'Lesotho', 'Eswatini', 'Mozambique', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Djibouti', 'Somalia', 'Eritrea', 'Sudan', 'South Sudan', 'Libya', 'Tunisia', 'Algeria', 'Mauritania', 'Western Sahara', 'Cape Verde', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', 'Cote d''Ivoire', 'Burkina Faso', 'Togo', 'Benin') THEN
      NEW.shipping_region := 'Africa';
    ELSIF NEW.destination_country IN ('UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal', 'Ireland', 'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Poland', 'Czech Republic', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Greece', 'Croatia', 'Slovenia', 'Estonia', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Cyprus') THEN
      NEW.shipping_region := 'Europe';
    ELSIF NEW.destination_country IN ('USA', 'Canada', 'Mexico', 'Costa Rica', 'Panama', 'Guatemala', 'Belize', 'El Salvador', 'Honduras', 'Nicaragua', 'Cuba', 'Jamaica', 'Haiti', 'Dominican Republic', 'Puerto Rico', 'Bahamas', 'Barbados', 'Trinidad and Tobago', 'Guyana', 'Suriname', 'French Guiana', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Ecuador', 'Colombia', 'Venezuela', 'Bolivia', 'Paraguay', 'Uruguay') THEN
      NEW.shipping_region := 'North America';
    ELSIF NEW.destination_country IN ('China', 'India', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam', 'Philippines', 'Indonesia', 'Myanmar', 'Cambodia', 'Laos', 'Brunei', 'Taiwan', 'Hong Kong', 'Macau', 'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Afghanistan', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Maldives') THEN
      NEW.shipping_region := 'Asia';
    ELSIF NEW.destination_country IN ('Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Solomon Islands', 'Vanuatu', 'New Caledonia', 'Samoa', 'Tonga', 'Tuvalu', 'Kiribati', 'Nauru', 'Palau', 'Micronesia', 'Marshall Islands') THEN
      NEW.shipping_region := 'Oceania';
    ELSE
      NEW.shipping_region := 'Other';
    END IF;
  END IF;

  -- Set shipping method based on destination
  IF NEW.destination_country IS NOT NULL THEN
    IF NEW.destination_country IN ('USA', 'UK', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Japan', 'South Korea', 'Singapore') THEN
      NEW.shipping_method := 'Air';
    ELSIF NEW.destination_country IN ('Ghana', 'Kenya', 'South Africa', 'China', 'India', 'Brazil', 'Argentina', 'Chile') THEN
      NEW.shipping_method := 'Sea';
    ELSIF NEW.destination_country IN ('Nigeria', 'Ghana', 'Togo', 'Benin', 'Cameroon', 'Chad', 'Niger', 'Burkina Faso', 'Mali', 'Senegal', 'Gambia', 'Guinea-Bissau', 'Guinea', 'Sierra Leone', 'Liberia', 'Cote d''Ivoire') THEN
      NEW.shipping_method := 'Land';
    ELSE
      NEW.shipping_method := 'Mixed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set shipping region and method
CREATE TRIGGER set_boxes_shipping_info
  BEFORE INSERT OR UPDATE ON boxes
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

CREATE TRIGGER set_sacks_shipping_info
  BEFORE INSERT OR UPDATE ON sacks
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

CREATE TRIGGER set_customers_shipping_info
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

-- Trigger to set createdat if not provided for messages
CREATE OR REPLACE FUNCTION set_message_created_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.createdat IS NULL THEN
    NEW.createdat := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_message_created_at_trigger
  BEFORE INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION set_message_created_at();

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_boxes_updated_at BEFORE UPDATE ON boxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sacks_updated_at BEFORE UPDATE ON sacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON user_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON company_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for international shipping analytics
CREATE OR REPLACE VIEW international_shipping_analytics AS
SELECT 
  'box' as parcel_type,
  box_id as parcel_id,
  content,
  quantity,
  weight_kg,
  status,
  origin_country,
  destination_country,
  destination_city,
  shipping_region,
  shipping_method,
  customs_status,
  international_tracking_number,
  created_at,
  customers.first_name,
  customers.last_name,
  customers.phone,
  customers.price
FROM boxes
JOIN customers ON boxes.customer_id = customers.customer_id

UNION ALL

SELECT 
  'sack' as parcel_type,
  sack_id as parcel_id,
  content,
  quantity,
  weight_kg,
  status,
  origin_country,
  destination_country,
  destination_city,
  shipping_region,
  shipping_method,
  customs_status,
  international_tracking_number,
  created_at,
  customers.first_name,
  customers.last_name,
  customers.phone,
  customers.price
FROM sacks
JOIN customers ON sacks.customer_id = customers.customer_id;

-- Create functions for shipping statistics
CREATE OR REPLACE FUNCTION get_shipping_stats_by_region()
RETURNS TABLE (
  region VARCHAR(50),
  total_shipments BIGINT,
  total_weight DECIMAL,
  total_revenue DECIMAL,
  avg_weight DECIMAL,
  avg_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    shipping_region,
    COUNT(*) as total_shipments,
    SUM(weight_kg) as total_weight,
    SUM(price) as total_revenue,
    AVG(weight_kg) as avg_weight,
    AVG(price) as avg_revenue
  FROM international_shipping_analytics
  WHERE shipping_region IS NOT NULL
  GROUP BY shipping_region
  ORDER BY total_shipments DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_shipping_stats_by_method()
RETURNS TABLE (
  method VARCHAR(20),
  total_shipments BIGINT,
  total_weight DECIMAL,
  total_revenue DECIMAL,
  avg_weight DECIMAL,
  avg_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    shipping_method,
    COUNT(*) as total_shipments,
    SUM(weight_kg) as total_weight,
    SUM(price) as total_revenue,
    AVG(weight_kg) as avg_weight,
    AVG(price) as avg_revenue
  FROM international_shipping_analytics
  WHERE shipping_method IS NOT NULL
  GROUP BY shipping_method
  ORDER BY total_shipments DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_top_destinations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  destination_country VARCHAR(100),
  destination_city VARCHAR(100),
  total_shipments BIGINT,
  total_weight DECIMAL,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    destination_country,
    destination_city,
    COUNT(*) as total_shipments,
    SUM(weight_kg) as total_weight,
    SUM(price) as total_revenue
  FROM international_shipping_analytics
  WHERE destination_country IS NOT NULL
  GROUP BY destination_country, destination_city
  ORDER BY total_shipments DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate QR code URL
CREATE OR REPLACE FUNCTION generate_qr_code_url(parcel_id UUID, parcel_type TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://smarttrack.com/track/' || parcel_type || '/' || parcel_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default company settings
INSERT INTO company_settings (
    company_name, contact_email, support_phone, terms_of_use, privacy_policy, enable_whatsapp, preferred_languages
) VALUES (
    'The Smart Exporters',
    'support@smartexporters.com',
    '+2341234567890',
    'Terms of Use for SmartTrack Logistics Platform...',
    'Privacy Policy for SmartTrack Logistics Platform...',
    true,
    ARRAY['en'::message_language, 'fr'::message_language, 'yo'::message_language, 'es'::message_language]
);

-- Verify schema creation
SELECT 'Schema created successfully' as status; 