# ClickStay Manuel Resort - Complete User Guide

A comprehensive step-by-step guide to using all features of the Manuel Resort Online Booking Platform.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Guest User Guide](#guest-user-guide)
3. [Admin User Guide](#admin-user-guide)
4. [Cashier User Guide](#cashier-user-guide)
5. [Troubleshooting](#troubleshooting)

---

# Getting Started

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- PayMongo account (for payments)
- Email service (Gmail/SMTP)

## Installation Steps

### 1. Clone and Install

```bash
cd "Online Booking"
npm install
```

### 2. Environment Setup

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/resort_db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# PayMongo
PAYMONGO_SECRET_KEY="sk_test_your_secret_key"
PAYMONGO_PUBLIC_KEY="pk_test_your_public_key"

# Email (Gmail)
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="Manuel Resort <noreply@manuelresort.com>"

# Admin Credentials
ADMIN_EMAIL="admin@manuelresort.com"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

# Guest User Guide

## 1. Browse Facilities

### Step 1: Visit Homepage
- Go to `http://localhost:3000`
- View featured facilities and resort information

### Step 2: Browse All Facilities
- Click **"Browse Facilities"** button
- Or navigate to `/browse`

### Step 3: Filter Facilities
- **By Type:** Select Room, Cottage, or Function Hall
- **By Capacity:** Enter number of guests
- **By Dates:** Select check-in and check-out dates
- Click **"Apply Filters"**

### Step 4: View Facility Details
- Click on any facility card
- View photos, amenities, pricing, and reviews
- Check availability calendar

---

## 2. Make a Booking

### Step 1: Pre-Booking Modal
When you first visit the site, a modal appears:

1. **Select Check-In Date**
2. **Select Check-Out Date**
3. **Choose Facility Type:**
   - All Facilities
   - Rooms Only
   - Cottages Only
   - Function Halls Only
4. Click **"Check Availability"**

### Step 2: Select Facility
- Browse available facilities
- Click **"Book Now"** on your chosen facility

### Step 3: Fill Booking Details
On the checkout page (`/checkout`):

1. **Verify Dates:** Check-in and check-out dates
2. **Enter Personal Information:**
   - Full Name
   - Email Address
   - Phone Number
3. **Special Requests:** (Optional) Add any special requirements
4. **Review Pricing:**
   - Nightly Rate
   - Number of Nights
   - Total Amount
5. Click **"Get Quote"** to see final pricing

### Step 4: Complete Payment
1. Review booking summary
2. Click **"Proceed to Payment"**
3. **Payment Options:**
   - GCash (via PayMongo)
   - Cash on Arrival
4. For GCash:
   - Redirected to PayMongo checkout
   - Scan QR code with GCash app
   - Complete payment
5. For Cash:
   - Booking confirmed immediately
   - Pay at resort upon arrival

### Step 5: Confirmation
- Receive confirmation email with:
  - Booking code (e.g., `BK-M1S50`)
  - Booking details
  - Calendar invite (.ics file)
- Save your booking code for check-in

---

## 3. Manage Your Bookings

### View Bookings
1. Click **"My Bookings"** in navigation
2. Or visit `/my-bookings`
3. Enter your email address
4. Click **"View My Bookings"**

### Booking Details
- **Booking Code:** Unique identifier
- **Status:** PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT
- **Facility:** Room/cottage/hall details
- **Dates:** Check-in and check-out
- **Amount:** Total payment
- **Payment Status:** PENDING, PAID, FAILED

### Check Payment Status
1. Go to your booking details
2. Click **"Check Payment Status"**
3. If payment succeeded, booking auto-confirms

---

## 4. Leave a Review

### Eligibility
- Only after **check-out**
- Within **24 hours** of check-out
- One review per booking

### Steps to Review

1. **Access Review Page:**
   - Visit `/review?code=YOUR_BOOKING_CODE`
   - Or click review link in check-out email

2. **Fill Review Form:**
   - **Rating:** 1-5 stars (required)
   - **Comment:** Your experience (optional)
   - **Anonymous:** Check to hide your name

3. **Submit Review:**
   - Click **"Submit Review"**
   - Review appears on facility page immediately

### Review Display
- Shows on facility detail page
- Includes rating, comment, and reviewer name (unless anonymous)
- Facility average rating updates automatically

---

## 5. Contact Resort

### Contact Page
- Visit `/contact`
- View resort information:
  - Address
  - Phone number
  - Email
  - Operating hours
- Send inquiry via contact form

---

# Admin User Guide

## 1. Access Admin Dashboard

### Login
1. Go to `/login`
2. Enter admin email (from `.env`)
3. Receive magic link via email
4. Click link to login
5. Redirected to `/admin`

### Dashboard Overview
- **Total Bookings:** All-time count
- **Active Bookings:** Currently confirmed
- **Total Revenue:** Earnings from confirmed bookings
- **Active Facilities:** Available properties
- **Recent Bookings:** Latest 5 reservations

---

## 2. Manage Bookings

### View All Bookings
1. Navigate to **Admin → Bookings** (`/admin/bookings`)
2. View list of all bookings with:
   - Booking code
   - Customer name
   - Facility
   - Dates
   - Status
   - Amount

### Filter Bookings
- **By Status:** All, Pending, Confirmed, Checked In, Checked Out, Cancelled
- **By Date Range:** Select start and end dates
- **Search:** By booking code or customer name

### Booking Actions
1. **View Details:** Click on booking
2. **Update Status:**
   - Confirm pending bookings
   - Cancel bookings
   - Mark as checked in/out
3. **Send Notifications:** Email updates to customers

---

## 3. Manage Facilities

### View Facilities
1. Go to **Admin → Facilities** (`/admin/facilities`)
2. See all rooms, cottages, and function halls

### Add New Facility
1. Click **"Add Facility"**
2. Fill in details:
   - **Name:** e.g., "Deluxe Room 101"
   - **Type:** ROOM, COTTAGE, or HALL
   - **Description:** Detailed description
   - **Capacity:** Maximum guests
   - **Price:** Nightly rate (₱)
   - **Photos:** Upload images
   - **Amenities:** WiFi, AC, TV, etc.
   - **Rules:** Check-in time, policies
3. Click **"Create Facility"**

### Edit Facility
1. Click **"Edit"** on facility
2. Update any field
3. Click **"Save Changes"**

### Deactivate Facility
1. Click **"Deactivate"**
2. Facility hidden from public booking
3. Can reactivate anytime

---

## 4. View Analytics

### Access Analytics
- Navigate to **Admin → Analytics** (`/admin/analytics`)

### Available Metrics

#### KPIs (Key Performance Indicators)
- **Total Bookings:** Current vs previous period
- **Total Revenue:** With trend percentage
- **Occupancy Rate:** Percentage of booked days
- **Average Rating:** Customer satisfaction

#### Charts
1. **Booking Trends:**
   - Monthly bookings over the year
   - Revenue trends
   - Line chart visualization

2. **Most Booked Facilities:**
   - Top performing properties
   - Booking count and revenue
   - Bar chart visualization

3. **Booking Status Distribution:**
   - Confirmed, Pending, Cancelled
   - Pie chart visualization

4. **Category Distribution:**
   - Rooms vs Cottages vs Halls
   - Revenue breakdown

#### Time Period Selection
- Last 7 days
- Last 30 days
- Last 90 days
- This year
- Custom date range

---

## 5. Generate Reports

### Access Reports
- Go to **Admin → Reports** (`/admin/reports`)

### Available Reports

#### Dashboard Report
- Overall statistics
- Bookings by status
- Revenue by facility type
- Monthly trends

#### Export Options

1. **Detailed CSV Export:**
   - Click **"Export Detailed Report (CSV)"**
   - Includes 16 fields:
     - Booking Code, Status, Customer Info
     - Facility, Dates, Amount
     - Booked On, Confirmed On
     - Rating, Notes
   - Opens in Excel/Google Sheets

2. **Summary CSV Export:**
   - Click **"Export Summary Report (CSV)"**
   - Includes:
     - Total bookings and revenue
     - Bookings by status
     - Revenue by facility type
   - Professional formatted report

### Report Features
- **Auto-excludes:** Temporary locks
- **Formatted amounts:** ₱2,925.00 with commas
- **Proper dates:** Feb 19, 2026 format
- **Clean headers:** No special characters
- **Professional layout:** Resort branding included

---

## 6. Manage Pricing

### View Pricing
- Navigate to **Admin → Pricing** (`/admin/pricing`)

### Current Pricing Model
- **Simplified Pricing:** Fixed nightly rates per facility
- Each facility has its own price
- No seasonal variations (can be added)

### Update Pricing
1. Go to facility edit page
2. Update **Price** field
3. Save changes
4. New price applies to future bookings

---

## 7. Manage Users & Roles

### User Roles
- **GUEST:** Regular customers (default)
- **STAFF:** Cashier access
- **ADMIN:** Full system access

### View Users
1. Go to **Admin → Users** (if implemented)
2. View all registered users

### Change User Role
1. Find user
2. Update role dropdown
3. Save changes

---

# Cashier User Guide

## 1. Access Cashier Portal

### Login
1. Go to `/login`
2. Enter staff email
3. Receive magic link
4. Click to login
5. Redirected to `/cashier`

### Cashier Dashboard
- Quick search for bookings
- Today's check-ins and check-outs
- Pending verifications

---

## 2. Verify Booking

### Step 1: Search Booking
1. Enter **Booking Code** (e.g., `BK-M1S50`)
2. Or enter **Customer Email**
3. Click **"Search"**

### Step 2: Verify Details
- Customer name
- Facility booked
- Check-in/out dates
- Payment status
- Total amount

### Step 3: Confirm Booking
1. Verify customer ID
2. Click **"Verify Booking"**
3. Booking marked as verified
4. Ready for check-in

---

## 3. Check-In Guest

### Prerequisites
- Booking must be CONFIRMED
- Check-in date must be today or past

### Steps

1. **Search Booking:**
   - Enter booking code
   - Click **"Search"**

2. **Verify Guest:**
   - Check customer ID
   - Verify booking details

3. **Process Check-In:**
   - Click **"Check In Guest"**
   - Booking status → CHECKED_IN
   - Guest receives check-in confirmation email

4. **Provide Room Key:**
   - Hand over facility key/access
   - Explain amenities and rules

---

## 4. Check-Out Guest

### Prerequisites
- Booking must be CHECKED_IN
- Check-out date must be today or past

### Steps

1. **Search Booking:**
   - Enter booking code

2. **Inspect Facility:**
   - Check for damages
   - Verify all items present

3. **Process Check-Out:**
   - Click **"Check Out Guest"**
   - Booking status → CHECKED_OUT
   - Guest receives check-out email with review link

4. **Collect Payment (if Cash):**
   - If payment status is PENDING
   - Collect cash payment
   - Mark as PAID in system

5. **Return Deposit (if applicable):**
   - Verify no damages
   - Return security deposit

---

## 5. Handle Payments

### Cash Payments
1. Collect payment from guest
2. Issue receipt
3. Update payment status in system

### GCash Verification
1. Check payment status in system
2. If PENDING, click **"Check Payment Status"**
3. System verifies with PayMongo
4. Auto-updates if payment succeeded

### Failed Payments
1. Contact customer
2. Request alternative payment
3. Or cancel booking if needed

---

# Troubleshooting

## Common Issues

### 1. "Facility Not Available"
**Problem:** Selected dates are already booked

**Solution:**
- Choose different dates
- Select alternative facility
- Contact admin for availability

### 2. "Payment Failed"
**Problem:** GCash payment didn't complete

**Solution:**
- Check GCash balance
- Retry payment
- Use alternative payment method
- Contact support with booking code

### 3. "Booking Code Not Found"
**Problem:** Cannot find booking

**Solution:**
- Check email for correct code
- Verify email address used
- Contact admin with booking details

### 4. "Review Submission Failed"
**Problem:** Cannot submit review

**Solution:**
- Ensure you're checked out
- Check if within 24-hour window
- Verify you haven't already reviewed
- Try again or contact support

### 5. "Email Not Received"
**Problem:** Confirmation email missing

**Solution:**
- Check spam/junk folder
- Verify email address is correct
- Wait 5-10 minutes
- Request resend from admin

### 6. "Cannot Login to Admin"
**Problem:** Magic link not working

**Solution:**
- Check email spam folder
- Ensure using correct admin email
- Request new magic link
- Check `.env` configuration

## System Maintenance

### Clear Temporary Locks
Temporary locks are automatically cleaned up:
- When admin dashboard loads
- When new bookings are created
- Expired locks (> 5 minutes old)

### Database Backup
```bash
# Export database
pg_dump resort_db > backup.sql

# Restore database
psql resort_db < backup.sql
```

### Clear Next.js Cache
```bash
# Remove .next folder
rm -rf .next

# Rebuild
npm run build
```

---

## Support & Contact

### For Guests
- **Email:** support@manuelresort.com
- **Phone:** (123) 456-7890
- **Hours:** 8:00 AM - 10:00 PM daily

### For Technical Issues
- **Developer:** Check GitHub issues
- **Email:** dev@manuelresort.com
- **Documentation:** `/docs` folder

---

## Quick Reference

### Important URLs
- **Homepage:** `/`
- **Browse:** `/browse`
- **Checkout:** `/checkout?unit=ID&start=DATE&end=DATE`
- **My Bookings:** `/my-bookings`
- **Review:** `/review?code=BOOKING_CODE`
- **Admin:** `/admin`
- **Cashier:** `/cashier`
- **Login:** `/login`

### Booking Status Flow
```
PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT
         ↓
    CANCELLED
```

### Payment Status Flow
```
PENDING → PAID
        ↓
      FAILED
```

### User Roles
- **GUEST:** Browse and book
- **STAFF:** Cashier operations
- **ADMIN:** Full system access

---

## Best Practices

### For Guests
✅ Book early for peak seasons
✅ Save your booking code
✅ Arrive on time for check-in
✅ Leave a review after checkout
✅ Contact support for issues

### For Cashiers
✅ Verify customer ID at check-in
✅ Inspect facilities at check-out
✅ Process payments promptly
✅ Update booking status immediately
✅ Report issues to admin

### For Admins
✅ Monitor dashboard daily
✅ Respond to bookings quickly
✅ Keep facility info updated
✅ Review analytics weekly
✅ Export reports monthly
✅ Backup database regularly

---

**Last Updated:** February 19, 2026
**Version:** 1.0.0
**Platform:** ClickStay Manuel Resort Online Booking Platform
