import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const exportType = searchParams.get("type") || "bookings"; // bookings, revenue, summary

    const where: any = {
      customerName: { not: 'Temporary Lock' } // Exclude temporary locks
    };

    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    if (exportType === "summary") {
      return await exportSummaryReport(where);
    }

    // Default: Export detailed bookings
    const bookings = await prisma.booking.findMany({
      where,
      include: {
        facility: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        reviews: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Professional CSV Export Template
    const exportDate = format(new Date(), "MMMM dd, yyyy 'at' HH:mm");
    const reportTitle = [
      ["MANUEL RESORT - BOOKING REPORT"],
      ["Generated:", exportDate],
      ["Total Records:", bookings.length.toString()],
      [""],
    ];

    // Organized headers with clear sections
    const headers = [
      "Booking Code",
      "Status",
      "Customer Name",
      "Email",
      "Phone",
      "Facility",
      "Type",
      "Check-In",
      "Check-Out",
      "Nights",
      "Guests",
      "Amount",
      "Booked On",
      "Confirmed On",
      "Rating",
      "Notes",
    ];

    const rows = bookings.map((booking) => {
      const nights = (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24);
      const firstReview = booking.reviews && booking.reviews.length > 0 ? booking.reviews[0] : null;
      
      // Format amount with thousand separators
      const formattedAmount = Number(booking.totalAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      return [
        `"${booking.code}"`,
        `"${booking.status}"`,
        `"${booking.customerName.replace(/"/g, '""')}"`,
        `"${booking.customerEmail.replace(/"/g, '""')}"`,
        `"${booking.customerPhone || "-"}"`,
        `"${booking.facility.name.replace(/"/g, '""')}"`,
        `"${booking.facility.kind}"`,
        `"${format(booking.startDate, "MMM dd, yyyy")}"`,
        `"${format(booking.endDate, "MMM dd, yyyy")}"`,
        `"${nights}"`,
        `"${booking.guests || "-"}"`,
        `"${formattedAmount}"`,
        `"${format(booking.createdAt, "MMM dd, yyyy HH:mm")}"`,
        `"${booking.confirmedAt ? format(booking.confirmedAt, "MMM dd, yyyy HH:mm") : "-"}"`,
        `"${firstReview?.rating ? `${firstReview.rating}/5` : "-"}"`,
        `"${(booking.notes || "-").replace(/"/g, '""')}"`,
      ];
    });

    // Combine title, headers, and data
    const csvRows = [
      ...reportTitle.map(row => row.join(",")),
      headers.map(h => `"${h}"`).join(","),
      ...rows.map(row => row.join(",")),
      "",
      '"End of Report"',
    ];

    const csv = csvRows.join("\n");

    const filename = `Manuel-Resort-Bookings-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Admin export error:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: "Failed to export data",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function exportSummaryReport(where: any) {
  // Get aggregated statistics
  const [totalBookings, totalRevenue, bookingsByStatus, bookingsByType] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.aggregate({
      where: {
        ...where,
        status: { in: ["CONFIRMED", "COMPLETED", "CHECKED_OUT"] },
      },
      _sum: { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where,
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ["facilityId"],
      where,
      _count: true,
      _sum: { totalAmount: true },
    }),
  ]);

  const facilities = await prisma.facility.findMany({
    where: {
      id: { in: bookingsByType.map((b) => b.facilityId) },
    },
  });

  // Summary Report CSV
  const summaryRows = [
    ["BOOKING SUMMARY REPORT"],
    ["Generated:", format(new Date(), "yyyy-MM-dd HH:mm:ss")],
    [""],
    ["OVERALL STATISTICS"],
    ["Total Bookings", totalBookings.toString()],
    ["Total Revenue", `₱${Number(totalRevenue._sum.totalAmount || 0).toLocaleString()}`],
    [""],
    ["BOOKINGS BY STATUS"],
    ["Status", "Count", "Revenue (₱)"],
    ...bookingsByStatus.map((stat) => [
      stat.status,
      stat._count.toString(),
      Number(stat._sum.totalAmount || 0).toLocaleString(),
    ]),
    [""],
    ["BOOKINGS BY FACILITY TYPE"],
    ["Facility", "Type", "Bookings", "Revenue (₱)"],
    ...bookingsByType.map((stat) => {
      const facility = facilities.find((f) => f.id === stat.facilityId);
      return [
        escapeCSV(facility?.name || "Unknown"),
        facility?.kind || "Unknown",
        stat._count.toString(),
        Number(stat._sum.totalAmount || 0).toLocaleString(),
      ];
    }),
  ];

  const csv = summaryRows.map((row) => row.join(",")).join("\n");
  const filename = `summary-report-${format(new Date(), "yyyy-MM-dd-HHmmss")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

// Helper function to escape CSV fields
function escapeCSV(field: string): string {
  if (field.includes(",") || field.includes('"') || field.includes("\n")) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
