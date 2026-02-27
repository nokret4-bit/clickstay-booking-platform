import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all active tickets (public) or all tickets (admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const facilityId = searchParams.get("facilityId");
    const includeInactive = searchParams.get("all") === "true";

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    if (facilityId) {
      where.facilityId = facilityId;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        facility: { select: { id: true, name: true, kind: true } },
        event: { select: { id: true, name: true, date: true } },
        _count: { select: { purchases: true } },
      },
      orderBy: [{ event: { date: "asc" } }, { name: "asc" }],
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Tickets API error:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

// POST - Create a new ticket (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, weekdayPrice, weekendPrice, facilityId, eventId } = body;

    if (!name || !weekdayPrice || !weekendPrice || !facilityId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        name,
        description: description || null,
        weekdayPrice: parseFloat(weekdayPrice),
        weekendPrice: parseFloat(weekendPrice),
        facilityId,
        eventId: eventId || null,
      },
      include: {
        facility: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    console.error("Create ticket error:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
