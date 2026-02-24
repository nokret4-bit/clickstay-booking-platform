# Auto-Checkout System Documentation

## Overview

The Auto-Checkout System automatically checks out bookings that have passed their end date, enabling guests to submit reviews within 24 hours after checkout.

---

## Problem Solved

**Issue:** Guests couldn't leave reviews after their stay because bookings remained in `CONFIRMED` or `CHECKED_IN` status indefinitely. The review system requires:
1. Booking status to be `CHECKED_OUT` or `COMPLETED`
2. A `checkedOutAt` timestamp to calculate the 24-hour review window

**Solution:** Automatic checkout system that transitions past bookings to `CHECKED_OUT` status with proper timestamps.

---

## How It Works

### 1. Auto-Checkout API
**Endpoint:** `/api/bookings/auto-checkout`

**Methods:** `GET` or `POST`

**Logic:**
```typescript
1. Find all bookings where:
   - endDate < current date (stay has ended)
   - status is CONFIRMED or CHECKED_IN
   - checkedOutAt is null (not already checked out)

2. Update these bookings:
   - Set status to CHECKED_OUT
   - Set checkedOutAt to current timestamp
   - Update updatedAt timestamp

3. Return count of checked-out bookings
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully checked out 3 bookings",
  "count": 3,
  "bookings": [
    {
      "code": "BK-ABC123-XYZ",
      "endDate": "2026-02-16T10:00:00.000Z"
    }
  ]
}
```

### 2. Client-Side Trigger
**Location:** My Bookings page (`/my-bookings`)

When a user searches for their booking, the system automatically triggers auto-checkout to ensure their booking status is up-to-date.

```typescript
// Triggered before searching
await fetch("/api/bookings/auto-checkout", { method: "POST" });
```

### 3. Cron Job Endpoint (Optional)
**Endpoint:** `/api/cron/auto-checkout`

For scheduled execution via external cron services or Vercel Cron Jobs.

---

## Review Eligibility Flow

```
Booking Created (PENDING)
    ↓
Payment Confirmed (CONFIRMED)
    ↓
Guest Checks In (CHECKED_IN)
    ↓
End Date Passes
    ↓
Auto-Checkout Runs ✅
    ↓
Status: CHECKED_OUT
checkedOutAt: [timestamp]
    ↓
Review Window Opens (24 hours)
    ↓
Guest Can Submit Review ⭐
    ↓
24 Hours Pass
    ↓
Review Window Closes ❌
```

---

## Testing

### Manual Test
1. **Create a test booking** with an end date in the past
2. **Trigger auto-checkout:**
   ```bash
   curl -X POST http://localhost:3000/api/bookings/auto-checkout
   ```
3. **Verify the response:**
   - Check that bookings were updated
   - Verify `checkedOutAt` timestamp is set
4. **Test review submission:**
   - Go to My Bookings page
   - Search for the booking
   - Click "Write a Review Now"
   - Submit a review

### Database Check
```sql
-- Check bookings that should be auto-checked out
SELECT id, code, endDate, status, checkedOutAt
FROM "Booking"
WHERE endDate < NOW()
  AND status IN ('CONFIRMED', 'CHECKED_IN')
  AND checkedOutAt IS NULL;

-- Verify auto-checkout worked
SELECT id, code, status, checkedOutAt
FROM "Booking"
WHERE status = 'CHECKED_OUT'
  AND checkedOutAt IS NOT NULL
ORDER BY checkedOutAt DESC;
```

---

## Deployment Options

### Option 1: Client-Side Trigger (Current)
✅ **Pros:**
- No additional setup required
- Works immediately
- Runs when users actually need it

❌ **Cons:**
- Only runs when users visit My Bookings page
- Slight delay on page load

### Option 2: Vercel Cron Jobs
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-checkout",
      "schedule": "0 * * * *"
    }
  ]
}
```

✅ **Pros:**
- Runs automatically every hour
- No user interaction needed

❌ **Cons:**
- Requires Vercel Pro plan
- Additional configuration

### Option 3: External Cron Service
Use services like:
- **cron-job.org** (free)
- **EasyCron** (free tier available)
- **GitHub Actions** (free for public repos)

Setup:
1. Create account on cron service
2. Add job to call: `https://yourdomain.com/api/cron/auto-checkout`
3. Set schedule: Every hour (`0 * * * *`)

---

## API Endpoints Summary

| Endpoint | Method | Purpose | Trigger |
|----------|--------|---------|---------|
| `/api/bookings/auto-checkout` | POST/GET | Auto-checkout past bookings | Manual or client-side |
| `/api/cron/auto-checkout` | GET | Cron job wrapper | Scheduled service |
| `/api/bookings/[id]/review-eligibility` | GET | Check if booking can be reviewed | Review page |
| `/review/[bookingId]` | GET | Review submission page | User navigation |

---

## Review Window Rules

1. **Eligibility Check:**
   - Booking must have `checkedOutAt` timestamp
   - Status must be `CHECKED_OUT` or `COMPLETED`
   - Must be within 24 hours of checkout

2. **Time Calculation:**
   ```typescript
   hoursSinceCheckout = (now - checkedOutAt) / (1000 * 60 * 60)
   canReview = hoursSinceCheckout >= 0 && hoursSinceCheckout <= 24
   hoursRemaining = 24 - hoursSinceCheckout
   isExpired = hoursSinceCheckout > 24
   ```

3. **User Experience:**
   - **0-24 hours:** Can submit review ✅
   - **> 24 hours:** Review window expired ❌
   - **Already reviewed:** Thank you message 🎉

---

## Troubleshooting

### Issue: "You must check out before submitting a review"
**Cause:** Booking doesn't have `checkedOutAt` timestamp

**Solution:**
1. Trigger auto-checkout: Visit My Bookings page or call API manually
2. Verify booking end date has passed
3. Check booking status is not `CANCELLED`

### Issue: "Review window expired"
**Cause:** More than 24 hours since checkout

**Solution:**
- This is by design. Reviews must be submitted within 24 hours
- Consider extending the window in the API if needed

### Issue: Auto-checkout not running
**Cause:** No trigger mechanism active

**Solution:**
1. Ensure users visit My Bookings page, OR
2. Set up cron job (Option 2 or 3 above)

---

## Future Enhancements

1. **Email Notifications:**
   - Send email when booking is auto-checked out
   - Remind users to leave a review

2. **Extended Review Window:**
   - Make 24-hour window configurable
   - Allow admin to extend window for specific bookings

3. **Batch Processing:**
   - Process auto-checkouts in batches for performance
   - Add rate limiting

4. **Analytics:**
   - Track auto-checkout success rate
   - Monitor review submission rates

---

## Security Considerations

1. **No Authentication Required:**
   - Auto-checkout API is public (by design)
   - Only updates past bookings (safe operation)
   - No sensitive data exposed

2. **Idempotent:**
   - Safe to run multiple times
   - Won't duplicate checkouts
   - Uses `checkedOutAt IS NULL` check

3. **Rate Limiting:**
   - Consider adding rate limiting for production
   - Prevent abuse of public endpoint

---

## Summary

The Auto-Checkout System ensures guests can leave reviews by:
1. ✅ Automatically checking out past bookings
2. ✅ Setting proper timestamps for review eligibility
3. ✅ Enabling the 24-hour review window
4. ✅ Improving user experience with timely reviews

**Current Implementation:** Client-side trigger on My Bookings page
**Recommended:** Add scheduled cron job for production
