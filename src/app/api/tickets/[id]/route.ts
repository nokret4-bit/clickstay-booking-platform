import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update a ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, weekdayPrice, weekendPrice, facilityId, eventId, isActive } = body;

    const ticket = await prisma.ticket.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(weekdayPrice !== undefined && { weekdayPrice: parseFloat(weekdayPrice) }),
        ...(weekendPrice !== undefined && { weekendPrice: parseFloat(weekendPrice) }),
        ...(facilityId !== undefined && { facilityId }),
        ...(eventId !== undefined && { eventId: eventId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        facility: { select: { id: true, name: true } },
        event: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Update ticket error:", error);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

// DELETE - Delete a ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.ticket.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete ticket error:", error);
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}
