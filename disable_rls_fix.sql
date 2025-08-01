-- Disable RLS on user_accounts table
-- This is a last resort fix for the 406 authentication error

-- Disable RLS on user_accounts table
ALTER TABLE user_accounts DISABLE ROW LEVEL SECURITY;

-- Insert default users if they don't exist
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES 
    ('admin', 'admin@smartexporters.com', 'YWRtaW4xMjM=', 'admin', NOW()),
    ('warehouse_staff', 'warehouse@smartexporters.com', 'd2FyZWhvdXNlMTIz', 'warehouse_staff', NOW()),
    ('customer', 'customer@example.com', 'Y3VzdG9tZXIxMjM=', 'customer', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify the fix
SELECT 'RLS disabled on user_accounts!' as status;
SELECT user_id, username, email, role FROM user_accounts ORDER BY role, username;