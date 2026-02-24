# 📊 CLICK STAY - ANALYTICS DASHBOARD DOCUMENTATION

## 🎯 OVERVIEW

This document provides comprehensive documentation for the Admin Reports & Analytics Dashboard system, including architecture, implementation details, SQL queries, and improvement recommendations.

---

## 📋 DASHBOARD FEATURES

### **1. KPI Summary Cards**

Five key performance indicators displayed at the top:

#### **Total Bookings**
- **Metric:** Count of all non-cancelled bookings in the period
- **Comparison:** Month-over-month or year-over-year percentage change
- **Formula:** `COUNT(bookings WHERE status != 'CANCELLED')`

#### **Total Revenue**
- **Metric:** Sum of all confirmed booking amounts
- **Comparison:** Percentage change from previous period
- **Formula:** `SUM(totalAmount WHERE status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'))`

#### **Average Rating**
- **Metric:** Average star rating across all approved reviews
- **Display:** Shows total review count
- **Formula:** `AVG(rating WHERE status = 'APPROVED')`

#### **Occupancy Rate**
- **Metric:** Percentage of available days that are booked
- **Formula:** `(Total Booked Days / Total Available Days) × 100`
- **Calculation:**
  ```typescript
  Total Available Days = Number of Facilities × Days in Period
  Total Booked Days = SUM(booking duration for each booking in period)
  Occupancy Rate = (Booked Days / Available Days) × 100
  ```

#### **Total Reviews**
- **Metric:** Count of all approved reviews
- **Display:** All-time total
- **Formula:** `COUNT(reviews WHERE status = 'APPROVED')`

---

## 📈 CHARTS & VISUALIZATIONS

### **1. Booking Trends (Line Chart)**

**Purpose:** Show monthly booking volume or revenue trends

**Data Structure:**
```typescript
{
  month: number,           // 1-12
  monthName: string,       // "Jan", "Feb", etc.
  bookings: number,        // Count of bookings
  revenue: number          // Total revenue
}
```

**SQL Query:**
```sql
SELECT 
  EXTRACT(MONTH FROM "createdAt")::int as month,
  COUNT(*)::bigint as count,
  SUM(CAST("totalAmount" AS DECIMAL))::float as revenue
FROM booking
WHERE EXTRACT(YEAR FROM "createdAt") = $year
  AND status NOT IN ('CANCELLED')
GROUP BY month
ORDER BY month
```

**Features:**
- Toggle between bookings count and revenue view
- Year filter
- Smooth line with area fill
- Responsive design

---

### **2. Most Booked Facilities (Horizontal Bar Chart)**

**Purpose:** Identify top-performing facilities

**Data Structure:**
```typescript
{
  facilityId: string,
  name: string,
  kind: 'ROOM' | 'COTTAGE' | 'HALL',
  bookings: number,
  revenue: number
}
```

**SQL Query:**
```sql
SELECT 
  "facilityId",
  COUNT(id) as bookings,
  SUM("totalAmount") as revenue
FROM booking
WHERE "createdAt" >= $startDate 
  AND "createdAt" <= $endDate
  AND status NOT IN ('CANCELLED')
GROUP BY "facilityId"
ORDER BY bookings DESC
LIMIT 10
```

**Features:**
- Shows top 10 facilities
- Sorted by booking count (descending)
- Color-coded bars
- Horizontal layout for better readability

---

### **3. Rating Distribution (Bar Chart)**

**Purpose:** Visualize customer satisfaction breakdown

**Data Structure:**
```typescript
{
  rating: number,    // 1-5
  count: number      // Number of reviews
}
```

**SQL Query:**
```sql
SELECT 
  rating,
  COUNT(*) as count
FROM review
WHERE status = 'APPROVED'
GROUP BY rating
ORDER BY rating
```

**Features:**
- 5 bars representing 1-5 star ratings
- Color gradient (red for 1-star, green for 5-star)
- Shows sentiment at a glance

---

### **4. Booking Category Distribution (Pie Chart)**

**Purpose:** Show booking distribution by facility type

**Data Structure:**
```typescript
{
  category: 'ROOM' | 'COTTAGE' | 'HALL',
  count: number,
  percentage: number
}
```

**SQL Logic:**
```typescript
// Group bookings by facility type
const categoryMap = new Map<string, number>();
bookings.forEach(booking => {
  const facilityKind = facility.kind; // ROOM, COTTAGE, or HALL
  categoryMap.set(facilityKind, (categoryMap.get(facilityKind) || 0) + 1);
});

// Calculate percentages
const total = Array.from(categoryMap.values()).reduce((a, b) => a + b, 0);
const distribution = Array.from(categoryMap.entries()).map(([kind, count]) => ({
  category: kind,
  count,
  percentage: (count / total) * 100
}));
```

**Features:**
- Pie chart with 3 segments (ROOM, COTTAGE, HALL)
- Shows percentage and count
- Legend at bottom

---

## 🧠 INSIGHTS & ALERTS

### **1. Peak Season Detection**

**Purpose:** Identify the month with highest bookings

**Logic:**
```typescript
const peakMonth = bookingTrends.reduce((max, curr) => 
  curr.bookings > max.bookings ? curr : max
);
```

**Display:**
- Month name
- Number of bookings
- Total revenue

---

### **2. Cancellation Rate Alert**

**Purpose:** Monitor booking cancellations

**Formula:**
```typescript
Cancellation Rate = (Cancelled Bookings / Total Bookings) × 100
```

**Alert Threshold:** 10%
- 🟢 Below 10%: Normal
- 🟡 10-15%: Warning
- 🔴 Above 15%: Critical

---

### **3. Low Performing Facilities**

**Purpose:** Identify facilities that need attention

**Logic:**
- Take bottom 3 facilities from most booked list
- Reverse order (lowest first)

**Action Items:**
- Review pricing
- Improve marketing
- Check facility condition
- Analyze customer feedback

---

### **4. Recent Low Ratings Alert**

**Purpose:** Flag negative reviews requiring immediate response

**Criteria:**
- Rating ≤ 2 stars
- Status: APPROVED
- Created within last 30 days

**SQL Query:**
```sql
SELECT 
  r.*,
  f.name as facilityName,
  b.customerName
FROM review r
JOIN facility f ON r."facilityId" = f.id
JOIN booking b ON r."bookingId" = b.id
WHERE r.rating <= 2
  AND r.status = 'APPROVED'
  AND r."createdAt" >= NOW() - INTERVAL '30 days'
ORDER BY r."createdAt" DESC
LIMIT 5
```

**Display:**
- Facility name
- Customer name
- Star rating
- Comment text
- Date posted

---

## 🔧 TECHNICAL IMPLEMENTATION

### **API Endpoint**

**Route:** `/api/admin/analytics`

**Method:** GET

**Query Parameters:**
- `year` (required): Year to analyze (e.g., 2024)
- `month` (optional): Specific month (1-12)

**Authentication:**
- Requires admin or staff role
- Uses session-based authentication

**Response Structure:**
```typescript
{
  kpis: {
    totalBookings: { value, change, previous },
    totalRevenue: { value, change, previous },
    averageRating: { value, total },
    occupancyRate: { value, bookedDays, availableDays },
    totalReviews: { value }
  },
  charts: {
    bookingTrends: Array<MonthlyData>,
    mostBookedFacilities: Array<FacilityData>,
    ratingDistribution: Array<RatingData>,
    categoryDistribution: Array<CategoryData>,
    paymentDistribution: Array<PaymentData>
  },
  insights: {
    peakMonth: { month, bookings, revenue },
    lowPerformingFacilities: Array<FacilityData>,
    lowRatings: Array<ReviewData>,
    cancellationRate: number,
    cancelledBookings: number
  },
  period: {
    year: number,
    month: number | null,
    start: Date,
    end: Date
  }
}
```

---

## 📊 SQL AGGREGATION QUERIES

### **1. Monthly Booking Trends**

```sql
SELECT 
  EXTRACT(MONTH FROM "createdAt")::int as month,
  COUNT(*)::bigint as count,
  SUM(CAST("totalAmount" AS DECIMAL))::float as revenue
FROM booking
WHERE EXTRACT(YEAR FROM "createdAt") = 2024
  AND status NOT IN ('CANCELLED')
GROUP BY month
ORDER BY month;
```

### **2. Facility Performance**

```sql
SELECT 
  f.id,
  f.name,
  f.kind,
  COUNT(b.id) as total_bookings,
  SUM(b."totalAmount") as total_revenue,
  AVG(r.rating) as avg_rating
FROM facility f
LEFT JOIN booking b ON f.id = b."facilityId" 
  AND b.status NOT IN ('CANCELLED')
LEFT JOIN review r ON f.id = r."facilityId" 
  AND r.status = 'APPROVED'
GROUP BY f.id, f.name, f.kind
ORDER BY total_bookings DESC;
```

### **3. Occupancy Rate Calculation**

```sql
-- Step 1: Get total available days
SELECT COUNT(*) * 365 as total_available_days
FROM facility
WHERE "isActive" = true;

-- Step 2: Calculate booked days
SELECT 
  SUM(EXTRACT(DAY FROM (b."endDate" - b."startDate"))) as total_booked_days
FROM booking b
WHERE b.status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED')
  AND b."startDate" >= '2024-01-01'
  AND b."endDate" <= '2024-12-31';

-- Step 3: Calculate rate
-- Occupancy Rate = (total_booked_days / total_available_days) * 100
```

### **4. Revenue by Payment Status**

```sql
SELECT 
  p.status,
  COUNT(p.id) as payment_count,
  SUM(p.amount) as total_amount
FROM payment p
WHERE p."createdAt" >= '2024-01-01'
  AND p."createdAt" <= '2024-12-31'
GROUP BY p.status
ORDER BY total_amount DESC;
```

### **5. Rating Distribution**

```sql
SELECT 
  rating,
  COUNT(*) as count,
  (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()) as percentage
FROM review
WHERE status = 'APPROVED'
GROUP BY rating
ORDER BY rating DESC;
```

### **6. Cancellation Analysis**

```sql
SELECT 
  DATE_TRUNC('month', "createdAt") as month,
  COUNT(*) FILTER (WHERE status = 'CANCELLED') as cancelled,
  COUNT(*) as total,
  (COUNT(*) FILTER (WHERE status = 'CANCELLED') * 100.0 / COUNT(*)) as cancellation_rate
FROM booking
WHERE "createdAt" >= '2024-01-01'
GROUP BY month
ORDER BY month;
```

---

## 🎨 UI/UX DESIGN PRINCIPLES

### **Layout Structure**

```
┌─────────────────────────────────────────────────────┐
│ Header (Title + Year Filter)                        │
├─────────────────────────────────────────────────────┤
│ KPI Cards (5 columns)                               │
│ [Bookings] [Revenue] [Rating] [Occupancy] [Reviews] │
├─────────────────────────────────────────────────────┤
│ Charts Row 1 (2 columns)                            │
│ [Booking Trends Line Chart] [Most Booked Bar Chart] │
├─────────────────────────────────────────────────────┤
│ Charts Row 2 (2 columns)                            │
│ [Rating Distribution Bar] [Category Pie Chart]      │
├─────────────────────────────────────────────────────┤
│ Insights Row (3 columns)                            │
│ [Peak Season] [Cancellation Rate] [Low Performers]  │
├─────────────────────────────────────────────────────┤
│ Alerts Section (full width)                         │
│ [Recent Low Ratings - Requires Response]            │
└─────────────────────────────────────────────────────┘
```

### **Color Scheme**

- **Primary:** Blue (#3B82F6) - Bookings, main actions
- **Success:** Green (#10B981) - Positive trends, high ratings
- **Warning:** Yellow/Orange (#F59E0B) - Moderate alerts
- **Danger:** Red (#EF4444) - Critical issues, low ratings
- **Neutral:** Gray (#6B7280) - Secondary information

### **Responsive Design**

- **Desktop (≥1024px):** Full grid layout
- **Tablet (768-1023px):** 2-column layout for charts
- **Mobile (<768px):** Single column, stacked cards

### **Chart Library**

Using **Chart.js** with React wrappers:
- `react-chartjs-2`
- Responsive by default
- Customizable tooltips
- Animation support
- Accessible

---

## 🚀 PERFORMANCE OPTIMIZATION

### **1. Database Indexing**

Ensure these indexes exist:
```sql
CREATE INDEX idx_booking_created_at ON booking("createdAt");
CREATE INDEX idx_booking_status ON booking(status);
CREATE INDEX idx_booking_facility_dates ON booking("facilityId", "startDate", "endDate");
CREATE INDEX idx_review_status ON review(status);
CREATE INDEX idx_review_rating ON review(rating);
CREATE INDEX idx_payment_created_at ON payment("createdAt");
```

### **2. Query Optimization**

- Use `COUNT(*)` instead of `COUNT(id)` for better performance
- Leverage `GROUP BY` with proper indexes
- Use `WHERE` clauses to filter early
- Limit result sets with `LIMIT`

### **3. Caching Strategy**

Implement Redis caching for:
- KPI metrics (TTL: 5 minutes)
- Monthly trends (TTL: 1 hour)
- Rating distribution (TTL: 30 minutes)

```typescript
// Example caching
const cacheKey = `analytics:${year}:${month || 'all'}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Fetch from database
const data = await fetchAnalytics();

// Cache for 5 minutes
await redis.setex(cacheKey, 300, JSON.stringify(data));
return data;
```

### **4. Lazy Loading**

- Load KPIs first (critical)
- Load charts progressively
- Defer insights section
- Use skeleton loaders

---

## 🔒 SECURITY CONSIDERATIONS

### **1. Authentication**

```typescript
const session = await getServerSession();
if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### **2. Data Access Control**

- Only ADMIN and STAFF roles can access analytics
- No customer PII exposed in aggregated data
- Audit log all analytics access

### **3. SQL Injection Prevention**

- Use Prisma ORM (parameterized queries)
- Never concatenate user input into SQL
- Validate all query parameters

---

## 📈 MISSING METRICS & IMPROVEMENTS

### **Critical Metrics to Add**

#### **1. Revenue Forecast**

**Purpose:** Predict future revenue based on historical trends

**Implementation:**
```typescript
// Simple linear regression
function forecastRevenue(historicalData: MonthlyData[]): number {
  const n = historicalData.length;
  const sumX = historicalData.reduce((sum, d, i) => sum + i, 0);
  const sumY = historicalData.reduce((sum, d) => sum + d.revenue, 0);
  const sumXY = historicalData.reduce((sum, d, i) => sum + (i * d.revenue), 0);
  const sumX2 = historicalData.reduce((sum, d, i) => sum + (i * i), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return slope * n + intercept; // Next month forecast
}
```

#### **2. Customer Lifetime Value (CLV)**

**Formula:**
```typescript
CLV = (Average Booking Value) × (Number of Repeat Bookings) × (Average Customer Lifespan)
```

**SQL Query:**
```sql
SELECT 
  "customerEmail",
  COUNT(*) as total_bookings,
  AVG("totalAmount") as avg_booking_value,
  SUM("totalAmount") as lifetime_value
FROM booking
WHERE status NOT IN ('CANCELLED')
GROUP BY "customerEmail"
HAVING COUNT(*) > 1
ORDER BY lifetime_value DESC;
```

#### **3. Booking Lead Time**

**Purpose:** Understand how far in advance customers book

**Formula:**
```typescript
Lead Time = startDate - createdAt (in days)
```

**SQL Query:**
```sql
SELECT 
  AVG(EXTRACT(DAY FROM ("startDate" - "createdAt"))) as avg_lead_time_days,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(DAY FROM ("startDate" - "createdAt"))) as median_lead_time
FROM booking
WHERE status NOT IN ('CANCELLED');
```

#### **4. Revenue Per Available Room (RevPAR)**

**Formula:**
```typescript
RevPAR = Total Room Revenue / Total Available Rooms
```

#### **5. Average Daily Rate (ADR)**

**Formula:**
```typescript
ADR = Total Room Revenue / Number of Rooms Sold
```

#### **6. Repeat Customer Rate**

**Formula:**
```typescript
Repeat Rate = (Customers with >1 Booking / Total Customers) × 100
```

**SQL Query:**
```sql
SELECT 
  COUNT(DISTINCT CASE WHEN booking_count > 1 THEN "customerEmail" END) * 100.0 / 
  COUNT(DISTINCT "customerEmail") as repeat_rate
FROM (
  SELECT "customerEmail", COUNT(*) as booking_count
  FROM booking
  WHERE status NOT IN ('CANCELLED')
  GROUP BY "customerEmail"
) subquery;
```

---

## 🎯 SMART ALERTS & NOTIFICATIONS

### **1. Declining Rating Alert**

**Trigger:** Average rating drops below 4.0 or decreases by >0.5 in a month

**Action:** Email admin with details and affected facilities

### **2. Low Occupancy Alert**

**Trigger:** Occupancy rate below 50% for 2 consecutive months

**Action:** Suggest promotional campaigns or pricing adjustments

### **3. High Cancellation Alert**

**Trigger:** Cancellation rate exceeds 15%

**Action:** Investigate reasons and implement retention strategies

### **4. Revenue Milestone**

**Trigger:** Monthly revenue exceeds target or hits new record

**Action:** Celebrate and analyze success factors

### **5. Facility Performance Alert**

**Trigger:** Facility has 0 bookings for 30+ days

**Action:** Review pricing, availability, or facility condition

---

## 🔄 FUTURE SCALABILITY IMPROVEMENTS

### **1. Real-Time Dashboard**

- Implement WebSocket connections
- Live booking updates
- Real-time revenue counter
- Active users indicator

### **2. Comparative Analytics**

- Year-over-year comparison
- Facility-to-facility comparison
- Benchmark against industry standards

### **3. Predictive Analytics**

- Machine learning for demand forecasting
- Dynamic pricing recommendations
- Churn prediction
- Seasonal trend analysis

### **4. Custom Report Builder**

- Allow admins to create custom reports
- Export to PDF/Excel
- Schedule automated reports
- Email delivery

### **5. Mobile Analytics App**

- Native mobile app for on-the-go insights
- Push notifications for alerts
- Simplified dashboard view
- Quick actions

### **6. Multi-Property Support**

- Compare multiple resort locations
- Consolidated reporting
- Property-specific insights
- Cross-property trends

---

## 📚 CHART.JS CONFIGURATION EXAMPLES

### **Line Chart (Booking Trends)**

```typescript
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function(value: number) {
          return viewMode === 'revenue' 
            ? '₱' + value.toLocaleString() 
            : value;
        }
      }
    }
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false
  },
};
```

### **Bar Chart (Most Booked)**

```typescript
const barChartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `${context.parsed.x} bookings`;
        }
      }
    }
  },
  scales: {
    x: {
      beginAtZero: true,
    }
  }
};
```

### **Pie Chart (Category Distribution)**

```typescript
const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
};
```

---

## ✅ TESTING CHECKLIST

- [ ] KPI cards display correct values
- [ ] Percentage changes calculate properly
- [ ] Year filter updates all data
- [ ] Booking trends chart renders correctly
- [ ] Toggle between bookings/revenue works
- [ ] Most booked facilities sorted correctly
- [ ] Rating distribution shows all 5 stars
- [ ] Category pie chart shows correct percentages
- [ ] Peak season identified correctly
- [ ] Low ratings alert displays recent reviews
- [ ] Cancellation rate calculates properly
- [ ] Occupancy rate formula is accurate
- [ ] Charts are responsive on mobile
- [ ] Loading states work properly
- [ ] Error handling displays user-friendly messages
- [ ] Authentication prevents unauthorized access
- [ ] Performance is acceptable (<2s load time)

---

## 🎓 BEST PRACTICES

1. **Cache Aggressively** - Analytics data doesn't change every second
2. **Index Properly** - Ensure all date and status fields are indexed
3. **Paginate Large Datasets** - Don't load all facilities at once
4. **Use Aggregations** - Let the database do the heavy lifting
5. **Monitor Performance** - Track query execution times
6. **Validate Inputs** - Always validate year/month parameters
7. **Handle Edge Cases** - What if no bookings exist?
8. **Provide Context** - Show comparisons and trends, not just numbers
9. **Make It Actionable** - Every metric should suggest an action
10. **Keep It Simple** - Don't overwhelm with too many metrics

---

## 📞 SUPPORT & MAINTENANCE

### **Monitoring**

- Track API response times
- Monitor database query performance
- Log all errors with context
- Set up alerts for failures

### **Regular Updates**

- Review metrics quarterly
- Add new insights based on business needs
- Optimize slow queries
- Update chart visualizations

### **Documentation**

- Keep this document updated
- Document new metrics added
- Maintain changelog
- Provide training materials

---

## 🎉 CONCLUSION

This analytics dashboard provides comprehensive insights into booking performance, revenue trends, customer satisfaction, and facility utilization. It enables data-driven decision-making and helps identify opportunities for improvement.

**Key Benefits:**
- ✅ Real-time business intelligence
- ✅ Actionable insights with alerts
- ✅ Beautiful, intuitive visualizations
- ✅ Scalable architecture
- ✅ Production-ready implementation

**Next Steps:**
1. Install Chart.js dependencies: `npm install chart.js react-chartjs-2`
2. Test the analytics API endpoint
3. Review the dashboard UI
4. Customize metrics based on business needs
5. Set up caching for better performance
6. Implement automated alerts
7. Train staff on using the dashboard

