# ⏰ 24-HOUR REVIEW WINDOW - QUICK REFERENCE

## 📋 CORRECTED LOGIC

Users can submit reviews **immediately after checkout** but the opportunity **expires after 24 hours**.

---

## ✅ ELIGIBILITY RULES

### **Rule 1: Must Be Checked Out**
```typescript
if (!booking.checkedOutAt) {
  return { canReview: false }
}
```

### **Rule 2: Within 24-Hour Window**
```typescript
const hoursSinceCheckout = (now - checkedOutAt) / (1000 * 60 * 60);

// Can review if 0-24 hours have passed
const canReview = hoursSinceCheckout >= 0 && hoursSinceCheckout <= 24;

// Calculate time remaining
const hoursRemaining = 24 - hoursSinceCheckout;

// Check if expired
const isExpired = hoursSinceCheckout > 24;
```

### **Rule 3: One Review Per Booking**
```typescript
if (existingReview) {
  return { alreadyReviewed: true }
}
```

---

## 🔄 USER FLOW

```
Customer checks out
    ↓
Review window OPENS (immediately)
    ↓
Customer has 24 hours to submit review
    ↓
After 24 hours → Review window EXPIRES
    ↓
Can no longer submit review for this booking
```

---

## 📊 TIMELINE EXAMPLE

```
Day 1, 2:00 PM - Customer checks out
    ↓
Day 1, 2:00 PM - Review window OPENS ✅
    ↓
Day 1, 3:00 PM - Can review (23 hours remaining) ✅
    ↓
Day 2, 1:00 PM - Can review (1 hour remaining) ✅
    ↓
Day 2, 2:00 PM - Review window CLOSES ❌
    ↓
Day 2, 3:00 PM - Cannot review (expired) ❌
```

---

## 🎨 USER INTERFACE MESSAGES

### **My Bookings Page**
```
┌─────────────────────────────────────┐
│ ⏰ Share Your Experience!           │
│                                     │
│ You have 24 hours after checkout   │
│ to write a review. Your feedback   │
│ helps other guests make informed   │
│ decisions.                          │
│                                     │
│ [⭐ Write a Review Now]             │
└─────────────────────────────────────┘
```

### **Review Form (Active)**
```
┌─────────────────────────────────────┐
│ ⏰ Time Remaining:                  │
│ You have approximately 18 hours     │
│ left to submit your review.         │
│ Reviews must be submitted within    │
│ 24 hours after checkout.            │
└─────────────────────────────────────┘
```

### **Review Form (Expired)**
```
┌─────────────────────────────────────┐
│ ❌ Review Window Expired            │
│                                     │
│ The review period for this booking  │
│ has expired. Reviews must be        │
│ submitted within 24 hours after     │
│ checkout.                           │
│                                     │
│ If you have feedback, please        │
│ contact customer service.           │
└─────────────────────────────────────┘
```

---

## 🔌 API RESPONSE

### **GET /api/bookings/[id]/review-eligibility**

**Response:**
```json
{
  "id": "booking-123",
  "code": "BK-ABC123",
  "facilityName": "Deluxe Room",
  "checkedOutAt": "2026-02-17T14:00:00Z",
  "canReview": true,
  "alreadyReviewed": false,
  "hoursRemaining": 18.5,
  "isExpired": false
}
```

**Scenarios:**

1. **Just checked out (0 hours ago)**
   ```json
   {
     "canReview": true,
     "hoursRemaining": 24.0,
     "isExpired": false
   }
   ```

2. **12 hours after checkout**
   ```json
   {
     "canReview": true,
     "hoursRemaining": 12.0,
     "isExpired": false
   }
   ```

3. **25 hours after checkout (EXPIRED)**
   ```json
   {
     "canReview": false,
     "hoursRemaining": 0,
     "isExpired": true
   }
   ```

4. **Already reviewed**
   ```json
   {
     "canReview": false,
     "alreadyReviewed": true,
     "hoursRemaining": 0,
     "isExpired": false
   }
   ```

---

## 💡 KEY BENEFITS

### **1. Immediate Feedback**
- Customers can review while experience is fresh
- No waiting period required
- Higher review submission rate

### **2. Urgency Creates Action**
- 24-hour deadline encourages prompt reviews
- Reduces procrastination
- Increases completion rate

### **3. Quality Control**
- Recent memories = more accurate reviews
- Prevents old, irrelevant feedback
- Maintains review freshness

### **4. Prevents Abuse**
- Limited time window prevents spam
- One review per booking
- Verified customers only

---

## 📧 AUTOMATED EMAIL SUGGESTION

### **Email 1: Immediately After Checkout**
```
Subject: How was your stay? Share your experience!

Hi [Name],

Thank you for staying with us at [Facility]!

We'd love to hear about your experience. You have 24 hours 
to share your feedback.

[Write Your Review] ← Links to /review/[bookingId]

Your review helps other guests make informed decisions.

Best regards,
Click Stay Team
```

### **Email 2: Reminder at 20 Hours**
```
Subject: Last chance to review your stay!

Hi [Name],

You have approximately 4 hours left to review your recent 
stay at [Facility].

[Write Your Review Now]

This is your last chance to share your experience!

Thank you,
Click Stay Team
```

---

## 🧪 TESTING SCENARIOS

### **Test 1: Immediate Review**
1. Create booking
2. Set `checkedOutAt` to current time
3. Visit `/review/[bookingId]`
4. ✅ Should show review form
5. ✅ Should show "24 hours remaining"

### **Test 2: Mid-Window Review**
1. Create booking
2. Set `checkedOutAt` to 12 hours ago
3. Visit `/review/[bookingId]`
4. ✅ Should show review form
5. ✅ Should show "12 hours remaining"

### **Test 3: Expired Review**
1. Create booking
2. Set `checkedOutAt` to 25 hours ago
3. Visit `/review/[bookingId]`
4. ✅ Should show "Review Window Expired"
5. ❌ Should NOT show review form

### **Test 4: Already Reviewed**
1. Create booking with existing review
2. Visit `/review/[bookingId]`
3. ✅ Should show "Already Reviewed"
4. ❌ Should NOT show review form

### **Test 5: Not Checked Out**
1. Create booking without `checkedOutAt`
2. Visit `/review/[bookingId]`
3. ✅ Should show error message
4. ❌ Should NOT show review form

---

## 📊 EXPECTED METRICS

### **Review Submission Rate**
- **Target:** 40-50% (higher than 24-hour wait)
- **Reason:** Immediate availability + urgency

### **Average Submission Time**
- **Expected:** 6-12 hours after checkout
- **Peak:** First 4 hours after checkout

### **Completion Rate**
- **Target:** 85%+ (start to finish)
- **Reason:** Simple form, clear deadline

---

## 🔧 IMPLEMENTATION CHECKLIST

- [x] Update review eligibility API logic
- [x] Change 24-hour wait to 24-hour window
- [x] Update review submission page messages
- [x] Add time remaining countdown
- [x] Update My Bookings page messaging
- [x] Add expired state handling
- [x] Update API response fields
- [ ] Set up automated checkout emails (optional)
- [ ] Set up 20-hour reminder emails (optional)
- [ ] Add analytics tracking (optional)

---

## ✅ SUMMARY

**OLD LOGIC (INCORRECT):**
- Wait 24 hours after checkout
- Then review window opens
- No expiration

**NEW LOGIC (CORRECT):**
- Review window opens immediately at checkout ✅
- Customer has 24 hours to submit ⏰
- Window expires after 24 hours ❌

**Result:** More reviews, fresher feedback, better user experience! 🎉

