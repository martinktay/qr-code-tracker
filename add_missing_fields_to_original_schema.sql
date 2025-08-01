-- Migration Script: Add Missing Fields to Original Schema
-- This script adds the missing fields from the enhanced schema to the original schema
-- Run this script to upgrade your database to support all features

-- Add missing fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria',
ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50),
ADD COLUMN IF NOT EXISTS customs_declaration TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add missing fields to boxes table
ALTER TABLE boxes 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria',
ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS customs_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS international_tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS customs_declaration TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add missing fields to sacks table
ALTER TABLE sacks 
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria',
ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20),
ADD COLUMN IF NOT EXISTS customs_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS international_tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS customs_declaration TEXT,
ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add missing fields to user_accounts table
ALTER TABLE user_accounts 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Add missing fields to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'customer',
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(customer_id);

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_boxes_weight ON boxes(weight_kg);
CREATE INDEX IF NOT EXISTS idx_boxes_destination_country ON boxes(destination_country);
CREATE INDEX IF NOT EXISTS idx_boxes_shipping_region ON boxes(shipping_region);
CREATE INDEX IF NOT EXISTS idx_boxes_shipping_method ON boxes(shipping_method);
CREATE INDEX IF NOT EXISTS idx_boxes_customs_status ON boxes(customs_status);

CREATE INDEX IF NOT EXISTS idx_sacks_weight ON sacks(weight_kg);
CREATE INDEX IF NOT EXISTS idx_sacks_destination_country ON sacks(destination_country);
CREATE INDEX IF NOT EXISTS idx_sacks_shipping_region ON sacks(shipping_region);
CREATE INDEX IF NOT EXISTS idx_sacks_shipping_method ON sacks(shipping_method);
CREATE INDEX IF NOT EXISTS idx_sacks_customs_status ON sacks(customs_status);

CREATE INDEX IF NOT EXISTS idx_customers_destination_country ON customers(destination_country);
CREATE INDEX IF NOT EXISTS idx_customers_shipping_region ON customers(shipping_region);

-- Create function to automatically set shipping region based on destination
CREATE OR REPLACE FUNCTION set_shipping_region()
RETURNS TRIGGER AS $$
BEGIN
  -- Set shipping region based on destination country
  IF NEW.destination_country IS NOT NULL THEN
    CASE 
      WHEN NEW.destination_country IN ('Ghana', 'Kenya', 'South Africa', 'Nigeria', 'Egypt', 'Morocco', 'Ethiopia', 'Uganda', 'Tanzania') THEN
        NEW.shipping_region := 'Africa';
      WHEN NEW.destination_country IN ('UK', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria') THEN
        NEW.shipping_region := 'Europe';
      WHEN NEW.destination_country IN ('USA', 'Canada', 'Mexico') THEN
        NEW.shipping_region := 'North America';
      WHEN NEW.destination_country IN ('China', 'India', 'Japan', 'South Korea', 'Singapore', 'Malaysia', 'Thailand') THEN
        NEW.shipping_region := 'Asia';
      WHEN NEW.destination_country IN ('Australia', 'New Zealand') THEN
        NEW.shipping_region := 'Oceania';
      ELSE
        NEW.shipping_region := 'Other';
    END CASE;
  END IF;
  
  -- Set shipping method based on destination
  IF NEW.destination_country IS NOT NULL THEN
    CASE 
      WHEN NEW.destination_country IN ('USA', 'UK', 'Canada', 'Australia', 'Germany', 'France') THEN
        NEW.shipping_method := 'Air';
      WHEN NEW.destination_country IN ('Ghana', 'Kenya', 'South Africa', 'China', 'India') THEN
        NEW.shipping_method := 'Sea';
      ELSE
        NEW.shipping_method := 'Mixed';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically set shipping information
DROP TRIGGER IF EXISTS set_boxes_shipping_info ON boxes;
CREATE TRIGGER set_boxes_shipping_info
  BEFORE INSERT OR UPDATE ON boxes
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

DROP TRIGGER IF EXISTS set_sacks_shipping_info ON sacks;
CREATE TRIGGER set_sacks_shipping_info
  BEFORE INSERT OR UPDATE ON sacks
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

DROP TRIGGER IF EXISTS set_customers_shipping_info ON customers;
CREATE TRIGGER set_customers_shipping_info
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_shipping_region();

-- Create international shipping analytics view
CREATE OR REPLACE VIEW international_shipping_analytics AS
SELECT 
  'box' as parcel_type,
  box_id as parcel_id,
  content,
  status,
  boxes.destination,
  boxes.destination_country,
  boxes.shipping_region,
  boxes.shipping_method,
  boxes.customs_status,
  boxes.weight_kg,
  date_packed as created_date,
  customers.first_name,
  customers.last_name,
  customers.phone,
  customers.price
FROM boxes
JOIN customers ON boxes.customer_id = customers.customer_id
WHERE boxes.destination_country IS NOT NULL

UNION ALL

SELECT 
  'sack' as parcel_type,
  sack_id as parcel_id,
  content,
  status,
  sacks.destination,
  sacks.destination_country,
  sacks.shipping_region,
  sacks.shipping_method,
  sacks.customs_status,
  sacks.weight_kg,
  date_packed as created_date,
  customers.first_name,
  customers.last_name,
  customers.phone,
  customers.price
FROM sacks
JOIN customers ON sacks.customer_id = customers.customer_id
WHERE sacks.destination_country IS NOT NULL;

-- Create function to get shipping statistics by region
CREATE OR REPLACE FUNCTION get_shipping_stats_by_region()
RETURNS TABLE (
  region VARCHAR(50),
  total_shipments BIGINT,
  total_weight DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  avg_weight DECIMAL(10,2),
  avg_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(shipping_region, 'Unknown') as region,
    COUNT(*) as total_shipments,
    COALESCE(SUM(weight_kg), 0) as total_weight,
    COALESCE(SUM(price), 0) as total_revenue,
    COALESCE(AVG(weight_kg), 0) as avg_weight,
    COALESCE(AVG(price), 0) as avg_revenue
  FROM international_shipping_analytics
  GROUP BY shipping_region
  ORDER BY total_shipments DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get shipping statistics by method
CREATE OR REPLACE FUNCTION get_shipping_stats_by_method()
RETURNS TABLE (
  method VARCHAR(20),
  total_shipments BIGINT,
  total_weight DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  avg_weight DECIMAL(10,2),
  avg_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(shipping_method, 'Unknown') as method,
    COUNT(*) as total_shipments,
    COALESCE(SUM(weight_kg), 0) as total_weight,
    COALESCE(SUM(price), 0) as total_revenue,
    COALESCE(AVG(weight_kg), 0) as avg_weight,
    COALESCE(AVG(price), 0) as avg_revenue
  FROM international_shipping_analytics
  GROUP BY shipping_method
  ORDER BY total_shipments DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get top destinations
CREATE OR REPLACE FUNCTION get_top_destinations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  destination_country VARCHAR(100),
  destination_city VARCHAR(100),
  total_shipments BIGINT,
  total_weight DECIMAL(10,2),
  total_revenue DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    destination_country,
    destination_city,
    COUNT(*) as total_shipments,
    COALESCE(SUM(weight_kg), 0) as total_weight,
    COALESCE(SUM(price), 0) as total_revenue
  FROM international_shipping_analytics
  WHERE destination_country IS NOT NULL
  GROUP BY destination_country, destination_city
  ORDER BY total_shipments DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Update RLS policies to include new fields
-- Add policies for the new fields if needed
-- (The existing policies should work with the new fields)

-- Insert sample data for testing (optional)
-- You can uncomment these lines to add sample international shipping data

/*
INSERT INTO customers (first_name, last_name, phone, destination, destination_country, destination_city, price) VALUES
('John', 'Doe', '+1234567890', 'New York', 'USA', 'New York', 150.00),
('Jane', 'Smith', '+44123456789', 'London', 'UK', 'London', 200.00),
('Ahmed', 'Hassan', '+20123456789', 'Cairo', 'Egypt', 'Cairo', 120.00);

-- Update existing parcels with international shipping data
UPDATE boxes SET 
  destination_country = 'USA',
  destination_city = 'New York',
  weight_kg = 5.5,
  shipping_method = 'Air'
WHERE box_id IN (SELECT box_id FROM boxes LIMIT 1);

UPDATE sacks SET 
  destination_country = 'UK',
  destination_city = 'London',
  weight_kg = 3.2,
  shipping_method = 'Air'
WHERE sack_id IN (SELECT sack_id FROM sacks LIMIT 1);
*/

-- Verify the migration
SELECT 'Migration completed successfully!' as status;