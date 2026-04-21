import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { format, startOfMonth, endOfMonth } from "date-fns";
import * as XLSX from "xlsx-js-style";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get("month"); // Format: YYYY-MM
    const year = searchParams.get("year"); // Format: YYYY

    if (!month && !year) {
      return NextResponse.json(
        { error: "Either month (YYYY-MM) or year (YYYY) parameter is required" },
        { status: 400 }
      );
    }

    if (month) {
      return await getMonthlyReport(month);
    } else if (year) {
      return await getYearlyReport(year);
    }
  } catch (error) {
    console.error("Report export error:", error);
    return NextResponse.json(
      { error: "Failed to export report" },
      { status: 500 }
    );
  }
}

async function getMonthlyReport(month: string) {
  try {
    const session = await getServerSession();
    
    // Parse month (YYYY-MM format)
    const [yearStr, monthStr] = month.split("-");
    const yearNum = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: "Invalid month format. Use YYYY-MM" },
        { status: 400 }
      );
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Fetch report data for the month
    const [bookings, facilities, auditLogs] = await Promise.all([
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          customerName: { not: "Temporary Lock" },
        },
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
      }),
      prisma.facility.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          kind: true,
        },
      }),
      prisma.auditLog.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return generateMonthlyExcel(bookings, facilities, auditLogs, startDate, session);
  } catch (error) {
    console.error("Monthly report error:", error);
    return NextResponse.json(
      { error: "Failed to generate monthly report" },
      { status: 500 }
    );
  }
}

async function getYearlyReport(year: string) {
  try {
    const session = await getServerSession();
    
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > new Date().getFullYear()) {
      return NextResponse.json(
        { error: "Invalid year format" },
        { status: 400 }
      );
    }

    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);

    // Fetch all bookings for the year
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        customerName: { not: "Temporary Lock" },
      },
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

    return generateYearlyExcel(bookings, yearNum, session);
  } catch (error) {
    console.error("Yearly report error:", error);
    return NextResponse.json(
      { error: "Failed to generate yearly report" },
      { status: 500 }
    );
  }
}

async function generateMonthlyExcel(bookings: any[], facilities: any[], auditLogs: any[], startDate: Date, session: any) {
  // Calculate statistics
  const confirmedBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED
  ).length;
  const completedBookings = bookings.filter(
    (b) =>
      b.status === BookingStatus.COMPLETED ||
      b.status === BookingStatus.CHECKED_OUT
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  ).length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const totalGuests = bookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const averageRevenuePerBooking =
    bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // Group bookings by facility
  const bookingsByFacility = bookings.reduce(
    (acc, booking) => {
      const facilityName = booking.facility.name;
      if (!acc[facilityName]) {
        acc[facilityName] = {
          name: facilityName,
          kind: booking.facility.kind,
          count: 0,
          revenue: 0,
          guests: 0,
        };
      }
      acc[facilityName].count++;
      acc[facilityName].revenue += Number(booking.totalAmount);
      acc[facilityName].guests += booking.guests || 0;
      return acc;
    },
    {} as Record<
      string,
      { name: string; kind: string; count: number; revenue: number; guests: number }
    >
  );

  // Group bookings by type
  const bookingsByType = bookings.reduce(
    (acc, booking) => {
      const type = booking.facility.kind;
      if (!acc[type]) {
        acc[type] = { type, count: 0, revenue: 0 };
      }
      acc[type].count++;
      acc[type].revenue += Number(booking.totalAmount);
      return acc;
    },
    {} as Record<string, { type: string; count: number; revenue: number }>
  );

  // Create workbook
  const wb = XLSX.utils.book_new();

  // ====== Sheet 1: Summary ======
  const summaryData: any[][] = [
    [
      "MANUEL RESORT - MONTHLY BUSINESS REPORT",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", ""],
    ["Month:", format(startDate, "MMMM yyyy"), "", "", "", "", ""],
    [
      "Period:",
      `${format(startDate, "MMMM dd, yyyy")} to ${format(new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0), "MMMM dd, yyyy")}`,
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Generated:",
      format(new Date(), "MMMM dd, yyyy HH:mm"),
      "",
      "",
      "",
      "",
      "",
    ],
    ["Generated by:", session?.user?.name || session?.user?.email || "Admin", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["KEY METRICS", "", "VALUE", "", "", "", ""],
    ["Total Revenue", "", `₱${totalRevenue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`, "", "", "", ""],
    ["Total Bookings", "", bookings.length.toString(), "", "", "", ""],
    ["Confirmed Bookings", "", confirmedBookings.toString(), "", "", "", ""],
    ["Completed Bookings", "", completedBookings.toString(), "", "", "", ""],
    ["Cancelled Bookings", "", cancelledBookings.toString(), "", "", "", ""],
    ["Total Guests", "", totalGuests.toString(), "", "", "", ""],
    ["Average Revenue/Booking", "", `₱${averageRevenuePerBooking.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`, "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["REVENUE BY TYPE", "", "", "", "", "", ""],
  ];

  // Add type breakdown
  Object.values(bookingsByType).forEach((typeData) => {
    summaryData.push([
      typeData.type || "Unknown",
      typeData.count.toString(),
      `₱${typeData.revenue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`,
      "",
      "",
      "",
      "",
    ]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];

  const headerStyle = {
    font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1F2937" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const subheaderStyle = {
    font: { bold: true, size: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "374151" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const dataStyle = {
    alignment: { horizontal: "right", vertical: "center" },
    border: {
      bottom: { style: "thin", color: { rgb: "D1D5DB" } },
    },
  };

  summaryWs["A1"]!.s = headerStyle;
  for (let i = 8; i <= 16; i++) {
    summaryWs[`A${i}`]!.s = {
      ...dataStyle,
      font: { bold: true },
      fill: { fgColor: { rgb: "F3F4F6" } },
    };
  }

  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // ====== Sheet 2: Detailed Bookings ======
  const bookingsData: any[][] = [
    [
      "Booking Code",
      "Status",
      "Customer",
      "Email",
      "Facility",
      "Type",
      "Check-In",
      "Check-Out",
      "Nights",
      "Guests",
      "Amount (₱)",
      "Booked On",
      "Confirmed On",
      "Rating",
    ],
  ];

  bookings.forEach((booking) => {
    const nights = Math.ceil(
      (booking.endDate.getTime() - booking.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const firstReview =
      booking.reviews && booking.reviews.length > 0 ? booking.reviews[0] : null;

    bookingsData.push([
      booking.code,
      booking.status.replace(/_/g, " "),
      booking.customerName,
      booking.customerEmail,
      booking.facility.name,
      booking.facility.kind,
      format(booking.startDate, "MMM dd, yyyy"),
      format(booking.endDate, "MMM dd, yyyy"),
      nights.toString(),
      (booking.guests || "-").toString(),
      Number(booking.totalAmount),
      format(booking.createdAt, "MMM dd, yyyy HH:mm"),
      booking.confirmedAt
        ? format(booking.confirmedAt, "MMM dd, yyyy HH:mm")
        : "-",
      firstReview?.rating ? `${firstReview.rating}/5` : "-",
    ]);
  });

  const bookingsWs = XLSX.utils.aoa_to_sheet(bookingsData);
  bookingsWs["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
  ];

  for (let i = 0; i < 14; i++) {
    const cell = bookingsWs[String.fromCharCode(65 + i) + "1"];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let row = 2; row <= bookingsData.length; row++) {
    const amountCell = bookingsWs["K" + row];
    if (amountCell && typeof amountCell.v === "number") {
      amountCell.z = "#,##0.00";
    }
  }

  XLSX.utils.book_append_sheet(wb, bookingsWs, "Bookings");

  // ====== Sheet 3: Facility Breakdown ======
  const facilityData: any[][] = [
    ["Facility", "Type", "Bookings", "Guests", "Revenue (₱)", "Avg/Booking"],
  ];

  Object.values(bookingsByFacility).forEach((facility) => {
    const avgPerBooking =
      facility.count > 0 ? facility.revenue / facility.count : 0;
    facilityData.push([
      facility.name,
      facility.kind,
      facility.count,
      facility.guests,
      facility.revenue,
      avgPerBooking,
    ]);
  });

  const facilityWs = XLSX.utils.aoa_to_sheet(facilityData);
  facilityWs["!cols"] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
  ];

  for (let i = 0; i < 6; i++) {
    const cell = facilityWs[String.fromCharCode(65 + i) + "1"];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let row = 2; row <= facilityData.length; row++) {
    const revenueCell = facilityWs["E" + row];
    const avgCell = facilityWs["F" + row];
    if (revenueCell && typeof revenueCell.v === "number") {
      revenueCell.z = "#,##0.00";
    }
    if (avgCell && typeof avgCell.v === "number") {
      avgCell.z = "#,##0.00";
    }
  }

  XLSX.utils.book_append_sheet(wb, facilityWs, "Facilities");

  // ====== Sheet 4: Activity Logs ======
  if (auditLogs.length > 0) {
    const logsData: any[][] = [
      ["Date", "Time", "Action", "Entity", "User", "Email", "Role", "Details"],
    ];

    auditLogs.forEach((log) => {
      logsData.push([
        format(new Date(log.createdAt), "yyyy-MM-dd"),
        format(new Date(log.createdAt), "HH:mm:ss"),
        log.action.replace(/_/g, " "),
        log.entity,
        log.user?.name || "System",
        log.user?.email || "",
        log.user?.role || "",
        log.data ? JSON.stringify(log.data) : "",
      ]);
    });

    const logsWs = XLSX.utils.aoa_to_sheet(logsData);
    logsWs["!cols"] = [
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 16 },
      { wch: 22 },
      { wch: 12 },
      { wch: 30 },
    ];

    for (let i = 0; i < 8; i++) {
      const cell = logsWs[String.fromCharCode(65 + i) + "1"];
      if (cell) {
        cell.s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "8B5CF6" } },
          alignment: { horizontal: "center", vertical: "center" },
        };
      }
    }

    XLSX.utils.book_append_sheet(wb, logsWs, "Activity Logs");
  }

  const fileName = `Manuel-Resort-Report-${format(startDate, "MMMM-yyyy")}.xlsx`;
  const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const buffer = Buffer.from(file);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

async function generateYearlyExcel(bookings: any[], yearNum: number, session: any) {
  // Calculate statistics
  const confirmedBookings = bookings.filter(
    (b) => b.status === BookingStatus.CONFIRMED
  ).length;
  const completedBookings = bookings.filter(
    (b) =>
      b.status === BookingStatus.COMPLETED ||
      b.status === BookingStatus.CHECKED_OUT
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === BookingStatus.CANCELLED
  ).length;
  const totalRevenue = bookings.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const totalGuests = bookings.reduce((sum, b) => sum + (b.guests || 0), 0);
  const averageRevenuePerBooking =
    bookings.length > 0 ? totalRevenue / bookings.length : 0;

  // Monthly breakdown
  const monthlyData: Record<string, { bookings: number; revenue: number; guests: number }> = {};
  for (let i = 1; i <= 12; i++) {
    const monthKey = String(i).padStart(2, "0");
    monthlyData[monthKey] = { bookings: 0, revenue: 0, guests: 0 };
  }

  bookings.forEach((booking) => {
    // Use checkedOutAt for monthly breakdown if available, otherwise use confirmedAt
    const dateToUse = booking.checkedOutAt || booking.confirmedAt || booking.createdAt;
    const monthKey = String(dateToUse.getMonth() + 1).padStart(2, "0");
    monthlyData[monthKey].bookings++;
    monthlyData[monthKey].revenue += Number(booking.totalAmount);
    monthlyData[monthKey].guests += booking.guests || 0;
  });

  // Group bookings by facility
  const bookingsByFacility = bookings.reduce(
    (acc, booking) => {
      const facilityName = booking.facility.name;
      if (!acc[facilityName]) {
        acc[facilityName] = {
          name: facilityName,
          kind: booking.facility.kind,
          count: 0,
          revenue: 0,
          guests: 0,
        };
      }
      acc[facilityName].count++;
      acc[facilityName].revenue += Number(booking.totalAmount);
      acc[facilityName].guests += booking.guests || 0;
      return acc;
    },
    {} as Record<
      string,
      { name: string; kind: string; count: number; revenue: number; guests: number }
    >
  );

  // Group bookings by type
  const bookingsByType = bookings.reduce(
    (acc, booking) => {
      const type = booking.facility.kind;
      if (!acc[type]) {
        acc[type] = { type, count: 0, revenue: 0 };
      }
      acc[type].count++;
      acc[type].revenue += Number(booking.totalAmount);
      return acc;
    },
    {} as Record<string, { type: string; count: number; revenue: number }>
  );

  // Create workbook
  const wb = XLSX.utils.book_new();

  // ====== Sheet 1: Annual Summary ======
  const summaryData: any[][] = [
    [
      "MANUEL RESORT - ANNUAL BUSINESS REPORT",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    ["", "", "", "", "", "", ""],
    ["Year:", yearNum.toString(), "", "", "", "", ""],
    [
      "Period:",
      `January 1, ${yearNum} to December 31, ${yearNum}`,
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "Generated:",
      format(new Date(), "MMMM dd, yyyy HH:mm"),
      "",
      "",
      "",
      "",
      "",
    ],
    ["Generated by:", session?.user?.name || session?.user?.email || "Admin", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["KEY METRICS", "", "VALUE", "", "", "", ""],
    ["Total Revenue", "", `₱${totalRevenue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`, "", "", "", ""],
    ["Total Bookings", "", bookings.length.toString(), "", "", "", ""],
    ["Confirmed Bookings", "", confirmedBookings.toString(), "", "", "", ""],
    ["Completed Bookings", "", completedBookings.toString(), "", "", "", ""],
    ["Cancelled Bookings", "", cancelledBookings.toString(), "", "", "", ""],
    ["Total Guests", "", totalGuests.toString(), "", "", "", ""],
    ["Average Revenue/Booking", "", `₱${averageRevenuePerBooking.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`, "", "", "", ""],
    ["", "", "", "", "", "", ""],
    ["REVENUE BY TYPE", "", "", "", "", "", ""],
  ];

  Object.values(bookingsByType).forEach((typeData) => {
    summaryData.push([
      typeData.type || "Unknown",
      typeData.count.toString(),
      `₱${typeData.revenue.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`,
      "",
      "",
      "",
      "",
    ]);
  });

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  summaryWs["!cols"] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
  ];

  const headerStyle = {
    font: { bold: true, size: 14, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "1F2937" } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  summaryWs["A1"]!.s = headerStyle;
  for (let i = 8; i <= 16; i++) {
    if (summaryWs[`A${i}`]) {
      summaryWs[`A${i}`]!.s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "F3F4F6" } },
        alignment: { horizontal: "right", vertical: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        },
      };
    }
  }

  XLSX.utils.book_append_sheet(wb, summaryWs, "Annual Summary");

  // ====== Sheet 2: Monthly Breakdown ======
  const monthlyBreakdownData: any[][] = [
    ["Month", "Bookings", "Revenue (₱)", "Guests", "Avg Revenue/Booking"],
  ];

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  monthNames.forEach((name, index) => {
    const monthKey = String(index + 1).padStart(2, "0");
    const data = monthlyData[monthKey];
    const avgRevenue = data.bookings > 0 ? data.revenue / data.bookings : 0;
    monthlyBreakdownData.push([
      name,
      data.bookings,
      data.revenue,
      data.guests,
      avgRevenue,
    ]);
  });

  const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyBreakdownData);
  monthlyWs["!cols"] = [
    { wch: 15 },
    { wch: 12 },
    { wch: 16 },
    { wch: 10 },
    { wch: 18 },
  ];

  for (let i = 0; i < 5; i++) {
    const cell = monthlyWs[String.fromCharCode(65 + i) + "1"];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "F59E0B" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let row = 2; row <= monthlyBreakdownData.length; row++) {
    const revenueCell = monthlyWs["C" + row];
    const avgCell = monthlyWs["E" + row];
    if (revenueCell && typeof revenueCell.v === "number") {
      revenueCell.z = "#,##0.00";
    }
    if (avgCell && typeof avgCell.v === "number") {
      avgCell.z = "#,##0.00";
    }
  }

  XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Breakdown");

  // ====== Sheet 3: Facility Breakdown ======
  const facilityData: any[][] = [
    ["Facility", "Type", "Bookings", "Guests", "Revenue (₱)", "Avg/Booking"],
  ];

  Object.values(bookingsByFacility).forEach((facility) => {
    const avgPerBooking =
      facility.count > 0 ? facility.revenue / facility.count : 0;
    facilityData.push([
      facility.name,
      facility.kind,
      facility.count,
      facility.guests,
      facility.revenue,
      avgPerBooking,
    ]);
  });

  const facilityWs = XLSX.utils.aoa_to_sheet(facilityData);
  facilityWs["!cols"] = [
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 14 },
    { wch: 14 },
  ];

  for (let i = 0; i < 6; i++) {
    const cell = facilityWs[String.fromCharCode(65 + i) + "1"];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "10B981" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let row = 2; row <= facilityData.length; row++) {
    const revenueCell = facilityWs["E" + row];
    const avgCell = facilityWs["F" + row];
    if (revenueCell && typeof revenueCell.v === "number") {
      revenueCell.z = "#,##0.00";
    }
    if (avgCell && typeof avgCell.v === "number") {
      avgCell.z = "#,##0.00";
    }
  }

  XLSX.utils.book_append_sheet(wb, facilityWs, "Facility Performance");

  // ====== Sheet 4: All Bookings ======
  const bookingsData: any[][] = [
    [
      "Booking Code",
      "Status",
      "Customer",
      "Email",
      "Facility",
      "Type",
      "Check-In",
      "Check-Out",
      "Nights",
      "Guests",
      "Amount (₱)",
      "Booked On",
      "Confirmed On",
      "Rating",
    ],
  ];

  bookings.forEach((booking) => {
    const nights = Math.ceil(
      (booking.endDate.getTime() - booking.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const firstReview =
      booking.reviews && booking.reviews.length > 0 ? booking.reviews[0] : null;

    bookingsData.push([
      booking.code,
      booking.status.replace(/_/g, " "),
      booking.customerName,
      booking.customerEmail,
      booking.facility.name,
      booking.facility.kind,
      format(booking.startDate, "MMM dd, yyyy"),
      format(booking.endDate, "MMM dd, yyyy"),
      nights.toString(),
      (booking.guests || "-").toString(),
      Number(booking.totalAmount),
      format(booking.createdAt, "MMM dd, yyyy HH:mm"),
      booking.confirmedAt
        ? format(booking.confirmedAt, "MMM dd, yyyy HH:mm")
        : "-",
      firstReview?.rating ? `${firstReview.rating}/5` : "-",
    ]);
  });

  const bookingsWs = XLSX.utils.aoa_to_sheet(bookingsData);
  bookingsWs["!cols"] = [
    { wch: 14 },
    { wch: 14 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 12 },
    { wch: 14 },
    { wch: 14 },
    { wch: 8 },
    { wch: 8 },
    { wch: 14 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
  ];

  for (let i = 0; i < 14; i++) {
    const cell = bookingsWs[String.fromCharCode(65 + i) + "1"];
    if (cell) {
      cell.s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "3B82F6" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let row = 2; row <= bookingsData.length; row++) {
    const amountCell = bookingsWs["K" + row];
    if (amountCell && typeof amountCell.v === "number") {
      amountCell.z = "#,##0.00";
    }
  }

  XLSX.utils.book_append_sheet(wb, bookingsWs, "All Bookings");

  const fileName = `Manuel-Resort-Annual-Report-${yearNum}.xlsx`;
  const file = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const buffer = Buffer.from(file);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
