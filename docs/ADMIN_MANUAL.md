# Manuel Resort - Admin Manual

**Complete Administrator Guide for the Booking System**

A comprehensive guide for administrators managing the Manuel Resort Online Booking Platform.

---

## 📋 Table of Contents

1. [Admin Access & Login](#admin-access--login)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Managing Bookings](#managing-bookings)
4. [Managing Facilities](#managing-facilities)
5. [User Management](#user-management)
6. [Analytics & Reports](#analytics--reports)
7. [Pricing Management](#pricing-management)
8. [System Settings](#system-settings)
9. [Best Practices](#best-practices)

---

# Admin Access & Login

## Getting Admin Access

### Initial Setup

Admin credentials are configured in the `.env` file:

```env
ADMIN_EMAIL="admin@manuelresort.com"
```

**Important:** Only the email specified in `ADMIN_EMAIL` has full admin access.

## Login Process

### Step 1: Navigate to Login Page

**URL:** `/login`

**What you'll see:**
- Login form
- Email input field
- "Send Magic Link" button

### Step 2: Enter Admin Email

1. **Type your admin email** (from `.env` file)
2. **Click "Send Magic Link"**
3. **Wait for confirmation** message

### Step 3: Check Your Email

**You'll receive an email with:**
- **Subject:** "Sign in to Manuel Resort"
- **Magic Link button:** Click to login
- **Link expires:** 24 hours

### Step 4: Click Magic Link

1. **Open the email**
2. **Click the magic link button**
3. **Automatically logged in**
4. **Redirected to:** `/admin` dashboard

### Step 5: Verify Access

**Check navigation bar:**
- Your email displayed
- "Admin Portal" link visible
- "Sign Out" option available

---

# Admin Dashboard Overview

## Dashboard Layout

**URL:** `/admin`

### Top Navigation

**Left Side:**
- **Logo:** Manuel Resort branding
- **Dashboard:** Link to main dashboard

**Right Side:**
- **Your Email:** Displays logged-in admin
- **Sign Out:** Logout button

### Sidebar Menu

**Main Navigation:**

1. **📊 Dashboard** - Overview and statistics
2. **📅 Bookings** - Manage reservations
3. **🏠 Facilities** - Manage properties
4. **👥 Users** - Manage user accounts
5. **📈 Analytics** - Charts and metrics
6. **📄 Reports** - Generate and export reports
7. **💰 Pricing** - Manage facility pricing

### Dashboard Widgets

**Key Performance Indicators (KPIs):**

**1. Total Bookings**
- **Number:** All-time booking count
- **Icon:** Calendar icon
- **Color:** Blue

**2. Active Bookings**
- **Number:** Currently confirmed bookings
- **Icon:** Check icon
- **Color:** Green

**3. Total Revenue**
- **Amount:** Sum of all confirmed bookings (₱)
- **Icon:** Peso icon
- **Color:** Purple

**4. Active Facilities**
- **Number:** Available properties
- **Icon:** Building icon
- **Color:** Orange

### Recent Bookings Table

**Displays last 5 bookings:**

**Columns:**
- **Booking Code:** Unique identifier
- **Customer:** Guest name
- **Facility:** Room/cottage/hall name
- **Check-In:** Arrival date
- **Status:** Current booking status
- **Amount:** Total price (₱)

**Actions:**
- **View Details:** Click on booking code
- **Quick Status:** Color-coded badges

---

# Managing Bookings

## Accessing Bookings

**Navigate to:** Admin → Bookings (`/admin/bookings`)

## Bookings List View

### Table Columns

**Information Displayed:**

1. **Booking Code**
   - Format: BK-XXXXX
   - Clickable to view details

2. **Customer Name**
   - Guest's full name
   - Email shown on hover

3. **Facility**
   - Room/cottage/hall name
   - Type badge (ROOM/COTTAGE/HALL)

4. **Check-In Date**
   - Arrival date
   - Format: Feb 20, 2026

5. **Check-Out Date**
   - Departure date
   - Number of nights calculated

6. **Status**
   - Color-coded badge
   - PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED

7. **Payment Status**
   - PENDING, PAID, FAILED
   - Payment method shown

8. **Total Amount**
   - Price in Philippine Peso (₱)
   - Formatted with commas

9. **Actions**
   - View, Edit, Cancel buttons

### Filtering Bookings

**Filter Panel (Top of Page):**

**1. Status Filter**
- **All Bookings** (default)
- **Pending** - Awaiting payment/confirmation
- **Confirmed** - Payment received
- **Checked In** - Guest arrived
- **Checked Out** - Guest departed
- **Cancelled** - Cancelled bookings

**How to use:**
- Click dropdown
- Select status
- List updates automatically

**2. Date Range Filter**
- **Start Date:** Filter from this date
- **End Date:** Filter to this date
- **Apply to:** Check-in dates

**How to use:**
- Click date fields
- Select range
- Click "Apply"

**3. Search Bar**
- **Search by:**
  - Booking code
  - Customer name
  - Customer email
  - Facility name

**How to use:**
- Type in search box
- Results filter as you type
- Clear to show all

### Viewing Booking Details

**Click on any booking to see:**

**Customer Information:**
- Full name
- Email address
- Phone number
- Number of guests

**Booking Information:**
- Booking code
- Booking date
- Confirmed date (if applicable)
- Check-in date/time
- Check-out date/time

**Facility Information:**
- Facility name and type
- Capacity
- Amenities
- Photo

**Payment Information:**
- Total amount
- Payment status
- Payment method
- Transaction ID (if GCash)

**Special Requests:**
- Guest notes
- Special requirements

**Status History:**
- Created
- Confirmed
- Checked in
- Checked out

### Managing Booking Status

**Available Actions:**

**1. Confirm Booking**
- **When:** Status is PENDING
- **How:** Click "Confirm Booking" button
- **Effect:** 
  - Status → CONFIRMED
  - Confirmation email sent to guest
  - Payment marked as verified

**2. Check In Guest**
- **When:** Status is CONFIRMED and check-in date is today/past
- **How:** Click "Check In" button
- **Effect:**
  - Status → CHECKED_IN
  - Check-in timestamp recorded
  - Email sent to guest

**3. Check Out Guest**
- **When:** Status is CHECKED_IN
- **How:** Click "Check Out" button
- **Effect:**
  - Status → CHECKED_OUT
  - Check-out timestamp recorded
  - Review invitation email sent

**4. Cancel Booking**
- **When:** Any status except CHECKED_OUT
- **How:** Click "Cancel Booking" button
- **Confirmation:** Popup asks for confirmation
- **Effect:**
  - Status → CANCELLED
  - Dates released for rebooking
  - Cancellation email sent
  - Refund processed (if applicable)

### Editing Booking Details

**Click "Edit Booking":**

**Editable Fields:**
- Customer name
- Customer email
- Customer phone
- Number of guests
- Special requests
- Notes (admin only)

**Non-Editable:**
- Booking code
- Facility
- Dates (use cancel/rebook instead)
- Payment amount

**Save Changes:**
- Click "Save" button
- Confirmation message
- Guest notified of changes

### Sending Notifications

**Manual Email Options:**

**1. Resend Confirmation**
- Sends booking confirmation email
- Includes booking code and details

**2. Send Reminder**
- Sends check-in reminder
- Useful for day before arrival

**3. Custom Message**
- Write custom email to guest
- Include booking details
- Send directly from admin panel

---

# Managing Facilities

## Accessing Facilities

**Navigate to:** Admin → Facilities (`/admin/facilities`)

## Facilities List View

### Facility Cards

**Each facility shows:**
- **Photo:** Main image
- **Name:** Facility name
- **Type:** ROOM, COTTAGE, or HALL badge
- **Capacity:** Maximum guests
- **Price:** Nightly rate (₱)
- **Status:** Active/Inactive
- **Actions:** Edit, Deactivate, View

### Filter Facilities

**Filter Options:**
- **All Types**
- **Rooms Only**
- **Cottages Only**
- **Function Halls Only**
- **Active Only**
- **Inactive Only**

## Adding New Facility

**Click "Add New Facility" button:**

### Step 1: Basic Information

**Required Fields:**

**1. Facility Name**
- **Example:** "Deluxe Room 101"
- **Guidelines:** 
  - Include room/cottage number
  - Be descriptive
  - Keep under 50 characters

**2. Facility Type**
- **Dropdown:** ROOM, COTTAGE, HALL
- **Select one**

**3. Description**
- **Text area:** Detailed description
- **Include:**
  - Size/dimensions
  - View (ocean, garden, etc.)
  - Special features
  - Ambiance
- **Maximum:** 1000 characters

**4. Capacity**
- **Number:** Maximum guests
- **Examples:**
  - Room: 2-4 guests
  - Cottage: 4-8 guests
  - Hall: 50-200 guests

**5. Price**
- **Amount:** Nightly rate in Peso
- **Format:** Numbers only (e.g., 2925)
- **No commas or symbols**

### Step 2: Photos

**Upload Facility Photos:**

**Requirements:**
- **Format:** JPG, PNG, or WebP
- **Size:** Maximum 5MB per image
- **Recommended:** 1920x1080 pixels
- **Minimum:** 3 photos
- **Maximum:** 10 photos

**How to upload:**
1. Click "Upload Photos" button
2. Select multiple images
3. Drag to reorder
4. First image = main photo
5. Click "Save Photos"

**Photo Guidelines:**
- Show different angles
- Include bathroom
- Show amenities
- Natural lighting preferred
- No people in photos

### Step 3: Amenities

**Select included amenities:**

**Common Amenities:**
- ☐ Air Conditioning
- ☐ WiFi
- ☐ Private Bathroom
- ☐ Hot Shower
- ☐ TV
- ☐ Mini Fridge
- ☐ Balcony/Terrace
- ☐ Kitchen
- ☐ Dining Area
- ☐ Living Room
- ☐ BBQ Grill
- ☐ Swimming Pool Access
- ☐ Parking
- ☐ Towels & Linens
- ☐ Toiletries

**How to add:**
- Check boxes for included amenities
- Or type custom amenity
- Click "Add" to include

### Step 4: Rules & Policies

**Define facility rules:**

**Standard Rules:**
- Check-in time (e.g., 2:00 PM)
- Check-out time (e.g., 12:00 PM)
- No smoking policy
- Pet policy
- Noise restrictions
- Maximum occupancy
- Additional guest fees
- Cancellation policy

**How to add:**
- Type each rule
- Press Enter to add
- Edit or delete as needed

### Step 5: Review & Publish

**Review all information:**
- Verify all fields
- Check photos
- Confirm amenities
- Review rules

**Click "Create Facility":**
- Facility saved
- Status: Active (default)
- Appears on website immediately
- Available for booking

## Editing Existing Facility

**Click "Edit" on any facility:**

**Editable:**
- All fields from creation
- Photos (add/remove/reorder)
- Amenities
- Rules
- Price
- Status

**Save Changes:**
- Click "Save Changes"
- Confirmation message
- Updates reflected immediately

**Important:**
- Existing bookings not affected
- New price applies to future bookings only

## Deactivating Facility

**When to deactivate:**
- Maintenance required
- Renovations
- Seasonal closure
- Permanent removal

**How to deactivate:**
1. Click "Deactivate" button
2. Confirm action
3. Facility hidden from public
4. Existing bookings honored

**Reactivate:**
- Click "Activate" button
- Facility visible again
- Available for new bookings

## Viewing Facility Analytics

**Click "View Analytics" on facility:**

**Metrics shown:**
- Total bookings (all-time)
- Revenue generated
- Average rating
- Occupancy rate
- Most booked months
- Guest reviews

---

# User Management

## Accessing User Management

**Navigate to:** Admin → Users (`/admin/users`)

## User Roles

**Three user roles:**

**1. GUEST (Default)**
- Browse facilities
- Make bookings
- Leave reviews
- View own bookings

**2. STAFF**
- All GUEST permissions
- Access cashier portal
- Verify bookings
- Check-in/out guests
- Process payments

**3. ADMIN**
- All STAFF permissions
- Access admin portal
- Manage facilities
- Manage users
- View analytics
- Generate reports
- System settings

## Users List View

**Table shows:**
- **Name:** User's full name
- **Email:** Email address
- **Role:** Current role badge
- **Created:** Registration date
- **Last Login:** Last active date
- **Status:** Active/Inactive
- **Actions:** Edit, Delete

### Filter Users

**Filter options:**
- All Users
- Admins Only
- Staff Only
- Guests Only
- Active Users
- Inactive Users

**Search:**
- By name
- By email
- By role

## Creating New User

**Click "Add New User" button:**

### User Information Form

**Required Fields:**

**1. Full Name**
- User's complete name
- Example: "Maria Santos"

**2. Email Address**
- Valid email required
- Must be unique
- Used for login

**3. Role**
- **Dropdown:** GUEST, STAFF, ADMIN
- **Select appropriate role**

**4. Phone Number** (Optional)
- Contact number
- Format: 09XXXXXXXXX

**Optional Fields:**

**5. Send Welcome Email**
- Checkbox
- Sends login instructions
- Includes magic link

**6. Set as Active**
- Checkbox (default: checked)
- User can login immediately

### Create User

**Click "Create User" button:**

**What happens:**
- User account created
- Email sent (if checked)
- Magic link for first login
- User appears in list

**User receives:**
- Welcome email
- Login instructions
- Magic link to access system
- Role information

## Editing User

**Click "Edit" on any user:**

**Editable Fields:**
- Name
- Email (with caution)
- Phone number
- Role
- Status (Active/Inactive)

**Change User Role:**

**Promote to Staff:**
1. Select user
2. Click "Edit"
3. Change role to STAFF
4. Click "Save"
5. User gains cashier access

**Promote to Admin:**
1. Select user
2. Click "Edit"
3. Change role to ADMIN
4. Click "Save"
5. User gains full admin access

**Demote User:**
- Same process
- Select lower role
- Save changes

**Important:**
- Role changes immediate
- User notified via email
- Access updated on next login

## Deactivating User

**When to deactivate:**
- Employee left
- Suspended account
- Security concern
- Temporary disable

**How to deactivate:**
1. Click "Deactivate" on user
2. Confirm action
3. User cannot login
4. Existing sessions terminated

**Reactivate:**
- Click "Activate"
- User can login again

## Deleting User

**Permanent removal:**

**Warning:** This cannot be undone!

**What gets deleted:**
- User account
- Login credentials
- Profile information

**What's preserved:**
- Bookings made by user
- Reviews written
- Payment records

**How to delete:**
1. Click "Delete" button
2. Type "DELETE" to confirm
3. Click "Confirm Deletion"
4. User permanently removed

## Viewing User Activity

**Click "View Activity" on user:**

**Activity Log shows:**
- Login history
- Bookings made
- Reviews submitted
- Role changes
- Account modifications

---

# Analytics & Reports

## Accessing Analytics

**Navigate to:** Admin → Analytics (`/admin/analytics`)

## Dashboard Metrics

### Key Performance Indicators

**1. Total Bookings**
- Current period count
- Comparison to previous period
- Percentage change (↑ or ↓)
- Trend indicator

**2. Total Revenue**
- Sum of confirmed bookings (₱)
- Previous period comparison
- Growth percentage
- Revenue trend

**3. Occupancy Rate**
- Percentage of booked days
- Industry benchmark comparison
- Monthly average
- Peak season data

**4. Average Rating**
- Overall guest satisfaction
- Based on all reviews
- Star rating (1-5)
- Review count

### Time Period Selection

**Choose analysis period:**
- Last 7 days
- Last 30 days
- Last 90 days
- This month
- This year
- Custom date range

**How to use:**
1. Click period dropdown
2. Select timeframe
3. Or choose "Custom"
4. Select start and end dates
5. Click "Apply"
6. All charts update

## Charts & Visualizations

### 1. Booking Trends Chart

**Line chart showing:**
- Monthly bookings over time
- Revenue per month
- Dual Y-axis (bookings + revenue)

**Insights:**
- Peak booking months
- Seasonal patterns
- Growth trends
- Revenue correlation

### 2. Most Booked Facilities

**Bar chart displaying:**
- Top 10 facilities
- Booking count per facility
- Revenue per facility
- Color-coded by type

**Insights:**
- Popular facilities
- Revenue generators
- Underperforming properties
- Optimization opportunities

### 3. Booking Status Distribution

**Pie chart showing:**
- Confirmed bookings %
- Pending bookings %
- Cancelled bookings %
- Checked-in %
- Checked-out %

**Insights:**
- Conversion rate
- Cancellation rate
- Current occupancy
- Operational efficiency

### 4. Category Distribution

**Donut chart displaying:**
- Rooms revenue %
- Cottages revenue %
- Function Halls revenue %

**Insights:**
- Revenue by category
- Popular facility types
- Diversification
- Market demand

### 5. Revenue Trends

**Area chart showing:**
- Daily revenue
- Weekly average
- Monthly total
- Cumulative revenue

**Insights:**
- Revenue patterns
- Growth trajectory
- Forecasting data
- Financial health

## Generating Reports

**Navigate to:** Admin → Reports (`/admin/reports`)

### Report Types

**1. Dashboard Report**
- Overall statistics
- Current month summary
- KPIs snapshot
- Quick overview

**2. Detailed Booking Report**
- All booking fields
- Customer information
- Payment details
- Review data

**3. Summary Report**
- Aggregated data
- Totals by category
- Revenue breakdown
- Status distribution

### Export Options

**CSV Export:**

**Detailed Report:**
1. Click "Export Detailed Report (CSV)"
2. File downloads automatically
3. Opens in Excel/Google Sheets

**Contains 16 columns:**
- Booking Code
- Status
- Customer Name
- Email
- Phone
- Facility
- Type
- Check-In
- Check-Out
- Nights
- Guests
- Amount
- Booked On
- Confirmed On
- Rating
- Notes

**Summary Report:**
1. Click "Export Summary Report (CSV)"
2. File downloads

**Contains:**
- Total bookings
- Total revenue
- Bookings by status
- Revenue by facility type
- Monthly trends

**Report Features:**
- Professional formatting
- Resort branding
- Proper date formats
- Currency formatting (₱2,925.00)
- Clean headers
- No temporary locks included

### Scheduled Reports

**Set up automatic reports:**

**Configuration:**
1. Click "Schedule Reports"
2. Select report type
3. Choose frequency:
   - Daily
   - Weekly
   - Monthly
4. Select recipients
5. Click "Save Schedule"

**Reports sent via email:**
- Attached as CSV
- Summary in email body
- Sent automatically

---

# Pricing Management

**Navigate to:** Admin → Pricing (`/admin/pricing`)

## Current Pricing Model

**Simplified pricing:**
- Fixed nightly rate per facility
- No seasonal variations (can be added)
- Set individually per property

## Viewing Pricing

**Pricing table shows:**
- Facility name
- Current price (₱)
- Last updated
- Edit button

## Updating Prices

**Individual Facility:**
1. Find facility in list
2. Click "Edit Price"
3. Enter new amount
4. Click "Save"
5. Confirmation message

**Bulk Update:**
1. Select multiple facilities
2. Click "Bulk Edit"
3. Enter percentage increase/decrease
4. Or set fixed amount
5. Preview changes
6. Click "Apply"

**Important:**
- New prices apply to future bookings only
- Existing bookings unchanged
- Price history maintained

---

# System Settings

**Navigate to:** Admin → Settings (`/admin/settings`)

## General Settings

**Resort Information:**
- Resort name
- Address
- Phone number
- Email
- Operating hours

**Booking Settings:**
- Minimum stay (nights)
- Maximum advance booking (months)
- Booking hold time (minutes)
- Auto-checkout time

**Payment Settings:**
- Accepted payment methods
- PayMongo configuration
- Refund policy
- Cancellation terms

## Email Settings

**Email Templates:**
- Booking confirmation
- Payment confirmation
- Check-in reminder
- Check-out confirmation
- Review invitation
- Cancellation notice

**SMTP Configuration:**
- Email server
- Port
- Username
- Password
- From address

## Notification Settings

**Admin Notifications:**
- New booking alerts
- Payment received
- Cancellation notices
- Review submitted
- System errors

**Guest Notifications:**
- Booking confirmation
- Payment receipt
- Check-in reminder
- Check-out confirmation
- Review invitation

---

# Best Practices

## Daily Tasks

**Every Morning:**
✅ Check dashboard for new bookings
✅ Review pending payments
✅ Verify today's check-ins
✅ Process today's check-outs
✅ Respond to customer inquiries

## Weekly Tasks

**Every Week:**
✅ Review analytics
✅ Check facility availability
✅ Update pricing if needed
✅ Review guest feedback
✅ Export weekly report

## Monthly Tasks

**Every Month:**
✅ Generate monthly reports
✅ Analyze revenue trends
✅ Review facility performance
✅ Update facility photos/descriptions
✅ Backup database
✅ Review user accounts

## Security Best Practices

✅ Use strong admin password
✅ Don't share admin credentials
✅ Logout when finished
✅ Review user access regularly
✅ Monitor activity logs
✅ Keep system updated

## Customer Service

✅ Respond within 24 hours
✅ Be professional and courteous
✅ Resolve issues promptly
✅ Follow up on complaints
✅ Thank guests for reviews

---

**Document Information:**
- **Last Updated:** February 19, 2026
- **Version:** 1.0.0
- **For:** System Administrators
- **Platform:** Manuel Resort Online Booking System
