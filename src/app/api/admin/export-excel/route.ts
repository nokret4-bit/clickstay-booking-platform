import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { format } from "date-fns";
import * as XLSX from "xlsx-js-style";
import { encryptGuestData, maskSensitiveData } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const exportType = searchParams.get("type") || "bookings";

    const where: any = {
      customerName: { not: 'Temporary Lock' }
    };

    if (from && to) {
      where.createdAt = {
        gte: new Date(from),
        lte: new Date(to),
      };
    }

    if (exportType === "summary") {
      return await exportSummaryExcel(where);
    }

    // Default: Export detailed bookings with encryption
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

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare professional data with encrypted guest info
    const exportDate = format(new Date(), "MMMM dd, yyyy 'at' HH:mm");
    const dateRange = from && to ? `For the Period [${format(new Date(from), 'MMM dd, yyyy')} to ${format(new Date(to), 'MMM dd, yyyy')}]` : 'All Time';
    
    const data: any[][] = [
      ["MANUEL RESORT - CONFIDENTIAL BOOKING REPORT"],
      [""],
      ["Report Date:", exportDate],
      ["Period:", dateRange],
      ["Total Records:", bookings.length],
      [""],
      ["⚠️ DATA PROTECTION NOTICE", "", "", "", "", "", "This document contains encrypted guest information"],
      ["Guest contact details are encrypted for privacy protection", "", "", "", "", "", "Unauthorized distribution is prohibited"],
      [],
      ["Booking Code", "Status", "Customer (Encrypted)", "Email (Encrypted)", "Phone (Encrypted)", "Facility", "Type", "Check-In", "Check-Out", "Nights", "Guests", "Amount (₱)", "Booked On", "Confirmed On", "Rating", "Notes"],
    ];

    const startDataRow = 11;

    // Add booking rows with encrypted guest information
    bookings.forEach((booking) => {
      const nights = (booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24);
      const firstReview = booking.reviews && booking.reviews.length > 0 ? booking.reviews[0] : null;
      
      // Encrypt sensitive guest information
      const encryptedName = encryptGuestData(booking.customerName);
      const encryptedEmail = encryptGuestData(booking.customerEmail);
      const encryptedPhone = booking.customerPhone ? encryptGuestData(booking.customerPhone) : "N/A";
      
      // Create masked versions for readability
      const maskedName = maskSensitiveData(booking.customerName, 'address');
      const maskedEmail = maskSensitiveData(booking.customerEmail, 'email');
      const maskedPhone = booking.customerPhone ? maskSensitiveData(booking.customerPhone, 'phone') : "N/A";
      
      data.push([
        booking.code,
        booking.status,
        `${maskedName} [ENCRYPTED]`,
        `${maskedEmail} [ENCRYPTED]`,
        `${maskedPhone} [ENCRYPTED]`,
        booking.facility.name,
        booking.facility.kind,
        format(booking.startDate, "MMM dd, yyyy"),
        format(booking.endDate, "MMM dd, yyyy"),
        Math.round(nights),
        booking.guests || "-",
        Number(booking.totalAmount),
        format(booking.createdAt, "MMM dd, yyyy HH:mm"),
        booking.confirmedAt ? format(booking.confirmedAt, "MMM dd, yyyy HH:mm") : "-",
        firstReview?.rating ? `${firstReview.rating}/5` : "-",
        booking.notes || "-",
      ]);
    });

    // Add summary totals
    const totalAmount = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalGuests = bookings.reduce((sum, b) => sum + (b.guests || 0), 0);
    
    data.push([]);
    data.push(["SUMMARY", "", "", "", "", "", "", "", "", "", totalGuests, totalAmount]);
    data.push([]);
    data.push([
      `Report Generated: ${exportDate}`,
      `By: ${session.user?.name || session.user?.email || 'Admin'}`,
      "",
      "",
      "",
      "",
      `© ${new Date().getFullYear()} Manuel Resort`,
      "CONFIDENTIAL"
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Set professional column widths
    ws['!cols'] = [
      { wch: 14 }, // Booking Code
      { wch: 12 }, // Status
      { wch: 20 }, // Customer Name
      { wch: 24 }, // Email (Encrypted)
      { wch: 22 }, // Phone (Encrypted)
      { wch: 20 }, // Facility
      { wch: 12 }, // Type
      { wch: 14 }, // Check-In
      { wch: 14 }, // Check-Out
      { wch: 8 },  // Nights
      { wch: 8 },  // Guests
      { wch: 13 }, // Amount
      { wch: 20 }, // Booked On
      { wch: 20 }, // Confirmed On
      { wch: 10 }, // Rating
      { wch: 30 }, // Notes
    ];

    // Set minimum row height for better readability
    ws['!rows'] = ws['!rows'] || [];

    // Professional header styling
    const headerStyle = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E78" } },
      alignment: { horizontal: "center", vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: "1F4E78" } },
        bottom: { style: "medium", color: { rgb: "1F4E78" } },
        left: { style: "thin", color: { rgb: "1F4E78" } },
        right: { style: "thin", color: { rgb: "1F4E78" } }
      }
    };

    // Title styling (CONFIDENTIAL)
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "C00000" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Data protection notice styling
    ['A7', 'A8'].forEach(cell => {
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true, sz: 10, color: { rgb: "C00000" } },
          fill: { fgColor: { rgb: "FCE4D6" } },
          alignment: { horizontal: "left", vertical: "center", wrapText: true },
          border: {
            top: { style: "thin", color: { rgb: "C00000" } },
            bottom: { style: "thin", color: { rgb: "C00000" } },
            left: { style: "medium", color: { rgb: "C00000" } },
            right: { style: "medium", color: { rgb: "C00000" } }
          }
        };
      }
    });

    // Column headers styling
    const columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
    columns.forEach(col => {
      const cellRef = `${col}10`;
      if (ws[cellRef]) {
        ws[cellRef].s = headerStyle;
      }
    });

    // Professional data row styling with alternating colors
    for (let i = 0; i < bookings.length; i++) {
      const rowNum = startDataRow + i;
      const isEven = i % 2 === 0;
      const bgColor = isEven ? "FFFFFF" : "F0F4F8";
      
      columns.forEach((col, colIdx) => {
        const cellRef = `${col}${rowNum}`;
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: bgColor } },
            alignment: { 
              horizontal: (col === 'L' || col === 'K' || col === 'J') ? "right" : "left",
              vertical: "center",
              wrapText: false
            },
            border: {
              top: { style: "thin", color: { rgb: "D9E1F2" } },
              bottom: { style: "thin", color: { rgb: "D9E1F2" } },
              left: { style: "thin", color: { rgb: "E7E6E6" } },
              right: { style: "thin", color: { rgb: "E7E6E6" } }
            }
          };
          
          // Format currency
          if (col === 'L' && typeof ws[cellRef].v === 'number') {
            ws[cellRef].z = '"₱"#,##0.00';
          }
          
          // Highlight encrypted fields
          if ((col === 'C' || col === 'D' || col === 'E') && typeof ws[cellRef].v === 'string' && ws[cellRef].v.includes('[ENCRYPTED]')) {
            ws[cellRef].s = {
              ...ws[cellRef].s,
              fill: { fgColor: { rgb: "FFF2CC" } },
              font: { italic: true, sz: 10, color: { rgb: "9C6500" } }
            };
          }
        }
      });
    }

    // Summary row styling
    const summaryRow = startDataRow + bookings.length + 2;
    columns.forEach(col => {
      const cellRef = `${col}${summaryRow}`;
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: (col === 'K' || col === 'L') ? "right" : "left", vertical: "center" },
          border: {
            top: { style: "medium", color: { rgb: "4472C4" } },
            bottom: { style: "medium", color: { rgb: "4472C4" } },
            left: { style: "thin", color: { rgb: "4472C4" } },
            right: { style: "thin", color: { rgb: "4472C4" } }
          }
        };
        
        if (col === 'L' && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = '"₱"#,##0.00';
        }
      }
    });

    // Set sheet protection - read-only access
    ws['!protect'] = {
      sheet: true,
      content: true,
      objects: false,
      scenarios: false,
      formatCells: false,
      formatColumns: false,
      formatRows: false,
      insertColumns: false,
      insertRows: false,
      insertHyperlinks: false,
      deleteColumns: false,
      deleteRows: false,
      selectLockedCells: true,
      sort: true,
      autoFilter: true,
      pivotTables: false,
      selectUnlockedCells: true,
    };

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Booking Report");

    // Set workbook protection
    wb.props = {
      title: "Manuel Resort Booking Report",
      subject: "Confidential Booking Data",
      author: "Manuel Resort Management",
      manager: "Admin",
      company: "Manuel Resort",
      category: "Reports",
      keywords: "bookings,revenue,guests",
      comments: "Encrypted guest information for privacy protection",
    };

    // Write with protection settings
    const excelBuffer = XLSX.write(wb, { 
      type: "buffer", 
      bookType: "xlsx",
      password: "readonly" // Adds an additional layer of protection
    });

    const filename = `Manuel-Resort-Bookings-${format(new Date(), "yyyy-MM-dd-HHmmss")}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Excel export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

async function exportSummaryExcel(where: any) {
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

  const totalRev = Number(totalRevenue._sum.totalAmount || 0);
  const exportDate = format(new Date(), "MMMM dd, yyyy 'at' HH:mm");

  // Create workbook
  const wb = XLSX.utils.book_new();

  const data: any[][] = [
    ["MANUEL RESORT - FINANCIAL SUMMARY REPORT"],
    [],
    ["Report Date:", exportDate],
    ["Total Records:", totalBookings],
    [],
    ["REVENUE SUMMARY"],
    ["Total Bookings", totalBookings],
    ["Total Revenue", "", "", totalRev],
    [],
    ["REVENUE BY BOOKING STATUS"],
    ["Status", "Count", "Percentage", "Revenue (₱)"],
  ];

  bookingsByStatus.forEach((stat) => {
    const percentage = totalBookings > 0 ? ((stat._count / totalBookings) * 100).toFixed(1) : 0;
    data.push([
      stat.status.replace(/_/g, ' '),
      stat._count,
      `${percentage}%`,
      Number(stat._sum.totalAmount || 0),
    ]);
  });

  data.push(["Total", totalBookings, "100%", totalRev]);
  data.push([]);
  data.push(["REVENUE BY FACILITY"]);
  data.push(["Facility Name", "Type", "Bookings", "Revenue (₱)", "Avg. per Booking"]);

  bookingsByType.forEach((stat) => {
    const facility = facilities.find((f) => f.id === stat.facilityId);
    const avgRevenue = stat._count > 0 ? Number(stat._sum.totalAmount || 0) / stat._count : 0;
    data.push([
      facility?.name || "Unknown",
      facility?.kind || "Unknown",
      stat._count,
      Number(stat._sum.totalAmount || 0),
      avgRevenue,
    ]);
  });

  data.push(["Total Revenue", "", "", totalRev, ""]);
  data.push([]);
  data.push([
    `© ${new Date().getFullYear()} Manuel Resort | Generated: ${exportDate}`,
    "",
    "",
    "",
    "CONFIDENTIAL"
  ]);

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Professional column widths
  ws['!cols'] = [
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 16 },
    { wch: 18 },
  ];

  // Header styling - CONFIDENTIAL title
  if (ws['A1']) {
    ws['A1'].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1F4E78" } },
      alignment: { horizontal: "center", vertical: "center" }
    };
  }

  // Section headers styling
  ['A6', 'A10', 'A17'].forEach(cell => {
    if (ws[cell]) {
      ws[cell].s = {
        font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: "left", vertical: "center" }
      };
    }
  });

  // Column headers for both tables
  const headerCells = ['A11', `A${13 + bookingsByStatus.length}`];
  headerCells.forEach(headerRow => {
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      const cellRef = `${col}${headerRow.replace(/\D/g, '')}`;
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
          fill: { fgColor: { rgb: "4472C4" } },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            top: { style: "medium", color: { rgb: "4472C4" } },
            bottom: { style: "medium", color: { rgb: "4472C4" } },
            left: { style: "thin", color: { rgb: "4472C4" } },
            right: { style: "thin", color: { rgb: "4472C4" } }
          }
        };
      }
    });
  });

  // Data rows with alternating colors
  for (let i = 0; i < bookingsByStatus.length; i++) {
    const rowNum = 12 + i;
    const isEven = i % 2 === 0;
    ['A', 'B', 'C', 'D'].forEach(col => {
      const cellRef = `${col}${rowNum}`;
      if (ws[cellRef]) {
        ws[cellRef].s = {
          fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F0F4F8" } },
          alignment: { horizontal: (col === 'C' || col === 'D') ? "right" : "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "D9E1F2" } },
            bottom: { style: "thin", color: { rgb: "D9E1F2" } },
          }
        };
        
        if (col === 'D' && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = '"₱"#,##0.00';
        }
      }
    });
  }

  // Total row for status table
  const statusTotalRow = 12 + bookingsByStatus.length;
  ['A', 'B', 'C', 'D'].forEach(col => {
    const cellRef = `${col}${statusTotalRow}`;
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4472C4" } },
        alignment: { horizontal: (col === 'C' || col === 'D') ? "right" : "left", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: "4472C4" } },
          bottom: { style: "medium", color: { rgb: "4472C4" } },
        }
      };
      
      if (col === 'D' && typeof ws[cellRef].v === 'number') {
        ws[cellRef].z = '"₱"#,##0.00';
      }
    }
  });

  // Facility data rows
  const facilityStartRow = 18 + bookingsByStatus.length;
  for (let i = 0; i < bookingsByType.length; i++) {
    const rowNum = facilityStartRow + i;
    const isEven = i % 2 === 0;
    ['A', 'B', 'C', 'D', 'E'].forEach(col => {
      const cellRef = `${col}${rowNum}`;
      if (ws[cellRef]) {
        ws[cellRef].s = {
          fill: { fgColor: { rgb: isEven ? "FFFFFF" : "F0F4F8" } },
          alignment: { horizontal: (col === 'C' || col === 'D' || col === 'E') ? "right" : "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "D9E1F2" } },
            bottom: { style: "thin", color: { rgb: "D9E1F2" } },
          }
        };
        
        if ((col === 'D' || col === 'E') && typeof ws[cellRef].v === 'number') {
          ws[cellRef].z = '"₱"#,##0.00';
        }
      }
    });
  }

  // Set sheet protection - read-only
  ws['!protect'] = {
    sheet: true,
    content: true,
    objects: false,
    scenarios: false,
    formatCells: false,
    formatColumns: false,
    formatRows: false,
    insertColumns: false,
    insertRows: false,
    insertHyperlinks: false,
    deleteColumns: false,
    deleteRows: false,
    selectLockedCells: true,
    sort: true,
    autoFilter: true,
    pivotTables: false,
    selectUnlockedCells: true,
  };

  // Add worksheet
  XLSX.utils.book_append_sheet(wb, ws, "Summary Report");

  // Set workbook properties
  wb.props = {
    title: "Manuel Resort Financial Summary",
    subject: "Revenue Report",
    author: "Manuel Resort Management",
    manager: "Admin",
    company: "Manuel Resort",
    category: "Financial Reports",
  };

  // Write with protection
  const excelBuffer = XLSX.write(wb, { 
    type: "buffer", 
    bookType: "xlsx",
    password: "readonly"
  });

  const filename = `Manuel-Resort-Summary-${format(new Date(), "yyyy-MM-dd-HHmmss")}.xlsx`;

  return new NextResponse(excelBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
