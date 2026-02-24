import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;

    // Date range for current period
    const currentStart = month 
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    const currentEnd = month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    // Previous period for comparison
    const previousStart = month
      ? new Date(year, month - 2, 1)
      : new Date(year - 1, 0, 1);
    const previousEnd = month
      ? new Date(year, month - 1, 0, 23, 59, 59)
      : new Date(year - 1, 11, 31, 23, 59, 59);

    // 1. KPI METRICS
    
    // Total Bookings (current period) - Exclude temporary locks
    const currentBookings = await prisma.booking.count({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { notIn: ['CANCELLED'] },
        customerName: { not: 'Temporary Lock' }
      }
    });

    const previousBookings = await prisma.booking.count({
      where: {
        createdAt: { gte: previousStart, lte: previousEnd },
        status: { notIn: ['CANCELLED'] },
        customerName: { not: 'Temporary Lock' }
      }
    });

    const bookingsChange = previousBookings > 0 
      ? ((currentBookings - previousBookings) / previousBookings) * 100 
      : 0;

    // Total Revenue (current period) - Exclude temporary locks
    const currentRevenue = await prisma.booking.aggregate({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
        customerName: { not: 'Temporary Lock' }
      },
      _sum: { totalAmount: true }
    });

    const previousRevenue = await prisma.booking.aggregate({
      where: {
        createdAt: { gte: previousStart, lte: previousEnd },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
        customerName: { not: 'Temporary Lock' }
      },
      _sum: { totalAmount: true }
    });

    const currentRevenueValue = Number(currentRevenue._sum.totalAmount || 0);
    const previousRevenueValue = Number(previousRevenue._sum.totalAmount || 0);
    const revenueChange = previousRevenueValue > 0
      ? ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100
      : 0;

    // Average Rating
    const ratingStats = await prisma.review.aggregate({
      where: { status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true }
    });

    const averageRating = ratingStats._avg.rating || 0;
    const totalReviews = ratingStats._count.rating;

    // Occupancy Rate Calculation
    const facilities = await prisma.facility.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    const daysInPeriod = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
    const totalAvailableDays = facilities.length * daysInPeriod;

    // Calculate booked days - Exclude temporary locks
    const bookings = await prisma.booking.findMany({
      where: {
        startDate: { lte: currentEnd },
        endDate: { gte: currentStart },
        status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED'] },
        customerName: { not: 'Temporary Lock' }
      },
      select: {
        startDate: true,
        endDate: true
      }
    });

    let totalBookedDays = 0;
    bookings.forEach(booking => {
      const start = booking.startDate > currentStart ? booking.startDate : currentStart;
      const end = booking.endDate < currentEnd ? booking.endDate : currentEnd;
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      totalBookedDays += Math.max(0, days);
    });

    const occupancyRate = totalAvailableDays > 0 
      ? (totalBookedDays / totalAvailableDays) * 100 
      : 0;

    // 2. BOOKING TRENDS (Monthly for the year) - Exclude temporary locks
    const monthlyBookings = await prisma.$queryRaw<Array<{ month: number; count: bigint; revenue: number }>>`
      SELECT 
        EXTRACT(MONTH FROM "createdAt")::int as month,
        COUNT(*)::bigint as count,
        SUM(CAST("totalAmount" AS DECIMAL))::float as revenue
      FROM booking
      WHERE EXTRACT(YEAR FROM "createdAt") = ${year}
        AND status NOT IN ('CANCELLED')
        AND "customerName" != 'Temporary Lock'
      GROUP BY month
      ORDER BY month
    `;

    const bookingTrends = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyBookings.find(m => m.month === i + 1);
      return {
        month: i + 1,
        monthName: new Date(year, i).toLocaleString('default', { month: 'short' }),
        bookings: monthData ? Number(monthData.count) : 0,
        revenue: monthData ? Number(monthData.revenue || 0) : 0
      };
    });

    // 3. MOST BOOKED FACILITIES - Exclude temporary locks
    const facilityBookings = await prisma.booking.groupBy({
      by: ['facilityId'],
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { notIn: ['CANCELLED'] },
        customerName: { not: 'Temporary Lock' }
      },
      _count: { id: true },
      _sum: { totalAmount: true }
    });

    const facilitiesData = await prisma.facility.findMany({
      where: {
        id: { in: facilityBookings.map(fb => fb.facilityId) }
      },
      select: {
        id: true,
        name: true,
        kind: true
      }
    });

    const mostBookedFacilities = facilityBookings
      .map(fb => {
        const facility = facilitiesData.find(f => f.id === fb.facilityId);
        return {
          facilityId: fb.facilityId,
          name: facility?.name || 'Unknown',
          kind: facility?.kind || 'ROOM',
          bookings: fb._count.id,
          revenue: Number(fb._sum.totalAmount || 0)
        };
      })
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 10);

    // 4. RATING DISTRIBUTION
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { status: 'APPROVED' },
      _count: { rating: true }
    });

    const ratingDist = [1, 2, 3, 4, 5].map(rating => ({
      rating,
      count: ratingDistribution.find(r => r.rating === rating)?._count.rating || 0
    }));

    // 5. BOOKING CATEGORY DISTRIBUTION - Exclude temporary locks
    const categoryDistribution = await prisma.booking.groupBy({
      by: ['facilityId'],
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: { notIn: ['CANCELLED'] },
        customerName: { not: 'Temporary Lock' }
      },
      _count: { id: true }
    });

    const facilitiesWithKind = await prisma.facility.findMany({
      where: {
        id: { in: categoryDistribution.map(cd => cd.facilityId) }
      },
      select: {
        id: true,
        kind: true
      }
    });

    const categoryMap = new Map<string, number>();
    categoryDistribution.forEach(cd => {
      const facility = facilitiesWithKind.find(f => f.id === cd.facilityId);
      if (facility) {
        const current = categoryMap.get(facility.kind) || 0;
        categoryMap.set(facility.kind, current + cd._count.id);
      }
    });

    const categoryDist = Array.from(categoryMap.entries()).map(([kind, count]) => ({
      category: kind,
      count,
      percentage: currentBookings > 0 ? (count / currentBookings) * 100 : 0
    }));

    // 6. ADDITIONAL INSIGHTS

    // Peak booking months
    const peakMonth = bookingTrends.length > 0 
      ? bookingTrends.reduce((max, curr) => 
          curr.bookings > max.bookings ? curr : max
        )
      : { monthName: 'N/A', bookings: 0, revenue: 0 };

    // Low performing facilities (least booked)
    const lowPerformingFacilities = mostBookedFacilities
      .slice(-3)
      .reverse();

    // Revenue by payment status
    const paymentStats = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: currentStart, lte: currentEnd }
      },
      _count: { id: true },
      _sum: { amount: true }
    });

    const paymentDistribution = paymentStats.map(ps => ({
      status: ps.status,
      count: ps._count.id,
      amount: Number(ps._sum.amount || 0)
    }));

    // Recent low ratings (needs attention)
    const lowRatings = await prisma.review.findMany({
      where: {
        rating: { lte: 2 },
        status: 'APPROVED',
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      include: {
        facility: { select: { name: true } },
        booking: { select: { customerName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Cancellation rate - Exclude temporary locks
    const totalBookingsIncludingCancelled = await prisma.booking.count({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        customerName: { not: 'Temporary Lock' }
      }
    });

    const cancelledBookings = await prisma.booking.count({
      where: {
        createdAt: { gte: currentStart, lte: currentEnd },
        status: 'CANCELLED',
        customerName: { not: 'Temporary Lock' }
      }
    });

    const cancellationRate = totalBookingsIncludingCancelled > 0
      ? (cancelledBookings / totalBookingsIncludingCancelled) * 100
      : 0;

    return NextResponse.json({
      kpis: {
        totalBookings: {
          value: currentBookings,
          change: bookingsChange,
          previous: previousBookings
        },
        totalRevenue: {
          value: currentRevenueValue,
          change: revenueChange,
          previous: previousRevenueValue
        },
        averageRating: {
          value: averageRating,
          total: totalReviews
        },
        occupancyRate: {
          value: occupancyRate,
          bookedDays: totalBookedDays,
          availableDays: totalAvailableDays
        },
        totalReviews: {
          value: totalReviews
        }
      },
      charts: {
        bookingTrends,
        mostBookedFacilities,
        ratingDistribution: ratingDist,
        categoryDistribution: categoryDist,
        paymentDistribution
      },
      insights: {
        peakMonth: {
          month: peakMonth.monthName,
          bookings: peakMonth.bookings,
          revenue: peakMonth.revenue
        },
        lowPerformingFacilities,
        lowRatings: lowRatings.map(lr => ({
          facilityName: lr.facility.name,
          customerName: lr.booking.customerName,
          rating: lr.rating,
          comment: lr.comment,
          createdAt: lr.createdAt
        })),
        cancellationRate,
        cancelledBookings
      },
      period: {
        year,
        month,
        start: currentStart,
        end: currentEnd
      }
    });

  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
