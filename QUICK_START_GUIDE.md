# 🚀 SmartTrack Quick Start Guide

## Step 1: Set Up Database with Seed Data

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**

   - Visit: https://supabase.com/dashboard
   - Select your project: `yxlswprzumjpvilxrmrc`

2. **Execute the Database Schema**

   - Go to **SQL Editor** in the left sidebar
   - Copy and paste the contents of `supabase_schema.sql`
   - Click **Run** to create all tables and functions

3. **Add Seed Data**
   - In the same SQL Editor
   - Copy and paste the contents of `seed-data.sql`
   - Click **Run** to insert 50+ sample records

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref yxlswprzumjpvilxrmrc

# Push schema and seed data
supabase db push
```

## Step 2: Create Admin User

1. **Go to Authentication > Users**

   - In your Supabase dashboard
   - Click **Add User**

2. **Create Admin Account**

   - **Email**: `admin@smartexporters.com`
   - **Password**: Choose a secure password (e.g., `Admin123!`)
   - Click **Create User**

3. **Set User Role**
   - Go to **Table Editor** > `user_accounts`
   - Find the user with email `admin@smartexporters.com`
   - Set `role` to `admin`
   - Save the changes

## Step 3: Run the Application

```bash
# Start the development server
npm run dev
```

The app will be available at: **http://localhost:3000** (or the port shown in terminal)

## Step 4: Login and Test

### Admin Login Credentials

- **Email**: `admin@smartexporters.com`
- **Password**: `Admin123!` (or whatever you set)

### Test Accounts Available

- **Warehouse Staff**: `warehouse1@smartexporters.com`
- **Customers**: `customer1@example.com`, `customer2@example.com`, etc.

## Step 5: Test Features

### As Admin:

1. **Dashboard** - View statistics and recent activity
2. **Admin Panel** - Manage users, company settings, branding
3. **Map Tracker** - View all parcels on a map
4. **Register Boxes/Sacks** - Create new parcels
5. **Scan & Log** - Update parcel status with QR codes

### As Warehouse Staff:

1. **Register Parcels** - Create new boxes and sacks
2. **Scan & Update** - Use QR scanner to update status
3. **View Timeline** - Check parcel history

### As Customer:

1. **Customer Portal** - Track parcels by QR code or phone
2. **Parcel Timeline** - View detailed delivery history
3. **Chat** - Message with company staff

## Sample Data Included

- **50 Customers** with Nigerian destinations
- **30 Boxes** with various contents and statuses
- **20 Sacks** with bulk items
- **50+ Scan History** records with timestamps
- **Sample Messages** for testing chat functionality
- **Company Settings** with branding info

## Troubleshooting

### If you get "supabaseUrl is required":

- Ensure `.env.local` file exists in project root
- Check that environment variables are correct

### If login fails:

- Verify the user exists in Supabase Auth
- Check that the role is set correctly in `user_accounts` table

### If QR codes don't work:

- Ensure camera permissions are granted
- Test with the sample QR codes in the seed data

## Next Steps

1. **Customize Branding** - Upload your logo and update company info
2. **Configure WhatsApp** - Set up Twilio for notifications
3. **Set up Email** - Configure SMTP for email alerts
4. **Deploy** - Deploy to Netlify or Vercel for production

---

**🎉 You're all set! The SmartTrack logistics platform is ready to use.**
