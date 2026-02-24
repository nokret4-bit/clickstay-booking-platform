# 📦 ANALYTICS DASHBOARD - INSTALLATION GUIDE

## 🚀 Quick Start

### **Step 1: Install Dependencies**

Install Chart.js and React wrappers:

```bash
npm install chart.js react-chartjs-2
```

Or with yarn:

```bash
yarn add chart.js react-chartjs-2
```

### **Step 2: Verify Installation**

Check that these packages are in your `package.json`:

```json
{
  "dependencies": {
    "chart.js": "^4.4.0",
    "react-chartjs-2": "^5.2.0"
  }
}
```

### **Step 3: Access the Dashboard**

Navigate to the admin analytics page:

```
http://localhost:3000/admin/analytics
```

**Note:** You must be logged in as an ADMIN or STAFF user.

---

## 📁 FILES CREATED

### **1. API Endpoint**
- **Path:** `src/app/api/admin/analytics/route.ts`
- **Purpose:** Fetches and aggregates analytics data
- **Method:** GET
- **Auth:** Requires ADMIN or STAFF role

### **2. Dashboard Page**
- **Path:** `src/app/admin/analytics/page.tsx`
- **Purpose:** Displays analytics dashboard with charts
- **Features:** KPIs, charts, insights, alerts

### **3. Documentation**
- **Path:** `ANALYTICS_DASHBOARD_DOCUMENTATION.md`
- **Purpose:** Comprehensive system documentation
- **Contents:** SQL queries, formulas, best practices

---

## 🔧 CONFIGURATION

### **Environment Variables**

No additional environment variables required. The system uses existing:
- `DATABASE_URL` - PostgreSQL connection
- `NEXTAUTH_SECRET` - Authentication

### **Database Requirements**

Ensure these indexes exist for optimal performance:

```sql
-- Run these in your PostgreSQL database
CREATE INDEX IF NOT EXISTS idx_booking_created_at ON booking("createdAt");
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);
CREATE INDEX IF NOT EXISTS idx_booking_facility_dates ON booking("facilityId", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS idx_review_status ON review(status);
CREATE INDEX IF NOT EXISTS idx_review_rating ON review(rating);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment("createdAt");
```

Or use Prisma:

```bash
# These indexes should already be in your schema.prisma
npx prisma db push
```

---

## 🎨 CHART.JS SETUP

Chart.js is configured in the dashboard component with these modules:

```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

---

## 🧪 TESTING

### **Test the API Endpoint**

```bash
# Using curl (replace with your auth token)
curl -X GET "http://localhost:3000/api/admin/analytics?year=2024" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### **Expected Response**

```json
{
  "kpis": {
    "totalBookings": { "value": 150, "change": 12.5, "previous": 133 },
    "totalRevenue": { "value": 450000, "change": 8.3, "previous": 415000 },
    "averageRating": { "value": 4.6, "total": 89 },
    "occupancyRate": { "value": 72.5, "bookedDays": 2610, "availableDays": 3600 },
    "totalReviews": { "value": 89 }
  },
  "charts": { ... },
  "insights": { ... }
}
```

---

## 🐛 TROUBLESHOOTING

### **Issue: Charts not rendering**

**Solution:**
1. Verify Chart.js is installed: `npm list chart.js`
2. Check browser console for errors
3. Ensure ChartJS.register() is called before rendering

### **Issue: "Unauthorized" error**

**Solution:**
1. Verify you're logged in as ADMIN or STAFF
2. Check session cookie is present
3. Review auth middleware in API route

### **Issue: Slow loading**

**Solution:**
1. Add database indexes (see Configuration section)
2. Implement Redis caching (see documentation)
3. Reduce date range or add pagination

### **Issue: TypeScript errors**

**Solution:**
```bash
# Reinstall dependencies
npm install

# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## 📊 SAMPLE DATA

If you need sample data for testing:

```sql
-- Generate sample bookings (PostgreSQL)
INSERT INTO booking (
  id, code, "facilityId", "startDate", "endDate", 
  status, "customerName", "customerEmail", "totalAmount",
  "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  'BK' || LPAD((ROW_NUMBER() OVER())::text, 6, '0'),
  (SELECT id FROM facility ORDER BY RANDOM() LIMIT 1),
  CURRENT_DATE - (RANDOM() * 365)::int,
  CURRENT_DATE - (RANDOM() * 365)::int + (RANDOM() * 7)::int,
  (ARRAY['CONFIRMED', 'COMPLETED', 'CHECKED_OUT'])[FLOOR(RANDOM() * 3 + 1)],
  'Customer ' || generate_series,
  'customer' || generate_series || '@example.com',
  (RANDOM() * 10000 + 1000)::decimal(10,2),
  CURRENT_DATE - (RANDOM() * 365)::int,
  CURRENT_DATE
FROM generate_series(1, 100);

-- Generate sample reviews
INSERT INTO review (
  id, "facilityId", "bookingId", rating, comment,
  "isVerified", status, "createdAt", "updatedAt"
)
SELECT 
  gen_random_uuid()::text,
  b."facilityId",
  b.id,
  FLOOR(RANDOM() * 5 + 1)::int,
  'Sample review comment',
  true,
  'APPROVED',
  b."createdAt" + INTERVAL '7 days',
  b."createdAt" + INTERVAL '7 days'
FROM booking b
WHERE NOT EXISTS (
  SELECT 1 FROM review r WHERE r."bookingId" = b.id
)
LIMIT 50;
```

---

## 🔐 SECURITY CHECKLIST

- [x] Authentication required (ADMIN/STAFF only)
- [x] SQL injection prevention (Prisma ORM)
- [x] Input validation (year parameter)
- [x] No PII exposed in aggregated data
- [x] Rate limiting recommended (add if needed)
- [x] Audit logging (add if needed)

---

## 📈 PERFORMANCE BENCHMARKS

**Target Performance:**
- API Response Time: < 2 seconds
- Dashboard Load Time: < 3 seconds
- Chart Render Time: < 500ms

**Optimization Tips:**
1. Enable database indexes
2. Implement Redis caching
3. Use CDN for Chart.js
4. Lazy load charts
5. Paginate large datasets

---

## 🎯 FEATURE CHECKLIST

### **Implemented ✅**
- [x] KPI Summary Cards (5 metrics)
- [x] Booking Trends Line Chart
- [x] Most Booked Facilities Bar Chart
- [x] Rating Distribution Bar Chart
- [x] Category Distribution Pie Chart
- [x] Peak Season Detection
- [x] Cancellation Rate Alert
- [x] Low Performing Facilities
- [x] Recent Low Ratings Alert
- [x] Year Filter
- [x] Toggle Bookings/Revenue View
- [x] Responsive Design
- [x] Loading States
- [x] Error Handling

### **Future Enhancements 🚀**
- [ ] Month-specific filtering
- [ ] Export to PDF/Excel
- [ ] Real-time updates (WebSocket)
- [ ] Custom date range picker
- [ ] Revenue forecast
- [ ] Customer lifetime value
- [ ] Booking lead time analysis
- [ ] Comparative analytics (YoY)
- [ ] Email report scheduling
- [ ] Mobile app version

---

## 📞 SUPPORT

### **Common Questions**

**Q: Can I customize the metrics?**
A: Yes! Edit `src/app/api/admin/analytics/route.ts` to add new KPIs.

**Q: How do I add a new chart?**
A: Add the data to the API response, then create a new chart component in the dashboard page.

**Q: Can staff users access analytics?**
A: Yes, both ADMIN and STAFF roles have access.

**Q: How often is data updated?**
A: Data is fetched on page load. Implement caching for better performance.

**Q: Can I export reports?**
A: Not yet - this is a planned feature. You can implement PDF export using libraries like `jspdf`.

---

## 🎓 NEXT STEPS

1. **Install dependencies** (see Step 1)
2. **Test the API endpoint** (see Testing section)
3. **Access the dashboard** at `/admin/analytics`
4. **Review the documentation** for customization options
5. **Add database indexes** for better performance
6. **Implement caching** if needed
7. **Customize metrics** based on your business needs
8. **Train staff** on using the dashboard

---

## 📚 ADDITIONAL RESOURCES

- **Chart.js Documentation:** https://www.chartjs.org/docs/latest/
- **React Chart.js 2:** https://react-chartjs-2.js.org/
- **Prisma Aggregations:** https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing
- **Next.js API Routes:** https://nextjs.org/docs/api-routes/introduction

---

## ✨ CONCLUSION

Your analytics dashboard is now ready! This powerful tool provides:

- ✅ **5 Key Performance Indicators** with trend analysis
- ✅ **4 Interactive Charts** for data visualization
- ✅ **Smart Insights** with automated alerts
- ✅ **Production-Ready** code with error handling
- ✅ **Scalable Architecture** for future enhancements
- ✅ **Comprehensive Documentation** for maintenance

**Enjoy your new analytics dashboard! 📊🎉**

