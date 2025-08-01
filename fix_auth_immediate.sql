-- Immediate Authentication Fix
-- This script fixes the 406 error by allowing access to user_accounts table

-- Drop any existing restrictive policies on user_accounts
DROP POLICY IF EXISTS "Enable read access for all users" ON user_accounts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON user_accounts;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_accounts;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON user_accounts;
DROP POLICY IF EXISTS "Allow all operations on user_accounts" ON user_accounts;

-- Create a simple policy that allows all operations on user_accounts
CREATE POLICY "Allow all operations on user_accounts" ON user_accounts FOR ALL USING (true) WITH CHECK (true);

-- Insert default users if they don't exist
INSERT INTO user_accounts (username, email, hashed_password, role, created_at)
VALUES 
    ('admin', 'admin@smartexporters.com', 'YWRtaW4xMjM=', 'admin', NOW()),
    ('warehouse_staff', 'warehouse@smartexporters.com', 'd2FyZWhvdXNlMTIz', 'warehouse_staff', NOW()),
    ('customer', 'customer@example.com', 'Y3VzdG9tZXIxMjM=', 'customer', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify the fix
SELECT 'Authentication fix completed!' as status;
SELECT user_id, username, email, role FROM user_accounts ORDER BY role, username;