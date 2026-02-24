import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { CancelBookingSchema } from "@/schemas/booking";
import { BookingStatus } from "@prisma/client";
import { sendMail } from "@/lib/email/transport";
import { render } from "@react-email/components";
import { BookingCancelledEmail } from "@/lib/email/templates";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CancelBookingSchema.parse(body);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        facility: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check authorization - must be the booking owner
    const isOwner = booking.userId === session.user.id;

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { error: "Booking is already cancelled" },
        { status: 400 }
      );
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json(
        { error: "Cannot cancel completed booking" },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CANCEL_BOOKING",
        entity: "Booking",
        entityId: booking.id,
        data: { reason: validated.reason },
      },
    });

    // Send cancellation email
    const html = await render(
      BookingCancelledEmail({
        bookingCode: booking.code,
        customerName: booking.customerName,
        facilityName: booking.facility.name,
      })
    );

    await sendMail({
      to: booking.customerEmail,
      subject: `Booking Cancelled - ${booking.code}`,
      html,
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Cancel booking API error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
