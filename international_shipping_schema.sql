-- International Shipping Schema Updates
-- This adds fields needed for tracking shipments from Nigeria to other countries

-- Add international shipping fields to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50); -- Africa, Europe, North America, Asia, Oceania
ALTER TABLE customers ADD COLUMN IF NOT EXISTS customs_declaration TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add international shipping fields to boxes table
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria';
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100);
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50);
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20); -- Air, Sea, Land
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS customs_status VARCHAR(50); -- Pending, Cleared, Held
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS international_tracking_number VARCHAR(100);
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS customs_declaration TEXT;
ALTER TABLE boxes ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add international shipping fields to sacks table
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS origin_country VARCHAR(100) DEFAULT 'Nigeria';
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS destination_country VARCHAR(100);
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS destination_city VARCHAR(100);
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS shipping_region VARCHAR(50);
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(20); -- Air, Sea, Land
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS customs_status VARCHAR(50); -- Pending, Cleared, Held
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS international_tracking_number VARCHAR(100);
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS customs_declaration TEXT;
ALTER TABLE sacks ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- Add international shipping fields to scan_history table
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS customs_checkpoint VARCHAR(100);
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS international_location VARCHAR(100);
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS customs_notes TEXT;
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS shipping_carrier VARCHAR(100);
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS carrier_tracking_number VARCHAR(100);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boxes_destination_country ON boxes(destination_country);
CREATE INDEX IF NOT EXISTS idx_boxes_shipping_region ON boxes(shipping_region);
CREATE INDEX IF NOT EXISTS idx_boxes_shipping_method ON boxes(shipping_method);
CREATE INDEX IF NOT EXISTS idx_boxes_customs_status ON boxes(customs_status);

CREATE INDEX IF NOT EXISTS idx_sacks_destination_country ON sacks(destination_country);
CREATE INDEX IF NOT EXISTS idx_sacks_shipping_region ON sacks(shipping_region);
CREATE INDEX IF NOT EXISTS idx_sacks_shipping_method ON sacks(shipping_method);
CREATE INDEX IF NOT EXISTS idx_sacks_customs_status ON sacks(customs_status);

CREATE INDEX IF NOT EXISTS idx_customers_destination_country ON customers(destination_country);
CREATE INDEX IF NOT EXISTS idx_customers_shipping_region ON customers(shipping_region);

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

-- Create a function to get shipping statistics by region
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

-- Create a function to get shipping statistics by method
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

-- Create a function to get top destinations
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