import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { BookingStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as BookingStatus | null;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: {
      status?: BookingStatus;
      startDate?: { gte: Date };
      endDate?: { lte: Date };
    } = {};

    if (status) {
      where.status = status;
    }

    if (from) {
      where.startDate = { gte: new Date(from) };
    }

    if (to) {
      where.endDate = { lte: new Date(to) };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        facility: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Admin reservations GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
