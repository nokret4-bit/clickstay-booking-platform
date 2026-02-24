import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const year = searchParams.get("year");

    let startDate: Date;
    let endDate: Date;

    if (month) {
      // Parse month (YYYY-MM format)
      const [yearStr, monthStr] = month.split("-");
      const yearNum = parseInt(yearStr);
      const monthNum = parseInt(monthStr);
      
      startDate = new Date(yearNum, monthNum - 1, 1);
      endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
    } else if (year) {
      // Export entire year
      const yearNum = parseInt(year);
      startDate = new Date(yearNum, 0, 1);
      endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999);
    } else {
      // Default to current month
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    // Fetch logs for the specified period
    const logs = await prisma.auditLog.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Generate CSV content
    const headers = [
      "Date",
      "Time",
      "Action",
      "Entity",
      "Entity ID",
      "User Name",
      "User Email",
      "User Role",
      "Details",
    ];

    const csvRows = logs.map((log) => {
      const date = format(new Date(log.createdAt), "yyyy-MM-dd");
      const time = format(new Date(log.createdAt), "HH:mm:ss");
      const action = log.action.replace(/_/g, " ");
      const entity = log.entity;
      const entityId = log.entityId || "";
      const userName = log.user?.name || "System";
      const userEmail = log.user?.email || "";
      const userRole = log.user?.role || "";
      const details = log.data ? JSON.stringify(log.data) : "";

      // Escape and quote fields
      const escapeField = (field: string) => {
        const escaped = field.replace(/"/g, '""');
        return `"${escaped}"`;
      };

      return [
        escapeField(date),
        escapeField(time),
        escapeField(action),
        escapeField(entity),
        escapeField(entityId),
        escapeField(userName),
        escapeField(userEmail),
        escapeField(userRole),
        escapeField(details),
      ].join(",");
    });

    const csv = [headers.join(","), ...csvRows].join("\n");

    // Generate filename
    const periodLabel = month || year || format(startDate, "yyyy-MM");
    const filename = `Activity-Logs-${periodLabel}-${format(new Date(), "yyyyMMdd-HHmmss")}.csv`;

    // Return CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Activity logs export error:", error);
    return NextResponse.json(
      { error: "Failed to export activity logs" },
      { status: 500 }
    );
  }
}
