-- Fix Admin User Setup
-- This script ensures the admin user is properly configured

-- Step 1: Check current status
SELECT '=== CURRENT STATUS ===' as info;
SELECT 
    'auth.users' as table_name,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'admin@smartexporters.com'
UNION ALL
SELECT 
    'user_accounts' as table_name,
    COUNT(*) as count
FROM user_accounts 
WHERE email = 'admin@smartexporters.com';

-- Step 2: If admin exists in auth.users but not in user_accounts, create the account
INSERT INTO user_accounts (user_id, username, hashed_password, role, email, created_at)
SELECT 
    id as user_id,
    'admin@smartexporters.com' as username,
    '' as hashed_password,
    'admin' as role,
    'admin@smartexporters.com' as email,
    NOW() as created_at
FROM auth.users 
WHERE email = 'admin@smartexporters.com'
AND id NOT IN (SELECT user_id FROM user_accounts WHERE email = 'admin@smartexporters.com');

-- Step 3: Update existing admin user to ensure correct role
UPDATE user_accounts 
SET role = 'admin'
WHERE email = 'admin@smartexporters.com' 
AND role != 'admin';

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as info;
SELECT 
    user_id,
    username,
    email,
    role,
    created_at
FROM user_accounts 
WHERE email = 'admin@smartexporters.com';

-- Step 5: Check cross-reference
SELECT '=== CROSS-REFERENCE VERIFICATION ===' as info;
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

SELECT '=== ADMIN USER FIX COMPLETE ===' as info; 