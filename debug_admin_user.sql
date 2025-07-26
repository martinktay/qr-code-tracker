-- Debug Admin User Status
-- This script will help identify why the admin user is not being detected properly

-- Step 1: Check if admin user exists in auth.users
SELECT '=== CHECKING AUTH.USERS ===' as info;
SELECT 
    id,
    email,
    created_at,
    CASE WHEN email_confirmed_at IS NOT NULL THEN 'CONFIRMED' ELSE 'NOT CONFIRMED' END as email_status
FROM auth.users 
WHERE email = 'admin@smartexporters.com';

-- Step 2: Check if admin user exists in user_accounts
SELECT '=== CHECKING USER_ACCOUNTS ===' as info;
SELECT 
    user_id,
    username,
    email,
    role,
    created_at
FROM user_accounts 
WHERE email = 'admin@smartexporters.com';

-- Step 3: Check if there's a mismatch between user_id values
SELECT '=== CHECKING FOR MISMATCH ===' as info;
SELECT 
    'auth.users' as table_name,
    id::text as user_id,
    email
FROM auth.users 
WHERE email = 'admin@smartexporters.com'
UNION ALL
SELECT 
    'user_accounts' as table_name,
    user_id::text as user_id,
    email
FROM user_accounts 
WHERE email = 'admin@smartexporters.com';

-- Step 4: Check all admin users in user_accounts
SELECT '=== ALL ADMIN USERS ===' as info;
SELECT 
    user_id,
    username,
    email,
    role,
    created_at
FROM user_accounts 
WHERE role = 'admin'
ORDER BY created_at;

-- Step 5: Check if the user_id from auth.users matches user_accounts
SELECT '=== CROSS-REFERENCE CHECK ===' as info;
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

-- Step 6: If no match found, create the admin user account
SELECT '=== FIX SCRIPT ===' as info;
SELECT 
    'If no admin user found in user_accounts, run this:' as instruction,
    'INSERT INTO user_accounts (user_id, username, hashed_password, role, email, created_at) VALUES (' ||
    '(SELECT id FROM auth.users WHERE email = ''admin@smartexporters.com''), ' ||
    '''admin@smartexporters.com'', ' ||
    '''admin123'', ' ||
    '''admin'', ' ||
    '''admin@smartexporters.com'', ' ||
    'NOW());' as sql_command; 