# QR Code Functionality Test Guide

## Overview

This guide tests the complete QR code workflow for inventory tracking in the SmartTrack Logistics platform.

## Test Scenarios

### 1. Register Box with QR Code Generation

**Steps:**

1. Navigate to `/register-box`
2. Fill in customer information (or search existing customer)
3. Enter box details:
   - Content: "Electronics and clothing"
   - Quantity: 1
   - Weight: 2.5 kg
   - Price: ₦15,000
   - Destination: "Lagos, Nigeria"
4. Click "Register Box"

**Expected Results:**

- ✅ Box is created in database
- ✅ QR code is generated with URL: `https://smarttrack.com/track/box/{boxId}`
- ✅ QR code image is displayed
- ✅ Download label button works
- ✅ Box status is set to "packed"

### 2. Register Sack with QR Code Generation

**Steps:**

1. Navigate to `/register-sack`
2. Fill in customer information (or search existing customer)
3. Enter sack details:
   - Content: "Food items and spices"
   - Quantity: 1
   - Weight: 1.8 kg
   - Price: ₦8,500
   - Destination: "Abuja, Nigeria"
4. Click "Register Sack"

**Expected Results:**

- ✅ Sack is created in database
- ✅ QR code is generated with URL: `https://smarttrack.com/track/sack/{sackId}`
- ✅ QR code image is displayed
- ✅ Download label button works
- ✅ Sack status is set to "packed"

### 3. QR Code Scanning and Public Access

**Steps:**

1. Scan the generated QR code with a mobile device
2. Verify the URL opens: `https://smarttrack.com/track/box/{boxId}` or `/track/sack/{sackId}`
3. Check that the tracking page loads without requiring login

**Expected Results:**

- ✅ QR code URL opens correctly
- ✅ Public tracking page displays parcel information
- ✅ No authentication required for basic tracking
- ✅ Customer information is displayed
- ✅ Parcel details are shown
- ✅ Link to customer portal is provided

### 4. Scan and Log Inventory Tracking

**Steps:**

1. Navigate to `/scan-and-log`
2. Click "Start Scanning" or manually enter QR code URL
3. Scan the QR code of a registered box/sack
4. Fill in scan details:
   - Status: "In Transit"
   - Status Message: "Package picked up from warehouse"
   - Estimated Delivery: Tomorrow's date
   - Comment: "Package in good condition"
   - Capture photo (optional)
5. Click "Log Scan"

**Expected Results:**

- ✅ QR code is scanned successfully
- ✅ Parcel information is loaded
- ✅ Scan record is created in `scan_history` table
- ✅ Parcel status is updated
- ✅ Location is captured (if GPS enabled)
- ✅ Photo is uploaded (if captured)
- ✅ Status is logged in scan history

### 5. Complete Inventory Tracking Workflow

**Steps:**

1. Register a new box/sack (see steps 1-2)
2. Scan and log at "Packed" status
3. Scan and log at "In Transit" status
4. Scan and log at "Out for Delivery" status
5. Scan and log at "Delivered" status

**Expected Results:**

- ✅ Each scan creates a record in `scan_history`
- ✅ Each scan includes:
  - Timestamp
  - Location (if available)
  - Status
  - Status message
  - Photo (if captured)
  - Comments
- ✅ Parcel status is updated at each scan
- ✅ Complete audit trail is maintained

### 6. Database Verification

**SQL Queries to Run:**

```sql
-- Check boxes table
SELECT box_id, content, status, created_at FROM boxes ORDER BY created_at DESC LIMIT 5;

-- Check sacks table
SELECT sack_id, content, status, created_at FROM sacks ORDER BY created_at DESC LIMIT 5;

-- Check scan history
SELECT
    scan_id,
    box_id,
    sack_id,
    status,
    status_message,
    scan_location,
    scan_time
FROM scan_history
ORDER BY scan_time DESC
LIMIT 10;

-- Check scan history with status column
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'scan_history'
AND column_name = 'status';
```

**Expected Results:**

- ✅ Boxes and sacks are properly stored
- ✅ Scan history records are created
- ✅ Status column exists in scan_history table
- ✅ All required fields are populated

### 7. QR Code URL Format Verification

**Test URLs:**

- `https://smarttrack.com/track/box/{boxId}` - Should open box tracking
- `https://smarttrack.com/track/sack/{sackId}` - Should open sack tracking

**Expected Results:**

- ✅ URLs are accessible without authentication
- ✅ Correct parcel information is displayed
- ✅ Tracking timeline is shown
- ✅ Customer can access their parcel details

## Inventory Tracking Requirements Met

✅ **QR Code Generation**: Each box/sack gets a unique QR code
✅ **Public Access**: QR codes can be scanned without login
✅ **Inventory Logging**: Every scan creates a comprehensive log
✅ **Status Tracking**: Status is updated and logged at each scan
✅ **Location Tracking**: GPS coordinates are captured
✅ **Photo Documentation**: Photos can be attached to scans
✅ **Audit Trail**: Complete history of all scans is maintained
✅ **Customer Access**: Customers can track their parcels via QR codes

## Issues to Fix

1. **Database Schema**: Run `fix_scan_history_status.sql` to add status column
2. **Public Routes**: Added `/track/box/:id` and `/track/sack/:id` routes
3. **ParcelTimeline Component**: Updated to handle public access
4. **Scan Logging**: Enhanced to include status in scan records

## Testing Checklist

- [ ] Register box with QR code
- [ ] Register sack with QR code
- [ ] Scan QR code for public access
- [ ] Log scan with status update
- [ ] Verify database records
- [ ] Test complete workflow
- [ ] Check public tracking pages
- [ ] Verify inventory audit trail
