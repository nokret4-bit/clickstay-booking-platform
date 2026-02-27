import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, date, endDate, facilityId, maxCapacity, isActive } = body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(facilityId !== undefined && { facilityId }),
        ...(maxCapacity !== undefined && { maxCapacity: maxCapacity ? parseInt(maxCapacity) : null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        facility: { select: { id: true, name: true } },
        tickets: true,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Update event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
