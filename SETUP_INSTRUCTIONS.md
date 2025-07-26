# 🔗 Frontend-Backend Connection Setup

## Step 1: Execute Database Schema in Supabase

1. **Go to your Supabase Dashboard**

   - Visit: https://supabase.com/dashboard
   - Select your project: `yxlswprzumjpvilxrmrc`

2. **Go to SQL Editor**

   - Click on **"SQL Editor"** in the left sidebar

3. **Execute the Schema**

   - Copy the entire contents of `corrected_schema.sql`
   - Paste it into the SQL Editor
   - Click **"Run"** to create all tables and functions

4. **Add Seed Data**
   - Copy the entire contents of `seed_data.sql`
   - Paste it into a new query in the SQL Editor
   - Click **"Run"** to insert test data

## Step 2: Create Admin User in Supabase Auth

1. **Go to Authentication > Users**

   - Click **"Add User"**

2. **Create Admin Account**

   - **Email**: `admin@smartexporters.com`
   - **Password**: `Admin123!`
   - Click **"Create User"**

3. **Verify User Role**
   - Go to **Table Editor** > `user_accounts`
   - Find the user with email `admin@smartexporters.com`
   - Ensure `role` is set to `admin`
   - If not, update it manually

## Step 3: Test the Connection

1. **Open your app**: http://localhost:3004
2. **Login with**:
   - **Email**: `admin@smartexporters.com`
   - **Password**: `Admin123!`

## Step 4: Verify Everything is Working

### Check Database Tables:

- ✅ `customers` - Should have 3 customers
- ✅ `boxes` - Should have 3 boxes
- ✅ `scan_history` - Should have 3 scan records
- ✅ `user_accounts` - Should have admin user
- ✅ `company_settings` - Should have company info

### Check Authentication:

- ✅ Admin user exists in Supabase Auth
- ✅ User role is set to 'admin' in user_accounts table
- ✅ Frontend can connect to Supabase

## Troubleshooting

### If login fails with "Invalid credentials":

1. **Check if user exists in Supabase Auth**

   - Go to Authentication > Users
   - Verify `admin@smartexporters.com` exists

2. **Check if user exists in user_accounts table**

   - Go to Table Editor > user_accounts
   - Verify the user record exists with role 'admin'

3. **Check environment variables**
   - Ensure `.env.local` has correct Supabase URL and key
   - Restart the dev server after changes

### If you get "supabaseUrl is required":

1. **Check .env.local file**
   - Ensure it exists in project root
   - Ensure it has correct format:
   ```
   VITE_SUPABASE_URL=https://yxlswprzumjpvilxrmrc.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### If tables don't exist:

1. **Execute the schema again**
   - Copy `corrected_schema.sql` content
   - Run it in Supabase SQL Editor

## Expected Results

After successful setup:

- ✅ Login page loads without errors
- ✅ Admin can login with `admin@smartexporters.com` / `Admin123!`
- ✅ Dashboard shows with admin features
- ✅ All navigation works
- ✅ Database queries work

## Next Steps After Setup

1. **Test Admin Features**:

   - Dashboard statistics
   - Admin Panel
   - User management
   - Company settings

2. **Test Warehouse Staff Features**:

   - Register boxes/sacks
   - Scan QR codes
   - Update parcel status

3. **Test Customer Features**:
   - Customer portal
   - Parcel tracking
   - Chat functionality

---

**🎉 Once you complete these steps, your frontend and backend will be fully connected!**
