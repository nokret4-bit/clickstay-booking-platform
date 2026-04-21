import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { format } from "date-fns";
import * as XLSX from "xlsx-js-style";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all staff members
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare professional data structure
    const exportDate = format(new Date(), "MMMM dd, yyyy 'at' HH:mm");
    
    const headerData: any[][] = [
      ["MANUEL RESORT STAFF MANAGEMENT SYSTEM"],
      ["Staff Directory Export"],
      [exportDate],
      [],
      ["EXPORT INFORMATION"],
      ["Total Staff Members:", users.length],
      ["Active Members:", users.filter(u => u.isActive).length],
      ["Inactive Members:", users.filter(u => !u.isActive).length],
      [],
    ];

    // Column headers
    const columns = ["#", "Name", "Email", "Role", "Status", "Created Date", "Last Updated"];
    headerData.push(columns);

    // Add staff data with proper formatting
    users.forEach((user, index) => {
      headerData.push([
        index + 1,
        user.name || "N/A",
        user.email,
        user.role,
        user.isActive ? "Active" : "Inactive",
        format(user.createdAt, "MMM dd, yyyy HH:mm"),
        format(user.updatedAt, "MMM dd, yyyy HH:mm"),
      ]);
    });

    // Add footer
    headerData.push([]);
    headerData.push(["© " + new Date().getFullYear() + " Manuel Resort | Staff Management System", "", "", "", "", "", "Confidential"]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(headerData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // #
      { wch: 25 },  // Name
      { wch: 30 },  // Email
      { wch: 12 },  // Role
      { wch: 12 },  // Status
      { wch: 20 },  // Created Date
      { wch: 20 },  // Last Updated
    ];

    // Apply professional styling
    const titleRow = 0;
    const subtitleRow = 1;
    const dateRow = 2;
    const summaryStartRow = 4;
    const headerRow = 9;
    const dataStartRow = 10;

    // Title styling (MANUEL RESORT...)
    if (ws['A1']) {
      ws['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1F4E78" } },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          bottom: { style: "medium", color: { rgb: "1F4E78" } }
        }
      };
    }

    // Subtitle styling
    if (ws['A2']) {
      ws['A2'].s = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2E5C90" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Date styling
    if (ws['A3']) {
      ws['A3'].s = {
        font: { italic: true, sz: 10, color: { rgb: "666666" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Summary section styling
    for (let i = summaryStartRow; i < summaryStartRow + 4; i++) {
      const cellRef = `A${i + 1}`;
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { bold: true, sz: 11, color: { rgb: "1F4E78" } },
          fill: { fgColor: { rgb: "E7E6F7" } },
          alignment: { horizontal: "left", vertical: "center" }
        };
      }
    }

    // Column headers styling - professional blue background
    const cols = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    cols.forEach(col => {
      const cellRef = `${col}${headerRow + 1}`;
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

    // Data rows styling with alternating colors
    for (let i = 0; i < users.length; i++) {
      const rowNum = dataStartRow + i + 1;
      const isEven = i % 2 === 0;
      const bgColor = isEven ? "FFFFFF" : "F5F7FA";
      
      cols.forEach((col, colIdx) => {
        const cellRef = `${col}${rowNum}`;
        if (ws[cellRef]) {
          ws[cellRef].s = {
            fill: { fgColor: { rgb: bgColor } },
            alignment: { 
              horizontal: colIdx === 0 ? "center" : (col === 'E' ? "center" : "left"),
              vertical: "center"
            },
            border: {
              top: { style: "thin", color: { rgb: "D3D3D3" } },
              bottom: { style: "thin", color: { rgb: "D3D3D3" } },
              left: { style: "thin", color: { rgb: "D3D3D3" } },
              right: { style: "thin", color: { rgb: "D3D3D3" } }
            }
          };
        }
      });
    }

    // Footer styling
    const footerRow = dataStartRow + users.length + 2;
    if (ws[`A${footerRow}`]) {
      ws[`A${footerRow}`].s = {
        font: { italic: true, sz: 9, color: { rgb: "999999" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Staff Directory");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `Manuel-Resort-Staff-Directory-${format(new Date(), "yyyy-MM-dd-HHmmss")}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Staff Excel export error:", error);
    return NextResponse.json(
      { error: "Failed to export staff data" },
      { status: 500 }
    );
  }
}
