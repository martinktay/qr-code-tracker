-- Add weight fields to boxes and sacks tables
-- This enhances the parcel registration with weight tracking

-- Add weight column to boxes table
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,2);

-- Add weight column to sacks table  
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(8,2);

-- Create indexes for weight queries
CREATE INDEX IF NOT EXISTS idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX IF NOT EXISTS idx_sacks_weight ON sacks(weight_kg);

-- Fix messaging schema by adding user_id to customers table
-- This allows customers to have user accounts for messaging

-- Add user_id column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_accounts(user_id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);

-- Update RLS policy for customers to allow access based on user_id
DROP POLICY IF EXISTS "Enable read for all users" ON customers;
CREATE POLICY "Enable read for all users" ON customers FOR SELECT USING (true);

-- Update messages table to handle both user-to-user and user-to-customer messaging
-- Add a new column to distinguish between user and customer recipients
ALTER TABLE messages ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'user'; -- 'user' or 'customer'
ALTER TABLE messages ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE;

-- Create index for customer_id in messages
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);

-- Update RLS policies for messages to handle customer messaging
DROP POLICY IF EXISTS "Allow sender, recipient, admin to read messages" ON messages;
CREATE POLICY "Allow sender, recipient, admin to read messages" ON messages
  FOR SELECT USING (
    auth.uid() = senderid OR
    auth.uid() = recipientid OR
    (EXISTS (SELECT 1 FROM user_accounts WHERE user_id = auth.uid() AND role = 'admin')) OR
    (recipient_type = 'customer' AND EXISTS (
      SELECT 1 FROM customers WHERE customer_id = messages.customer_id AND user_id = auth.uid()
    ))
  );

-- Update insert policy for messages
DROP POLICY IF EXISTS "Allow sender to insert message" ON messages;
CREATE POLICY "Allow sender to insert message" ON messages
  FOR INSERT USING (
    auth.uid() = senderid
  );

-- Update update policy for messages
DROP POLICY IF EXISTS "Allow sender to update own message" ON messages;
CREATE POLICY "Allow sender to update own message" ON messages
  FOR UPDATE USING (
    auth.uid() = senderid
  );

-- Add a function to get customer's user_id if they have one
CREATE OR REPLACE FUNCTION get_customer_user_id(customer_uuid UUID)
RETURNS UUID AS $$
DECLARE
    user_uuid UUID;
BEGIN
    SELECT user_id INTO user_uuid FROM customers WHERE customer_id = customer_uuid;
    RETURN user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add a function to create a user account for a customer if they don't have one
CREATE OR REPLACE FUNCTION ensure_customer_user_account(customer_uuid UUID, customer_email TEXT, customer_phone TEXT)
RETURNS UUID AS $$
DECLARE
    existing_user_id UUID;
    new_user_id UUID;
BEGIN
    -- Check if customer already has a user account
    SELECT user_id INTO existing_user_id FROM customers WHERE customer_id = customer_uuid;
    
    IF existing_user_id IS NOT NULL THEN
        RETURN existing_user_id;
    END IF;
    
    -- Create a new user account for the customer
    INSERT INTO user_accounts (username, hashed_password, role, email, phone)
    VALUES (
        COALESCE(customer_email, customer_phone),
        crypt('temporary_password', gen_salt('bf')), -- Temporary password
        'customer',
        customer_email,
        customer_phone
    ) RETURNING user_id INTO new_user_id;
    
    -- Update customer with the new user_id
    UPDATE customers SET user_id = new_user_id WHERE customer_id = customer_uuid;
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql; 