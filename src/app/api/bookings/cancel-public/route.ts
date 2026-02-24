import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";
import { sendMail } from "@/lib/email/transport";
import { render } from "@react-email/components";
import { BookingCancelledEmail } from "@/lib/email/templates";
import { z } from "zod";

const CancelPublicSchema = z.object({
  bookingCode: z.string(),
  customerEmail: z.string().email(),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CancelPublicSchema.parse(body);

    // Find booking by code and email (for verification)
    const booking = await prisma.booking.findFirst({
      where: {
        code: validated.bookingCode,
        customerEmail: validated.customerEmail,
      },
      include: {
        facility: true,
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found or email doesn't match" },
        { status: 404 }
      );
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
      where: { id: booking.id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        updatedAt: new Date(),
        notes: validated.reason
          ? `${booking.notes || ""}\nCancellation reason: ${validated.reason}`.trim()
          : booking.notes,
      },
    });

    // Send cancellation email
    try {
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
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError);
      // Don't fail the cancellation if email fails
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        code: updatedBooking.code,
        status: updatedBooking.status,
      },
    });
  } catch (error) {
    console.error("Cancel booking (public) API error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to cancel booking" },
      { status: 500 }
    );
  }
}
