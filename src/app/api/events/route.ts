import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch events
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get("facilityId");
    const includeInactive = searchParams.get("all") === "true";
    const upcoming = searchParams.get("upcoming") === "true";

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (facilityId) {
      where.facilityId = facilityId;
    }
    if (upcoming) {
      where.date = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        facility: { select: { id: true, name: true } },
        tickets: {
          where: { isActive: true },
          include: {
            _count: { select: { purchases: true } },
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Events API error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST - Create a new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, date, endDate, facilityId, maxCapacity } = body;

    if (!name || !date || !facilityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        description: description || null,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        facilityId,
        maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
      },
      include: {
        facility: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
