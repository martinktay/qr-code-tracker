-- Enhanced Scan History Migration Script
-- This script adds the status column and optimizes the scan_history table
-- for better performance and data integrity

-- Start transaction for safe migration
BEGIN;

-- Step 1: Add status column to scan_history table
ALTER TABLE scan_history ADD COLUMN IF NOT EXISTS status parcel_status;

-- Step 2: Update existing scan records to have a default status if null
UPDATE scan_history 
SET status = 'packed' 
WHERE status IS NULL;

-- Step 3: Verify no null values remain
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM scan_history WHERE status IS NULL) THEN
        RAISE EXCEPTION 'Found NULL status values after migration';
    END IF;
END $$;

-- Step 4: Make status column NOT NULL after setting default values
ALTER TABLE scan_history ALTER COLUMN status SET NOT NULL;

-- Step 5: Add performance indexes for status-based queries
CREATE INDEX IF NOT EXISTS idx_scan_history_status ON scan_history(status);
CREATE INDEX IF NOT EXISTS idx_scan_history_status_time ON scan_history(status, scan_time);
CREATE INDEX IF NOT EXISTS idx_scan_history_parcel_status ON scan_history(box_id, sack_id, status, scan_time);

-- Step 6: Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_scan_history_box_status_time ON scan_history(box_id, status, scan_time) WHERE box_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scan_history_sack_status_time ON scan_history(sack_id, status, scan_time) WHERE sack_id IS NOT NULL;

-- Step 7: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'scan_history' 
AND column_name = 'status';

-- Step 8: Show sample data to verify
SELECT 
    scan_id,
    box_id,
    sack_id,
    status,
    status_message,
    scan_time
FROM scan_history 
ORDER BY scan_time DESC
LIMIT 5;

-- Step 9: Validate data consistency between tables
-- Check if current status in boxes/sacks matches last scan status
SELECT 
    'Box Status Mismatch' as issue_type,
    b.box_id,
    b.status as current_status,
    sh.status as last_scan_status,
    sh.scan_time as last_scan_time
FROM boxes b
LEFT JOIN (
    SELECT DISTINCT ON (box_id) 
        box_id, 
        status, 
        scan_time
    FROM scan_history 
    WHERE box_id IS NOT NULL
    ORDER BY box_id, scan_time DESC
) sh ON b.box_id = sh.box_id
WHERE b.status != COALESCE(sh.status, 'packed')

UNION ALL

SELECT 
    'Sack Status Mismatch' as issue_type,
    s.sack_id,
    s.status as current_status,
    sh.status as last_scan_status,
    sh.scan_time as last_scan_time
FROM sacks s
LEFT JOIN (
    SELECT DISTINCT ON (sack_id) 
        sack_id, 
        status, 
        scan_time
    FROM scan_history 
    WHERE sack_id IS NOT NULL
    ORDER BY sack_id, scan_time DESC
) sh ON s.sack_id = sh.sack_id
WHERE s.status != COALESCE(sh.status, 'packed');

-- Step 10: Create a view for easy status history access
CREATE OR REPLACE VIEW parcel_status_history AS
SELECT 
    COALESCE(box_id, sack_id) as parcel_id,
    CASE WHEN box_id IS NOT NULL THEN 'box' ELSE 'sack' END as parcel_type,
    status,
    status_message,
    scan_location,
    scan_time,
    comment,
    photo_url,
    estimated_delivery
FROM scan_history
ORDER BY scan_time DESC;

-- Step 11: Create a function to get status progression for a parcel
CREATE OR REPLACE FUNCTION get_parcel_status_progression(parcel_id UUID, parcel_type TEXT)
RETURNS TABLE (
    status parcel_status,
    status_message TEXT,
    scan_time TIMESTAMP WITH TIME ZONE,
    time_in_status INTERVAL,
    previous_status parcel_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sh.status,
        sh.status_message,
        sh.scan_time,
        sh.scan_time - LAG(sh.scan_time) OVER (ORDER BY sh.scan_time) as time_in_status,
        LAG(sh.status) OVER (ORDER BY sh.scan_time) as previous_status
    FROM scan_history sh
    WHERE 
        (parcel_type = 'box' AND sh.box_id = parcel_id) OR
        (parcel_type = 'sack' AND sh.sack_id = parcel_id)
    ORDER BY sh.scan_time;
END;
$$ LANGUAGE plpgsql;

-- Step 11.5: Create a function to calculate average time between scans by status
CREATE OR REPLACE FUNCTION get_avg_time_between_scans_by_status()
RETURNS TABLE (
    status parcel_status,
    avg_seconds_between_scans NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH scan_intervals AS (
        SELECT 
            sh.status,
            EXTRACT(EPOCH FROM (sh.scan_time - LAG(sh.scan_time) OVER (
                PARTITION BY COALESCE(sh.box_id, sh.sack_id) 
                ORDER BY sh.scan_time
            ))) as seconds_between_scans
        FROM scan_history sh
    )
    SELECT 
        si.status,
        ROUND(AVG(si.seconds_between_scans), 2) as avg_seconds_between_scans
    FROM scan_intervals si
    WHERE si.seconds_between_scans IS NOT NULL
    GROUP BY si.status
    ORDER BY si.status;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create analytics view for status-based reporting
CREATE OR REPLACE VIEW status_analytics AS
SELECT 
    status,
    COUNT(*) as total_scans,
    COUNT(DISTINCT COALESCE(box_id, sack_id)) as unique_parcels,
    MIN(scan_time) as first_scan,
    MAX(scan_time) as last_scan
FROM scan_history
GROUP BY status;

-- Step 13: Show migration summary
SELECT 
    'Migration Summary' as info,
    COUNT(*) as total_scan_records,
    COUNT(CASE WHEN status IS NOT NULL THEN 1 END) as records_with_status,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as records_without_status
FROM scan_history;

-- Step 14: Show index information
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'scan_history' 
AND indexname LIKE 'idx_scan_history%'
ORDER BY indexname;

-- Commit the transaction
COMMIT;

-- Final verification queries
SELECT 'Migration completed successfully!' as status;

-- Test the new functions
SELECT 'Testing parcel status progression function...' as test_info;
-- Note: Replace 'test-box-id' with an actual box_id from your database
-- SELECT * FROM get_parcel_status_progression('test-box-id'::UUID, 'box');

-- Show the new view
SELECT 'Testing status analytics view...' as test_info;
SELECT * FROM status_analytics;

-- Test the average time between scans function
SELECT 'Testing average time between scans function...' as test_info;
SELECT * FROM get_avg_time_between_scans_by_status(); 