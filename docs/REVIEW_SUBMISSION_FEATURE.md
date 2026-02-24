# ⭐ BOOKING-BASED REVIEW SUBMISSION FEATURE

## 📋 OVERVIEW

This feature allows customers to submit ratings and reviews using their Booking ID after they have checked out. The system enforces a 24-hour waiting period after checkout before reviews can be submitted.

---

## 🎯 KEY FEATURES

### **1. Booking ID-Based Review Submission**
- Users can write reviews using their booking ID
- No account login required
- Accessible via direct link or My Bookings page

### **2. 24-Hour Post-Checkout Delay**
- Reviews can only be submitted 24 hours after checkout
- Prevents immediate emotional reactions
- Ensures thoughtful, considered feedback

### **3. One Review Per Booking**
- Each booking can only have one review
- Prevents duplicate reviews
- Maintains review authenticity

### **4. Smart Eligibility Checking**
- Automatic validation of booking status
- Checkout date verification
- Review existence check

---

## 📁 FILES CREATED

### **1. Review Submission Page**
**File:** `src/app/review/[bookingId]/page.tsx`

**Features:**
- ⭐ Star rating selector (1-5 stars)
- 💬 Comment textarea (required for ratings ≤2)
- ✅ Booking information display
- 🔒 Eligibility validation
- 📝 Review submission form
- 🎨 Beautiful, user-friendly UI

**States Handled:**
- Loading state
- Booking not found
- Already reviewed
- Not eligible yet (shows hours remaining)
- Ready to review

### **2. Review Eligibility API**
**File:** `src/app/api/bookings/[id]/review-eligibility/route.ts`

**Endpoint:** `GET /api/bookings/[id]/review-eligibility`

**Response:**
```typescript
{
  id: string;
  code: string;
  facilityId: string;
  facilityName: string;
  customerName: string;
  startDate: string;
  endDate: string;
  checkedOutAt: string | null;
  canReview: boolean;
  alreadyReviewed: boolean;
  hoursUntilReview: number;
}
```

**Logic:**
```typescript
// Must be checked out
if (!checkedOutAt) return { canReview: false }

// Calculate hours since checkout
hoursSinceCheckout = (now - checkedOutAt) / (1000 * 60 * 60)

// Must wait 24 hours
canReview = hoursSinceCheckout >= 24

// Calculate remaining hours
hoursUntilReview = canReview ? 0 : Math.ceil(24 - hoursSinceCheckout)
```

### **3. Updated My Bookings Page**
**File:** `src/app/my-bookings/page.tsx`

**New Features:**
- ⭐ "Write a Review" button for checked-out bookings
- 📝 Review status indicator (submitted/pending)
- 🎨 Beautiful call-to-action card
- ℹ️ Informative message about 24-hour rule

**Button Display Logic:**
```typescript
// Show review button if:
- status === "CHECKED_OUT" OR status === "COMPLETED"
- hasReview === false

// Show "Thank you" message if:
- status === "CHECKED_OUT" OR status === "COMPLETED"
- hasReview === true
```

### **4. Updated Booking Search API**
**File:** `src/app/api/bookings/search/route.ts`

**Enhancement:**
- Added `reviews` relation to booking query
- Added `hasReview` flag to response
- Enables My Bookings page to show review status

---

## 🔄 USER FLOW

### **Flow 1: From My Bookings Page**

```
1. User searches for booking (by code or email)
   ↓
2. Booking details displayed
   ↓
3. If CHECKED_OUT/COMPLETED and no review:
   → "Write a Review" button appears
   ↓
4. Click "Write a Review"
   → Redirects to /review/[bookingId]
   ↓
5. System checks eligibility:
   - ✅ Checked out? 
   - ✅ 24 hours passed?
   - ✅ No existing review?
   ↓
6a. If eligible:
    → Show review form
    → User submits rating & comment
    → Review saved as PENDING
    → Redirect to My Bookings
    
6b. If not eligible:
    → Show waiting message
    → Display hours remaining
    → Provide "Go to My Bookings" button
```

### **Flow 2: Direct Link**

```
1. User receives review link via email/SMS
   Example: https://yoursite.com/review/booking-id-123
   ↓
2. Page loads and checks eligibility
   ↓
3. Same as steps 5-6 above
```

---

## 📊 ELIGIBILITY RULES

### **Rule 1: Must Be Checked Out**
```typescript
if (!booking.checkedOutAt) {
  return { 
    canReview: false,
    message: "You must check out before submitting a review"
  }
}
```

### **Rule 2: 24-Hour Waiting Period**
```typescript
const hoursSinceCheckout = 
  (Date.now() - new Date(booking.checkedOutAt).getTime()) / (1000 * 60 * 60);

if (hoursSinceCheckout < 24) {
  return {
    canReview: false,
    hoursUntilReview: Math.ceil(24 - hoursSinceCheckout)
  }
}
```

### **Rule 3: One Review Per Booking**
```typescript
const existingReview = await prisma.review.findFirst({
  where: { bookingId: booking.id }
});

if (existingReview) {
  return {
    canReview: false,
    alreadyReviewed: true
  }
}
```

---

## 🎨 UI COMPONENTS

### **Review Form**

```
┌─────────────────────────────────────────┐
│  Rate Your Stay                         │
│  Share your experience at [Facility]    │
├─────────────────────────────────────────┤
│  Booking Info:                          │
│  • Booking ID: BK-ABC123                │
│  • Facility: Deluxe Room                │
│  • Dates: Jan 1 - Jan 3, 2026           │
├─────────────────────────────────────────┤
│  How would you rate your experience? *  │
│  ⭐⭐⭐⭐⭐ 5 Stars                      │
├─────────────────────────────────────────┤
│  Your Review                            │
│  ┌─────────────────────────────────┐   │
│  │ Tell us about your experience...│   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│  Comment required for ≤2 stars          │
├─────────────────────────────────────────┤
│  [Cancel]  [Submit Review]              │
├─────────────────────────────────────────┤
│  ℹ️ Your review will be verified and    │
│  published after moderation.            │
└─────────────────────────────────────────┘
```

### **My Bookings - Review Button**

```
┌─────────────────────────────────────────┐
│  Booking Details                        │
│  Status: CHECKED_OUT ✓                  │
├─────────────────────────────────────────┤
│  [Booking information...]               │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │ 📝 Share Your Experience!         │ │
│  │                                   │ │
│  │ You can write a review 24 hours   │ │
│  │ after checkout. Your feedback     │ │
│  │ helps other guests.               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [⭐ Write a Review]                    │
└─────────────────────────────────────────┘
```

### **Already Reviewed State**

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐ │
│  │ ✅ Thank you for your review!     │ │
│  │                                   │ │
│  │ Your feedback has been submitted  │ │
│  │ and is pending moderation.        │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔌 API INTEGRATION

### **Submit Review**

**Endpoint:** `POST /api/reviews`

**Request Body:**
```json
{
  "bookingId": "booking-id-123",
  "rating": 5,
  "comment": "Great experience! Highly recommend."
}
```

**Validation:**
- Rating must be 1-5
- Comment required if rating ≤ 2
- Booking must exist and be checked out
- 24 hours must have passed since checkout
- No existing review for this booking

**Response:**
```json
{
  "success": true,
  "review": {
    "id": "review-id-456",
    "rating": 5,
    "status": "PENDING"
  }
}
```

---

## 📧 AUTOMATED EMAIL INTEGRATION (Future Enhancement)

### **Review Request Email**

**Trigger:** 24 hours after checkout

**Template:**
```
Subject: How was your stay at [Facility Name]?

Hi [Customer Name],

Thank you for choosing Click Stay! We hope you enjoyed your recent stay at [Facility Name].

We'd love to hear about your experience. Your feedback helps us improve and helps other guests make informed decisions.

[Write Your Review Button]
→ Links to: /review/[bookingId]

This will only take a minute!

Best regards,
The Click Stay Team
```

**Implementation:**
```typescript
// Cron job or scheduled task
// Run every hour

const checkoutsFrom24HoursAgo = await prisma.booking.findMany({
  where: {
    checkedOutAt: {
      gte: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    },
    reviews: {
      none: {} // No existing review
    }
  }
});

for (const booking of checkoutsFrom24HoursAgo) {
  await sendReviewRequestEmail(booking);
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### **1. Booking ID Validation**
- Verify booking exists in database
- Check booking belongs to customer
- Validate checkout status

### **2. Rate Limiting**
- Limit review submission attempts
- Prevent spam/abuse
- Track failed attempts

### **3. Input Sanitization**
- Sanitize comment text
- Prevent XSS attacks
- Validate rating range

### **4. Moderation**
- All reviews start as PENDING
- Admin approval required
- Spam detection

---

## 📊 TESTING CHECKLIST

### **Functionality Tests**

- [ ] User can access review page with valid booking ID
- [ ] System blocks review if not checked out
- [ ] System blocks review if < 24 hours since checkout
- [ ] System blocks review if already reviewed
- [ ] Star rating selector works (1-5 stars)
- [ ] Comment required for ratings ≤ 2
- [ ] Review submission succeeds with valid data
- [ ] Review saved with PENDING status
- [ ] User redirected after successful submission
- [ ] "Write Review" button appears in My Bookings
- [ ] "Thank you" message shows after review submitted
- [ ] Hours remaining calculated correctly

### **Edge Cases**

- [ ] Invalid booking ID shows error
- [ ] Booking without checkout shows appropriate message
- [ ] Multiple review attempts blocked
- [ ] Form validation works correctly
- [ ] Network errors handled gracefully

### **UI/UX Tests**

- [ ] Page loads quickly
- [ ] Star rating hover effect works
- [ ] Form is mobile-responsive
- [ ] Error messages are clear
- [ ] Success feedback is visible
- [ ] Loading states display properly

---

## 🚀 DEPLOYMENT STEPS

### **1. Database Check**
Ensure `review` table has required fields:
```sql
-- Check if review table exists
SELECT * FROM review LIMIT 1;

-- Verify booking relation
SELECT b.id, b.code, r.id as review_id 
FROM booking b 
LEFT JOIN review r ON r."bookingId" = b.id 
LIMIT 5;
```

### **2. Test Eligibility API**
```bash
# Test with a checked-out booking
curl http://localhost:3000/api/bookings/[booking-id]/review-eligibility
```

### **3. Test Review Submission**
```bash
# Submit a test review
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "test-booking-id",
    "rating": 5,
    "comment": "Test review"
  }'
```

### **4. Verify My Bookings Integration**
- Search for a checked-out booking
- Verify "Write Review" button appears
- Click button and verify redirect
- Submit review and verify success

---

## 📈 ANALYTICS & METRICS

### **Key Metrics to Track**

1. **Review Submission Rate**
   - % of checked-out bookings with reviews
   - Target: 30-40%

2. **Time to Review**
   - Average hours between checkout and review
   - Median: 24-48 hours

3. **Rating Distribution**
   - Count by star rating (1-5)
   - Average rating

4. **Review Completion Rate**
   - % who start vs complete review form
   - Target: 80%+

5. **Comment Rate**
   - % of reviews with comments
   - Target: 60%+

---

## 🎯 FUTURE ENHANCEMENTS

### **Phase 2 Features**

1. **Photo Upload**
   - Allow users to upload photos with reviews
   - Image moderation
   - Gallery display

2. **Detailed Ratings**
   - Cleanliness (1-5)
   - Service (1-5)
   - Value (1-5)
   - Location (1-5)
   - Amenities (1-5)

3. **Trip Type**
   - Family, Business, Solo, Couple, Friends
   - Filter reviews by trip type

4. **Helpful Votes**
   - Allow users to mark reviews as helpful
   - Sort by most helpful

5. **Management Responses**
   - Allow staff to respond to reviews
   - Show response in review display

6. **Review Reminders**
   - Email reminder if no review after 7 days
   - SMS reminder option

7. **Incentives**
   - Discount code for submitting review
   - Loyalty points
   - Entry into monthly draw

---

## ✅ SUMMARY

This feature provides a complete, user-friendly review submission system that:

- ✅ **Prevents blind reviews** - 24-hour waiting period ensures thoughtful feedback
- ✅ **Maintains authenticity** - One review per booking, verified customers only
- ✅ **Easy to use** - Simple, intuitive interface
- ✅ **Accessible** - No login required, just booking ID
- ✅ **Integrated** - Seamlessly works with My Bookings page
- ✅ **Moderated** - All reviews pending admin approval
- ✅ **Scalable** - Ready for automated email integration

**Result:** Higher review submission rates, more authentic feedback, and better decision-making for future guests! 🎉

