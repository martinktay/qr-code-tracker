# Test User Credentials - SmartTrack Logistics

## 🧪 **Test User Information for App Testing**

This document provides test user credentials and sample data for testing both Warehouse and Customer interfaces of the SmartTrack Logistics platform.

## 👥 **Test Users**

### **1. Warehouse User**

```
Email: warehouse@smarttrack.com
Password: warehouse123
Role: warehouse
```

### **2. Customer User**

```
Email: customer@smarttrack.com
Password: customer123
Role: customer
```

### **3. Admin User**

```
Email: admin@smarttrack.com
Password: admin123
Role: admin
```

## 📋 **Sample Customer Data for Testing**

### **Customer 1 - John Doe**

```
First Name: John
Last Name: Doe
Phone: +1234567890
Email: john.doe@email.com
Destination: New York, USA
```

### **Customer 2 - Jane Smith**

```
First Name: Jane
Last Name: Smith
Phone: +1987654321
Email: jane.smith@email.com
Destination: Los Angeles, USA
```

### **Customer 3 - Carlos Rodriguez**

```
First Name: Carlos
Last Name: Rodriguez
Phone: +1555123456
Email: carlos.rodriguez@email.com
Destination: Miami, USA
```

### **Customer 4 - Sarah Johnson**

```
First Name: Sarah
Last Name: Johnson
Phone: +1444567890
Email: sarah.johnson@email.com
Destination: Chicago, USA
```

## 📦 **Sample Parcel Data for Testing**

### **Box 1 - Electronics**

```
Customer: John Doe
Weight: 5.5 kg
Content: Electronics (Laptop, Phone, Accessories)
Destination: New York, USA
Status: packed
```

### **Box 2 - Clothing**

```
Customer: Jane Smith
Weight: 3.2 kg
Content: Clothing (Dresses, Shoes, Accessories)
Destination: Los Angeles, USA
Status: in_transit
```

### **Sack 1 - Documents**

```
Customer: Carlos Rodriguez
Weight: 1.8 kg
Content: Documents (Contracts, Papers, Files)
Destination: Miami, USA
Status: out_for_delivery
```

### **Sack 2 - Books**

```
Customer: Sarah Johnson
Weight: 4.1 kg
Content: Books (Textbooks, Novels, Magazines)
Destination: Chicago, USA
Status: delivered
```

## 🚀 **Testing Scenarios**

### **Scenario 1: Complete Warehouse Workflow**

1. **Login as Warehouse User**

   - Email: `warehouse@smarttrack.com`
   - Password: `warehouse123`

2. **Register New Box**

   - Customer: John Doe
   - Weight: 5.5 kg
   - Content: Electronics
   - Destination: New York

3. **Generate QR Code**

   - Download the generated QR code
   - Note the Box ID for tracking

4. **Scan & Log Process**
   - Go to Scan & Log
   - Scan the QR code
   - Update status to "in_transit"
   - Add location and photo
   - Send notifications

### **Scenario 2: Customer Tracking**

1. **Public QR Code Access**

   - Use phone camera to scan QR code
   - Verify public tracking page loads
   - Check parcel details and status

2. **Customer Portal Access**
   - Login as Customer: `customer@smarttrack.com`
   - Password: `customer123`
   - View parcel list
   - Check detailed timeline

### **Scenario 3: Admin Management**

1. **Login as Admin**

   - Email: `admin@smarttrack.com`
   - Password: `admin123`

2. **User Management**
   - Create new warehouse user
   - Assign roles
   - View system analytics

## 📱 **QR Code Testing Data**

### **Sample QR Code URLs**

```
Box: https://smarttrack.com/track/box/{boxId}
Sack: https://smarttrack.com/track/sack/{sackId}
```

### **Test QR Code Content**

When you register a box/sack, the QR code will contain:

- Box: `https://smarttrack.com/track/box/550e8400-e29b-41d4-a716-446655440000`
- Sack: `https://smarttrack.com/track/sack/550e8400-e29b-41d4-a716-446655440001`

## 🔔 **Notification Testing**

### **Email Notifications**

- **Recipient**: Customer email addresses
- **Templates**: Status updates in multiple languages
- **Languages**: English, Spanish, French, Yoruba

### **WhatsApp Notifications**

- **Recipient**: Customer phone numbers
- **Format**: `+1234567890` (with country code)
- **Content**: Status updates and tracking information

## 📊 **Database Test Data**

### **Sample Scan History**

```sql
-- Sample scan records for testing
INSERT INTO scan_history (
    box_id,
    status,
    status_message,
    scan_location,
    comment
) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'packed', 'Package packed at warehouse', '(40.7128,-74.0060)', 'Package in good condition'),
('550e8400-e29b-41d4-a716-446655440000', 'in_transit', 'Package picked up by courier', '(40.7128,-74.0060)', 'On route to destination'),
('550e8400-e29b-41d4-a716-446655440000', 'out_for_delivery', 'Out for delivery', '(40.7128,-74.0060)', 'Final delivery attempt');
```

## 🧪 **Step-by-Step Testing Guide**

### **Phase 1: Warehouse Testing**

1. **Login as Warehouse User**

   ```
   Email: warehouse@smarttrack.com
   Password: warehouse123
   ```

2. **Register New Parcel**

   - Go to `/register-box` or `/register-sack`
   - Use sample customer data above
   - Verify QR code generation

3. **Test Scan & Log**
   - Go to `/scan-and-log`
   - Scan the generated QR code
   - Update status through progression
   - Test location and photo capture

### **Phase 2: Customer Testing**

1. **Public QR Tracking**

   - Scan QR code with phone camera
   - Verify public tracking page loads
   - Check parcel information display

2. **Customer Portal**
   ```
   Email: customer@smarttrack.com
   Password: customer123
   ```
   - Login to customer portal
   - View parcel list
   - Test chat functionality

### **Phase 3: Admin Testing**

1. **Admin Panel**
   ```
   Email: admin@smarttrack.com
   Password: admin123
   ```
   - Access admin panel
   - Test user management
   - View analytics

## 🔍 **Verification Checklist**

### **Warehouse Functions** ✅

- [ ] Login with warehouse credentials
- [ ] Register new box with customer data
- [ ] Register new sack with customer data
- [ ] Generate QR codes successfully
- [ ] Scan QR codes in Scan & Log
- [ ] Update parcel status
- [ ] Capture location and photos
- [ ] Send notifications

### **Customer Functions** ✅

- [ ] Scan QR code with phone camera
- [ ] Access public tracking page
- [ ] Login to customer portal
- [ ] View parcel list
- [ ] Check parcel details
- [ ] View status timeline
- [ ] Test chat functionality

### **Admin Functions** ✅

- [ ] Login with admin credentials
- [ ] Access admin panel
- [ ] Manage users
- [ ] View system analytics
- [ ] Configure system settings

## 🐛 **Troubleshooting**

### **Login Issues**

- Verify Supabase credentials in `.env.local`
- Check network connectivity
- Ensure user accounts exist in database

### **QR Code Issues**

- Grant camera permissions in browser
- Ensure QR code is properly generated
- Check QR code URL format

### **Database Issues**

- Run database migration: `enhanced_scan_history_migration.sql`
- Verify status column exists
- Check data integrity

## 📞 **Support Information**

### **Test Environment**

- **URL**: `http://localhost:3000`
- **Database**: Supabase
- **Storage**: Supabase Storage
- **Notifications**: Netlify Functions

### **Contact**

For testing issues or questions, refer to:

- `COMPREHENSIVE_TESTING_GUIDE.md`
- `PROJECT_SYNC_CHECK.md`
- Database migration script: `enhanced_scan_history_migration.sql`

---

**Status: ✅ READY FOR TESTING WITH PROVIDED CREDENTIALS**
