# Manuel Resort - End User Manual

**For Guests Using the Deployed Booking System**

A detailed guide on how to interact with the Manuel Resort Online Booking Platform as a guest user.

---

## 📋 Table of Contents

1. [Welcome to Manuel Resort](#welcome-to-manuel-resort)
2. [Getting Started](#getting-started)
3. [Browsing Facilities](#browsing-facilities)
4. [Making a Reservation](#making-a-reservation)
5. [Payment Process](#payment-process)
6. [Managing Your Bookings](#managing-your-bookings)
7. [Check-In Process](#check-in-process)
8. [During Your Stay](#during-your-stay)
9. [Check-Out Process](#check-out-process)
10. [Leaving a Review](#leaving-a-review)
11. [Frequently Asked Questions](#frequently-asked-questions)
12. [Contact & Support](#contact--support)

---

# Welcome to Manuel Resort

Thank you for choosing Manuel Resort! This manual will guide you through every step of your booking experience, from browsing our facilities to leaving a review after your stay.

## What You Can Do

✅ **Browse** our rooms, cottages, and function halls  
✅ **Book** your preferred facility online  
✅ **Pay** securely via GCash or cash on arrival  
✅ **Manage** your reservations  
✅ **Review** your experience after checkout  

---

# Getting Started

## Accessing the Website

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)
2. **Navigate to:** `https://manuelresort.com` (or your deployed URL)
3. **Homepage loads** with featured facilities and resort information

## First-Time Visitors

When you first visit the website, you'll see:

### Pre-Booking Modal (Pop-up)
A helpful modal appears asking for your preferences:

**What you'll see:**
- **Check-In Date:** Calendar to select arrival date
- **Check-Out Date:** Calendar to select departure date
- **Facility Type:** Dropdown menu with options:
  - All Facilities (default)
  - Rooms Only
  - Cottages Only
  - Function Halls Only
- **Check Availability Button:** Searches for available facilities

**How to use it:**

1. **Click on Check-In Date field**
   - Calendar appears
   - Select your desired arrival date
   - Date must be today or in the future

2. **Click on Check-Out Date field**
   - Calendar appears
   - Select your desired departure date
   - Must be after check-in date
   - Minimum 1 night stay

3. **Choose Facility Type** (optional)
   - Click dropdown menu
   - Select your preference
   - Or leave as "All Facilities" to see everything

4. **Click "Check Availability"**
   - System searches for available facilities
   - Redirects to browse page with filtered results

**Can't decide yet?**
- Click the **X** button to close the modal
- You can browse without selecting dates
- Modal won't appear again during your session

---

# Browsing Facilities

## Browse Page

**URL:** `/browse`

**How to access:**
- Click **"Browse Facilities"** button on homepage
- Or use the pre-booking modal
- Or click **"Browse"** in the navigation menu

## What You'll See

### Facility Cards
Each facility is displayed as a card showing:

**Visual Information:**
- **Photo:** Main image of the facility
- **Facility Name:** e.g., "Deluxe Room 101"
- **Type Badge:** ROOM, COTTAGE, or HALL
- **Capacity:** Number of guests (e.g., "Up to 4 guests")
- **Price:** Nightly rate (e.g., "₱2,925/night")
- **Rating:** Star rating (e.g., "4.5 ★")
- **Book Now Button:** Click to reserve

## Filtering Facilities

### Filter Panel (Left Side)

**1. Facility Type Filter**
- **All Facilities:** Shows everything (default)
- **Rooms:** Shows only rooms
- **Cottages:** Shows only cottages
- **Function Halls:** Shows only event spaces

**How to use:**
- Click on the type you want
- Results update immediately
- Active filter is highlighted

**2. Date Range Filter**
- **Check-In Date:** Select arrival date
- **Check-Out Date:** Select departure date

**How to use:**
- Click date field to open calendar
- Select dates
- Click **"Apply Filters"** button
- Only available facilities for those dates will show

**3. Capacity Filter**
- **Number of Guests:** Enter how many people

**How to use:**
- Type number in the field
- Click **"Apply Filters"**
- Shows facilities that can accommodate your group

**4. Clear Filters**
- Click **"Clear Filters"** button
- Resets all filters
- Shows all facilities again

## Viewing Facility Details

**To see more information about a facility:**

1. **Click on any facility card**
   - Or click **"View Details"** button
   - Redirects to facility detail page

2. **Facility Detail Page shows:**

### Photo Gallery
- **Main Image:** Large photo at the top
- **Thumbnail Gallery:** Additional photos below
- **Click thumbnails** to view different angles
- **Full-screen view:** Click on main image

### Facility Information

**Basic Details:**
- **Facility Name:** Full name
- **Type:** Room/Cottage/Hall
- **Capacity:** Maximum guests allowed
- **Price:** Nightly rate in Philippine Peso (₱)
- **Average Rating:** Star rating from guest reviews

**Description:**
- Detailed description of the facility
- Special features
- What makes it unique

**Amenities:**
- List of included features
- Examples:
  - ✓ Air Conditioning
  - ✓ WiFi
  - ✓ Private Bathroom
  - ✓ TV
  - ✓ Mini Fridge
  - ✓ Balcony

**Rules & Policies:**
- Check-in time (e.g., 2:00 PM)
- Check-out time (e.g., 12:00 PM)
- House rules
- Cancellation policy
- Additional policies

### Availability Calendar

**What it shows:**
- Current month view
- **Green dates:** Available
- **Red dates:** Fully booked
- **Gray dates:** Past dates (not selectable)

**How to use:**
1. Click on a green (available) date for check-in
2. Click another green date for check-out
3. System calculates number of nights
4. **"Book Now"** button becomes active

### Guest Reviews

**Review Section shows:**
- **Overall Rating:** Average star rating
- **Total Reviews:** Number of reviews
- **Individual Reviews:**
  - Guest name (or "Anonymous")
  - Star rating (1-5 stars)
  - Written comment
  - Date of review

**Scroll through reviews** to see what other guests experienced

### Book Now Button

**Located at:**
- Top right of page
- Bottom of page (sticky)

**When active:**
- Dates are selected
- Facility is available
- Click to proceed to checkout

---

# Making a Reservation

## Step 1: Select Dates

**On the facility detail page:**

1. **Use the availability calendar**
   - Click your desired check-in date
   - Click your desired check-out date
   - Or use the date picker fields above the calendar

2. **Verify your selection**
   - Check-in date displays
   - Check-out date displays
   - Number of nights calculates automatically
   - Total price updates (nights × nightly rate)

3. **Click "Book Now"**
   - Redirects to checkout page

## Step 2: Checkout Page

**URL:** `/checkout?unit=FACILITY_ID&start=CHECK_IN&end=CHECK_OUT`

### Booking Summary (Right Side)

**Displays:**
- **Facility Photo:** Image of your selected facility
- **Facility Name:** Full name
- **Facility Type:** Room/Cottage/Hall
- **Check-In Date:** Your arrival date
- **Check-Out Date:** Your departure date
- **Number of Nights:** Calculated duration
- **Nightly Rate:** Price per night (₱)
- **Total Amount:** Final price (₱)

**Example:**
```
Deluxe Room 101
ROOM

Check-In: Feb 20, 2026
Check-Out: Feb 22, 2026
Nights: 2

Nightly Rate: ₱2,925
Total Amount: ₱5,850
```

### Guest Information Form (Left Side)

**Required Fields:**

**1. Full Name**
- Enter your complete name
- As it appears on your ID
- Example: "Juan Dela Cruz"

**2. Email Address**
- Valid email required
- You'll receive confirmation here
- Example: "juan@email.com"
- **Important:** Check spelling carefully!

**3. Phone Number**
- Contact number
- Include country code if international
- Example: "09123456789"

**4. Number of Guests**
- How many people will stay
- Must not exceed facility capacity
- Example: "2"

**Optional Fields:**

**5. Special Requests**
- Any special needs or requests
- Examples:
  - "Early check-in if possible"
  - "Ground floor room preferred"
  - "Celebrating anniversary"
  - "Need extra pillows"
- Not guaranteed but we'll try our best

### Get Quote Button

**Before proceeding to payment:**

1. **Fill in all required fields**
   - Name, Email, Phone, Guests

2. **Click "Get Quote"**
   - System verifies availability
   - Calculates final pricing
   - Checks for any additional fees
   - Quote appears below the button

3. **Review the quote**
   - Verify all details are correct
   - Check total amount
   - Read terms and conditions

### Proceed to Payment Button

**After getting a quote:**

1. **"Proceed to Payment" button activates**
   - Located below the quote

2. **Click the button**
   - Creates your booking in the system
   - Redirects to payment page

**Important Notes:**
- Your booking is held for **5 minutes**
- This prevents others from booking the same dates
- Complete payment within this time
- If time expires, you'll need to start over

---

# Payment Process

## Payment Options

You have **two payment methods:**

### Option 1: GCash (Online Payment)

**Advantages:**
- ✅ Instant confirmation
- ✅ Secure payment
- ✅ No need to bring cash
- ✅ Booking confirmed immediately

**How it works:**

1. **Select GCash Payment**
   - On the payment page
   - Click **"Pay with GCash"** button

2. **Redirect to PayMongo**
   - Secure payment gateway
   - You'll see the PayMongo checkout page

3. **Payment Page Shows:**
   - **Booking Details:** Your reservation info
   - **Amount to Pay:** Total in Philippine Peso (₱)
   - **QR Code:** For GCash scanning
   - **Payment Instructions**

4. **Complete Payment:**

   **Using GCash App:**
   - Open your GCash app on your phone
   - Tap **"Scan QR"**
   - Scan the QR code on the screen
   - Verify the amount
   - Enter your GCash PIN
   - Confirm payment

   **Or use GCash number:**
   - Enter the merchant number shown
   - Enter the amount
   - Confirm payment

5. **Payment Processing:**
   - Wait for confirmation (usually instant)
   - **Success screen appears**
   - Redirected back to booking confirmation

6. **Confirmation:**
   - Booking status: **CONFIRMED**
   - Payment status: **PAID**
   - Confirmation email sent immediately

### Option 2: Cash on Arrival

**Advantages:**
- ✅ No online payment needed
- ✅ Pay when you arrive
- ✅ Booking still reserved

**How it works:**

1. **Select Cash Payment**
   - On the payment page
   - Click **"Pay Cash on Arrival"** button

2. **Booking Created:**
   - Booking status: **PENDING**
   - Payment status: **PENDING**
   - Dates are reserved for you

3. **Confirmation Email:**
   - Sent immediately
   - Contains booking code
   - Payment instructions

4. **Payment at Resort:**
   - Bring cash on check-in day
   - Pay at the front desk
   - Staff will update your booking to CONFIRMED
   - Receive receipt

**Important:**
- Booking may be cancelled if payment not received by check-in time
- Bring exact amount or be prepared for change
- Payment must be in Philippine Peso (₱)

## After Payment

### Confirmation Email

**You'll receive an email containing:**

**1. Booking Confirmation**
- **Subject:** "Booking Confirmation - Manuel Resort"
- **Booking Code:** Unique identifier (e.g., BK-M1S50)
- **Save this code!** You'll need it for check-in

**2. Booking Details:**
- Guest name
- Facility booked
- Check-in date and time
- Check-out date and time
- Number of nights
- Number of guests
- Total amount paid/due

**3. Payment Information:**
- Payment status (PAID or PENDING)
- Payment method (GCash or Cash)
- Amount paid (if GCash)
- Amount due (if Cash)

**4. Calendar Invite (.ics file)**
- Attached to email
- Click to add to your calendar
- Automatic reminder before check-in

**5. Important Information:**
- Resort address
- Contact number
- Check-in instructions
- What to bring
- Cancellation policy

**6. Next Steps:**
- What to expect
- How to contact us
- Link to view booking online

### Save Your Booking Code

**Your booking code is crucial:**
- ✅ Needed for check-in
- ✅ Used to view booking status
- ✅ Required for any changes
- ✅ Needed for customer support

**How to save it:**
- Screenshot the confirmation email
- Write it down
- Save email in a folder
- Add to your notes app

---

# Managing Your Bookings

## View Your Bookings

**URL:** `/my-bookings`

**How to access:**
1. Click **"My Bookings"** in the navigation menu
2. Or visit the URL directly

### Find Your Booking

**You'll see a search form:**

**Option 1: Search by Email**
1. Enter the email address you used when booking
2. Click **"View My Bookings"**
3. All bookings for that email appear

**Option 2: Search by Booking Code**
1. Enter your booking code (e.g., BK-M1S50)
2. Click **"Search"**
3. Your specific booking appears

### Booking Details Page

**What you'll see:**

**1. Booking Status Badge**
- **PENDING:** Awaiting payment/confirmation
- **CONFIRMED:** Payment received, booking confirmed
- **CHECKED_IN:** You've arrived and checked in
- **CHECKED_OUT:** You've completed your stay
- **CANCELLED:** Booking was cancelled

**2. Booking Information:**
- **Booking Code:** Your unique identifier
- **Booked On:** Date you made the reservation
- **Confirmed On:** Date payment was confirmed (if applicable)

**3. Guest Information:**
- Your name
- Email address
- Phone number
- Number of guests

**4. Facility Information:**
- Facility name
- Facility type
- Capacity
- Photo

**5. Stay Details:**
- Check-in date
- Check-out date
- Number of nights
- Check-in time (e.g., 2:00 PM)
- Check-out time (e.g., 12:00 PM)

**6. Payment Information:**
- Total amount
- Payment status (PAID or PENDING)
- Payment method (GCash or Cash)

**7. Special Requests:**
- Any requests you submitted
- Status of requests

### Available Actions

**Depending on your booking status:**

**If Payment is PENDING (GCash):**
- **"Check Payment Status" button**
  - Click to verify if payment went through
  - System checks with PayMongo
  - Updates status if payment succeeded

**If Booking is CONFIRMED:**
- **"View Booking Details"**
  - See full information
  - Download confirmation
  - Print booking details

**If Booking is CHECKED_OUT:**
- **"Leave a Review" button**
  - Available for 24 hours after checkout
  - Share your experience
  - Rate the facility

### Modify or Cancel Booking

**To make changes:**

1. **Contact the resort directly**
   - Email: support@manuelresort.com
   - Phone: (123) 456-7890
   - Provide your booking code

2. **Cancellation Policy:**
   - Free cancellation up to 48 hours before check-in
   - 50% refund for cancellations within 48 hours
   - No refund for no-shows
   - Refunds processed within 7-14 business days

---

# Check-In Process

## Before You Arrive

**Prepare the following:**

✅ **Booking Code** - From your confirmation email  
✅ **Valid ID** - Government-issued identification  
✅ **Payment** - If you selected "Cash on Arrival"  
✅ **Confirmation Email** - Print or show on phone  

**Check-In Time:** 2:00 PM (or as specified in your booking)

**Early Check-In:**
- Subject to availability
- Request via special requests during booking
- Or call ahead to inquire

## Arrival at Resort

**Step 1: Go to Front Desk**
- Located in the main lobby
- Staff will greet you

**Step 2: Provide Information**
- Give your **booking code**
- Or provide your **name and email**
- Staff will look up your reservation

**Step 3: Verification**
- Staff verifies your booking details
- Checks your ID
- Confirms number of guests

**Step 4: Payment (if Cash on Arrival)**
- Pay the total amount
- Receive official receipt
- Booking status updated to CONFIRMED

**Step 5: Facility Assignment**
- Receive your room/cottage key or access card
- Get facility number/location
- Receive welcome packet

**Step 6: Orientation**
- Staff explains:
  - Facility location
  - Amenities and how to use them
  - Breakfast/meal times (if included)
  - Resort rules and regulations
  - Emergency procedures
  - WiFi password
  - Contact information

**Step 7: Proceed to Facility**
- Follow directions to your room/cottage
- Staff may escort you
- Luggage assistance available

## Check-In Confirmation

**You'll receive:**
- ✅ Facility key/access card
- ✅ Welcome packet with resort information
- ✅ WiFi password
- ✅ Breakfast vouchers (if applicable)
- ✅ Resort map
- ✅ Emergency contact numbers

**Email Notification:**
- Check-in confirmation email sent
- Booking status updated to CHECKED_IN
- Check-out reminder included

---

# During Your Stay

## Facility Amenities

**How to use amenities:**

**Air Conditioning:**
- Remote control in the room
- Adjust temperature as needed
- Turn off when leaving to save energy

**WiFi:**
- Network name (SSID) provided at check-in
- Password on welcome packet
- Free unlimited access

**TV:**
- Remote control provided
- Cable channels available
- Instructions in room

**Mini Fridge:**
- Store your drinks and snacks
- Do not adjust temperature settings

**Bathroom:**
- Hot and cold shower
- Toiletries provided
- Extra towels available upon request

## Resort Facilities

**Swimming Pool:**
- Operating hours: 6:00 AM - 10:00 PM
- Lifeguard on duty during peak hours
- Children must be supervised

**Restaurant:**
- Breakfast: 7:00 AM - 10:00 AM
- Lunch: 12:00 PM - 2:00 PM
- Dinner: 6:00 PM - 9:00 PM

**Function Hall (if applicable):**
- For events and gatherings
- Advance booking required
- Catering services available

## Need Assistance?

**Contact Front Desk:**
- **Phone:** Dial "0" from room phone
- **In Person:** Visit the front desk
- **Available:** 24/7

**Common Requests:**
- Extra towels or linens
- Room cleaning
- Maintenance issues
- Restaurant reservations
- Tour bookings
- Transportation arrangements

## Resort Rules

**Please observe:**
- ✅ Quiet hours: 10:00 PM - 6:00 AM
- ✅ No smoking inside facilities
- ✅ No pets allowed (unless specified)
- ✅ Guests must be registered
- ✅ Respect other guests' privacy
- ✅ Keep facilities clean
- ✅ Report any damages immediately

---

# Check-Out Process

## Before Check-Out

**Check-Out Time:** 12:00 PM (noon) - or as specified in your booking

**Late Check-Out:**
- Subject to availability
- Additional charges may apply
- Request at front desk before 10:00 AM

**Prepare for Check-Out:**

1. **Pack Your Belongings**
   - Check all drawers and closets
   - Don't forget items in bathroom
   - Check under beds

2. **Check for Personal Items**
   - Phone chargers
   - Toiletries
   - Documents
   - Valuables from safe

3. **Facility Inspection**
   - Turn off lights and AC
   - Close windows
   - Check for damages
   - Report any issues immediately

## Check-Out Steps

**Step 1: Go to Front Desk**
- Bring your key/access card
- Arrive before 12:00 PM

**Step 2: Return Key**
- Hand over room/cottage key
- Or return access card

**Step 3: Facility Inspection**
- Staff may inspect the facility
- Check for damages or missing items
- Usually takes 5-10 minutes

**Step 4: Final Payment (if applicable)**
- Pay for any additional services:
  - Extra meals
  - Minibar items
  - Damage charges
  - Late check-out fees
- Receive final receipt

**Step 5: Feedback**
- Staff may ask about your stay
- Share your experience
- Provide suggestions

**Step 6: Check-Out Confirmation**
- Booking status updated to CHECKED_OUT
- Receive check-out receipt
- Email confirmation sent

## After Check-Out

**Check-Out Email Contains:**
- ✅ Thank you message
- ✅ Booking summary
- ✅ Final charges (if any)
- ✅ **Link to leave a review**
- ✅ Invitation to book again
- ✅ Special offers for return guests

**Important:**
- Review link is valid for **24 hours only**
- Share your experience while it's fresh
- Help future guests make informed decisions

---

# Leaving a Review

## Why Leave a Review?

**Your review helps:**
- ✅ Future guests make informed decisions
- ✅ The resort improve its services
- ✅ Other travelers plan their stay
- ✅ Recognize excellent service

## Eligibility

**You can leave a review if:**
- ✅ Your booking status is CHECKED_OUT
- ✅ It's within **24 hours** of check-out
- ✅ You haven't already reviewed this booking

**You cannot review if:**
- ❌ Still checked in
- ❌ More than 24 hours since check-out
- ❌ Already submitted a review
- ❌ Booking was cancelled

## How to Leave a Review

### Method 1: Email Link

**Easiest way:**

1. **Open your check-out confirmation email**
   - Subject: "Thank You for Staying at Manuel Resort"
   - Sent immediately after check-out

2. **Click "Leave a Review" button**
   - Redirects to review page
   - Booking code pre-filled

3. **Fill out the review form**
   - See detailed steps below

### Method 2: Direct URL

**If you don't have the email:**

1. **Visit:** `/review?code=YOUR_BOOKING_CODE`
   - Replace YOUR_BOOKING_CODE with your actual code
   - Example: `/review?code=BK-M1S50`

2. **Fill out the review form**

## Review Form

**What you'll see:**

### Booking Information (Read-Only)
- **Booking Code:** Your reservation ID
- **Facility:** Name of room/cottage/hall
- **Check-Out Date:** When you left
- **Guest Name:** Your name

### Review Fields

**1. Rating (Required)**
- **Star Rating:** 1 to 5 stars
- Click on the stars to rate
- **1 star:** Poor
- **2 stars:** Fair
- **3 stars:** Good
- **4 stars:** Very Good
- **5 stars:** Excellent

**How to rate:**
- Click on the star that represents your experience
- All stars up to your selection will be filled
- You can change your rating before submitting

**2. Comment (Optional)**
- **Text area** for your written review
- **Maximum:** 1000 characters
- Share your experience:
  - What you liked
  - What could be improved
  - Memorable moments
  - Tips for future guests

**Examples of good comments:**
- "Beautiful facility with amazing views! Staff was very accommodating. The room was clean and comfortable. Highly recommend!"
- "Great location and amenities. The pool was well-maintained. Only issue was slow WiFi, but overall a wonderful stay."
- "Perfect for families! Kids loved the pool. Room was spacious. Breakfast was delicious. Will definitely come back!"

**3. Anonymous Review (Optional)**
- **Checkbox:** "Post as anonymous"
- **Checked:** Your name won't appear on the review
- **Unchecked:** Your name will be shown (default)

**When to use anonymous:**
- If you prefer privacy
- If you're leaving critical feedback
- Personal preference

### Submit Review

**Before submitting:**
1. **Review your rating** - Is it accurate?
2. **Proofread your comment** - Check for typos
3. **Decide on anonymity** - Show name or not?

**Click "Submit Review" button**
- Review is saved immediately
- Cannot be edited after submission
- Appears on facility page instantly

## After Submitting

**Success Message:**
- "Thank you for your review!"
- Confirmation that review was saved

**Your review now:**
- ✅ Appears on the facility detail page
- ✅ Contributes to facility's average rating
- ✅ Helps future guests
- ✅ Provides feedback to resort management

**Email Confirmation:**
- Thank you email sent
- Copy of your review included

## Review Guidelines

**Please ensure your review:**
- ✅ Is based on your actual experience
- ✅ Is respectful and constructive
- ✅ Focuses on the facility and service
- ✅ Is honest and helpful

**Avoid:**
- ❌ Offensive language
- ❌ Personal attacks
- ❌ Spam or promotional content
- ❌ Reviews about other properties

**Note:** Resort management may remove reviews that violate guidelines.

---

# Frequently Asked Questions

## Booking Questions

### Q1: How far in advance can I book?
**A:** You can book up to 12 months in advance. Bookings open on a rolling basis.

### Q2: Can I book for same-day check-in?
**A:** Yes, if the facility is available. However, we recommend booking at least 24 hours in advance to ensure availability.

### Q3: What is the minimum stay requirement?
**A:** Minimum 1 night stay. Some facilities may require longer stays during peak seasons.

### Q4: Can I book multiple facilities?
**A:** Yes, you can make separate bookings for multiple facilities. Each booking will have its own booking code.

### Q5: Do I need to create an account?
**A:** No account required! Just provide your email address during booking. You can view your bookings using your email or booking code.

## Payment Questions

### Q6: What payment methods do you accept?
**A:** We accept:
- GCash (online payment via PayMongo)
- Cash on Arrival (pay at check-in)

### Q7: Is my payment information secure?
**A:** Yes! GCash payments are processed through PayMongo, a PCI-DSS compliant payment gateway. We never store your payment information.

### Q8: When will I be charged?
**A:** 
- **GCash:** Charged immediately upon payment
- **Cash:** Charged at check-in

### Q9: Can I get a refund?
**A:** Refund policy:
- Free cancellation up to 48 hours before check-in
- 50% refund for cancellations within 48 hours
- No refund for no-shows

### Q10: How long does a refund take?
**A:** Refunds are processed within 7-14 business days to your original payment method.

## Facility Questions

### Q11: What amenities are included?
**A:** Each facility listing shows included amenities. Common amenities:
- Air conditioning
- WiFi
- Private bathroom
- TV
- Linens and towels

### Q12: Are meals included?
**A:** Meals are not included unless specified in your booking. Our restaurant is available for breakfast, lunch, and dinner at additional cost.

### Q13: Can I request a specific room number?
**A:** You can add this as a special request during booking. We'll do our best to accommodate, but cannot guarantee specific room assignments.

### Q14: Is the facility pet-friendly?
**A:** Pet policy varies by facility. Check the facility details page or contact us before booking.

### Q15: Is there parking available?
**A:** Yes, free parking is available for all guests.

## Check-In/Out Questions

### Q16: What time is check-in?
**A:** Standard check-in time is 2:00 PM. Early check-in may be available upon request and subject to availability.

### Q17: What time is check-out?
**A:** Standard check-out time is 12:00 PM (noon). Late check-out may be available for an additional fee.

### Q18: What do I need to bring for check-in?
**A:** Bring:
- Valid government-issued ID
- Booking code (from confirmation email)
- Payment (if you selected Cash on Arrival)

### Q19: Can I check in early or check out late?
**A:** Subject to availability. Contact us in advance to request early check-in or late check-out. Additional fees may apply.

### Q20: What if I arrive late?
**A:** We have 24/7 front desk service. Please inform us if you'll arrive after 10:00 PM.

## Modification Questions

### Q21: Can I change my booking dates?
**A:** Yes, contact us at least 48 hours before check-in. Changes subject to availability and may incur fees.

### Q22: Can I add more guests?
**A:** Additional guests can be added if within facility capacity. Contact us before arrival. Extra person fees may apply.

### Q23: How do I cancel my booking?
**A:** Contact us via email or phone with your booking code. Cancellation policy applies.

## Review Questions

### Q24: When can I leave a review?
**A:** You can leave a review within 24 hours after check-out.

### Q25: Can I edit my review after submitting?
**A:** No, reviews cannot be edited after submission. Please review carefully before submitting.

### Q26: Will my review be published immediately?
**A:** Yes, reviews appear on the facility page immediately after submission.

### Q27: Can I leave an anonymous review?
**A:** Yes, check the "Post as anonymous" option when submitting your review.

## Technical Questions

### Q28: I didn't receive my confirmation email. What should I do?
**A:** 
1. Check your spam/junk folder
2. Verify the email address you provided
3. Wait 10-15 minutes for delivery
4. Contact us with your booking details

### Q29: My payment went through but booking shows PENDING. Why?
**A:** 
1. Click "Check Payment Status" on your booking page
2. System will verify with PayMongo
3. Status updates automatically if payment succeeded
4. If issue persists, contact us

### Q30: The website is not loading. What should I do?
**A:**
1. Check your internet connection
2. Try a different browser
3. Clear your browser cache
4. Try again in a few minutes
5. Contact support if problem persists

---

# Contact & Support

## Get Help

### Customer Support

**Email:** support@manuelresort.com  
**Phone:** (123) 456-7890  
**Hours:** 8:00 AM - 10:00 PM daily  

**Response Time:**
- Email: Within 24 hours
- Phone: Immediate during business hours

### Front Desk (For Current Guests)

**Phone:** Dial "0" from your room phone  
**Available:** 24/7  

### Emergency Contact

**For urgent matters during your stay:**  
**Emergency Hotline:** (123) 456-7891  
**Available:** 24/7  

## Visit Us

**Manuel Resort**  
123 Beach Road, Paradise City  
Philippines 1234  

**Operating Hours:**  
- Front Desk: 24/7
- Restaurant: 7:00 AM - 9:00 PM
- Pool: 6:00 AM - 10:00 PM

## Social Media

**Follow us for updates and special offers:**

- Facebook: @ManuelResort
- Instagram: @manuelresort
- Twitter: @manuelresort

## Feedback & Suggestions

**We value your feedback!**

**Send us your thoughts:**
- Email: feedback@manuelresort.com
- Online form: Visit `/contact` page
- Social media: Message us on any platform

**Your feedback helps us:**
- Improve our services
- Enhance guest experience
- Develop new amenities
- Train our staff better

---

## Thank You!

Thank you for choosing Manuel Resort. We hope this manual helps you have a smooth and enjoyable booking experience.

**Have a wonderful stay!**

---

**Document Information:**
- **Last Updated:** February 19, 2026
- **Version:** 1.0.0
- **For:** End Users (Guests)
- **Platform:** Manuel Resort Online Booking System

**Need more help?** Contact our support team anytime!
