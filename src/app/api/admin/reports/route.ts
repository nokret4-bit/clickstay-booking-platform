import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";
import { startOfMonth, endOfMonth, eachDayOfInterval, subMonths, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get("type");

    // If specific report type requested
    if (reportType === "revenue") {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const startDate = from ? new Date(from) : startOfMonth(new Date());
      const endDate = to ? new Date(to) : endOfMonth(new Date());
      return await getRevenueReport(startDate, endDate);
    } else if (reportType === "bookings") {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const startDate = from ? new Date(from) : startOfMonth(new Date());
      const endDate = to ? new Date(to) : endOfMonth(new Date());
      return await getBookingsReport(startDate, endDate);
    } else if (reportType === "occupancy") {
      const from = searchParams.get("from");
      const to = searchParams.get("to");
      const startDate = from ? new Date(from) : startOfMonth(new Date());
      const endDate = to ? new Date(to) : endOfMonth(new Date());
      return await getOccupancyReport(startDate, endDate);
    }

    // Default: return comprehensive dashboard data
    return await getDashboardData();
  } catch (error) {
    console.error("Admin reports GET error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

async function getDashboardData() {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // Get stats - exclude temporary locks
  const [totalRevenue, monthlyRevenue, totalBookings, monthlyBookings, confirmedBookings, cancelledBookings, facilities] = await Promise.all([
    prisma.booking.aggregate({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT] },
        customerName: { not: 'Temporary Lock' }
      },
      _sum: { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: {
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT] },
        confirmedAt: { gte: monthStart, lte: monthEnd },
        customerName: { not: 'Temporary Lock' }
      },
      _sum: { totalAmount: true },
    }),
    prisma.booking.count({
      where: { customerName: { not: 'Temporary Lock' } }
    }),
    prisma.booking.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        customerName: { not: 'Temporary Lock' }
      },
    }),
    prisma.booking.count({
      where: { 
        status: BookingStatus.CONFIRMED,
        customerName: { not: 'Temporary Lock' }
      },
    }),
    prisma.booking.count({
      where: { 
        status: BookingStatus.CANCELLED,
        customerName: { not: 'Temporary Lock' }
      },
    }),
    prisma.facility.count({ where: { isActive: true } }),
  ]);

  // Bookings by facility type
  const bookingsByType = await prisma.booking.groupBy({
    by: ["facilityId"],
    where: {
      status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT] },
      customerName: { not: 'Temporary Lock' }
    },
    _count: true,
    _sum: { totalAmount: true },
  });

  const facilityData = await prisma.facility.findMany({
    where: {
      id: { in: bookingsByType.map((b) => b.facilityId) },
    },
  });

  // Per-facility stats with names
  const facilityStats = bookingsByType.map((booking) => {
    const facility = facilityData.find((f) => f.id === booking.facilityId);
    return {
      facilityId: booking.facilityId,
      facilityName: facility?.name || "Unknown Facility",
      type: facility?.kind || "Unknown",
      count: booking._count,
      revenue: Number(booking._sum.totalAmount || 0),
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Aggregated stats by type
  const typeStats = Object.values(
    facilityStats.reduce((acc, stat) => {
      if (!acc[stat.type]) {
        acc[stat.type] = { type: stat.type, count: 0, revenue: 0 };
      }
      acc[stat.type].count += stat.count;
      acc[stat.type].revenue += stat.revenue;
      return acc;
    }, {} as Record<string, { type: string; count: number; revenue: number }>)
  );

  // Monthly trends for last 6 months
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    
    const [bookings, revenue] = await Promise.all([
      prisma.booking.count({
        where: {
          createdAt: { gte: start, lte: end },
          customerName: { not: 'Temporary Lock' }
        },
      }),
      prisma.booking.aggregate({
        where: {
          status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED, BookingStatus.CHECKED_OUT] },
          confirmedAt: { gte: start, lte: end },
          customerName: { not: 'Temporary Lock' }
        },
        _sum: { totalAmount: true },
      }),
    ]);

    monthlyTrends.push({
      month: format(monthDate, 'MMM'),
      bookings,
      revenue: Number(revenue._sum.totalAmount || 0),
    });
  }

  // Recent bookings
  const recentBookings = await prisma.booking.findMany({
    take: 10,
    where: {
      customerName: { not: 'Temporary Lock' }
    },
    orderBy: { createdAt: "desc" },
    include: {
      facility: true,
    },
  });

  return NextResponse.json({
    totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    monthlyRevenue: Number(monthlyRevenue._sum.totalAmount || 0),
    totalBookings,
    monthlyBookings,
    confirmedBookings,
    cancelledBookings,
    facilities,
    typeStats,
    facilityStats,
    recentBookings,
    monthlyTrends,
  });
}

async function getRevenueReport(startDate: Date, endDate: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
      },
      confirmedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      facility: true,
      payment: true,
    },
  });

  const totalRevenue = bookings.reduce(
    (sum, booking) => sum + Number(booking.totalAmount),
    0
  );

  const revenueByType = bookings.reduce(
    (acc, booking) => {
      const type = booking.facility.kind;
      acc[type] = (acc[type] || 0) + Number(booking.totalAmount);
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    reportType: "revenue",
    period: { from: startDate, to: endDate },
    totalRevenue,
    revenueByType,
    bookingsCount: bookings.length,
  });
}

async function getBookingsReport(startDate: Date, endDate: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      facility: true,
    },
  });

  const bookingsByStatus = bookings.reduce(
    (acc, booking) => {
      acc[booking.status] = (acc[booking.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const bookingsByType = bookings.reduce(
    (acc, booking) => {
      const type = booking.facility.kind;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return NextResponse.json({
    reportType: "bookings",
    period: { from: startDate, to: endDate },
    totalBookings: bookings.length,
    bookingsByStatus,
    bookingsByType,
  });
}

async function getOccupancyReport(startDate: Date, endDate: Date) {
  const facilities = await prisma.facility.findMany({
    where: { isActive: true },
    include: {
      bookings: {
        where: {
          status: {
            in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED],
          },
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
      },
    },
  });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const totalDays = days.length;
  const totalUnits = facilities.length;
  const totalCapacity = totalDays * totalUnits;

  let occupiedDays = 0;
  facilities.forEach((facility: any) => {
    facility.bookings.forEach((booking: any) => {
      const bookingDays = eachDayOfInterval({
        start: booking.startDate > startDate ? booking.startDate : startDate,
        end: booking.endDate < endDate ? booking.endDate : endDate,
      });
      occupiedDays += bookingDays.length;
    });
  });

  const occupancyRate = totalCapacity > 0 ? (occupiedDays / totalCapacity) * 100 : 0;

  return NextResponse.json({
    reportType: "occupancy",
    period: { from: startDate, to: endDate },
    totalUnits,
    totalDays,
    occupiedDays,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
  });
}
