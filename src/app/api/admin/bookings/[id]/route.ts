import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    
    // Check authentication
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_bookings")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      startDate,
      endDate,
      notes,
      status,
      totalAmount,
      isCustomPrice,
    } = body;

    const normalizedPhone = typeof customerPhone === "string"
      ? customerPhone.replace(/\D/g, "").slice(0, 11)
      : "";

    if (normalizedPhone && normalizedPhone.length !== 11) {
      return NextResponse.json(
        { error: "Customer phone must be exactly 11 digits" },
        { status: 400 }
      );
    }

    // Update booking
    const booking = await prisma.booking.update({
      where: { id },
      data: {
        customerName,
        customerEmail,
        customerPhone: normalizedPhone || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        notes,
        status,
        ...(totalAmount !== undefined && {
          totalAmount: totalAmount.toString(),
          isCustomPrice: isCustomPrice || false,
        }),
        updatedAt: new Date(),
      },
    });

    // Log audit
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_BOOKING",
          entity: "Booking",
          entityId: booking.id,
          data: { code: booking.code, status },
        },
      });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    const { id } = await params;
    
    // Check authentication
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_bookings")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Delete related records first
    await prisma.payment.deleteMany({
      where: { bookingId: id },
    });

    await prisma.auditLog.deleteMany({
      where: { entityId: id, entity: "Booking" },
    });

    // Delete booking
    await prisma.booking.delete({
      where: { id },
    });

    // Log audit
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_BOOKING",
          entity: "Booking",
          entityId: id,
          data: { code: booking.code },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete booking error:", error);
    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
