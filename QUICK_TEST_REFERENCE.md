# Quick Test Reference - SmartTrack Logistics

## 🔑 **Login Credentials**

### **Warehouse User**

```
Email: warehouse@smarttrack.com
Password: warehouse123
```

### **Customer User**

```
Email: customer@smarttrack.com
Password: customer123
```

### **Admin User**

```
Email: admin@smarttrack.com
Password: admin123
```

## 📱 **Quick Test URLs**

### **Main App**

- **Development Server**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000/login`
- **Customer Portal**: `http://localhost:3000/portal`

### **Warehouse Functions**

- **Register Box**: `http://localhost:3000/register-box`
- **Register Sack**: `http://localhost:3000/register-sack`
- **Scan & Log**: `http://localhost:3000/scan-and-log`

### **Admin Functions**

- **Admin Panel**: `http://localhost:3000/admin-panel`
- **Test Functionality**: `http://localhost:3000/test`

### **Public Tracking**

- **Box Tracking**: `http://localhost:3000/track/box/{boxId}`
- **Sack Tracking**: `http://localhost:3000/track/sack/{sackId}`

## 📋 **Sample Customer Data**

### **John Doe (Electronics)**

```
Name: John Doe
Phone: +1234567890
Email: john.doe@email.com
Destination: New York, USA
Content: Electronics (Laptop, Phone, Accessories)
Weight: 5.5 kg
```

### **Jane Smith (Clothing)**

```
Name: Jane Smith
Phone: +1987654321
Email: jane.smith@email.com
Destination: Los Angeles, USA
Content: Clothing (Dresses, Shoes, Accessories)
Weight: 3.2 kg
```

### **Carlos Rodriguez (Documents)**

```
Name: Carlos Rodriguez
Phone: +1555123456
Email: carlos.rodriguez@email.com
Destination: Miami, USA
Content: Documents (Contracts, Papers, Files)
Weight: 1.8 kg
```

### **Sarah Johnson (Books)**

```
Name: Sarah Johnson
Phone: +1444567890
Email: sarah.johnson@email.com
Destination: Chicago, USA
Content: Books (Textbooks, Novels, Magazines)
Weight: 4.1 kg
```

## 🚀 **Quick Test Workflow**

### **1. Warehouse Testing (5 minutes)**

1. Login: `warehouse@smarttrack.com` / `warehouse123`
2. Go to Register Box
3. Use John Doe data
4. Generate QR code
5. Go to Scan & Log
6. Scan QR code
7. Update status to "in_transit"

### **2. Customer Testing (3 minutes)**

1. Scan QR code with phone camera
2. Verify public tracking page loads
3. Login: `customer@smarttrack.com` / `customer123`
4. Check customer portal

### **3. Admin Testing (2 minutes)**

1. Login: `admin@smarttrack.com` / `admin123`
2. Access admin panel
3. View user management

## 🔍 **Common Test Scenarios**

### **QR Code Generation**

- Register new box/sack
- Verify QR code displays
- Download label
- Note Box/Sack ID

### **QR Code Scanning**

- Use phone camera
- Grant camera permissions
- Verify tracking page loads
- Check parcel details

### **Status Updates**

- Scan existing parcel
- Update status: packed → in_transit → out_for_delivery → delivered
- Add location and photo
- Send notifications

### **Customer Portal**

- Login as customer
- View parcel list
- Check parcel details
- Test chat functionality

## ⚡ **Quick Commands**

```bash
# Start development server
npm run dev

# Run setup verification
node setup-testing.js

# Check project status
npm run build
```

## 🐛 **Quick Troubleshooting**

### **Login Issues**

- Check `.env.local` file exists
- Verify Supabase credentials
- Clear browser cache

### **QR Code Issues**

- Grant camera permissions
- Use HTTPS or localhost
- Check QR code format

### **Database Issues**

- Run `enhanced_scan_history_migration.sql`
- Run `setup_test_users.sql`
- Check Supabase connection

## 📞 **Support Files**

- `TEST_USER_CREDENTIALS.md` - Detailed user information
- `COMPREHENSIVE_TESTING_GUIDE.md` - Full testing guide
- `PROJECT_SYNC_CHECK.md` - Project synchronization status
- `setup_test_users.sql` - Database setup script

---

**Ready to test! 🚀**
