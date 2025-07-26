-- Simple Fix for Admin User
-- This script updates the existing admin user to match the auth.users user_id

-- Step 1: Show current mismatch
SELECT '=== CURRENT MISMATCH ===' as info;
SELECT 
    a.id as auth_user_id,
    a.email as auth_email,
    ua.user_id as account_user_id,
    ua.email as account_email,
    ua.role as account_role,
    CASE WHEN a.id = ua.user_id THEN 'MATCH' ELSE 'MISMATCH' END as status
FROM auth.users a
LEFT JOIN user_accounts ua ON a.id = ua.user_id
WHERE a.email = 'admin@smartexporters.com';

-- Step 2: Update the user_id in user_accounts to match auth.users
UPDATE user_accounts 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@smartexporters.com')
WHERE email = 'admin@smartexporters.com';

-- Step 3: Ensure role is set to admin
UPDATE user_accounts 
SET role = 'admin'
WHERE email = 'admin@smartexporters.com';

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as info;
SELECT 
    a.id as auth_user_id,
    a.email as auth_email,
    ua.user_id as account_user_id,
    ua.email as account_email,
    ua.role as account_role,
    CASE WHEN a.id = ua.user_id THEN 'MATCH' ELSE 'MISMATCH' END as status
FROM auth.users a
LEFT JOIN user_accounts ua ON a.id = ua.user_id
WHERE a.email = 'admin@smartexporters.com';

SELECT '=== ADMIN USER FIXED ===' as info; 