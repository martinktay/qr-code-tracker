-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'warehouse_staff', 'customer');
CREATE TYPE parcel_status AS ENUM ('packed', 'in_transit', 'out_for_delivery', 'delivered', 'returned');
CREATE TYPE message_language AS ENUM ('en', 'fr', 'yo', 'es');

-- Customers table
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

-- Boxes table
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

-- Sacks table
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

-- Scan History table
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

-- User Accounts table
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

-- Messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    senderid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    recipientid UUID NOT NULL REFERENCES user_accounts(user_id) ON DELETE CASCADE,
    parcelid UUID, -- References either box_id or sack_id
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- 'text', 'image', 'template'
    language message_language DEFAULT 'en',
    createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedat TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_channel TEXT DEFAULT 'in-app', -- 'in-app', 'whatsapp', 'email'
    status TEXT DEFAULT 'sent', -- 'sent', 'delivered', 'read'
    file_url TEXT, -- For file attachments
    file_name TEXT -- Original filename
);

-- Create indexes for better performance
CREATE INDEX idx_boxes_customer_id ON boxes(customer_id);
CREATE INDEX idx_boxes_status ON boxes(status);
CREATE INDEX idx_sacks_customer_id ON sacks(customer_id);
CREATE INDEX idx_sacks_status ON sacks(status);
CREATE INDEX idx_scan_history_box_id ON scan_history(box_id);
CREATE INDEX idx_scan_history_sack_id ON scan_history(sack_id);
CREATE INDEX idx_scan_history_scan_time ON scan_history(scan_time);
CREATE INDEX idx_customers_phone ON customers(phone);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Allow sender, recipient, admin to read messages" ON messages
  FOR SELECT USING (
    auth.uid() = senderid OR
    auth.uid() = recipientid OR
    EXISTS (
      SELECT 1 FROM user_accounts WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow sender to insert message" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = senderid
  );

CREATE POLICY "Allow sender to update own message" ON messages
  FOR UPDATE USING (
    auth.uid() = senderid
  );

-- Trigger to set createdat if not provided
CREATE OR REPLACE FUNCTION set_message_created_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.createdat IS NULL THEN
    NEW.createdat := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_message_created_at_trigger ON messages;
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

-- Function to generate QR code URL
CREATE OR REPLACE FUNCTION generate_qr_code_url(parcel_id UUID, parcel_type TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://smartexporters.com/track/' || parcel_type || '/' || parcel_id;
END;
$$ LANGUAGE plpgsql;
