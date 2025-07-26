-- Add status column to scan_history table for better tracking
-- This ensures each scan record includes the status at that point in time

-- Add status column to scan_history table
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS status parcel_status;

-- Update existing scan records to have a default status if null
UPDATE scan_history 
SET status = 'packed' 
WHERE status IS NULL;

-- Make status column NOT NULL after setting default values
ALTER TABLE scan_history ALTER COLUMN status SET NOT NULL;

-- Add index for better performance on status queries
CREATE INDEX IF NOT EXISTS idx_scan_history_status ON scan_history(status);

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'scan_history' 
AND column_name = 'status';

-- Show sample data to verify
SELECT 
    scan_id,
    box_id,
    sack_id,
    status,
    status_message,
    scan_time
FROM scan_history 
LIMIT 5; 