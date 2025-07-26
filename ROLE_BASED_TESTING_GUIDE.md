# 🎯 Role-Based Testing Guide - SmartTrack Logistics

## 🚀 **What's New - Role-Based Functionality**

The SmartTrack application now properly differentiates between user roles, providing a realistic simulation of a logistics platform:

### **👑 Admin Role**

- **Full system access** - sees all data and statistics
- **System overview** with total customers, users, and alerts
- **All navigation items** including user management, analytics, and settings
- **Complete parcel management** - register, scan, track, and manage all parcels

### **🏭 Warehouse Staff Role**

- **Operational focus** - sees only parcels that need attention
- **Limited navigation** - register parcels, scan & log, map tracker
- **Pending alerts** - shows parcels that need processing
- **No delivered items** - focuses on active operations

### **👤 Customer Role**

- **Personal view** - sees only their own shipments
- **Limited navigation** - dashboard and track package
- **Shipment status** - tracks their own parcels
- **No operational features** - can't register or scan parcels

---

## 🔑 **Test User Setup**

### **Option 1: Manual Setup in Supabase Dashboard**

1. **Go to your Supabase Dashboard**
2. **Navigate to Authentication > Users**
3. **Create/Update these users:**

#### **👑 Admin User**

- **Email:** `admin@smartexporters.com`
- **Password:** `Admin123!`
- **Role:** `admin`

#### **🏭 Warehouse Staff User**

- **Email:** `warehouse1@smartexporters.com`
- **Password:** `Warehouse123!`
- **Role:** `warehouse_staff`

#### **👤 Customer User**

- **Email:** `customer1@example.com`
- **Password:** `Customer123!`
- **Role:** `customer`

### **Option 2: Use Existing Admin Account**

If you already have the admin account working, you can test most features with:

- **Email:** `admin@smartexporters.com`
- **Password:** `Admin123!`

---

## 🧪 **Testing Scenarios**

### **1. Admin Dashboard Test**

**Login as:** `admin@smartexporters.com`

**What you should see:**

- ✅ **System Overview section** with total customers, users, alerts
- ✅ **All statistics** (boxes, sacks, in transit, delivered, pending)
- ✅ **Recent parcels** from all customers
- ✅ **Full navigation menu** with all options
- ✅ **Red "Administrator" badge** in sidebar

**Expected Statistics:**

- Total Customers: ~500 (from seed data)
- Total Users: ~3 (admin, warehouse, customer)
- Total Parcels: ~300 (boxes + sacks)
- Pending Alerts: ~100 (packed items)

### **2. Warehouse Staff Dashboard Test**

**Login as:** `warehouse1@smartexporters.com`

**What you should see:**

- ✅ **Operations Overview** with pending alerts
- ✅ **Limited statistics** (no delivered items shown)
- ✅ **Parcels needing attention** (packed, in transit, out for delivery)
- ✅ **Blue "Warehouse Staff" badge** in sidebar
- ✅ **Limited navigation** (no admin features)

**Expected Statistics:**

- Total Boxes: ~200 (active parcels only)
- Total Sacks: ~100 (active parcels only)
- In Transit: ~150
- Delivered: 0 (warehouse staff don't see delivered items)
- Pending: ~50 (packed items needing attention)

### **3. Customer Dashboard Test**

**Login as:** `customer1@example.com`

**What you should see:**

- ✅ **"My Shipments" section** with personal message
- ✅ **Only their own parcels** in statistics
- ✅ **Limited navigation** (dashboard and track package only)
- ✅ **Green "Customer" badge** in sidebar
- ✅ **Personalized welcome message**

**Expected Statistics:**

- Total Boxes: ~2-5 (their own boxes)
- Total Sacks: ~1-3 (their own sacks)
- In Transit: ~2-3
- Delivered: ~1-2
- Pending: ~0-1

---

## 🔍 **Feature Testing Checklist**

### **✅ Navigation Differences**

- [ ] **Admin:** All navigation items visible
- [ ] **Warehouse Staff:** Only operational items visible
- [ ] **Customer:** Only dashboard and track package visible

### **✅ Dashboard Content**

- [ ] **Admin:** System overview + all statistics
- [ ] **Warehouse Staff:** Operations overview + active parcels
- [ ] **Customer:** Personal shipments + limited statistics

### **✅ Data Filtering**

- [ ] **Admin:** Sees all parcels from all customers
- [ ] **Warehouse Staff:** Sees only active parcels (no delivered)
- [ ] **Customer:** Sees only their own parcels

### **✅ Role Indicators**

- [ ] **Admin:** Red "Administrator" badge
- [ ] **Warehouse Staff:** Blue "Warehouse Staff" badge
- [ ] **Customer:** Green "Customer" badge

### **✅ Page Titles**

- [ ] **Admin:** "Recent Parcels"
- [ ] **Warehouse Staff:** "Parcels Needing Attention"
- [ ] **Customer:** "My Recent Shipments"

---

## 🐛 **Troubleshooting**

### **Issue: All users see same data**

**Solution:** Check that user roles are properly set in the `user_accounts` table

### **Issue: Customer sees no parcels**

**Solution:** Ensure customer phone number matches a customer record in the database

### **Issue: Navigation items not filtering**

**Solution:** Verify the `userRole` is being correctly fetched in `AuthContext`

### **Issue: Statistics showing zeros**

**Solution:** Check that seed data is properly loaded and RLS policies allow access

---

## 📱 **Mobile Testing**

1. **Open Developer Tools (F12)**
2. **Click device toolbar** (mobile icon)
3. **Select mobile device** (iPhone, Android, etc.)
4. **Test responsive design** for each role

### **Mobile Features to Test:**

- [ ] **Sidebar navigation** collapses properly
- [ ] **Dashboard cards** stack correctly
- [ ] **Tables** scroll horizontally
- [ ] **Forms** are mobile-friendly
- [ ] **QR scanner** works on mobile

---

## 🎯 **Success Criteria**

### **✅ Role-Based Access Control**

- Each role sees appropriate data
- Navigation is properly filtered
- Statistics are role-specific

### **✅ User Experience**

- Clear role indicators
- Intuitive navigation
- Responsive design

### **✅ Data Security**

- Customers can't see other customers' data
- Warehouse staff can't access admin features
- Admin has full system access

---

## 🚀 **Next Steps**

After testing the role-based functionality:

1. **Report any issues** you find
2. **Suggest improvements** for the user experience
3. **Test additional features** like QR scanning, messaging, etc.
4. **Explore the admin panel** for system management

---

## 📞 **Support**

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Supabase connection
3. Ensure seed data is loaded
4. Contact support with specific error messages

**Happy Testing! 🎉**
