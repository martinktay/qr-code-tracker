-- Create Admin User Account
-- This script sets up the admin user properly

-- Step 1: First, create the user in Supabase Auth (if not exists)
-- Go to Supabase Dashboard → Authentication → Users → Add User
-- Email: admin@smartexporters.com
-- Password: (set a password you will use)

-- Step 2: Get the user_id from auth.users
-- Run this query to get the UUID of the admin user:
SELECT id, email FROM auth.users WHERE email = 'admin@smartexporters.com';

-- Step 3: Insert into user_accounts table
-- Replace 'USER_ID_FROM_STEP_2' with the actual UUID from step 2
INSERT INTO user_accounts (
    user_id,
    username,
    hashed_password,
    role,
    email,
    created_at
) VALUES (
    'USER_ID_FROM_STEP_2',  -- Replace with actual UUID from auth.users
    'admin@smartexporters.com',
    '',  -- Leave empty as Supabase Auth handles password
    'admin',
    'admin@smartexporters.com',
    NOW()
);

-- Step 4: Verify the admin user was created
SELECT 
    user_id,
    username,
    role,
    email,
    created_at
FROM user_accounts 
WHERE email = 'admin@smartexporters.com';

-- Step 5: Check if user exists in auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'admin@smartexporters.com'; 